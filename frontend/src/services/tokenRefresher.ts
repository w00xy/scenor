import { jwtDecode } from "jwt-decode";
import { getAccessToken, refreshTokenFlow } from "./api";

let refreshTimer: number | null = null; 

export function scheduleTokenRefresh() {
  console.log("[scheduleTokenRefresh] called");
  if (refreshTimer) clearTimeout(refreshTimer);
  const token = getAccessToken();
  if (!token) {
    console.log("[scheduleTokenRefresh] no token, exit");
    return;
  }
  try {
    const decoded = jwtDecode<{ exp: number }>(token);
    console.log("[scheduleTokenRefresh] decoded exp:", decoded.exp);
    const expiresInMs = decoded.exp * 1000 - Date.now();
    console.log("[scheduleTokenRefresh] expires in ms:", expiresInMs);
    const refreshMs = expiresInMs - 60_000;
    if (refreshMs > 0) {
      console.log(`[scheduleTokenRefresh] will refresh in ${refreshMs / 1000} seconds`);
      refreshTimer = setTimeout(async () => {
        console.log("[scheduleTokenRefresh] timer fired, refreshing");
        const success = await refreshTokenFlow();
        if (success) {
          scheduleTokenRefresh();
        } else {
          refreshTimer = setTimeout(scheduleTokenRefresh, 5 * 60_000);
        }
      }, refreshMs);
    } else {
      console.log("[scheduleTokenRefresh] token already expired or expiring soon, refreshing now");
      refreshTokenFlow().then(success => {
        if (success) scheduleTokenRefresh();
      });
    }
  } catch (e) {
    console.error("Token decode error", e);
  }
}

export function stopTokenRefresh() {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}