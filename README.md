# House Management Application

A comprehensive house management system for landlords, tenants, and maintenance workers.

## Project Structure

```
house/
├── backend/           # Node.js Express backend
│   ├── src/
│   │   ├── routes/   # API routes
│   │   ├── models/   # Database models
│   │   ├── middleware/ # Auth & validation middleware
│   │   └── config/   # Configuration files
│   └── package.json
└── frontend/         # React frontend
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   └── utils/
    └── package.json
```

## Features

- Authentication & Authorization (JWT-based)
- Role-based access control (Landlord, Tenant, Maintenance)
- Property and unit management
- Tenant and handyman invitations
- CSV import for properties, units and tenants
- Issue reporting and tracking
- Chat system
- Tenants and landlords can export chat conversations as PDF
- Notifications
- Dashboard with KPIs

## Setup Instructions

1. Backend Setup:
```bash
cd backend
npm install
npm run dev
```

Create a `.env` file in the project root based on `.env.example` and adjust the
values to match your environment. The application requires valid email
credentials and a `JWT_SECRET` for authentication. If no email credentials are
provided, the backend will automatically fall back to a temporary Ethereal
account for testing. The console will display a preview URL for sent emails in
this mode.

When deploying, define your SMTP variables (e.g. `EMAIL_HOST`, `EMAIL_PORT`,
`EMAIL_USER`, `EMAIL_PASSWORD`, `EMAIL_SECURE` and `EMAIL_FROM`) using your
hosting platform or GitHub repository secrets so the invitation emails can be
sent correctly.

### PayPal Billing Setup

Configure the following variables in your `.env` file to enable PayPal-based
subscriptions:

```
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
PAYPAL_PLAN_BASIC_ID=your-paypal-basic-plan-id
PAYPAL_PLAN_STANDARD_ID=your-paypal-standard-plan-id
PAYPAL_PLAN_PREMIUM_ID=your-paypal-premium-plan-id

PAYPAL_WEBHOOK_ID=your-paypal-webhook-id
PAYPAL_ENV=sandbox
```

2. Frontend Setup:
```bash
cd frontend
npm install
npm start
```

### Usage

After starting the application, open the chat view. Tenants and landlords can
export the conversation to a PDF by clicking the **Export** button.

## API Documentation

See the API documentation in the backend/docs directory for detailed endpoint information.

### CSV Import

Landlords can upload CSV files containing property, unit and tenant data via `/vermieter/import/csv`.
Each row should include columns like `property,unitNumber,squareMeters,rooms,monthlyRent,tenantFirstName,tenantLastName,tenantEmail,tenantPhone,moveInDate`.

For more details about invitations and role management see [docs/user-management.md](docs/user-management.md).

