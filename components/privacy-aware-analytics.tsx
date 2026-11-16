"use client";

import { Analytics } from "@vercel/analytics/next";
import { isPrivateAnalyticsPath } from "@/lib/analytics-privacy";

export function PrivacyAwareAnalytics() {
  return (
    <Analytics
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
