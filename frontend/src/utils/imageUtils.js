// frontend/src/utils/imageUtils.js

/**
 * Basic string hash function (djb2) for generating a somewhat consistent seed.
 * Source: http://www.cse.yorku.ca/~oz/hash.html
 * @param {string} str - The input string (e.g., recipe title)
 * @returns {number} A numerical hash code
 */
function simpleHashCode(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) + hash + char; /* hash * 33 + c */
  }
  // Ensure positive seed for Picsum
  return Math.abs(hash);
}

/**
 * Generates a placeholder image URL from picsum.photos based on a seed.
 * @param {string} seedStr - String to use for seeding (e.g., recipe title)
 * @param {number} width - Desired image width
 * @param {number} height - Desired image height
 * @returns {string} The picsum.photos URL
 */
export function getPlaceholderImageUrl(seedStr, width = 300, height = 200) {
  if (!seedStr) {
    // Return a generic random image if no seed provided
    return `https://picsum.photos/${width}/${height}`;
  }
  const seed = simpleHashCode(seedStr);
  // Use the seed parameter for Picsum
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}
