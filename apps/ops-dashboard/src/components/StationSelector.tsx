import { useEffect, useRef, useState } from "react";

import { operationsApi } from "../api/operations.api";

import type { OperationsStation } from "../types/operations.types";

interface StationSelectorProps {
  selectedStation: OperationsStation | null;

  onStationSelect: (station: OperationsStation | null) => void;
}

export default function StationSelector({
  selectedStation,
  onStationSelect,
}: StationSelectorProps) {
  const [search, setSearch] = useState("");

  const [results, setResults] = useState<OperationsStation[]>([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [showResults, setShowResults] = useState(false);

  const searchTimeout = useRef<number | null>(null);

  useEffect(() => {
    if (searchTimeout.current !== null) {
      window.clearTimeout(searchTimeout.current);
    }

    const value = search.trim();

    if (!value) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    searchTimeout.current = window.setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await operationsApi.searchStations(value);

        setResults(response.data);

        setShowResults(true);
      } catch (err) {
        setResults([]);

        setError(err instanceof Error ? err.message : "Station search failed");
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => {
      if (searchTimeout.current !== null) {
        window.clearTimeout(searchTimeout.current);
      }
    };
  }, [search]);

  const handleSelect = (station: OperationsStation) => {
    setSearch(station.name);
    setShowResults(false);

    onStationSelect(station);
  };

  return (
    <div className="station-selector">
      <label htmlFor="operations-station-search">Monitoring Station</label>

      <div className="station-selector-input">
        <input
          id="operations-station-search"
          type="text"
          value={search}
          placeholder="Search station..."
          autoComplete="off"
          onFocus={() => {
            if (results.length > 0) {
              setShowResults(true);
            }
          }}
          onChange={(event) => {
            setSearch(event.target.value);

            if (!event.target.value.trim()) {
              onStationSelect(null as never);
            }
          }}
        />

        {loading && <span>Searching...</span>}
      </div>

      {error && <div className="station-selector-error">{error}</div>}

      {showResults && results.length > 0 && (
        <div className="station-selector-results">
          {results.map((station) => (
            <button
              key={`${station.eva}-${station.ds100}`}
              type="button"
              onClick={() => handleSelect(station)}
            >
              <strong>{station.name}</strong>

              <span>
                {station.ds100} · EVA {station.eva}
              </span>
            </button>
          ))}
        </div>
      )}

      {showResults &&
        !loading &&
        search.trim() &&
        results.length === 0 &&
        !error && (
          <div className="station-selector-empty">No stations found.</div>
        )}

      {selectedStation && (
        <div className="station-selector-selected">
          <strong>{selectedStation.name}</strong>

          <span>
            {selectedStation.ds100} · EVA {selectedStation.eva}
          </span>
        </div>
      )}
    </div>
  );
}
