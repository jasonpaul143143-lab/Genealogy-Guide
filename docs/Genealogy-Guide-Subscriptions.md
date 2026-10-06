# Genealogy Guide subscriptions

Proposed plans:
- Free: $0
- Researcher: $4.99/month
- Genealogist: $9.99/month
- Family: $14.99/month

The app now includes a subscription plans UI and a Stripe Checkout endpoint. Live checkout intentionally stays disabled until a Stripe account is connected and STRIPE_SECRET_KEY is added to the server environment.

Before accepting real payments, add:
1. A parent/guardian or other authorized adult as the merchant/account owner where required.
2. Stripe test-mode credentials first.
3. Authentication and a database-backed subscription record.
4. Stripe webhooks to update subscription status after checkout, renewal, cancellation, or payment failure.
5. Terms, privacy, refund/cancellation, and age/eligibility disclosures appropriate to the service.

Do not put Stripe secret keys in client-side code, GitHub, or the browser.
