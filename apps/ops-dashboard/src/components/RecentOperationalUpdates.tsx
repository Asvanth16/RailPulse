import type { OperationalUpdate } from "../types/operations.types";

interface RecentOperationalUpdatesProps {
  updates: OperationalUpdate[];
}

function getUpdateIcon(type: OperationalUpdate["type"]) {
  switch (type) {
    case "CANCELLED":
      return "🔴";

    case "PLATFORM_CHANGED":
      return "🟡";

    case "DELAY_CHANGED":
      return "🟠";

    default:
      return "ℹ️";
  }
}

function getUpdateLabel(type: OperationalUpdate["type"]) {
  switch (type) {
    case "CANCELLED":
      return "Cancelled";

    case "PLATFORM_CHANGED":
      return "Platform Changed";

    case "DELAY_CHANGED":
      return "Delay Changed";

    default:
      return "Operational Update";
  }
}

function getUpdateClass(type: OperationalUpdate["type"]) {
  switch (type) {
    case "CANCELLED":
      return "operational-update cancelled";

    case "PLATFORM_CHANGED":
      return "operational-update platform-changed";

    case "DELAY_CHANGED":
      return "operational-update delayed";

    default:
      return "operational-update";
  }
}

function getRelativeTime(detectedAt: string) {
  const detectedTime = new Date(detectedAt).getTime();

  const now = Date.now();

  const difference = Math.max(0, now - detectedTime);

  const seconds = Math.floor(difference / 1000);

  if (seconds < 10) {
    return "Just now";
  }

  if (seconds < 60) {
    return `${seconds}s ago`;
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hr ago`;
  }

  const days = Math.floor(hours / 24);

  return `${days}d ago`;
}

function RecentOperationalUpdates({ updates }: RecentOperationalUpdatesProps) {
  const visibleUpdates = updates.slice(0, 10);

  return (
    <section className="recent-operational-updates">
      <div className="recent-updates-header">
        <div>
          <p className="dashboard-eyebrow">LIVE OPERATIONS</p>

          <h2>Recent Operational Updates</h2>

          <p>Recent changes detected from live train data.</p>
        </div>

        {updates.length > 0 && (
          <span>
            {updates.length} recent{" "}
            {updates.length === 1 ? "update" : "updates"}
          </span>
        )}
      </div>

      {visibleUpdates.length === 0 ? (
        <div className="recent-updates-empty">
          <p>No recent operational updates.</p>

          <small>
            Changes to delays, platforms, and cancellations will appear here
            automatically.
          </small>
        </div>
      ) : (
        <div className="recent-updates-list">
          {visibleUpdates.map((update) => (
            <article key={update.id} className={getUpdateClass(update.type)}>
              <div className="operational-update-icon">
                {getUpdateIcon(update.type)}
              </div>

              <div className="operational-update-content">
                <div className="operational-update-top">
                  <strong>
                    {update.category} {update.trainNumber}
                  </strong>

                  <span>{getUpdateLabel(update.type)}</span>
                </div>

                <p>{update.message}</p>

                <small>{getRelativeTime(update.detectedAt)}</small>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default RecentOperationalUpdates;
