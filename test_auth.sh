#!/bin/bash

echo "🧪 Testing JWT Authentication & Authorization..."
echo "================================================"
echo ""

BASE_URL="http://localhost:8080"

# Test 1: Public endpoint (should work without auth)
echo "✅ Test 1: Public endpoint (no auth required)"
curl -s "$BASE_URL/api/test/public" | jq -r '.results'
echo ""
echo ""

# Test 2: Login with admin account
echo "🔐 Test 2: Login as admin@gmail.com"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"123456789"}')

echo "$LOGIN_RESPONSE" | jq .

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.results.token // empty')

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
  echo "❌ Login failed! Trying with 'email' field instead of 'userName'..."
  LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"123456789"}')
  
  echo "$LOGIN_RESPONSE" | jq .
  TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.results.token // empty')
fi

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
  echo "❌ Login failed completely. Cannot proceed with tests."
  exit 1
fi

echo ""
echo "✅ Token received!"
echo "Token preview: ${TOKEN:0:50}..."
echo ""
echo ""

# Test 3: Authenticated endpoint (check user info)
echo "👤 Test 3: Get authenticated user info"
curl -s "$BASE_URL/api/test/authenticated" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""
echo ""

# Test 4: Admin-only endpoint (should work if user is ADMIN)
echo "🔒 Test 4: Admin-only endpoint"
ADMIN_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$BASE_URL/api/test/admin-only" \
  -H "Authorization: Bearer $TOKEN")

HTTP_STATUS=$(echo "$ADMIN_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$ADMIN_RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" == "200" ]; then
  echo "✅ Success! You have ADMIN role"
  echo "$BODY" | jq .
else
  echo "❌ Access Denied (HTTP $HTTP_STATUS)"
  echo "This means your user does NOT have ADMIN role"
  echo "$BODY"
fi
echo ""
echo ""

# Test 5: User-only endpoint
echo "👥 Test 5: User-only endpoint"
USER_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$BASE_URL/api/test/user-only" \
  -H "Authorization: Bearer $TOKEN")

HTTP_STATUS=$(echo "$USER_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$USER_RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" == "200" ]; then
  echo "✅ Success! You have USER role"
  echo "$BODY" | jq .
else
  echo "❌ Access Denied (HTTP $HTTP_STATUS)"
  echo "$BODY"
fi
echo ""
echo ""

# Test 6: Driver-only endpoint
echo "🚗 Test 6: Driver-only endpoint"
DRIVER_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$BASE_URL/api/test/driver-only" \
  -H "Authorization: Bearer $TOKEN")

HTTP_STATUS=$(echo "$DRIVER_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$DRIVER_RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" == "200" ]; then
  echo "✅ Success! You have DRIVER role"
  echo "$BODY" | jq .
else
  echo "❌ Access Denied (HTTP $HTTP_STATUS)"
  echo "$BODY"
fi
echo ""
echo ""

echo "================================================"
echo "🏁 Testing completed!"
echo "================================================"
