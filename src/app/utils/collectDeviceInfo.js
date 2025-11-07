// utils/collectDeviceInfo.js

export async function collectDeviceInfo({ includeLocation = true } = {}) {
  const nav = navigator;
  const screenData = window.screen;
  const conn = nav.connection || {};
  const batteryInfo = await getBatteryInfo();

  const info = {
    // Device / Environment
    userAgent: nav.userAgent,
    platform: nav.platform,
    hardwareConcurrency: nav.hardwareConcurrency || null,
    deviceMemory: nav.deviceMemory || null,
    maxTouchPoints: nav.maxTouchPoints || 0,
    screen: {
      width: screenData.width,
      height: screenData.height,
      pixelRatio: window.devicePixelRatio || 1,
      orientation: screen.orientation?.type || null,
    },

    // Locale / Language
    language: nav.language,
    languages: nav.languages,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,

    // Network
    connection: {
      online: nav.onLine,
      effectiveType: conn.effectiveType || null,
      downlink: conn.downlink || null,
      rtt: conn.rtt || null,
      saveData: conn.saveData || false,
    },

    // Battery
    battery: batteryInfo,

    // Permissions / Capabilities
    cookieEnabled: nav.cookieEnabled,
    javaEnabled: nav.javaEnabled ? nav.javaEnabled() : false,

    // Timestamp
    timestamp: new Date().toISOString(),
  };

  // Optionally include location if allowed
  if (includeLocation) {
    try {
      const location = await getLocation();
      info.location = location;
    } catch (err) {
      info.location = { error: err.message || "Location denied or unavailable" };
    }
  }

  return info;
}

// Helper: Battery
async function getBatteryInfo() {
  try {
    if (!navigator.getBattery) return null;
    const battery = await navigator.getBattery();
    return {
      charging: battery.charging,
      level: battery.level,
      chargingTime: battery.chargingTime,
      dischargingTime: battery.dischargingTime,
    };
  } catch {
    return null;
  }
}

// Helper: Location
async function getLocation() {
  if (!("geolocation" in navigator)) throw new Error("Geolocation not supported");
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          altitude: pos.coords.altitude,
          heading: pos.coords.heading,
          speed: pos.coords.speed,
          timestamp: new Date(pos.timestamp).toISOString(),
        });
      },
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}
