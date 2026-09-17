import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { operationsApi } from "../api/operations.api";

import type {
  LiveTrain,
  LiveTrainsResponse,
  OperationsStation,
} from "../types/operations.types";

import { getTrainOperationalStatus } from "../utils/trainStatus";

import { useOperationsWebSocket } from "../hooks/useOperationsWebSocket";

import type { OperationsWebSocketEvent } from "../websocket/websocket.types";

interface LiveTrainMonitorProps {
  onNavigateToTrainDetails: (train: LiveTrain) => void;
}

type TrainStatus =
  "ALL" | "RUNNING" | "DELAYED" | "PLATFORM_CHANGED" | "CANCELLED";

function LiveTrainMonitor({ onNavigateToTrainDetails }: LiveTrainMonitorProps) {
  // =========================
  // Station state
  // =========================

  const [stations, setStations] = useState<OperationsStation[]>([]);

  const [selectedStation, setSelectedStation] =
    useState<OperationsStation | null>(null);

  // =========================
  // Live train state
  // =========================

  const [data, setData] = useState<LiveTrainsResponse | null>(null);

  const [loading, setLoading] = useState(true);

  const [stationLoading, setStationLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);

  // =========================
  // Train filters
  // =========================

  const [searchTerm, setSearchTerm] = useState("");

  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const [statusFilter, setStatusFilter] = useState<TrainStatus>("ALL");

  // =========================
  // Station search
  // =========================

  const [stationSearchTerm, setStationSearchTerm] = useState("");

  const [showStationSuggestions, setShowStationSuggestions] = useState(false);

  /*
   * Keep the latest realtime timestamp outside React state.
   *
   * This prevents stale/out-of-order WebSocket events from
   * overwriting newer data without causing the WebSocket hook
   * to reconnect whenever a timestamp changes.
   */
  const realtimeUpdatedAtRef = useRef<Record<string, string>>({});

  // =========================
  // Load stations
  // =========================

  const loadStations = useCallback(async () => {
    try {
      setStationLoading(true);
      setError(null);

      /*
       * Current station source.
       *
       * This can later be replaced with the proper
       * station-master source without changing the
       * live train UI.
       */
      const response = await operationsApi.searchStations("*");

      const stationData = response.data
        .filter(
          (station) =>
            Number.isInteger(station.eva) && station.name.trim() !== "",
        )
        .sort((a, b) => a.name.localeCompare(b.name));

      setStations(stationData);

      setSelectedStation((current) => {
        if (current) {
          const stillExists = stationData.find(
            (station) => station.eva === current.eva,
          );

          if (stillExists) {
            setStationSearchTerm(`${stillExists.name} (${stillExists.eva})`);

            return stillExists;
          }
        }

        const firstStation = stationData[0] ?? null;

        if (firstStation) {
          setStationSearchTerm(`${firstStation.name} (${firstStation.eva})`);
        }

        return firstStation;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stations");
    } finally {
      setStationLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStations();
  }, [loadStations]);

  // =========================
  // Filter station suggestions
  // =========================

  const filteredStations = useMemo(() => {
    const query = stationSearchTerm.trim().toLowerCase();

    if (!query) {
      return [];
    }

    /*
     * The displayed input contains:
     *
     * Station Name (EVA)
     *
     * Therefore remove the EVA portion when performing
     * station-name matching.
     */
    const stationNameQuery = query.replace(/\s*\(\d+\)\s*$/, "").trim();

    if (!stationNameQuery) {
      return stations;
    }

    /*
     * Prefix matching:
     *
     * B   -> stations beginning with B
     * Bin -> stations beginning with Bin
     */
    return stations.filter((station) =>
      station.name.trim().toLowerCase().startsWith(stationNameQuery),
    );
  }, [stations, stationSearchTerm]);

  // =========================
  // Select station
  // =========================

  function handleStationSelect(station: OperationsStation) {
    setSelectedStation(station);

    setStationSearchTerm(`${station.name} (${station.eva})`);

    setShowStationSuggestions(false);
  }

  // =========================
  // Load live trains
  // =========================

  const loadTrains = useCallback(
    async (initialLoad = false) => {
      if (!selectedStation) {
        return;
      }

      try {
        if (initialLoad) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError(null);

        const response = await operationsApi.getLiveTrains(selectedStation.eva);

        setData(response.data);

        setLastUpdatedAt(new Date().toISOString());
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load live trains",
        );
      } finally {
        if (initialLoad) {
          setLoading(false);
        } else {
          setRefreshing(false);
        }
      }
    },
    [selectedStation],
  );

  // =========================
  // Reload when station changes
  // =========================

  useEffect(() => {
    if (!selectedStation) {
      return;
    }

    /*
     * Clear the previous station data
     * while the new station is loading.
     */
    setData(null);

    setLastUpdatedAt(null);

    /*
     * A new station has a different realtime event namespace.
     * Discard timestamps from the previous station.
     */
    realtimeUpdatedAtRef.current = {};

    void loadTrains(true);

    /*
     * Keep REST reconciliation as a fallback.
     *
     * WebSocket provides realtime updates.
     * REST keeps the snapshot synchronized.
     */
    const interval = window.setInterval(() => {
      void loadTrains(false);
    }, 30_000);

    return () => {
      window.clearInterval(interval);
    };
  }, [selectedStation, loadTrains]);

  // =========================
  // Realtime WebSocket events
  // =========================

  const handleRealtimeEvent = useCallback(
    (event: OperationsWebSocketEvent) => {
      if (!selectedStation) {
        return;
      }

      /*
       * Operations receives system-wide events.
       *
       * The Live Train page only applies events
       * belonging to the currently selected station.
       */
      if (event.data.stationEva !== selectedStation.eva) {
        return;
      }

      const trainNumber = String(event.data.trainNumber);
      const eventUpdatedAt = event.data.updatedAt;
      const previousUpdatedAt = realtimeUpdatedAtRef.current[trainNumber];

      /*
       * Ignore stale/out-of-order events.
       */
      if (previousUpdatedAt && eventUpdatedAt <= previousUpdatedAt) {
        return;
      }

      realtimeUpdatedAtRef.current[trainNumber] = eventUpdatedAt;

      setData((currentData) => {
        if (!currentData) {
          return currentData;
        }

        const existingIndex = currentData.trains.findIndex(
          (train) =>
            String(train.train.trainNumber) === trainNumber &&
            train.stationEva === event.data.stationEva,
        );

        const currentTrains = [...currentData.trains];

        // =========================
        // Full train update
        // =========================

        if (event.type === "train:updated") {
          const existingTrain =
            existingIndex >= 0 ? currentData.trains[existingIndex] : undefined;

          /*
           * Destination is optional because the existing
           * realtime event type may not contain it yet.
           *
           * When the event does contain destination, preserve
           * it. Otherwise retain the destination from the
           * existing REST snapshot.
           */
          const realtimeEventData = event.data as typeof event.data & {
            destination?: string;
            origin?: string;
            previousStations?: string[];
            nextStations?: string[];
          };

          const realtimeTrain: LiveTrain = {
            stationEva: event.data.stationEva,

            plannedArrival: event.data.plannedArrival ?? undefined,

            actualArrival: event.data.actualArrival ?? undefined,

            plannedDeparture: event.data.plannedDeparture ?? undefined,

            actualDeparture: event.data.actualDeparture ?? undefined,

            arrivalDelayMinutes: event.data.arrivalDelayMinutes,

            departureDelayMinutes: event.data.departureDelayMinutes,

            plannedPlatform: event.data.plannedPlatform ?? undefined,

            actualPlatform: event.data.actualPlatform ?? undefined,

            cancelled: event.data.cancelled,

            /*
             * Destination/origin/path information is retained
             * when it exists on the existing LiveTrain object.
             *
             * The type assertion keeps this component compatible
             * with the current LiveTrain type while allowing the
             * backend's destination field to be displayed.
             */
            ...(realtimeEventData.destination !== undefined ||
            (
              existingTrain as LiveTrain & {
                destination?: string;
              }
            )?.destination !== undefined
              ? {
                  destination:
                    realtimeEventData.destination ??
                    (
                      existingTrain as LiveTrain & {
                        destination?: string;
                      }
                    )?.destination,
                }
              : {}),

            ...(realtimeEventData.origin !== undefined ||
            (
              existingTrain as LiveTrain & {
                origin?: string;
              }
            )?.origin !== undefined
              ? {
                  origin:
                    realtimeEventData.origin ??
                    (
                      existingTrain as LiveTrain & {
                        origin?: string;
                      }
                    )?.origin,
                }
              : {}),

            ...(realtimeEventData.previousStations !== undefined ||
            (
              existingTrain as LiveTrain & {
                previousStations?: string[];
              }
            )?.previousStations !== undefined
              ? {
                  previousStations:
                    realtimeEventData.previousStations ??
                    (
                      existingTrain as LiveTrain & {
                        previousStations?: string[];
                      }
                    )?.previousStations,
                }
              : {}),

            ...(realtimeEventData.nextStations !== undefined ||
            (
              existingTrain as LiveTrain & {
                nextStations?: string[];
              }
            )?.nextStations !== undefined
              ? {
                  nextStations:
                    realtimeEventData.nextStations ??
                    (
                      existingTrain as LiveTrain & {
                        nextStations?: string[];
                      }
                    )?.nextStations,
                }
              : {}),

            train: {
              trainNumber: event.data.trainNumber,

              category: event.data.category,

              operator: existingTrain?.train.operator ?? "",

              flags: existingTrain?.train.flags,

              tripType: existingTrain?.train.tripType,
            },

            messages: existingTrain?.messages ?? [],
          };

          if (existingIndex >= 0) {
            currentTrains[existingIndex] = realtimeTrain;
          } else {
            currentTrains.unshift(realtimeTrain);
          }

          return {
            ...currentData,

            count: currentTrains.length,

            trains: currentTrains,
          };
        }

        // =========================
        // Delay update
        // =========================

        if (event.type === "train:delay_updated") {
          if (existingIndex < 0) {
            return currentData;
          }

          currentTrains[existingIndex] = {
            ...currentTrains[existingIndex],

            arrivalDelayMinutes: event.data.arrivalDelayMinutes,

            departureDelayMinutes: event.data.departureDelayMinutes,
          };

          return {
            ...currentData,

            trains: currentTrains,
          };
        }

        // =========================
        // Platform update
        // =========================

        if (event.type === "train:platform_changed") {
          if (existingIndex < 0) {
            return currentData;
          }

          currentTrains[existingIndex] = {
            ...currentTrains[existingIndex],

            plannedPlatform: event.data.plannedPlatform ?? undefined,

            actualPlatform: event.data.actualPlatform ?? undefined,
          };

          return {
            ...currentData,

            trains: currentTrains,
          };
        }

        // =========================
        // Cancellation
        // =========================

        if (event.type === "train:cancelled") {
          if (existingIndex < 0) {
            return currentData;
          }

          currentTrains[existingIndex] = {
            ...currentTrains[existingIndex],

            cancelled: event.data.cancelled,
          };

          return {
            ...currentData,

            trains: currentTrains,
          };
        }

        return currentData;
      });

      setLastUpdatedAt(new Date().toISOString());
    },
    [selectedStation],
  );

  // =========================
  // Operations WebSocket
  // =========================

  const {
    connected: webSocketConnected,
    subscribed: webSocketSubscribed,
    error: webSocketError,
  } = useOperationsWebSocket({
    onEvent: handleRealtimeEvent,
  });

  // =========================
  // Manual refresh
  // =========================

  async function handleRefresh() {
    await loadTrains(false);
  }

  // =========================
  // Categories
  // =========================

  const categories = useMemo(() => {
    if (!data) {
      return [];
    }

    return Array.from(
      new Set(data.trains.map((train) => train.train.category)),
    ).sort();
  }, [data]);

  // =========================
  // Filter trains
  // =========================

  const filteredTrains = useMemo(() => {
    if (!data) {
      return [];
    }

    const normalizedSearch = searchTerm.trim().toLowerCase();

    return data.trains.filter((train) => {
      const trainNumber = String(train.train.trainNumber ?? "").toLowerCase();

      const category = String(train.train.category ?? "").toLowerCase();

      const operator = String(train.train.operator ?? "").toLowerCase();

      const destination = String(
        (train as LiveTrain & { destination?: string }).destination ?? "",
      ).toLowerCase();

      const matchesSearch =
        normalizedSearch === "" ||
        trainNumber.includes(normalizedSearch) ||
        category.includes(normalizedSearch) ||
        operator.includes(normalizedSearch) ||
        destination.includes(normalizedSearch);

      const matchesCategory =
        categoryFilter === "ALL" ||
        String(train.train.category ?? "") === categoryFilter;

      const operationalStatus = getTrainOperationalStatus(train);

      const matchesStatus =
        statusFilter === "ALL" || operationalStatus === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [data, searchTerm, categoryFilter, statusFilter]);

  // =========================
  // Clear filters
  // =========================

  function clearFilters() {
    setSearchTerm("");
    setCategoryFilter("ALL");
    setStatusFilter("ALL");
  }

  // =========================
  // Loading stations
  // =========================

  if (stationLoading) {
    return (
      <section>
        <h2>Live Trains</h2>

        <p>Loading stations...</p>
      </section>
    );
  }

  // =========================
  // No station
  // =========================

  if (!selectedStation) {
    return (
      <section>
        <h2>Live Trains</h2>

        <p>No stations available.</p>
      </section>
    );
  }

  // =========================
  // Loading live trains
  // =========================

  if (loading && !data) {
    return (
      <section>
        <h2>Live Trains</h2>

        <p>Loading live trains for {selectedStation.name}...</p>
      </section>
    );
  }

  // =========================
  // Initial load error
  // =========================

  if (error && !data) {
    return (
      <section>
        <h2>Live Trains</h2>

        <p>{error}</p>

        <button onClick={() => void loadTrains(true)}>Retry</button>
      </section>
    );
  }

  return (
    <section>
      <h2>Live Trains</h2>

      {/* =========================
          Station Selection
          ========================= */}

      <div
        style={{
          position: "relative",
          maxWidth: "500px",
        }}
      >
        <label htmlFor="station-search">Station:</label>

        <input
          id="station-search"
          type="text"
          value={stationSearchTerm}
          onChange={(event) => {
            setStationSearchTerm(event.target.value);

            setShowStationSuggestions(true);
          }}
          onFocus={() => {
            setShowStationSuggestions(stationSearchTerm.trim() !== "");
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setShowStationSuggestions(false);
            }
          }}
          placeholder="Type station name..."
          autoComplete="off"
          style={{
            display: "block",
            width: "100%",
            marginTop: "4px",
            boxSizing: "border-box",
            padding: "6px 8px",
          }}
        />

        {/* =========================
            Station Suggestions
            ========================= */}

        {showStationSuggestions &&
          stationSearchTerm.trim() !== "" &&
          filteredStations.length > 0 && (
            <div
              role="listbox"
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                zIndex: 1000,
                maxHeight: "300px",
                overflowY: "auto",
                background: "#ffffff",
                border: "1px solid #ccc",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
              }}
            >
              {filteredStations.map((station) => (
                <button
                  key={station.eva}
                  type="button"
                  role="option"
                  onMouseDown={(event) => {
                    event.preventDefault();

                    handleStationSelect(station);
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "8px 10px",
                    border: "none",
                    borderBottom: "1px solid #eee",
                    background: "#fff",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <strong>{station.name}</strong> <span>({station.eva})</span>
                </button>
              ))}
            </div>
          )}

        {/* =========================
            No matching stations
            ========================= */}

        {showStationSuggestions &&
          stationSearchTerm.trim() !== "" &&
          filteredStations.length === 0 && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                zIndex: 1000,
                padding: "10px",
                background: "#ffffff",
                border: "1px solid #ccc",
              }}
            >
              No matching stations found.
            </div>
          )}
      </div>

      <p>
        Monitoring: <strong>{selectedStation.name}</strong> (EVA{" "}
        {selectedStation.eva})
      </p>

      <p>Total live trains: {data?.count ?? 0}</p>

      {/* =========================
          WebSocket Status
          ========================= */}

      <p>
        Realtime:{" "}
        <strong>
          {webSocketConnected && webSocketSubscribed
            ? "CONNECTED"
            : "CONNECTING"}
        </strong>
      </p>

      {webSocketError && <p>Realtime connection: {webSocketError}</p>}

      {/* =========================
          Refresh
          ========================= */}

      <div>
        <button onClick={() => void handleRefresh()} disabled={refreshing}>
          {refreshing ? "Refreshing..." : "Refresh Now"}
        </button>

        {lastUpdatedAt && (
          <p>Last updated: {new Date(lastUpdatedAt).toLocaleTimeString()}</p>
        )}

        <p>Automatic refresh: every 30 seconds</p>
      </div>

      {error && data && (
        <p>
          Unable to refresh live train data. Showing the last successful data.
        </p>
      )}

      {/* =========================
          Search & Filters
          ========================= */}

      <div>
        <h3>Search & Filters</h3>

        <div>
          <label htmlFor="train-search">Search train:</label>{" "}
          <input
            id="train-search"
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Train number, category, operator or destination"
          />
        </div>

        <div>
          <label htmlFor="category-filter">Category:</label>{" "}
          <select
            id="category-filter"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option value="ALL">All</option>

            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="status-filter">Status:</label>{" "}
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as TrainStatus)
            }
          >
            <option value="ALL">All</option>

            <option value="RUNNING">Running</option>

            <option value="DELAYED">Delayed</option>

            <option value="PLATFORM_CHANGED">Platform Changed</option>

            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <button onClick={clearFilters}>Clear Filters</button>

        <p>
          Showing {filteredTrains.length} of {data?.count ?? 0} trains
        </p>
      </div>

      {/* =========================
          Live Train Table
          ========================= */}

      <h3>Current Live Trains</h3>

      {filteredTrains.length === 0 ? (
        <div>
          <p>No trains match the current search or filters.</p>

          <button onClick={clearFilters}>Clear Filters</button>
        </div>
      ) : (
        <div
          style={{
            overflowX: "auto",
          }}
        >
          <table>
            <thead>
              <tr>
                <th scope="col">Train</th>

                <th scope="col">Category</th>

                <th scope="col">Operator</th>

                <th scope="col">Destination</th>

                <th scope="col">Arrival</th>

                <th scope="col">Departure</th>

                <th scope="col">Delay</th>

                <th scope="col">Platform</th>

                <th scope="col">Status</th>

                <th scope="col">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredTrains.map((train, index) => {
                /*
                 * IMPORTANT:
                 * No React hooks are used
                 * inside this map.
                 */
                const trainNumber = String(train.train.trainNumber);

                const arrivalDelay = train.arrivalDelayMinutes ?? 0;

                const departureDelay = train.departureDelayMinutes ?? 0;

                const maximumDelay = Math.max(arrivalDelay, departureDelay);

                const status = getTrainOperationalStatus(train);

                /*
                 * Destination is supplied by the backend LiveStopDto
                 * and propagated into LiveTrain.
                 *
                 * Use a type-safe compatibility cast here so this
                 * component can display the field even if the current
                 * operations.types.ts has not yet been updated with
                 * destination?: string.
                 */
                const destination = (
                  train as LiveTrain & { destination?: string }
                ).destination;

                return (
                  <tr key={`${trainNumber}-${train.stationEva}-${index}`}>
                    <td>
                      <strong>{trainNumber}</strong>
                    </td>

                    <td>{train.train.category}</td>

                    <td>{train.train.operator || "N/A"}</td>

                    <td>
                      {destination && destination.trim() !== ""
                        ? destination
                        : "N/A"}
                    </td>

                    <td>
                      {train.actualArrival ?? train.plannedArrival ?? "N/A"}
                    </td>

                    <td>
                      {train.actualDeparture ?? train.plannedDeparture ?? "N/A"}
                    </td>

                    <td>
                      {status === "DELAYED" ? `${maximumDelay} min` : "—"}
                    </td>

                    <td>
                      {train.actualPlatform ?? train.plannedPlatform ?? "N/A"}
                    </td>

                    <td>{status.replace("_", " ")}</td>

                    <td>
                      <button
                        type="button"
                        onClick={() =>
                          onNavigateToTrainDetails({
                            ...train,

                            /*
                             * The currently selected station is authoritative.
                             *
                             * This guarantees that the train passed to
                             * Train Details always carries the EVA of the
                             * station whose Live Trains table is being viewed.
                             */
                            stationEva:
                              selectedStation?.eva ?? train.stationEva,
                          })
                        }
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default LiveTrainMonitor;
