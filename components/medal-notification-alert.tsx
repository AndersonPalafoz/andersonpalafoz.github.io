"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getNewUnreadMedalNotifications, type StudentNotification } from "@/lib/medal-notifications";

const SESSION_KEY = "ap_seen_medal_notification_ids_v1";
const POLLING_INTERVAL_MS = 10_000;

function readSeenIds() {
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(SESSION_KEY) || "[]") as unknown;
    return new Set(Array.isArray(parsed) ? parsed.filter((id): id is number => Number.isInteger(id) && id > 0) : []);
  } catch {
    return new Set<number>();
  }
}

function storeSeenIds(ids: ReadonlySet<number>) {
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(Array.from(ids).slice(-100)));
}

export function MedalNotificationAlert() {
  const router = useRouter();
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    let active = true;
    const seenIds = readSeenIds();

    const announceNewMedals = (medals: StudentNotification[]) => {
      if (!active || medals.length === 0) return;

      medals.forEach((medal) => seenIds.add(medal.id));
      storeSeenIds(seenIds);

      const singular = medals.length === 1;
      const title = singular ? medals[0].title : `${medals.length} novas medalhas concedidas`;
      const description = singular
        ? medals[0].message
        : "Seus novos reconhecimentos de aprendizagem foram registrados na plataforma.";
      const status = singular ? `Nova medalha concedida: ${medals[0].title}.` : `${medals.length} novas medalhas foram concedidas.`;

      setAnnouncement(status);
      toast.success(title, {
        description,
        duration: 8_000,
        action: { label: "Ver no perfil", onClick: () => router.push("/dashboard/perfil#medals-title") },
      });
    };

    const checkNotifications = async () => {
      try {
        const response = await fetch("/api/notifications", { cache: "no-store" });
        const payload = await response.json();
        if (!response.ok || !Array.isArray(payload.notifications)) return;
        announceNewMedals(getNewUnreadMedalNotifications(payload.notifications as StudentNotification[], seenIds));
      } catch {
        // Falhas transitórias não devem interromper a aprendizagem nem gerar alertas repetidos.
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) void checkNotifications();
    };

    void checkNotifications();
    const interval = window.setInterval(() => { if (!document.hidden) void checkNotifications(); }, POLLING_INTERVAL_MS);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      active = false;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [router]);

  return <p className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</p>;
}
