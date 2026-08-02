export interface NotificationPreferenceDto {
  id?: string;

  pushNotifications: boolean;
  emailNotifications: boolean;

  delayAlerts: boolean;
  platformChangeAlerts: boolean;

  departureReminders: boolean;

  reminderMinutes: number;

  createdAt?: string;
  updatedAt?: string;
}