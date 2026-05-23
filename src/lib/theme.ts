const STORAGE_KEY = "sentinel-theme";

export function initTheme() {
  const stored = localStorage.getItem(STORAGE_KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = stored === "dark" || (stored !== "light" && prefersDark);
  document.documentElement.classList.toggle("dark", dark);
}

export function isDarkMode() {
  return document.documentElement.classList.contains("dark");
}

export function toggleTheme() {
  const dark = !isDarkMode();
  document.documentElement.classList.toggle("dark", dark);
  localStorage.setItem(STORAGE_KEY, dark ? "dark" : "light");
}
