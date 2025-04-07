import re
from flask import Blueprint, request, jsonify
from ..services import gemini_service # Import the service

# Create a Blueprint
suggest_bp = Blueprint('suggest_api', __name__, url_prefix='/api/suggest')

@suggest_bp.route('/', methods=['POST'])
def get_suggestions():
    """
    API endpoint to get recipe suggestions based on posted ingredients.
    Expects JSON: {"ingredients": "comma, separated, list"}
    """
    if not request.is_json:
        return jsonify({"error": "Invalid request: Content-Type must be application/json"}), 400

    data = request.get_json()
    ingredients_raw = data.get('ingredients')

    if not ingredients_raw or not isinstance(ingredients_raw, str):
        return jsonify({"error": "Invalid request: Missing or invalid 'ingredients' field"}), 400

    # Clean and split input
    ingredients_list = [item.strip().lower() for item in re.split(r'[,\n]+', ingredients_raw) if item.strip()]

    if not ingredients_list:
        # Return success=True but empty suggestions for consistency? Or an error?
        # Let's return an error message consistent with the service.
         return jsonify({"error": "Please enter some valid ingredients first."}), 400 # Bad Request

    print(f"⚙️ Suggest Route: Processing ingredients: {ingredients_list}")

    # Call the service function
    success, result = gemini_service.generate_recipe_suggestions(ingredients_list)

    if success:
        return jsonify({"suggestions": result}), 200
    else:
        # Determine appropriate status code based on error message?
        # For simplicity, return 500 for service errors, 400/429/etc. could be added
        status_code = 503 if "unavailable" in result.lower() else 500 # Basic check
        status_code = 429 if "safety filter" in result.lower() else status_code # Example
        return jsonify({"error": result}), status_code