import { jwtDecode } from "jwt-decode";
import { getAccessToken, refreshTokenFlow } from "./api";

const REFRESH_EARLY_MS = 60_000;
const REFRESH_RETRY_MS = 30_000;
const MIN_REFRESH_DELAY_MS = 1_000;

let refreshTimer: number | null = null;

export function scheduleTokenRefresh() {
  stopTokenRefresh();

  const token = getAccessToken();
  if (!token) {
    void refreshTokenFlow().then((success) => {
      if (success) {
        scheduleTokenRefresh();
      } else {
        refreshTimer = setTimeout(scheduleTokenRefresh, REFRESH_RETRY_MS);
      }
    });
    return;
  }

  try {
    const decoded = jwtDecode<{ exp: number }>(token);
    if (!decoded?.exp) {
      refreshTimer = setTimeout(scheduleTokenRefresh, REFRESH_RETRY_MS);
      return;
    }

    const refreshInMs = decoded.exp * 1000 - Date.now() - REFRESH_EARLY_MS;
    const delay = Math.max(refreshInMs, MIN_REFRESH_DELAY_MS);

    refreshTimer = setTimeout(async () => {
      const success = await refreshTokenFlow();
      if (success) {
        scheduleTokenRefresh();
      } else {
        refreshTimer = setTimeout(scheduleTokenRefresh, REFRESH_RETRY_MS);
      }
    }, delay);
  } catch (error) {
    console.error("Token decode error:", error);
    refreshTimer = setTimeout(async () => {
      const success = await refreshTokenFlow();
      if (success) {
        scheduleTokenRefresh();
      } else {
        refreshTimer = setTimeout(scheduleTokenRefresh, REFRESH_RETRY_MS);
      }
    }, MIN_REFRESH_DELAY_MS);
  }
}

export function stopTokenRefresh() {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}
