// frontend/src/services/unsplashService.js

// Retrieve the API key from environment variables
const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
const UNSPLASH_API_BASE = "https://api.unsplash.com";

/**
 * Fetches the first relevant image from Unsplash based on a query.
 *
 * @param {string} query - The search query (e.g., recipe title).
 * @returns {Promise<object|null>} - A promise resolving to an object { urls: { regular: '...' }, user: { name: '...', links: { html: '...' } }, links: { html: '...' } } or null if error/no results.
 * @throws {Error} - Throws an error if the fetch fails or API key is missing.
 */
export const fetchUnsplashImage = async (query) => {
  if (!UNSPLASH_ACCESS_KEY) {
    console.error("Unsplash API Key (VITE_UNSPLASH_ACCESS_KEY) is missing.");
    // Don't throw an error here, just return null so the app can continue without images
    return null;
    // Alternatively: throw new Error("Unsplash API Key is missing.");
  }

  // Construct the API URL
  // per_page=1: Only get the first result
  // orientation=landscape: Prefer landscape images (often better for cards)
  // content_filter=high: Filter potentially sensitive content
  const url = `${UNSPLASH_API_BASE}/search/photos?query=${encodeURIComponent(
    query
  )}&per_page=1&orientation=landscape&content_filter=high`;

  console.log(`📸 Fetching Unsplash image for query: "${query}"`);

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        "Accept-Version": "v1", // Recommended by Unsplash docs
      },
    });

    if (!response.ok) {
      // Handle specific errors like rate limiting (403) or not found (404)
      const errorData = await response.json().catch(() => ({})); // Try to get error details
      console.error(
        `🚨 Unsplash API Error (${response.status}): ${
          errorData.errors ? errorData.errors.join(", ") : response.statusText
        }`
      );
      return null; // Return null on API error
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      console.log(`✅ Unsplash image found for "${query}"`);
      const image = data.results[0];
      // Return only the necessary data for display and attribution
      return {
        id: image.id, // Useful as key sometimes
        urls: {
          small: image.urls.small, // Use 'small' or 'regular' for cards
          regular: image.urls.regular,
        },
        alt_description: image.alt_description || `Image related to ${query}`,
        user: {
          name: image.user.name,
          link: image.user.links.html,
        },
        // Link to the photo page on Unsplash itself
        photoLink: image.links.html,
      };
    } else {
      console.warn(`⚠️ No Unsplash image found for query: "${query}"`);
      return null; // Return null if no results found
    }
  } catch (error) {
    console.error("🚨 Network or Unsplash Fetch Error:", error);
    return null; // Return null on network/fetch error
  }
};
