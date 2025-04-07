import os
from dotenv import load_dotenv

# Load .env file from the root 'backend' directory, not 'backend/app'
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env')
load_dotenv(dotenv_path=dotenv_path)

class Config:
    """Base configuration."""
    SECRET_KEY = os.environ.get('SECRET_KEY', os.urandom(24))
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
    # Process CORS_ORIGINS from space-separated string to list
    raw_origins = os.environ.get('CORS_ORIGINS', '')
    CORS_ORIGINS = [origin.strip() for origin in raw_origins.split(' ') if origin.strip()]

    # Basic Flask settings
    DEBUG = False
    TESTING = False

class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True

class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False
    # REMOVED THE CHECK FROM HERE:
    # if not Config.CORS_ORIGINS or "*" in Config.CORS_ORIGINS:
    #     raise ValueError("CORS_ORIGINS must be set to specific domains in production environment.")


# Dictionary to map FLASK_ENV to config class
config_by_name = dict(
    development=DevelopmentConfig,
    production=ProductionConfig,
    default=DevelopmentConfig
)

def get_config():
    """Returns the configuration object based on FLASK_ENV."""
    env = os.getenv('FLASK_ENV', 'default')
    # Ensure production maps correctly even if FLASK_ENV is uppercase etc.
    if env.lower() == 'production':
        return config_by_name['production']
    return config_by_name.get(env, DevelopmentConfig)

# Export the loaded config instance for easy import
config = get_config()

# Validate essential config (this runs always, which is okay for API key)
if not config.GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY is not set in the environment variables.")