/**
 * Parses a Markdown string containing recipes into structured objects.
 * Assumes format: ## Title\n* Ingredient\n1. Step
 *
 * @param {string} markdown - The raw Markdown string from the API.
 * @returns {Array<object>} - An array of recipe objects { title, ingredients, instructions }. Returns empty array on failure.
 */
export function parseRecipeMarkdown(markdown) {
  if (!markdown || typeof markdown !== "string") {
    console.warn("Markdown Parser: Input is not a valid string.");
    return [];
  }

  const recipes = [];
  const recipeBlocks = markdown.trim().split(/\n{1,}(?=## )/); // Split before ##, preserving it

  for (const block of recipeBlocks) {
    if (!block.trim()) continue;

    const lines = block.trim().split("\n");
    const titleMatch = lines[0]?.match(/^## (.*)/);
    const title = titleMatch ? titleMatch[1].trim() : "Untitled Recipe";

    let ingredients = [];
    let instructions = [];
    let currentSection = null; // 'ingredients' or 'instructions'

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Improve section detection
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes("ingredient")) {
        currentSection = "ingredients";
        continue;
      } else if (
        lowerLine.includes("instruction") ||
        lowerLine.includes("step") ||
        line.match(/^\d+\.\s/)
      ) {
        currentSection = "instructions";
        // Don't skip if it's an actual instruction line like "1. Do this"
        if (lowerLine.includes("instruction") || lowerLine.includes("step"))
          continue;
      }

      if (currentSection === "ingredients" && line.startsWith("*")) {
        ingredients.push(line.substring(1).trim());
      } else if (currentSection === "instructions" && line.match(/^\d+\.?\s/)) {
        // Keep the numbering from the source for display consistency? Or remove it? Let's remove for now.
        instructions.push(line.substring(line.search(/\s/) + 1).trim());
        // instructions.push(line); // Alternative: keep original numbering
      } else if (currentSection === "ingredients" && line.length > 0) {
        // Capture ingredient lines that might not start with *
        ingredients.push(line);
      } else if (currentSection === "instructions" && line.length > 0) {
        // Capture instruction lines that might not start with number
        instructions.push(line);
      }
    }

    // Basic check if parsing likely failed
    if (
      lines.length > 1 &&
      ingredients.length === 0 &&
      instructions.length === 0
    ) {
      console.warn(
        `Markdown Parser: Failed to parse sections for recipe "${title}". Treating remaining lines as instructions.`
      );
      instructions = lines.slice(1).map((l) => l.trim());
    }

    recipes.push({ title, ingredients, instructions });
  }

  // Handle cases where the entire response is a single message (e.g., error, note)
  if (
    recipes.length === 0 &&
    markdown.trim().length > 0 &&
    !markdown.includes("## ")
  ) {
    console.log(
      "Markdown Parser: Response seems to be a single message, not recipes."
    );
    recipes.push({
      title: "Note from Chef",
      ingredients: [],
      instructions: [markdown.trim()],
    });
  }

  console.log(`📄 Markdown Parser: Parsed ${recipes.length} recipe blocks.`);
  return recipes;
}
