import { useEffect, useState } from "react";

import "./App.css";

import Login from "./pages/Login";
import OperationsDashboard from "./pages/OperationsDashboard";
import LiveTrainsPage from "./pages/LiveTrainsPage";

type Page = "dashboard" | "live-trains";

function App() {
  const [authenticated, setAuthenticated] = useState(
    Boolean(localStorage.getItem("railpulse_access_token")),
  );

  const [currentPage, setCurrentPage] = useState<Page>("dashboard");

  useEffect(() => {
    function handleAuthExpired() {
      setAuthenticated(false);
      setCurrentPage("dashboard");
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
        }}
      />
    );
  }

  if (currentPage === "live-trains") {
    return <LiveTrainsPage onBack={() => setCurrentPage("dashboard")} />;
  }

  return (
    <OperationsDashboard
      onNavigateToLiveTrains={() => setCurrentPage("live-trains")}
    />
  );
}

export default App;
