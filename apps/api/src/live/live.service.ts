import { deutscheBahnProvider } from "../integrations/deutsche-bahn";

export class LiveService {
  async searchStations(query: string) {
    return deutscheBahnProvider.searchStations(query);
  }

  async getPlannedTimetable(
    evaNo: string,
    date: string,
    hour: string,
  ) {
    return deutscheBahnProvider.getPlannedTimetable(
      evaNo,
      date,
      hour,
    );
  }

  async getFullChanges(evaNo: string) {
    return deutscheBahnProvider.getFullChanges(evaNo);
  }

  async getRecentChanges(evaNo: string) {
    return deutscheBahnProvider.getRecentChanges(evaNo);
  }
}

export const liveService = new LiveService();