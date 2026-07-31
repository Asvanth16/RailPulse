export class RailwayApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = "RailwayApiError";
  }
}

export class RailwayAuthenticationError extends RailwayApiError {
  constructor(message = "Railway API authentication failed.") {
    super(message, 401);
    this.name = "RailwayAuthenticationError";
  }
}

export class RailwayRateLimitError extends RailwayApiError {
  constructor(message = "Railway API rate limit exceeded.") {
    super(message, 429);
    this.name = "RailwayRateLimitError";
  }
}

export class RailwayTimeoutError extends RailwayApiError {
  constructor(message = "Railway API request timed out.") {
    super(message, 408);
    this.name = "RailwayTimeoutError";
  }
}