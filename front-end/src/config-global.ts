// ----------------------------------------------------------------------

export const CONFIG = {
  appName: "ERP System",
  appVersion: "0.1.0", // You can also use import.meta.env.VITE_APP_VERSION if you prefer
  serverUrl: import.meta.env.VITE_SERVER_URL ?? "",
  assetsDir: import.meta.env.VITE_ASSETS_DIR ?? "",
  comingSoon: import.meta.env.VITE_COMING_SOON ?? "",
};
