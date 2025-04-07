import { SUGGEST_API_ENDPOINT } from "../constants/api";

/**
 * Fetches recipe suggestions from the backend API.
 *
 * @param {string} ingredients - The raw string of ingredients.
 * @returns {Promise<object>} - A promise that resolves to the JSON response (e.g., { suggestions: "..." })
 * @throws {Error} - Throws an error if the fetch fails or the backend returns an error structure.
 */
export const fetchSuggestions = async (ingredients) => {
  console.log(`🚀 Fetching suggestions from ${SUGGEST_API_ENDPOINT}`);
  try {
    const response = await fetch(SUGGEST_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json", // Be explicit about expecting JSON
      },
      body: JSON.stringify({ ingredients: ingredients }),
    });

    // Attempt to parse JSON regardless of status code, as backend might send error details
    const data = await response.json();

    if (!response.ok) {
      // Use backend error message if available, otherwise construct one
      const errorMessage =
        data?.error || `Request failed with status ${response.status}`;
      console.error(`🚨 API Error (${response.status}): ${errorMessage}`);
      throw new Error(errorMessage);
    }

    // Check for application-level errors even in a 200 OK response
    if (data.error) {
      console.error(`🚨 API Application Error: ${data.error}`);
      throw new Error(data.error);
    }

    console.log("✅ Suggestions received successfully.");
    return data; // Should contain { suggestions: "..." }
  } catch (error) {
    console.error("🚨 Network or Fetch Error:", error);
    // Rethrow the error so the calling component can handle it
    // Ensure it's always an Error object
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("An unexpected network error occurred.");
    }
  }
};
