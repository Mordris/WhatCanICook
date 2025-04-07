from app import create_app

# Create the app instance using the factory
app = create_app()

if __name__ == '__main__':
    # Use host='0.0.0.0' to be accessible on network
    # Port can be configured via environment variable if needed
    # Debug mode is controlled by the Config object now
    app.run(host='0.0.0.0', port=5000)