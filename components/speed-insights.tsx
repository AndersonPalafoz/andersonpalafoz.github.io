"use client";

import { SpeedInsights } from "@vercel/speed-insights/next";
import { isPrivateAnalyticsPath } from "@/lib/analytics-privacy";

export function PrivacyAwareSpeedInsights() {
  return (
    <SpeedInsights
      sampleRate={0.5}
      beforeSend={(event) => {
        const eventUrl = new URL(event.url, window.location.origin);
        if (isPrivateAnalyticsPath(eventUrl.pathname)) return null;
        eventUrl.search = "";
        eventUrl.hash = "";
        return { ...event, url: eventUrl.toString() };
      }}
    />
  );
}
