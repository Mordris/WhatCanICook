import { createTheme } from "@mantine/core";

// Define custom theme settings for Mantine
export const theme = createTheme({
  /** Put your mantine theme override here */
  fontFamily: "Inter, sans-serif", // Example: Use a nice sans-serif font
  primaryColor: "cyan", // Example: Set a primary color theme
  defaultRadius: "md", // Example: Slightly rounder corners by default

  // Example heading styles
  headings: {
    fontFamily: "Poppins, sans-serif", // A different font for headings
    fontWeight: "600",
  },
});
