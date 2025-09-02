# ProjectKAF Backend Smoke Tests - API Verification Guide

## Overview
This document provides copy-paste smoke tests for verifying the ProjectKAF backend API functionality, including expected outputs and troubleshooting guidance.

## Prerequisites

### Environment Setup
```bash
# 1. Ensure backend server is running
cd server
npm run dev

# 2. Verify environment variables are set
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE  
echo $QR_SECRET

# 3. Check server is listening
curl -s http://localhost:8080/health
```

## Smoke Test Suite

### Test 1: Health Check
**Purpose**: Verify server is running and responding

```bash
# Command
curl -s http://localhost:8080/health

# Expected Output
{"ok":true}

# Troubleshooting
# If connection refused: Check server is running on port 8080
# If 500 error: Check server logs for startup errors
# If timeout: Check firewall/network configuration
```

### Test 2: Create Tenant
**Purpose**: Test tenant creation with unique code generation

```bash
# Command
curl -s -X POST http://localhost:8080/tenants \
  -H 'Content-Type: application/json' \
  -d '{"name":"Bella Vista Restaurant","plan":"pro"}'

# Expected Output (example)
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Bella Vista Restaurant", 
  "code": "BELL",
  "plan": "pro",
  "status": "active",
  "slug": "bella-vista-restaurant",
  "created_at": "2025-01-15T10:30:00.000Z",
  "updated_at": "2025-01-15T10:30:00.000Z"
}

# Note: 'code' will be a random 4-character string (e.g., BELL, CAFE, REST)
# Note: 'slug' is auto-generated from name due to legacy NOT NULL constraint
```

**Troubleshooting:**
```bash
# If 400 error: Check request body format
curl -s -X POST http://localhost:8080/tenants \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test Restaurant"}'  # Minimal required fields

# If 500 error: Check database connection
# Check server logs for Supabase connection errors

# If unique constraint error: Code collision (retry automatically)
# Server will retry up to 5 times with different codes
```

### Test 3: Get Tenant by Code
**Purpose**: Verify tenant retrieval by 4-character code

```bash
# Command (replace BELL with actual code from Test 2)
curl -s http://localhost:8080/tenants/BELL

# Expected Output
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Bella Vista Restaurant",
  "code": "BELL", 
  "plan": "pro",
  "status": "active",
  "slug": "bella-vista-restaurant",
  "created_at": "2025-01-15T10:30:00.000Z",
  "updated_at": "2025-01-15T10:30:00.000Z"
}
```

**Troubleshooting:**
```bash
# If 404 error: Tenant code not found
curl -s http://localhost:8080/tenants  # List all tenants to see available codes

# If 400 error: Invalid code format
# Code must be exactly 4 characters, alphanumeric
```

### Test 4: Generate QR Code
**Purpose**: Test QR code generation with cryptographic signing

```bash
# Command (replace BELL with actual tenant code)
curl -s http://localhost:8080/tenants/BELL/qr/T01

# Expected Output
{
  "data_url": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "signed": {
    "data": {
      "tenant_code": "BELL",
      "table_code": "T01", 
      "iat": 1705312200,
      "exp": 1705315800,
      "nonce": "a1b2c3d4e5f6g7h8"
    },
    "sig": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Field Explanations:**
- **data_url**: PNG image as base64 data URL (can be used in `<img src="">`)
- **signed.data.tenant_code**: 4-character tenant identifier
- **signed.data.table_code**: Table identifier (T01, T02, etc.)
- **signed.data.iat**: Issued at timestamp (Unix seconds)
- **signed.data.exp**: Expiration timestamp (Unix seconds, +10 minutes default)
- **signed.data.nonce**: Random nonce for uniqueness
- **signed.sig**: HMAC-SHA256 signature for tamper protection

**Troubleshooting:**
```bash
# If 404 error: Tenant not found
curl -s http://localhost:8080/tenants/BELL  # Verify tenant exists

# If 400 error: Invalid table format
# Table code must match pattern: T01, T02, T99 (T + 2 digits)

# If 500 error: QR generation failed
# Check QR_SECRET environment variable is set
echo $QR_SECRET

# If missing signature: Check QR_SECRET length (minimum 32 characters)
```

### Test 5: List All Tenants
**Purpose**: Verify tenant listing (admin functionality)

```bash
# Command
curl -s http://localhost:8080/tenants

# Expected Output (array of tenants)
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Bella Vista Restaurant",
    "code": "BELL",
    "plan": "pro",
    "status": "active",
    "created_at": "2025-01-15T10:30:00.000Z"
  },
  {
    "id": "987fcdeb-51a2-43d7-b456-426614174001", 
    "name": "Urban Spice Kitchen",
    "code": "URBN",
    "plan": "basic", 
    "status": "active",
    "created_at": "2025-01-15T11:15:00.000Z"
  }
]
```

## Advanced Testing

### Test 6: QR Code Validation
**Purpose**: Verify QR signature and expiration handling

```bash
# Test with expired QR (should fail)
# Generate QR, wait for expiration, then try to use it

# Test with tampered signature (should fail)
# Modify the signature and verify it's rejected
```

### Test 7: Concurrent Tenant Creation
**Purpose**: Test unique code generation under load

```bash
# Create multiple tenants simultaneously
for i in {1..10}; do
  curl -s -X POST http://localhost:8080/tenants \
    -H 'Content-Type: application/json' \
    -d "{\"name\":\"Test Restaurant $i\"}" &
done
wait

# Verify all have unique codes
curl -s http://localhost:8080/tenants | jq '.[].code' | sort | uniq -d
# Should return no duplicates
```

### Test 8: Database Integration
**Purpose**: Verify database operations and RLS

```bash
# Create tenant and verify in database
TENANT_CODE=$(curl -s -X POST http://localhost:8080/tenants \
  -H 'Content-Type: application/json' \
  -d '{"name":"RLS Test Restaurant"}' | jq -r '.code')

echo "Created tenant with code: $TENANT_CODE"

# Generate QR and verify signed payload
curl -s http://localhost:8080/tenants/$TENANT_CODE/qr/T01 | jq '.signed'
```

## Error Scenarios & Troubleshooting

### Common 4xx Errors

#### 400 Bad Request
```bash
# Invalid JSON
curl -s -X POST http://localhost:8080/tenants \
  -H 'Content-Type: application/json' \
  -d '{"name":}'  # Invalid JSON

# Response
{"error":"Validation Error","details":[...]}

# Fix: Ensure valid JSON format
```

#### 404 Not Found
```bash
# Non-existent tenant
curl -s http://localhost:8080/tenants/XXXX

# Response  
{"error":"Tenant not found"}

# Fix: Use valid tenant code from creation response
```

#### 422 Unprocessable Entity
```bash
# Invalid tenant name
curl -s -X POST http://localhost:8080/tenants \
  -H 'Content-Type: application/json' \
  -d '{"name":"X"}'  # Too short

# Response
{"error":"Validation Error","details":"name must be at least 2 characters"}

# Fix: Provide valid input according to schema
```

### Common 5xx Errors

#### 500 Internal Server Error
**Possible Causes:**
1. **Database connection failure**
2. **Missing environment variables**
3. **Supabase service role issues**
4. **QR secret configuration**

**Troubleshooting Steps:**
```bash
# 1. Check environment variables
env | grep -E "(SUPABASE|QR_SECRET)"

# 2. Test Supabase connection manually
curl -H "apikey: $SUPABASE_SERVICE_ROLE" \
     -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE" \
     "$SUPABASE_URL/rest/v1/tenants?select=id&limit=1"

# 3. Check server logs
# Look for specific error messages in server console

# 4. Verify database schema
# Ensure all required tables exist in Supabase
```

#### 503 Service Unavailable
**Possible Causes:**
1. **Supabase project paused/inactive**
2. **Database connection pool exhausted**
3. **Rate limiting triggered**

**Troubleshooting:**
```bash
# Check Supabase project status in dashboard
# Verify project is not paused or over quota

# Check connection pool settings
# Reduce concurrent requests if needed
```

## Performance Testing

### Load Testing
```bash
# Simple load test with curl
for i in {1..100}; do
  time curl -s http://localhost:8080/health > /dev/null
done

# Expected: All requests < 100ms response time
```

### Memory Usage
```bash
# Monitor server memory usage
ps aux | grep node
# Check RSS memory usage stays reasonable

# Monitor during load
watch 'ps aux | grep node | grep -v grep'
```

## Integration Testing

### Database State Verification
```sql
-- After running smoke tests, verify database state

-- Check tenant count
SELECT COUNT(*) as tenant_count FROM tenants;

-- Check code uniqueness  
SELECT code, COUNT(*) 
FROM tenants 
GROUP BY code 
HAVING COUNT(*) > 1;
-- Should return no rows

-- Check RLS is working
SET ROLE authenticated;
SET request.jwt.claims.tenant_id = 'non-existent-tenant';
SELECT COUNT(*) FROM orders;
-- Should return 0 (no access to any orders)
```

### API Response Validation
```bash
# Validate response schemas
curl -s http://localhost:8080/tenants/BELL | jq '
  if .id and .name and .code and .plan and .status then
    "✅ Valid tenant response"
  else  
    "❌ Invalid response schema"
  end'

# Validate QR response
curl -s http://localhost:8080/tenants/BELL/qr/T01 | jq '
  if .data_url and .signed.data and .signed.sig then
    "✅ Valid QR response"
  else
    "❌ Invalid QR response schema" 
  end'
```

## Automated Smoke Test Script

### smoke-test.sh
```bash
#!/bin/bash
set -e

echo "🧪 ProjectKAF Backend Smoke Tests"
echo "=================================="

# Test 1: Health Check
echo "1. Testing health endpoint..."
HEALTH=$(curl -s http://localhost:8080/health)
if [[ $HEALTH == '{"ok":true}' ]]; then
  echo "✅ Health check passed"
else
  echo "❌ Health check failed: $HEALTH"
  exit 1
fi

# Test 2: Create Tenant
echo "2. Testing tenant creation..."
TENANT_RESPONSE=$(curl -s -X POST http://localhost:8080/tenants \
  -H 'Content-Type: application/json' \
  -d '{"name":"Smoke Test Restaurant","plan":"basic"}')

TENANT_CODE=$(echo $TENANT_RESPONSE | jq -r '.code')
if [[ $TENANT_CODE != "null" && ${#TENANT_CODE} == 4 ]]; then
  echo "✅ Tenant created with code: $TENANT_CODE"
else
  echo "❌ Tenant creation failed: $TENANT_RESPONSE"
  exit 1
fi

# Test 3: Get Tenant
echo "3. Testing tenant retrieval..."
TENANT_GET=$(curl -s http://localhost:8080/tenants/$TENANT_CODE)
TENANT_NAME=$(echo $TENANT_GET | jq -r '.name')
if [[ $TENANT_NAME == "Smoke Test Restaurant" ]]; then
  echo "✅ Tenant retrieval passed"
else
  echo "❌ Tenant retrieval failed: $TENANT_GET"
  exit 1
fi

# Test 4: Generate QR
echo "4. Testing QR generation..."
QR_RESPONSE=$(curl -s http://localhost:8080/tenants/$TENANT_CODE/qr/T01)
DATA_URL=$(echo $QR_RESPONSE | jq -r '.data_url')
if [[ $DATA_URL == data:image/png* ]]; then
  echo "✅ QR generation passed"
else
  echo "❌ QR generation failed: $QR_RESPONSE"
  exit 1
fi

echo ""
echo "🎉 All smoke tests passed!"
echo "Backend is ready for integration testing."
```

### Run Smoke Tests
```bash
# Make script executable
chmod +x smoke-test.sh

# Run tests
./smoke-test.sh
```

## Database Integration Verification

### Verify Tenant in Database
```sql
-- After creating tenant via API, verify in database
SELECT id, name, code, plan, status, created_at 
FROM tenants 
WHERE name = 'Bella Vista Restaurant';

-- Should show the created tenant with generated code
```

### Verify RLS Protection
```sql
-- Test tenant isolation
-- Create two tenants via API, then verify RLS blocks cross-access

-- As tenant 1 user
SET request.jwt.claims.tenant_id = 'tenant_1_id';
SELECT COUNT(*) FROM orders; -- Should only show tenant 1 orders

-- As tenant 2 user  
SET request.jwt.claims.tenant_id = 'tenant_2_id';
SELECT COUNT(*) FROM orders; -- Should only show tenant 2 orders
```

## Performance Benchmarks

### Response Time Targets
| Endpoint | Target | Acceptable | Action Required |
|----------|--------|------------|-----------------|
| **GET /health** | < 10ms | < 50ms | Optimize if > 50ms |
| **POST /tenants** | < 200ms | < 500ms | Database optimization |
| **GET /tenants/:code** | < 100ms | < 300ms | Add caching |
| **GET /tenants/:code/qr/:table** | < 300ms | < 1000ms | QR generation optimization |

### Load Testing
```bash
# Simple concurrent request test
seq 1 50 | xargs -n1 -P10 -I{} curl -s http://localhost:8080/health

# Expected: All requests succeed within reasonable time
# If failures: Check connection limits and server resources
```

## Security Testing

### Authentication Testing
```bash
# Test without authentication (should work for public endpoints)
curl -s http://localhost:8080/health

# Test with invalid authentication (future protected endpoints)
curl -s -H "Authorization: Bearer invalid-token" http://localhost:8080/protected-endpoint
# Should return 401 Unauthorized
```

### Input Validation Testing
```bash
# Test SQL injection attempts
curl -s -X POST http://localhost:8080/tenants \
  -H 'Content-Type: application/json' \
  -d '{"name":"'; DROP TABLE tenants; --"}'

# Should return validation error, not execute SQL

# Test XSS attempts  
curl -s -X POST http://localhost:8080/tenants \
  -H 'Content-Type: application/json' \
  -d '{"name":"<script>alert(\"xss\")</script>"}'

# Should sanitize input or return validation error
```

### QR Security Testing
```bash
# Generate QR and extract signature
QR_DATA=$(curl -s http://localhost:8080/tenants/BELL/qr/T01)
SIGNATURE=$(echo $QR_DATA | jq -r '.signed.sig')

# Test signature tampering (should fail when verified)
# Modify last character of signature
TAMPERED_SIG="${SIGNATURE%?}X"
echo "Original: $SIGNATURE"
echo "Tampered: $TAMPERED_SIG"

# Verification would happen in QR scanning endpoint
```

## Integration Points

### Frontend Integration
```javascript
// Test API integration from frontend
const createTenant = async () => {
  const response = await fetch('http://localhost:8080/tenants', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Frontend Test', plan: 'basic' })
  });
  
  const tenant = await response.json();
  console.log('Created tenant:', tenant);
  return tenant;
};

// Test QR generation
const generateQR = async (tenantCode) => {
  const response = await fetch(`http://localhost:8080/tenants/${tenantCode}/qr/T01`);
  const qrData = await response.json();
  
  // Display QR code
  const img = document.createElement('img');
  img.src = qrData.data_url;
  document.body.appendChild(img);
  
  return qrData;
};
```

### Mobile App Integration
```javascript
// QR scanning integration
const handleQRScan = (scannedData) => {
  // Parse KAF URI scheme
  if (scannedData.startsWith('kaf://t?')) {
    const url = new URL(scannedData);
    const dataParam = url.searchParams.get('d');
    const sigParam = url.searchParams.get('s');
    
    // Send to verification endpoint
    verifyQRCode(dataParam, sigParam);
  }
};
```

## Monitoring & Alerting

### Health Check Monitoring
```bash
# Set up monitoring script
#!/bin/bash
while true; do
  if ! curl -s http://localhost:8080/health > /dev/null; then
    echo "❌ Health check failed at $(date)"
    # Send alert notification
  fi
  sleep 30
done
```

### Log Monitoring
```bash
# Monitor server logs for errors
tail -f server/logs/app.log | grep -E "(ERROR|WARN)"

# Monitor for specific patterns
tail -f server/logs/app.log | grep -E "(tenant creation|QR generation|database error)"
```

## Success Criteria

### ✅ **All Tests Must Pass**
1. **Health check** returns `{"ok":true}`
2. **Tenant creation** returns valid tenant object with 4-char code
3. **Tenant retrieval** returns correct tenant data
4. **QR generation** returns valid PNG data URL and signed payload
5. **Database integration** properly stores and retrieves data
6. **RLS verification** blocks cross-tenant access

### 🎯 **Performance Targets**
- **Health check**: < 50ms response time
- **Tenant operations**: < 500ms response time  
- **QR generation**: < 1000ms response time
- **Concurrent requests**: Handle 50+ simultaneous requests

### 🔒 **Security Validation**
- **Input validation** blocks malicious input
- **QR signatures** prevent tampering
- **Database isolation** enforced by RLS
- **Error handling** doesn't leak sensitive information

---

**The backend smoke tests verify core functionality, security, and performance. All tests should pass before proceeding to frontend integration and advanced features.**