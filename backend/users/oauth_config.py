"""
Configuración para autenticación social (OAuth)
"""

# Google OAuth Configuration
GOOGLE_OAUTH2_CLIENT_ID = 'your-google-client-id.apps.googleusercontent.com'
GOOGLE_OAUTH2_CLIENT_SECRET = 'your-google-client-secret'

# Apple OAuth Configuration  
APPLE_CLIENT_ID = 'com.yourapp.bundleid'
APPLE_TEAM_ID = 'your-apple-team-id'
APPLE_KEY_ID = 'your-apple-key-id'
APPLE_PRIVATE_KEY_PATH = 'path/to/your/apple/private/key.p8'

# Configuraciones de audiencia para tokens
GOOGLE_AUDIENCE = [
    'your-google-client-id.apps.googleusercontent.com',  # Web
    'your-ios-client-id.apps.googleusercontent.com',     # iOS
    'your-android-client-id.apps.googleusercontent.com', # Android
]

APPLE_AUDIENCE = [
    'com.yourapp.bundleid',  # iOS App Bundle ID
]

# URLs de verificación
GOOGLE_TOKEN_INFO_URL = 'https://oauth2.googleapis.com/tokeninfo'
APPLE_KEYS_URL = 'https://appleid.apple.com/auth/keys'
APPLE_ISSUER = 'https://appleid.apple.com'

# Configuraciones adicionales
SOCIAL_AUTH_VERIFY_SSL = True
SOCIAL_AUTH_TIMEOUT = 30  # segundos
