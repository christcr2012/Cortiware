# Cost Budgets & Provider Baseline

This document defines cost budgets and provider baseline constraints for Cortiware.

## Provider Baseline: ≤ $100/month

The first tenant must operate within a $100/month provider baseline. This is achieved by:

### Default to Local/Open-Source
- **Database**: Local PostgreSQL or SQLite (no managed DB by default)
- **Cache/KV**: In-memory stores (Redis optional, not required)
- **Email**: Local SMTP or file-based (no SendGrid/Mailgun by default)
- **SMS**: Disabled by default (Twilio only when explicitly configured)
- **Maps/Geocoding**: Local data or free-tier APIs (no Google Maps by default)
- **AI/LLM**: Local models or free-tier APIs (no OpenAI by default)

### Wallet/HTTP 402 for Costed Actions
All actions that incur provider costs must:
1. Check wallet balance first
2. Debit wallet if sufficient balance
3. Return HTTP 402 invoice payload if insufficient

Examples:
- AI-powered route optimization
- SMS notifications
- Premium geocoding
- Third-party API calls

### Cost Tracking (Local Dashboard)
See `scripts/cost/dashboard.ts` for local cost tracking:
- Tracks wallet debits by category
- Aggregates monthly spend
- Alerts when approaching budget thresholds
- No external services required

## Cost Categories

| Category | Default Provider | Monthly Budget | Notes |
|----------|------------------|----------------|-------|
| Database | Local PostgreSQL | $0 | Managed DB optional |
| Cache/KV | In-memory | $0 | Redis optional |
| Email | Local SMTP | $0 | SendGrid optional |
| SMS | Disabled | $0 | Twilio opt-in |
| Maps | Free tier | $0-10 | Google Maps opt-in |
| AI/LLM | Free tier | $0-20 | OpenAI opt-in |
| Storage | Local filesystem | $0 | S3 optional |
| **Total** | | **≤ $100** | |

## Monitoring & Alerts

### Local Dashboard
```bash
tsx scripts/cost/dashboard.ts
```
Displays:
- Current month spend by category
- Wallet balance trends
- 402 invoice counts
- Budget utilization %

### Alerts
- Warning at 80% of budget ($80/month)
- Critical at 95% of budget ($95/month)
- Auto-disable costed actions at 100% (return 402 for all)

## Opt-In Paid Services

To enable paid services, set environment variables:
```bash
# Email
SENDGRID_API_KEY=...

# SMS
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...

# Maps
GOOGLE_MAPS_API_KEY=...

# AI
OPENAI_API_KEY=...
```

Without these, the system falls back to local/free alternatives.

## Cost Optimization Tips

1. **Batch operations**: Group API calls to reduce per-request costs
2. **Cache aggressively**: Store geocoding results, AI responses
3. **Use webhooks**: Avoid polling third-party APIs
4. **Implement rate limits**: Prevent runaway costs from bugs
5. **Monitor wallet**: Set up alerts for unusual spending patterns

## Compliance

- All costed actions must respect wallet/402 pattern
- No silent charges to external providers
- User must explicitly opt-in to paid services
- Cost tracking must be transparent and auditable

