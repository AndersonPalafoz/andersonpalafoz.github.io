export type StudentNotification = {
  id: number;
  type: string;
  title: string;
  message: string;
  metadata: string | null;
  readAt: string | null;
  createdAt: string;
};

export function isUnreadMedalNotification(notification: StudentNotification) {
  if (notification.readAt || notification.type !== "achievement") return false;

  try {
    const metadata = notification.metadata ? JSON.parse(notification.metadata) as { medalCode?: unknown } : null;
    return typeof metadata?.medalCode === "string" && metadata.medalCode.trim().length > 0;
  } catch {
    return false;
  }
}

export function getNewUnreadMedalNotifications(notifications: StudentNotification[], seenIds: ReadonlySet<number>) {
  return notifications.filter((notification) => isUnreadMedalNotification(notification) && !seenIds.has(notification.id));
}
