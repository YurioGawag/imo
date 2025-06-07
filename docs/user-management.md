# Landlord User Management

This document describes how landlords can manage tenants and handymen.

## Tenant Invitations

1. Landlords open a property detail page and click **"Mieter einladen"**.
2. The application requests `/vermieter/properties/:id/available-units` to obtain a list of vacant units.
3. An invitation dialog shows a dropdown with these units. Only unoccupied units appear here.
4. After entering the tenant data the landlord sends the invitation. A request to
   `/vermieter/properties/:propertyId/units/:unitId/tenant` creates a temporary
tenant record.
5. The tenant receives an email containing a unique link generated from the
   token stored in the `tenant.invitationToken` field. When the tenant follows
   the link, they choose a password. Their user account is created and the unit
   is marked `occupied`.

The email template is located in `tenant.service.ts` and can be adapted to
match the corporate design. Nodemailer is used with the Ethereal test service in
this demo configuration.

## Handyman Accounts

Landlords can create handymen via `/vermieter/handwerker`. A random initial
password is generated and sent by email. Handymen are stored in the `User`
collection with the role `handwerker` and may later be granted access to
properties using the `assignedProperties` field.

## Roles and Permissions

The application defines the following roles:

- **vermieter** – full access to their own properties, units and reports
- **mieter** – access to their assigned unit and related reports
- **handwerker** – limited access to assigned properties and tasks

Role checks are implemented in `auth.middleware.ts` and on the client using
protected routes.

## CSV Import

Landlords can upload CSV files at `/vermieter/import/csv`.
The `csvImport` utility parses rows into properties, units and optional tenants.
Invalid rows are skipped. Each property is created if missing and units are
inserted if they do not already exist. If an email address is provided, a tenant
invitation is sent for that unit.

## Available Unit Check

The endpoint `/vermieter/properties/:propertyId/available-units` returns all
units with the status `vacant`. The frontend fetches this list whenever the
invitation dialog opens. This ensures that only unoccupied units can be chosen
when inviting a tenant.
