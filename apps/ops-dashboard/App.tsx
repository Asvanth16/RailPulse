import { useEffect, useState } from "react";

import "./App.css";

import Login from "./pages/Login";
import OperationsDashboard from "./pages/OperationsDashboard";
import LiveTrainsPage from "./pages/LiveTrainsPage";
import TrainDetailsPage from "./pages/TrainDetailsPage";

import type { LiveTrain } from "./types/operations.types";

type AppPage = "dashboard" | "live-trains" | "train-details";

function App() {
  const [authenticated, setAuthenticated] = useState(
    Boolean(localStorage.getItem("railpulse_access_token")),
  );

  const [currentPage, setCurrentPage] = useState<AppPage>("dashboard");

  const [selectedTrain, setSelectedTrain] = useState<LiveTrain | null>(null);

  useEffect(() => {
    function handleAuthExpired() {
      setAuthenticated(false);

      setCurrentPage("dashboard");

      setSelectedTrain(null);
    }

    window.addEventListener("railpulse:auth-expired", handleAuthExpired);

    return () => {
      window.removeEventListener("railpulse:auth-expired", handleAuthExpired);
    };
  }, []);

  if (!authenticated) {
    return (
      <Login
        onLoginSuccess={() => {
          setAuthenticated(true);
          setCurrentPage("dashboard");
          setSelectedTrain(null);
        }}
      />
    );
  }

  // =========================
  // Train Details
  // =========================

  if (
    currentPage === "train-details" &&
    selectedTrain
  ) {
    return (
      <TrainDetailsPage
        trainNumber={String(selectedTrain.train.trainNumber)}
        stationEva={selectedTrain.stationEva}
        initialTrain={selectedTrain}
        onBack={() => {
          setCurrentPage("live-trains");

          setSelectedTrain(null);
        }}
      />
    );
  }

  // =========================
  // Live Trains
  // =========================

  if (currentPage === "live-trains") {
    return (
      <LiveTrainsPage
        onBack={() => {
          setCurrentPage("dashboard");
        }}
        onNavigateToTrainDetails={(train) => {
          setSelectedTrain(train);
          setCurrentPage("train-details");
        }}
      />
    );
  }

  // =========================
  // Dashboard
  // =========================

  return (
    <OperationsDashboard
      onNavigateToLiveTrains={() => setCurrentPage("live-trains")}
    />
  );
}

export default App;
