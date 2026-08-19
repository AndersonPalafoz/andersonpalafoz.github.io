const GOOGLE_DRIVE_HOSTS = new Set(["drive.google.com", "docs.google.com"]);

function isGoogleWorkspaceHost(hostname: string) {
  return GOOGLE_DRIVE_HOSTS.has(hostname) || Array.from(GOOGLE_DRIVE_HOSTS).some((host) => hostname.endsWith(`.${host}`));
}

export function parseGoogleDriveLinks(value: unknown): string[] {
  if (!value) return [];

  const candidates = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? (() => {
          try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : value.split(/[\n,]+/);
          } catch {
            return value.split(/[\n,]+/);
          }
        })()
      : [];

  return Array.from(new Set(
    candidates
      .map((item) => typeof item === "string" ? item.trim() : "")
      .filter((url) => {
        try {
          const parsed = new URL(url);
          return parsed.protocol === "https:" && isGoogleWorkspaceHost(parsed.hostname);
        } catch {
          return false;
        }
      }),
  ));
}
