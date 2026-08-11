import { useEffect, useState } from "react";

import { operationsApi } from "../api/operations.api";

import type {
  LiveTrain,
  LiveTrainsResponse,
} from "../types/operations.types";

function LiveTrainMonitor() {
  const [data, setData] =
    useState<LiveTrainsResponse | null>(null);

  const [selectedTrain, setSelectedTrain] =
    useState<LiveTrain | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [detailsLoading, setDetailsLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [detailsError, setDetailsError] =
    useState<string | null>(null);

  async function loadTrains() {
    try {
      setLoading(true);
      setError(null);

      const response =
        await operationsApi.getLiveTrains();

      setData(response.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load live trains",
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadTrainDetails(
    trainNumber: string | number,
  ) {
    try {
      setDetailsLoading(true);
      setDetailsError(null);

      const response =
        await operationsApi.getLiveTrain(
          String(trainNumber),
        );

      setSelectedTrain(response.data);
    } catch (err) {
      setDetailsError(
        err instanceof Error
          ? err.message
          : "Failed to load train details",
      );
    } finally {
      setDetailsLoading(false);
    }
  }

  useEffect(() => {
    loadTrains();
  }, []);

  if (loading) {
    return <p>Loading live trains...</p>;
  }

  if (error) {
    return (
      <section>
        <h2>Live Trains</h2>

        <p>{error}</p>

        <button onClick={loadTrains}>
          Retry
        </button>
      </section>
    );
  }

  return (
    <section>
      <h2>Live Trains</h2>

      <p>
        Station:{" "}
        {data?.stationEva ??
          "All monitored stations"}
      </p>

      <p>
        Total live trains:{" "}
        {data?.count ?? 0}
      </p>

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

          <button
            onClick={() =>
              setDetailsError(null)
            }
          >
            Close
          </button>
        </div>
      )}

      {selectedTrain && !detailsLoading && (
        <div>
          <h3>
            {selectedTrain.train.category}{" "}
            {selectedTrain.train.trainNumber}
          </h3>

          <p>
            Train number:{" "}
            {selectedTrain.train.trainNumber}
          </p>

          <p>
            Category:{" "}
            {selectedTrain.train.category}
          </p>

          <p>
            Operator:{" "}
            {selectedTrain.train.operator}
          </p>

          <p>
            Station EVA:{" "}
            {selectedTrain.stationEva}
          </p>

          <p>
            Planned arrival:{" "}
            {selectedTrain.plannedArrival
              ? new Date(
                  selectedTrain.plannedArrival,
                ).toLocaleString()
              : "N/A"}
          </p>

          <p>
            Actual arrival:{" "}
            {selectedTrain.actualArrival
              ? new Date(
                  selectedTrain.actualArrival,
                ).toLocaleString()
              : "N/A"}
          </p>

          <p>
            Planned departure:{" "}
            {selectedTrain.plannedDeparture
              ? new Date(
                  selectedTrain.plannedDeparture,
                ).toLocaleString()
              : "N/A"}
          </p>

          <p>
            Actual departure:{" "}
            {selectedTrain.actualDeparture
              ? new Date(
                  selectedTrain.actualDeparture,
                ).toLocaleString()
              : "N/A"}
          </p>

          <p>
            Planned platform:{" "}
            {selectedTrain.plannedPlatform ??
              "N/A"}
          </p>

          <p>
            Actual platform:{" "}
            {selectedTrain.actualPlatform ??
              "N/A"}
          </p>

          <p>
            Arrival delay:{" "}
            {selectedTrain.arrivalDelayMinutes ??
              0}{" "}
            minutes
          </p>

          <p>
            Departure delay:{" "}
            {selectedTrain.departureDelayMinutes ??
              0}{" "}
            minutes
          </p>

          <p>
            Cancelled:{" "}
            {selectedTrain.cancelled
              ? "Yes"
              : "No"}
          </p>

          <h4>Messages</h4>

          {selectedTrain.messages &&
          selectedTrain.messages.length > 0 ? (
            selectedTrain.messages.map(
              (message) => (
                <div key={message.id}>
                  <p>
                    Type: {message.type}
                  </p>

                  <p>
                    {message.text ||
                      "No message text"}
                  </p>
                </div>
              ),
            )
          ) : (
            <p>No messages.</p>
          )}

          <button
            onClick={() =>
              setSelectedTrain(null)
            }
          >
            Close Details
          </button>
        </div>
      )}

      {/* =========================
          Live Train List
          ========================= */}

      <h3>Current Live Trains</h3>

      {data?.trains.length === 0 ? (
        <p>No live trains found.</p>
      ) : (
        <div>
          {data?.trains.map((train, index) => {
            const trainNumber = String(
              train.train.trainNumber,
            );

            return (
              <div
                key={`${trainNumber}-${train.stationEva}-${index}`}
              >
                <p>
                  <strong>
                    {train.train.category}{" "}
                    {trainNumber}
                  </strong>
                </p>

                <p>
                  Station EVA:{" "}
                  {train.stationEva}
                </p>

                <p>
                  Platform:{" "}
                  {train.actualPlatform ??
                    train.plannedPlatform ??
                    "N/A"}
                </p>

                <p>
                  Arrival delay:{" "}
                  {train.arrivalDelayMinutes ??
                    0}{" "}
                  min
                </p>

                <p>
                  Departure delay:{" "}
                  {train.departureDelayMinutes ??
                    0}{" "}
                  min
                </p>

                <p>
                  Cancelled:{" "}
                  {train.cancelled
                    ? "Yes"
                    : "No"}
                </p>

                <button
                  onClick={() =>
                    loadTrainDetails(
                      trainNumber,
                    )
                  }
                >
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