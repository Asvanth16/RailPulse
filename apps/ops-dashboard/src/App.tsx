import { useEffect, useState } from "react";

import "./App.css";

import Login from "./pages/Login";
import OperationsDashboard from "./pages/OperationsDashboard";

function App() {
  const [authenticated, setAuthenticated] =
    useState(
      Boolean(
        localStorage.getItem(
          "railpulse_access_token",
        ),
      ),
    );

  useEffect(() => {
    function handleAuthExpired() {
      setAuthenticated(false);
    }

    window.addEventListener(
      "railpulse:auth-expired",
      handleAuthExpired,
    );

    return () => {
      window.removeEventListener(
        "railpulse:auth-expired",
        handleAuthExpired,
      );
    };
  }, []);

  if (!authenticated) {
    return (
      <Login
        onLoginSuccess={() =>
          setAuthenticated(true)
        }
      />
    );
  }

  return <OperationsDashboard />;
}

export default App;