# Federation Entitlements Model

**Product**: Cortiware  
**Company**: Robinson AI Systems  
**Last Updated**: 2025-10-06  
**Status**: ✅ Implemented

---

## Overview

The entitlements model defines what actions provider and developer users can perform within the federation system. All federation services enforce entitlements before database access to ensure proper authorization.

---

## Roles

### Provider Roles

#### provider-admin
**Description**: Full administrative access to provider portal and federation APIs

**Permissions**:
- View all tenants (organizations)
- Read tenant details
- Modify tenant settings
- View audit logs
- Manage monetization settings
- Create/modify invites, coupons, offers

**Use Cases**:
- Provider operations team
- System administrators
- Account managers

---

#### provider-viewer
**Description**: Read-only access to provider portal and federation APIs

**Permissions**:
- View all tenants (organizations)
- Read tenant details
- View audit logs (read-only)
- View monetization settings (read-only)

**Use Cases**:
- Support staff
- Analysts
- Auditors

---

### Developer Roles

#### developer
**Description**: Access to developer portal and diagnostic tools

**Permissions**:
- View system diagnostics
- View audit logs
- Access API explorer
- View technical documentation

**Use Cases**:
- Engineering team
- DevOps
- Technical support

---

## Actions

### Tenant Actions

| Action | Description | provider-admin | provider-viewer | developer |
|--------|-------------|----------------|-----------------|-----------|
| `tenants:list` | List all tenants | ✅ | ✅ | ❌ |
| `tenants:read` | Read tenant details | ✅ | ✅ | ❌ |
| `tenants:write` | Modify tenant settings | ✅ | ❌ | ❌ |

---

### Diagnostic Actions

| Action | Description | provider-admin | provider-viewer | developer |
|--------|-------------|----------------|-----------------|-----------|
| `diagnostics:read` | View system diagnostics | ❌ | ❌ | ✅ |

---

### Audit Actions

| Action | Description | provider-admin | provider-viewer | developer |
|--------|-------------|----------------|-----------------|-----------|
| `audit:read` | View audit logs | ✅ | ✅ | ✅ |

---

## Entitlement Matrix

### Complete Matrix

```typescript
const ENTITLEMENTS: Record<FederationRole, FederationAction[]> = {
  'provider-admin': [
    'tenants:list',
    'tenants:read',
    'tenants:write',
    'audit:read',
  ],
  'provider-viewer': [
    'tenants:list',
    'tenants:read',
  ],
  'developer': [
    'diagnostics:read',
    'audit:read',
  ],
};
```

---

## Implementation

### Entitlement Check

**File**: `src/lib/entitlements.ts`

**Functions**:

```typescript
// Check if role has permission (returns boolean)
function hasEntitlement(
  role: FederationRole, 
  action: FederationAction
): boolean

// Check and throw error if insufficient (returns void)
function checkEntitlement(
  role: FederationRole, 
  action: FederationAction
): void
```

**Usage in Services**:

```typescript
import { checkEntitlement } from '@/lib/entitlements';

export const providerFederationService = {
  async listTenants(params) {
    const { role = 'provider-viewer' } = params;
    
    // Enforce entitlement (throws if insufficient)
    try {
      checkEntitlement(role, 'tenants:list');
    } catch (error) {
      await logFederationAudit({
        actor: params.actor,
        action: 'tenants:list',
        result: 'forbidden',
        metadata: { role },
      });
      throw error;
    }
    
    // Proceed with database query...
  }
};
```

---

### Error Handling

**403 Forbidden Response**:

```json
{
  "ok": false,
  "error": "forbidden",
  "message": "Forbidden: provider-viewer does not have permission for tenants:write"
}
```

**Audit Log Entry**:

```json
{
  "actor": "provider@example.com",
  "action": "tenants:write",
  "result": "forbidden",
  "metadata": {
    "role": "provider-viewer"
  }
}
```

---

## Role Assignment

### Environment-Based (Current)

**Method**: Hardcoded credentials in environment variables

**Configuration**:
```bash
# Provider credentials
PROVIDER_EMAIL="provider@example.com"
PROVIDER_PASSWORD="secure-password"

# Developer credentials
DEVELOPER_EMAIL="developer@example.com"
DEVELOPER_PASSWORD="secure-password"
```

**Role Mapping**:
```typescript
function getRoleFromToken(token: string): FederationRole {
  if (token === 'dev-provider' || token.startsWith('provider-')) {
    return 'provider-admin';
  }
  if (token === 'dev-developer' || token.startsWith('developer-')) {
    return 'developer';
  }
  return 'provider-viewer'; // Default fallback
}
```

---

### OIDC-Based (Future)

**Method**: Extract role from OIDC claims

**Configuration**:
```bash
FED_OIDC_ENABLED="true"
OIDC_ISSUER="https://auth.cortiware.com"
```

**Role Mapping**:
```typescript
function getRoleFromOIDCClaims(claims: OIDCClaims): FederationRole {
  const roles = claims['https://cortiware.com/roles'] || [];
  
  if (roles.includes('provider-admin')) {
    return 'provider-admin';
  }
  if (roles.includes('provider-viewer')) {
    return 'provider-viewer';
  }
  if (roles.includes('developer')) {
    return 'developer';
  }
  
  throw new Error('No valid role found in OIDC claims');
}
```

**Required Claims**:
- `sub`: User identifier
- `email`: User email
- `https://cortiware.com/roles`: Array of role strings

---

## Testing

### Unit Tests

**File**: `tests/unit/entitlements.test.ts`

**Test Cases**:

```typescript
// Test 1: provider-admin has tenants:list
assert(hasEntitlement('provider-admin', 'tenants:list') === true);

// Test 2: provider-viewer does NOT have tenants:write
assert(hasEntitlement('provider-viewer', 'tenants:write') === false);

// Test 3: developer has diagnostics:read
assert(hasEntitlement('developer', 'diagnostics:read') === true);

// Test 4: checkEntitlement throws on insufficient permission
try {
  checkEntitlement('provider-viewer', 'tenants:write');
  assert(false, 'Should have thrown');
} catch (error) {
  assert(error.message.includes('Forbidden'));
}
```

---

### Integration Tests

**Scope**: Test entitlement enforcement in API routes

**Test Cases**:

1. **403 on insufficient permissions**:
   ```typescript
   // provider-viewer attempts tenants:write
   const res = await fetch('/api/fed/providers/tenants/org_123', {
     method: 'PATCH',
     headers: { Cookie: 'rs_provider=viewer-token' },
     body: JSON.stringify({ name: 'New Name' })
   });
   assert(res.status === 403);
   ```

2. **200 on sufficient permissions**:
   ```typescript
   // provider-admin attempts tenants:list
   const res = await fetch('/api/fed/providers/tenants', {
     headers: { Cookie: 'rs_provider=admin-token' }
   });
   assert(res.status === 200);
   ```

3. **Audit log on forbidden attempt**:
   ```typescript
   // Verify audit log entry created
   const logs = await prisma.auditLog.findMany({
     where: { action: 'tenants:write', result: 'forbidden' }
   });
   assert(logs.length > 0);
   ```

---

## Security Considerations

### Principle of Least Privilege

- Assign minimum necessary permissions
- Use `provider-viewer` for read-only access
- Reserve `provider-admin` for trusted users

---

### Defense in Depth

1. **Middleware**: Check authentication (withProviderAuth, withDeveloperAuth)
2. **Service Layer**: Check entitlements (checkEntitlement)
3. **Database**: Row-level security (future enhancement)

---

### Audit Trail

- All entitlement checks are logged
- Failed attempts logged with `result: 'forbidden'`
- Successful operations logged with `result: 'success'`

---

### Token Security

- Tokens stored in httpOnly cookies
- Tokens expire after session timeout
- Tokens rotated on privilege escalation

---

## Future Enhancements

### 1. Resource-Level Permissions

**Current**: Role-based (all tenants or none)  
**Future**: Resource-based (specific tenants only)

**Example**:
```typescript
checkEntitlement(role, 'tenants:read', { tenantId: 'org_123' });
```

---

### 2. Dynamic Role Assignment

**Current**: Static role from token/claims  
**Future**: Dynamic role based on context

**Example**:
```typescript
// User is admin for org_123 but viewer for org_456
const role = getRoleForTenant(userId, tenantId);
```

---

### 3. Permission Inheritance

**Current**: Flat permission list  
**Future**: Hierarchical permissions

**Example**:
```typescript
// provider-admin inherits all provider-viewer permissions
const ROLE_HIERARCHY = {
  'provider-admin': ['provider-viewer'],
  'provider-viewer': [],
};
```

---

### 4. Temporary Permissions

**Current**: Permanent role assignment  
**Future**: Time-limited permissions

**Example**:
```typescript
grantTemporaryPermission(
  userId, 
  'tenants:write', 
  { expiresAt: '2025-10-07T00:00:00.000Z' }
);
```

---

## References

- [API Contracts](./api-contracts.md) - Federation API documentation
- [Security](./security.md) - Security best practices
- [OIDC Configuration](./hosting-and-environments.md) - OIDC setup guide

---

**End of Entitlements Documentation**

