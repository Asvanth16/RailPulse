import LiveTrainMonitor from "../components/LiveTrainMonitor";

interface LiveTrainsPageProps {
  onBack: () => void;
}

function LiveTrainsPage({
  onBack,
}: LiveTrainsPageProps) {
  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">
            RAILPULSE OPERATIONS
          </p>

          <h1>Live Trains</h1>

          <p>
            Monitor all currently active trains
            and inspect their operational details.
          </p>

          <button onClick={onBack}>
            Back to Dashboard
          </button>
        </div>
      </header>

      <LiveTrainMonitor />
    </div>
  );
}

export default LiveTrainsPage;