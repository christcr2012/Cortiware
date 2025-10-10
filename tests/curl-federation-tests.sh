#!/bin/bash

# Federation v3+ Curl Simulation Tests
# Tests HMAC signature verification, rate limiting, idempotency, and RBAC
# Usage: ./tests/curl-federation-tests.sh [base_url]
# Example: ./tests/curl-federation-tests.sh http://localhost:3000

set -e

BASE_URL="${1:-http://localhost:3000}"
CLIENT_KEY_ID="${CLIENT_KEY_ID:-client-demo}"
CLIENT_SECRET="${CLIENT_SECRET:-demo-secret-key-for-testing-only}"
ORG_ID="${ORG_ID:-org-demo-123}"

echo "========================================="
echo "Federation v3+ Curl Simulation Tests"
echo "========================================="
echo "Base URL: $BASE_URL"
echo "Client Key ID: $CLIENT_KEY_ID"
echo ""

# Helper function to generate HMAC signature
generate_signature() {
    local method=$1
    local path=$2
    local timestamp=$3
    local secret=$4
    
    local to_sign="$method $path $timestamp"
    local sig=$(echo -n "$to_sign" | openssl dgst -sha256 -hmac "$secret" -binary | xxd -p -c256)
    echo "sha256:$sig"
}

# Test 1: Valid Escalation Request
echo "Test 1: Valid Escalation Request"
echo "---------------------------------"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
SIGNATURE=$(generate_signature "POST" "/api/v1/federation/escalation" "$TIMESTAMP" "$CLIENT_SECRET")

curl -s -X POST "$BASE_URL/api/v1/federation/escalation" \
  -H "X-Provider-KeyId: $CLIENT_KEY_ID" \
  -H "X-Provider-Timestamp: $TIMESTAMP" \
  -H "X-Provider-Signature: $SIGNATURE" \
  -H "X-Provider-Org: $ORG_ID" \
  -H "Idempotency-Key: test-escalation-001" \
  -H "Content-Type: application/json" \
  --data '{
    "escalationId": "esc-test-001",
    "tenantId": "tenant-demo-001",
    "incident": {
      "type": "ai_triage_failure",
      "severity": "high",
      "description": "AI triage system failed to process customer inquiry"
    },
    "client": {
      "orgId": "org-demo-123",
      "contactEmail": "ops@example.com",
      "planType": "premium"
    }
  }' | jq '.'

echo ""
echo ""

# Test 2: Idempotency - Replay Same Request
echo "Test 2: Idempotency - Replay Same Request"
echo "------------------------------------------"
echo "Replaying same request with same Idempotency-Key..."

curl -s -X POST "$BASE_URL/api/v1/federation/escalation" \
  -H "X-Provider-KeyId: $CLIENT_KEY_ID" \
  -H "X-Provider-Timestamp: $TIMESTAMP" \
  -H "X-Provider-Signature: $SIGNATURE" \
  -H "X-Provider-Org: $ORG_ID" \
  -H "Idempotency-Key: test-escalation-001" \
  -H "Content-Type: application/json" \
  --data '{
    "escalationId": "esc-test-001",
    "tenantId": "tenant-demo-001",
    "incident": {
      "type": "ai_triage_failure",
      "severity": "high",
      "description": "AI triage system failed to process customer inquiry"
    },
    "client": {
      "orgId": "org-demo-123",
      "contactEmail": "ops@example.com",
      "planType": "premium"
    }
  }' | jq '.'

echo ""
echo ""

# Test 3: Invalid Signature
echo "Test 3: Invalid Signature (Should Return 401)"
echo "----------------------------------------------"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
INVALID_SIG="sha256:$(printf '0%.0s' {1..64})"

curl -s -X POST "$BASE_URL/api/v1/federation/escalation" \
  -H "X-Provider-KeyId: $CLIENT_KEY_ID" \
  -H "X-Provider-Timestamp: $TIMESTAMP" \
  -H "X-Provider-Signature: $INVALID_SIG" \
  -H "X-Provider-Org: $ORG_ID" \
  -H "Idempotency-Key: test-invalid-sig" \
  -H "Content-Type: application/json" \
  --data '{"escalationId":"esc-invalid"}' | jq '.'

echo ""
echo ""

# Test 4: Expired Timestamp (Should Return 401)
echo "Test 4: Expired Timestamp (Should Return 401)"
echo "----------------------------------------------"
OLD_TIMESTAMP="2020-01-01T00:00:00.000Z"
OLD_SIGNATURE=$(generate_signature "POST" "/api/v1/federation/escalation" "$OLD_TIMESTAMP" "$CLIENT_SECRET")

curl -s -X POST "$BASE_URL/api/v1/federation/escalation" \
  -H "X-Provider-KeyId: $CLIENT_KEY_ID" \
  -H "X-Provider-Timestamp: $OLD_TIMESTAMP" \
  -H "X-Provider-Signature: $OLD_SIGNATURE" \
  -H "X-Provider-Org: $ORG_ID" \
  -H "Idempotency-Key: test-expired-timestamp" \
  -H "Content-Type: application/json" \
  --data '{"escalationId":"esc-expired"}' | jq '.'

echo ""
echo ""

# Test 5: Valid Invoice Request
echo "Test 5: Valid Invoice Request"
echo "------------------------------"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
SIGNATURE=$(generate_signature "POST" "/api/v1/federation/billing/invoice" "$TIMESTAMP" "$CLIENT_SECRET")

curl -s -X POST "$BASE_URL/api/v1/federation/billing/invoice" \
  -H "X-Provider-KeyId: $CLIENT_KEY_ID" \
  -H "X-Provider-Timestamp: $TIMESTAMP" \
  -H "X-Provider-Signature: $SIGNATURE" \
  -H "X-Provider-Org: $ORG_ID" \
  -H "Idempotency-Key: test-invoice-001" \
  -H "Content-Type: application/json" \
  --data '{
    "invoiceId": "inv-test-001",
    "tenantId": "tenant-demo-001",
    "billingPeriod": {
      "start": "2025-01-01T00:00:00.000Z",
      "end": "2025-01-31T23:59:59.999Z"
    },
    "lineItems": [
      {
        "description": "AI Credits - Premium Plan",
        "quantity": 1000,
        "unitPrice": 50,
        "total": 500
      }
    ],
    "total": 500,
    "currency": "USD"
  }' | jq '.'

echo ""
echo ""

# Test 6: Analytics Request (GET)
echo "Test 6: Analytics Request (GET)"
echo "--------------------------------"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
SIGNATURE=$(generate_signature "GET" "/api/v1/federation/analytics" "$TIMESTAMP" "$CLIENT_SECRET")

curl -s -X GET "$BASE_URL/api/v1/federation/analytics?orgId=$ORG_ID&startDate=2025-01-01&endDate=2025-01-31" \
  -H "X-Provider-KeyId: $CLIENT_KEY_ID" \
  -H "X-Provider-Timestamp: $TIMESTAMP" \
  -H "X-Provider-Signature: $SIGNATURE" \
  -H "X-Provider-Org: $ORG_ID" | jq '.'

echo ""
echo ""

# Test 7: Rate Limiting (Send Multiple Requests)
echo "Test 7: Rate Limiting (Send 10 Rapid Requests)"
echo "-----------------------------------------------"
echo "Sending 10 rapid requests to test rate limiting..."

for i in {1..10}; do
    TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
    SIGNATURE=$(generate_signature "POST" "/api/v1/federation/escalation" "$TIMESTAMP" "$CLIENT_SECRET")
    
    echo "Request $i:"
    curl -s -X POST "$BASE_URL/api/v1/federation/escalation" \
      -H "X-Provider-KeyId: $CLIENT_KEY_ID" \
      -H "X-Provider-Timestamp: $TIMESTAMP" \
      -H "X-Provider-Signature: $SIGNATURE" \
      -H "X-Provider-Org: $ORG_ID" \
      -H "Idempotency-Key: test-ratelimit-$i" \
      -H "Content-Type: application/json" \
      --data "{\"escalationId\":\"esc-ratelimit-$i\"}" \
      -w "\nHTTP Status: %{http_code}\n" | head -n 1
    
    sleep 0.1
done

echo ""
echo ""

# Test 8: Missing Required Headers
echo "Test 8: Missing Required Headers (Should Return 400)"
echo "-----------------------------------------------------"
curl -s -X POST "$BASE_URL/api/v1/federation/escalation" \
  -H "Content-Type: application/json" \
  --data '{"escalationId":"esc-missing-headers"}' | jq '.'

echo ""
echo ""

echo "========================================="
echo "All Tests Completed"
echo "========================================="
echo ""
echo "Summary:"
echo "- Test 1: Valid escalation request"
echo "- Test 2: Idempotency replay (should return same response)"
echo "- Test 3: Invalid signature (should return 401)"
echo "- Test 4: Expired timestamp (should return 401)"
echo "- Test 5: Valid invoice request"
echo "- Test 6: Analytics GET request"
echo "- Test 7: Rate limiting (may see 429 after several requests)"
echo "- Test 8: Missing headers (should return 400)"
echo ""
echo "Review the responses above to verify correct behavior."

