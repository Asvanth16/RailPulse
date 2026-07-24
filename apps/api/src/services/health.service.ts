import { ApiResponse } from "../types/api-response";
import { getServerStatus } from "../repositories/health.repository";

export const getHealthStatus = (): ApiResponse<{
  status: string;
  timestamp: Date;
}> => ({
  success: true,
  message: "Server is healthy",
  data: getServerStatus(),
});