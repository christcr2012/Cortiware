# Auth Ticket Spec (SSO Provider-Portal → Tenant-App)

Status: Draft

## Overview
Short-lived signed token carried from provider-portal to tenant-app to establish a session without sharing cookies across domains.

## Claims
- sub: string (user id or email)
- role: 'tenant' | 'accountant' | 'vendor' | 'provider' | 'developer'
- aud: 'tenant-app' (or explicit domain/app id)
- iat: issued-at (seconds)
- exp: expiry (<= 120s from iat)
- nonce: random string 16-32 bytes, single-use

## Signing
- Algorithm: HS256
- Secret: AUTH_TICKET_HMAC_SECRET
- Library: jose (Node/Edge compatible)

## Transport
- Recommended: POST /api/auth/callback with JSON body { token }
- Alternative: 302 with token in query, protected by CSRF token and strict expiry

## Replay Protection
- Store nonce with TTL (<= 5 minutes). Reject if seen before.
- Optionally bind to IP or UA hash for higher assurance.

## Verification Rules
- Signature valid
- aud matches tenant-app audience
- exp not expired
- nonce unused
- role allowed for target app

## Resulting Session
- On success, set HttpOnly+Secure cookie scoped to tenant-app domain with correct role landing route.

## Error Handling
- 400 on invalid token; redirect to /login with error param.
- Audit all failures with reason and metadata (ip, ua, email if present).
