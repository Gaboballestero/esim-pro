<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# eSIM Pro - Copilot Instructions

## Tech Stack
- **Backend**: Django 5.2+ with Django REST Framework
- **Frontend Web**: Next.js 14 with TypeScript and Tailwind CSS
- **Mobile**: React Native with Expo
- **Database**: PostgreSQL (SQLite for development)
- **Cache**: Redis
- **Payments**: Stripe, PayPal
- **Notifications**: Twilio (SMS)

## Architecture
```
backend/     - Django REST API
frontend/    - Next.js web application  
mobile/      - React Native mobile app
```

## Key Features
- User authentication and management
- eSIM provisioning and activation
- Multiple data plans with international coverage
- Payment processing with multiple providers
- Real-time usage tracking
- Multi-language support
- Admin dashboard

## Code Style Guidelines
- Use TypeScript for all React/Next.js code
- Follow Django best practices for backend
- Use Tailwind CSS for styling
- Implement proper error handling
- Add comprehensive logging
- Write descriptive docstrings and comments

## Models Overview
- **User**: Custom user model with profile extensions
- **DataPlan**: Available eSIM data plans
- **ESim**: Individual eSIM instances
- **Order**: Purchase orders
- **Payment**: Payment records
- **Country**: Supported countries

## API Endpoints Structure
- `/api/auth/` - Authentication endpoints
- `/api/plans/` - Data plans management
- `/api/esims/` - eSIM operations
- `/api/payments/` - Payment processing

## Development Notes
- Use virtual environment for Python dependencies
- Configure environment variables properly
- Follow REST API conventions
- Implement proper validation and serialization
- Use async/await for better performance where applicable

## Security Considerations
- Implement proper authentication
- Validate all inputs
- Use HTTPS in production
- Secure API keys and secrets
- Implement rate limiting

## Testing
- Write unit tests for critical functionality
- Implement integration tests for API endpoints
- Use pytest for Django testing
- Test mobile app on both iOS and Android

Please generate code that follows these guidelines and maintains consistency with the existing codebase.
