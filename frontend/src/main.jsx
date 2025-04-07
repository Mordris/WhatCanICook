import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { theme } from "./theme";

// Import required Mantine styles
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

// --- Suppress Specific Warning (Development ONLY) ---
// WARNING: Use with caution, may hide other errors. Option 1 (Manual Render) is safer.
if (import.meta.env.DEV) {
  // Vite specific environment variable for development mode
  const originalConsoleError = console.error;
  const errorMessagesToSuppress = [
    "React does not recognize the `highlightColor` prop on a DOM element",
    // Add other specific warning messages to suppress here if absolutely necessary
  ];

  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      errorMessagesToSuppress.some((msg) => args[0].includes(msg))
    ) {
      // Suppress the specific warning(s)
      return;
    }
    // Call the original console.error for all other messages
    originalConsoleError(...args);
  };
  console.log("DEV MODE: Suppressing specific React prop warnings."); // Optional log
}
// --- End Warning Suppression ---

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="auto">
      <Notifications position="top-right" zIndex={1000} />
      <App />
    </MantineProvider>
  </React.StrictMode>
);
