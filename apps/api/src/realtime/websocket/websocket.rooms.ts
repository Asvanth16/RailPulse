export const WebSocketRooms = {
  train(trainNumber: string): string {
    return `train:${trainNumber}`;
  },

  user(userId: string): string {
    return `user:${userId}`;
  },
};