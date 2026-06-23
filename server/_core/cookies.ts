import type { CookieOptions } from "cookie";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string) {
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function getHeaderValue(headers: any, key: string) {
  const val = headers?.[key];
  if (!val) return undefined;
  if (Array.isArray(val)) return val[0];
  return String(val);
}

function isSecureRequest(req: any) {
  // Try protocol first (may be provided by Next.js or reverse proxies)
  if (req?.protocol === "https") return true;

  // Some environments provide a forwarded proto header
  const forwardedProto = getHeaderValue(req?.headers, "x-forwarded-proto");
  if (!forwardedProto) return false;
  const protoList = forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(req: any): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  // This function accepts both Express Request and Next.js API request shapes.
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req),
  };
}
