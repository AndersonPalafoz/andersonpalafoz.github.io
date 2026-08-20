"use client";

import { useEffect, useState } from "react";

export function StreakBadge() {
  const [streakDays, setStreakDays] = useState<number | null>(null);

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const res = await fetch("/api/user/medals", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (typeof data.streakDays === "number") {
            setStreakDays(data.streakDays);
            return;
          }
        }
        setStreakDays(0);
      } catch {
        setStreakDays(0);
      }
    };
    void fetchStreak();
  }, []);

  if (streakDays === null || streakDays <= 0) {
    return null;
  }

  return (
    <div
      className="hidden sm:flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 px-3 py-1.5 rounded-full text-xs font-black text-amber-700 dark:text-amber-400"
      title={`${streakDays} dias de ofensiva contínua!`}
    >
      <span>🔥</span> {streakDays}d
    </div>
  );
}
