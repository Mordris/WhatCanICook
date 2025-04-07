import google.generativeai as genai
from ..core.config import config
import functools # Import functools for lru_cache
import time      # For basic cache info (optional)

# --- Constants ---
# Rough estimate: ~4 chars per token. Gemini Flash limit is high (1M+),
# but set a practical limit to prevent accidental large/expensive prompts.
# Adjust this based on observation or if using a more accurate tokenizer.
MAX_PROMPT_CHARS = 12000  # Roughly corresponds to ~3000 tokens

# --- Gemini Client Setup ---
model = None
try:
    genai.configure(api_key=config.GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-1.5-flash')
    print("✅ Gemini Service: Model configured successfully.")
except Exception as e:
    print(f"🚨 Gemini Service: Failed to configure model - {e}")


# --- Caching Decorator ---
# Cache results for up to 128 unique ingredient combinations
@functools.lru_cache(maxsize=128)
def _generate_suggestions_cached(ingredients_tuple, prompt_template):
    """
    Internal cached function. Takes a tuple of ingredients.
    IMPORTANT: Arguments to lru_cache MUST be hashable (tuple is, list is not).
    """
    if not model:
        print("🚨 Gemini Service (_cached): generate_suggestions called but model not loaded.")
        return False, "Error: Recipe generation service is currently unavailable."

    ingredients_str = ", ".join(ingredients_tuple) # Convert tuple back for prompt
    prompt = prompt_template.format(ingredients_str=ingredients_str)

    # --- Token/Character Count Estimation ---
    prompt_len = len(prompt)
    print(f"ℹ️ Gemini Service (_cached): Prompt length estimate: {prompt_len} chars.")
    if prompt_len > MAX_PROMPT_CHARS:
        error_msg = f"Error: Input is too long (approx. {prompt_len // 4} tokens). Please reduce the number of ingredients."
        print(f"⚠️ Gemini Service (_cached): {error_msg}")
        return False, error_msg
    # --- End Estimation Check ---

    try:
        start_time = time.time()
        print(f"💬 Gemini Service (_cached): Sending prompt for ingredients: {ingredients_str}")
        response = model.generate_content(prompt)
        duration = time.time() - start_time
        print(f"⏱️ Gemini Service (_cached): API call duration: {duration:.2f}s")

        # --- Response Handling (as before) ---
        if not response.candidates:
            block_reason = response.prompt_feedback.block_reason if response.prompt_feedback else 'Unknown'
            print(f"⚠️ Gemini Service (_cached): Response blocked or no candidates. Reason: {block_reason}")
            return False, f"Error: Suggestions blocked by safety filters (Reason: {block_reason}). Try different ingredients."
        elif not response.parts:
            print("⚠️ Gemini Service (_cached): Received an empty response (no parts).")
            return False, "Error: The model generated an empty response. Try adding more ingredients."
        else:
            print("✅ Gemini Service (_cached): Received suggestions.")
            return True, response.text.strip()

    except Exception as e:
        print(f"🚨 Gemini Service (_cached): Error during API call - {e}")
        return False, f"Error: An unexpected error occurred while contacting the recipe service ({type(e).__name__})."


def generate_recipe_suggestions(ingredients_list):
    """
    Public function to generate recipe suggestions. Handles list-to-tuple conversion for caching.

    Args:
        ingredients_list (list): A list of ingredient strings.

    Returns:
        tuple: (success_boolean, result_string_or_error_message)
    """
    if not ingredients_list:
        return False, "Error: No ingredients provided."

    # Convert list to tuple for caching and sort it for cache consistency
    # (apple, banana) should hit cache same as (banana, apple)
    ingredients_tuple = tuple(sorted(ingredients_list))

    # --- Define the Prompt Template ---
    # Moved here so it's consistent for the cached function
    prompt_template = """
    You are a creative culinary assistant specializing in simple, tasty recipes.
    Based *primarily* on these ingredients: **{ingredients_str}**

    Suggest 2-3 diverse recipes. Assume common pantry staples like salt, pepper, cooking oil, basic spices (like paprika, garlic powder), sugar, flour, and water are available.

    Format the output STRICTLY using Markdown:
    - Use `## Recipe Name` for each recipe title.
    - Use a bulleted list (`* Ingredient`) for **Required Ingredients**.
    - Use a numbered list (`1. Step`) for **Instructions**.
    - Keep instructions concise and easy to follow.
    - If no reasonable recipe can be made, clearly state that instead of making something unrelated. e.g., "Sorry, it's hard to make a full meal with just mustard and pickles!"
    - Do not add any conversational text before the first recipe or after the last one.
    """

    # Call the internal cached function
    success, result = _generate_suggestions_cached(ingredients_tuple, prompt_template)

    # Optional: Log cache info
    cache_info = _generate_suggestions_cached.cache_info()
    print(f"ℹ️ Gemini Service Cache Info: Hits={cache_info.hits}, Misses={cache_info.misses}, Size={cache_info.currsize}/{cache_info.maxsize}")

    return success, result