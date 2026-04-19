export function getAppOverlayRoot() {
  if (typeof document === "undefined") {
    return null;
  }

  return document.getElementById("app-overlay-root");
}

export function getAppScreenElement() {
  if (typeof document === "undefined") {
    return null;
  }

  return document.getElementById("app-device-screen");
}
