import LiveTrainMonitor from "../components/LiveTrainMonitor";

import type { LiveTrain } from "../types/operations.types";

interface LiveTrainsPageProps {
  onBack: () => void;

  onNavigateToTrainDetails: (train: LiveTrain) => void;
}

function LiveTrainsPage({
  onBack,
  onNavigateToTrainDetails,
}: LiveTrainsPageProps) {
  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">RAILPULSE OPERATIONS</p>

          <h1>Live Trains</h1>

          <p>
            Monitor all currently active trains at the selected station and
            inspect their operational details.
          </p>

          <button onClick={onBack}>Back to Dashboard</button>
        </div>
      </header>

      <LiveTrainMonitor onNavigateToTrainDetails={onNavigateToTrainDetails} />
    </div>
  );
}

export default LiveTrainsPage;
