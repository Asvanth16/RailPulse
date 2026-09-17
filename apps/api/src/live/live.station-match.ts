const STATION_SYNONYMS: Record<string, string[]> = {
  hbf: ["hbf", "hauptbahnhof"],
  hauptbahnhof: ["hauptbahnhof", "hbf"],
};

function expand(word: string): string[] {
  return STATION_SYNONYMS[word.toLowerCase()] ?? [word];
}

function words(value: string): string[] {
  return value
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 0);
}

/**
 * True if every word in `query` matches somewhere in `candidate`
 * (case-insensitive, Hbf/Hauptbahnhof treated as equivalent).
 */
export function stationNameMatches(candidate: string, query: string): boolean {
  const candidateLower = candidate.toLowerCase();
  const queryWords = words(query);

  if (queryWords.length === 0) return false;

  return queryWords.every((word) =>
    expand(word).some((variant) => candidateLower.includes(variant.toLowerCase())),
  );
}

/** True if any station in the list matches the query (see stationNameMatches). */
export function anyStationMatches(candidates: string[], query: string): boolean {
  return candidates.some((candidate) => stationNameMatches(candidate, query));
}
