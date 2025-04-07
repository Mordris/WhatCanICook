import os # Make sure os is imported
from flask import Flask, jsonify # Add jsonify import
from flask_cors import CORS
from .core.config import config # Import the loaded config instance

def create_app():
    """Application Factory Function"""
    app = Flask(__name__)
    app.config.from_object(config) # Load config from core/config.py

    print(f"🚀 Initializing Flask App in '{config.__class__.__name__}' mode (FLASK_ENV='{os.getenv('FLASK_ENV', 'default')}')")
    print(f"🔧 CORS Origins Allowed: {app.config.get('CORS_ORIGINS')}")

    # --- ADD PRODUCTION CORS VALIDATION HERE ---
    # Check the actual environment Flask determined AFTER loading config
    if not app.config.get('DEBUG') and not app.config.get('TESTING'): # A common way to check if it's production-like
         loaded_cors_origins = app.config.get('CORS_ORIGINS', [])
         if not loaded_cors_origins or "*" in loaded_cors_origins:
              # Raise error only if actually in production mode and CORS is insecure
              raise ValueError("CRITICAL: CORS_ORIGINS must be set to specific domains in the production environment. Check your .env file and ensure FLASK_ENV=production.")
         else:
              print("    ✅ Production CORS origins validated.")
    # --- END VALIDATION ---


    # Initialize extensions (like CORS)
    if app.config.get('CORS_ORIGINS'):
         CORS(app, resources={r"/api/*": {"origins": app.config.get('CORS_ORIGINS')}})
         print("    CORS initialized for /api/* routes.")
    else:
         print("    ⚠️ CORS not configured (CORS_ORIGINS is empty in .env).")


    # Register Blueprints
    from .api.suggest_routes import suggest_bp
    app.register_blueprint(suggest_bp)
    print(f"    Blueprint registered: {suggest_bp.name} at {suggest_bp.url_prefix}")


    # Add a simple root route for health check (optional)
    @app.route('/')
    def health_check():
        # Use app.config directly here for consistency
        env_mode = 'production' if not app.config.get('DEBUG') else 'development'
        return jsonify({"status": "ok", "environment": env_mode}), 200

    return app