import { useCallback, useEffect, useMemo, useState } from "react";

import { operationsApi } from "../api/operations.api";

import type { LiveTrain, LiveTrainsResponse } from "../types/operations.types";

type TrainStatus =
  "ALL" | "RUNNING" | "DELAYED" | "PLATFORM_CHANGED" | "CANCELLED";

function LiveTrainMonitor() {
  const [data, setData] = useState<LiveTrainsResponse | null>(null);

  const [selectedTrain, setSelectedTrain] = useState<LiveTrain | null>(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [detailsLoading, setDetailsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [detailsError, setDetailsError] = useState<string | null>(null);

  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);

  // =========================
  // Filters
  // =========================

  const [searchTerm, setSearchTerm] = useState("");

  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const [statusFilter, setStatusFilter] = useState<TrainStatus>("ALL");

  // =========================
  // Load live trains
  // =========================

  const loadTrains = useCallback(async (initialLoad = false) => {
    try {
      if (initialLoad) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError(null);

      const response = await operationsApi.getLiveTrains();

      setData(response.data);

      setLastUpdatedAt(new Date().toISOString());
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load live trains";

      setError(message);
    } finally {
      if (initialLoad) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  }, []);

  // =========================
  // Automatic refresh
  // =========================

  useEffect(() => {
    loadTrains(true);

    const interval = window.setInterval(() => {
      loadTrains(false);
    }, 30_000);

    return () => {
      window.clearInterval(interval);
    };
  }, [loadTrains]);

  // =========================
  // Manual refresh
  // =========================

  async function handleRefresh() {
    await loadTrains(false);
  }

  // =========================
  // Load train details
  // =========================

  async function loadTrainDetails(trainNumber: string | number) {
    try {
      setDetailsLoading(true);
      setDetailsError(null);

      const response = await operationsApi.getLiveTrain(String(trainNumber));

      setSelectedTrain(response.data);
    } catch (err) {
      setDetailsError(
        err instanceof Error ? err.message : "Failed to load train details",
      );
    } finally {
      setDetailsLoading(false);
    }
  }

  // =========================
  // Operational conditions
  // =========================

  function isCancelled(train: LiveTrain) {
    return train.cancelled;
  }

  function isDelayed(train: LiveTrain) {
    /*
     * IMPORTANT:
     * A cancelled train is NOT considered
     * delayed for operational display/filtering.
     */
    return (
      !isCancelled(train) &&
      ((train.arrivalDelayMinutes ?? 0) > 0 ||
        (train.departureDelayMinutes ?? 0) > 0)
    );
  }

  function hasPlatformChanged(train: LiveTrain) {
    /*
     * IMPORTANT:
     * A cancelled train is NOT considered
     * platform-changed for operational
     * display/filtering.
     */
    return (
      !isCancelled(train) &&
      train.plannedPlatform !== undefined &&
      train.plannedPlatform !== null &&
      train.actualPlatform !== undefined &&
      train.actualPlatform !== null &&
      train.plannedPlatform !== train.actualPlatform
    );
  }

  function isRunning(train: LiveTrain) {
    return (
      !isCancelled(train) && !isDelayed(train) && !hasPlatformChanged(train)
    );
  }

  // =========================
  // Available categories
  // =========================

  const categories = useMemo(() => {
    if (!data) {
      return [];
    }

    const uniqueCategories = new Set(
      data.trains.map((train) => train.train.category),
    );

    return Array.from(uniqueCategories).sort();
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
      const trainNumber = String(train.train.trainNumber).toLowerCase();

      const category = train.train.category.toLowerCase();

      const matchesSearch =
        normalizedSearch === "" ||
        trainNumber.includes(normalizedSearch) ||
        category.includes(normalizedSearch);

      const matchesCategory =
        categoryFilter === "ALL" || train.train.category === categoryFilter;

      let matchesStatus = true;

      switch (statusFilter) {
        case "RUNNING":
          matchesStatus = isRunning(train);
          break;

        case "DELAYED":
          matchesStatus = isDelayed(train);
          break;

        case "PLATFORM_CHANGED":
          matchesStatus = hasPlatformChanged(train);
          break;

        case "CANCELLED":
          matchesStatus = isCancelled(train);
          break;

        case "ALL":
        default:
          matchesStatus = true;
          break;
      }

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
  // Initial loading
  // =========================

  if (loading) {
    return (
      <section>
        <h2>Live Trains</h2>

        <p>Loading live trains...</p>
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

        <button onClick={() => loadTrains(true)}>Retry</button>
      </section>
    );
  }

  return (
    <section>
      <h2>Live Trains</h2>

      <p>Station: {data?.stationEva ?? "All monitored stations"}</p>

      <p>Total live trains: {data?.count ?? 0}</p>

      {/* =========================
          Refresh Information
          ========================= */}

      <div>
        <button onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? "Refreshing..." : "Refresh Now"}
        </button>

        {lastUpdatedAt && (
          <p>Last updated: {new Date(lastUpdatedAt).toLocaleTimeString()}</p>
        )}

        <p>Automatic refresh: every 30 seconds</p>
      </div>

      {error && data && (
        <p>Unable to refresh live train data. Showing last successful data.</p>
      )}

      {/* =========================
          Search & Filters
          ========================= */}

      <div>
        <h3>Search & Filters</h3>

        <div>
          <label htmlFor="train-search">Search train:</label>

          <input
            id="train-search"
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Train number or category"
          />
        </div>

        <div>
          <label htmlFor="category-filter">Category:</label>

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
          <label htmlFor="status-filter">Status:</label>

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
          Selected Train Details
          ========================= */}

      {detailsLoading && (
        <div>
          <h3>Train Details</h3>

          <p>Loading train details...</p>
        </div>
      )}

      {detailsError && (
        <div>
          <h3>Train Details</h3>

          <p>{detailsError}</p>

          <button onClick={() => setDetailsError(null)}>Close</button>
        </div>
      )}

      {selectedTrain && !detailsLoading && !detailsError && (
        <div>
          <h3>
            {selectedTrain.train.category} {selectedTrain.train.trainNumber}
          </h3>

          <p>Operational status:</p>

          {isCancelled(selectedTrain) ? (
            <p>🔴 CANCELLED</p>
          ) : (
            <>
              {isDelayed(selectedTrain) && <p>🟠 DELAYED</p>}

              {hasPlatformChanged(selectedTrain) && <p>🟡 PLATFORM CHANGED</p>}

              {isRunning(selectedTrain) && <p>🟢 RUNNING</p>}
            </>
          )}

          <p>Train number: {selectedTrain.train.trainNumber}</p>

          <p>Category: {selectedTrain.train.category}</p>

          <p>Operator: {selectedTrain.train.operator}</p>

          <p>Station EVA: {selectedTrain.stationEva}</p>

          <p>
            Planned arrival:{" "}
            {selectedTrain.plannedArrival
              ? new Date(selectedTrain.plannedArrival).toLocaleString()
              : "N/A"}
          </p>

          <p>
            Actual arrival:{" "}
            {selectedTrain.actualArrival
              ? new Date(selectedTrain.actualArrival).toLocaleString()
              : "N/A"}
          </p>

          <p>
            Planned departure:{" "}
            {selectedTrain.plannedDeparture
              ? new Date(selectedTrain.plannedDeparture).toLocaleString()
              : "N/A"}
          </p>

          <p>
            Actual departure:{" "}
            {selectedTrain.actualDeparture
              ? new Date(selectedTrain.actualDeparture).toLocaleString()
              : "N/A"}
          </p>

          <p>Planned platform: {selectedTrain.plannedPlatform ?? "N/A"}</p>

          <p>Actual platform: {selectedTrain.actualPlatform ?? "N/A"}</p>

          <p>Arrival delay: {selectedTrain.arrivalDelayMinutes ?? 0} minutes</p>

          <p>
            Departure delay: {selectedTrain.departureDelayMinutes ?? 0} minutes
          </p>

          <p>Cancelled: {selectedTrain.cancelled ? "Yes" : "No"}</p>

          <h4>Messages</h4>

          {selectedTrain.messages && selectedTrain.messages.length > 0 ? (
            selectedTrain.messages.map((message) => (
              <div key={message.id}>
                <p>Type: {message.type}</p>

                <p>{message.text || "No message text"}</p>

                {message.priority && <p>Priority: {message.priority}</p>}
              </div>
            ))
          ) : (
            <p>No messages.</p>
          )}

          <button onClick={() => setSelectedTrain(null)}>Close Details</button>
        </div>
      )}

      {/* =========================
          Filtered Train List
          ========================= */}

      <h3>Current Live Trains</h3>

      {filteredTrains.length === 0 ? (
        <div>
          <p>No trains match the current search or filters.</p>

          <button onClick={clearFilters}>Clear Filters</button>
        </div>
      ) : (
        <div>
          {filteredTrains.map((train, index) => {
            const trainNumber = String(train.train.trainNumber);

            const arrivalDelay = train.arrivalDelayMinutes ?? 0;

            const departureDelay = train.departureDelayMinutes ?? 0;

            const maximumDelay = Math.max(arrivalDelay, departureDelay);

            return (
              <div key={`${trainNumber}-${train.stationEva}-${index}`}>
                <h4>
                  {train.train.category} {trainNumber}
                </h4>

                {/* =========================
                      Operational indicators
                      ========================= */}

                {isCancelled(train) ? (
                  <p>🔴 CANCELLED</p>
                ) : (
                  <>
                    {isDelayed(train) && <p>🟠 DELAYED</p>}

                    {hasPlatformChanged(train) && <p>🟡 PLATFORM CHANGED</p>}

                    {isRunning(train) && <p>🟢 RUNNING</p>}
                  </>
                )}

                <p>
                  Platform:{" "}
                  {train.actualPlatform ?? train.plannedPlatform ?? "N/A"}
                </p>

                {!isCancelled(train) && isDelayed(train) && (
                  <p>Delay: {maximumDelay} minutes</p>
                )}

                {!isCancelled(train) && hasPlatformChanged(train) && (
                  <p>
                    Planned platform: {train.plannedPlatform} → Actual:{" "}
                    {train.actualPlatform}
                  </p>
                )}

                <button onClick={() => loadTrainDetails(trainNumber)}>
                  View Details
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default LiveTrainMonitor;
