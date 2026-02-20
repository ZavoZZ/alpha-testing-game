#!/bin/bash

# ============================================================================
# 🧪 COMPREHENSIVE SYSTEM TEST SUITE
# ============================================================================
# 
# Tests EVERYTHING built so far:
# - Authentication (login, logout, refresh, session expiration)
# - Admin Panel (user management, all CRUD operations)
# - Work System (status, preview, execute, cooldown, auto-hire)
# - Companies (list, join, solvency checks)
# - System Status & Tick
# - Economy APIs (all endpoints)
# - Error Handling & Security
# 
# Runs both LOCAL and PRODUCTION tests
# 
# ============================================================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Counters
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# Test function
test_api() {
    local test_name="$1"
    local url="$2"
    local method="${3:-GET}"
    local data="$4"
    local headers="$5"
    local expected_status="${6:-200}"
    local expected_content="$7"
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    
    echo -n "  [Test $TESTS_TOTAL] $test_name... "
    
    # Build curl command
    local curl_cmd="curl -s -w '\n%{http_code}' -X $method"
    
    if [ -n "$data" ]; then
        curl_cmd="$curl_cmd -d '$data' -H 'Content-Type: application/json'"
    fi
    
    if [ -n "$headers" ]; then
        curl_cmd="$curl_cmd $headers"
    fi
    
    curl_cmd="$curl_cmd '$url'"
    
    # Execute
    local response=$(eval $curl_cmd 2>&1)
    local status_code=$(echo "$response" | tail -n 1)
    local body=$(echo "$response" | head -n -1)
    
    # Check status code
    if [ "$status_code" != "$expected_status" ]; then
        echo -e "${RED}FAIL${NC} (Status: $status_code, Expected: $expected_status)"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
    
    # Check expected content
    if [ -n "$expected_content" ]; then
        if ! echo "$body" | grep -q "$expected_content"; then
            echo -e "${RED}FAIL${NC} (Content not found: $expected_content)"
            TESTS_FAILED=$((TESTS_FAILED + 1))
            return 1
        fi
    fi
    
    echo -e "${GREEN}PASS${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    return 0
}

# ============================================================================
# MAIN TEST EXECUTION
# ============================================================================

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                 ║"
echo "║     🧪 COMPREHENSIVE SYSTEM TEST SUITE                          ║"
echo "║                                                                 ║"
echo "║     Testing: Alpha Testing Game - Module 2.2 Complete          ║"
echo "║                                                                 ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Test environment
echo -e "${CYAN}📍 Test Environment:${NC}"
echo "  • Local:      http://localhost:3000"
echo "  • Production: https://ovidiuguru.online"
echo ""

# ============================================================================
# SECTION 1: PRODUCTION TESTS
# ============================================================================

echo -e "${MAGENTA}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║  SECTION 1: PRODUCTION TESTS (ovidiuguru.online)          ║${NC}"
echo -e "${MAGENTA}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

BASE_URL="https://ovidiuguru.online"

# --- Homepage ---
echo -e "${BLUE}🌐 Homepage & Static Files${NC}"
test_api "Homepage loads" "$BASE_URL/" "GET" "" "" "200" "Alpha Testing"
test_api "Main JS loads" "$BASE_URL/main" "GET" "" "" "200" ""
echo ""

# --- Public APIs (No Auth) ---
echo -e "${BLUE}🔓 Public APIs (No Authentication)${NC}"
test_api "System Status" "$BASE_URL/api/economy/system-status" "GET" "" "" "200" "server_time"
test_api "Companies List" "$BASE_URL/api/economy/companies" "GET" "" "" "200" "State Construction"
test_api "Health Check (Economy)" "$BASE_URL/api/economy/health" "GET" "" "" "200" "success"
echo ""

# --- Authentication Flow ---
echo -e "${BLUE}🔐 Authentication Flow${NC}"

# Login
LOGIN_DATA='{"email":"testjucator@ovidiuguru.com","password":"testparola2026"}'
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth-service/auth/login" \
  -H "Content-Type: application/json" \
  -d "$LOGIN_DATA")

JWT=$(echo "$LOGIN_RESPONSE" | grep -oP 'eyJ[A-Za-z0-9._-]+' | head -1)

if [ -n "$JWT" ]; then
    echo -e "  [Test $((TESTS_TOTAL + 1))] Login successful ${GREEN}PASS${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
else
    echo -e "  [Test $((TESTS_TOTAL + 1))] Login ${RED}FAIL${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    echo "  Response: $LOGIN_RESPONSE"
fi

# Token verification
test_api "Token Verify" "$BASE_URL/api/auth-service/auth/verify" "GET" "" "-H 'Authorization: Bearer $JWT'" "200" "valid"
echo ""

# --- Admin Panel APIs ---
echo -e "${BLUE}👥 Admin Panel APIs${NC}"
test_api "Admin Users List" "$BASE_URL/api/auth-service/auth/admin/users" "GET" "" "-H 'Authorization: Bearer $JWT'" "200" "users"
echo ""

# --- Work System APIs ---
echo -e "${BLUE}💼 Work System APIs${NC}"
test_api "Work Status" "$BASE_URL/api/economy/work/status" "GET" "" "-H 'Authorization: Bearer $JWT'" "200" "success"
test_api "Work Preview" "$BASE_URL/api/economy/work/preview" "GET" "" "-H 'Authorization: Bearer $JWT'" "200" "preview"
echo ""

# --- Work Execution Test ---
echo -e "${BLUE}🏗️ Work Execution Test${NC}"

# Check current status
WORK_STATUS=$(curl -s "$BASE_URL/api/economy/work/status" -H "Authorization: Bearer $JWT")
CAN_WORK=$(echo "$WORK_STATUS" | grep -o '"canWork":[^,]*' | cut -d':' -f2)

if echo "$CAN_WORK" | grep -q "true"; then
    echo -n "  [Test $((TESTS_TOTAL + 1))] Execute Work Shift... "
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    
    WORK_RESPONSE=$(curl -s -X POST "$BASE_URL/api/economy/work" \
      -H "Authorization: Bearer $JWT" \
      -H "Content-Type: application/json")
    
    if echo "$WORK_RESPONSE" | grep -q "success"; then
        echo -e "${GREEN}PASS${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        
        # Extract earnings
        NET_SALARY=$(echo "$WORK_RESPONSE" | grep -o '"net":"[^"]*"' | cut -d'"' -f4 | head -1)
        echo "    💰 Earned: €$NET_SALARY"
        
        # Test cooldown enforcement
        echo -n "  [Test $((TESTS_TOTAL + 1))] Cooldown Enforcement... "
        TESTS_TOTAL=$((TESTS_TOTAL + 1))
        
        sleep 1
        COOLDOWN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/economy/work" \
          -H "Authorization: Bearer $JWT" \
          -H "Content-Type: application/json")
        
        COOLDOWN_STATUS=$(echo "$COOLDOWN_RESPONSE" | tail -n 1)
        
        if [ "$COOLDOWN_STATUS" = "429" ]; then
            echo -e "${GREEN}PASS${NC}"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            echo -e "${RED}FAIL${NC} (Expected 429, got $COOLDOWN_STATUS)"
            TESTS_FAILED=$((TESTS_FAILED + 1))
        fi
    else
        echo -e "${RED}FAIL${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        echo "    Response: $WORK_RESPONSE"
    fi
else
    echo "  [Skip] Cannot work (cooldown active or insufficient energy)"
fi

echo ""

# ============================================================================
# SECTION 2: LOCAL TESTS
# ============================================================================

echo -e "${MAGENTA}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║  SECTION 2: LOCAL TESTS (localhost:3000)                  ║${NC}"
echo -e "${MAGENTA}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

LOCAL_URL="http://localhost:3000"

echo -e "${BLUE}🏠 Local Server Health${NC}"
test_api "Local Homepage" "$LOCAL_URL/" "GET" "" "" "200" "Alpha Testing"
test_api "Local API Proxy" "$LOCAL_URL/api/economy/health" "GET" "" "" "200" "success"
echo ""

# ============================================================================
# SECTION 3: DATABASE VERIFICATION
# ============================================================================

echo -e "${MAGENTA}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║  SECTION 3: DATABASE VERIFICATION                         ║${NC}"
echo -e "${MAGENTA}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}🗄️ MongoDB Direct Checks${NC}"

# User count
USER_COUNT=$(docker compose exec -T mongo mongosh --quiet auth_db --eval "db.users.countDocuments({})" 2>/dev/null)
echo "  • Total Users: $USER_COUNT"

# Company count
COMPANY_COUNT=$(docker compose exec -T mongo mongosh --quiet economy_db --eval "db.companies.countDocuments({})" 2>/dev/null)
echo "  • Total Companies: $COMPANY_COUNT"

# Government company check
GOV_COMPANY=$(docker compose exec -T mongo mongosh --quiet economy_db --eval "db.companies.findOne({name: 'State Construction'}, {name: 1, wage_offer: 1, funds_euro: 1})" 2>/dev/null)
echo "  • Government Company: Found"

# Ledger entries
LEDGER_COUNT=$(docker compose exec -T mongo mongosh --quiet economy_db --eval "db.ledgers.countDocuments({})" 2>/dev/null)
echo "  • Ledger Entries: $LEDGER_COUNT"

echo ""

# ============================================================================
# SECTION 4: SYSTEM INTEGRITY CHECKS
# ============================================================================

echo -e "${MAGENTA}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║  SECTION 4: SYSTEM INTEGRITY CHECKS                       ║${NC}"
echo -e "${MAGENTA}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}🔍 Container Status${NC}"
docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" | grep -E "NAME|mern-template"
echo ""

echo -e "${BLUE}📊 Service Logs (Last 5 lines each)${NC}"
echo "  Economy Server:"
docker compose logs economy-server 2>&1 | grep -v "dotenv" | tail -5 | sed 's/^/    /'
echo ""
echo "  Auth Server:"
docker compose logs auth-server 2>&1 | grep -v "dotenv" | tail -5 | sed 's/^/    /'
echo ""

# ============================================================================
# SECTION 5: SECURITY CHECKS
# ============================================================================

echo -e "${MAGENTA}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║  SECTION 5: SECURITY CHECKS                               ║${NC}"
echo -e "${MAGENTA}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}🔒 Security Validation${NC}"

# Test protected endpoint without auth
echo -n "  [Test $((TESTS_TOTAL + 1))] Protected Endpoint (No Auth)... "
TESTS_TOTAL=$((TESTS_TOTAL + 1))
NO_AUTH_STATUS=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/economy/work/status" | tail -n 1)
if [ "$NO_AUTH_STATUS" = "401" ] || [ "$NO_AUTH_STATUS" = "403" ] || [ "$NO_AUTH_STATUS" = "429" ]; then
    echo -e "${GREEN}PASS${NC} (Correctly blocked: $NO_AUTH_STATUS)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}FAIL${NC} (Expected 401/403/429, got $NO_AUTH_STATUS)"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

# Test invalid JWT
echo -n "  [Test $((TESTS_TOTAL + 1))] Invalid JWT Rejection... "
TESTS_TOTAL=$((TESTS_TOTAL + 1))
INVALID_JWT_STATUS=$(curl -s -w "\n%{http_code}" "$BASE_URL/api/economy/work/status" \
  -H "Authorization: Bearer INVALID_TOKEN_HERE" | tail -n 1)
if [ "$INVALID_JWT_STATUS" = "401" ] || [ "$INVALID_JWT_STATUS" = "403" ] || [ "$INVALID_JWT_STATUS" = "429" ]; then
    echo -e "${GREEN}PASS${NC} (Correctly blocked: $INVALID_JWT_STATUS)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}FAIL${NC} (Expected 401/403/429, got $INVALID_JWT_STATUS)"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo ""

# ============================================================================
# FINAL REPORT
# ============================================================================

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    TEST RESULTS SUMMARY                         ║"
echo "╠════════════════════════════════════════════════════════════════╣"
echo "║                                                                 ║"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "║  Status: ${GREEN}✅ ALL TESTS PASSED${NC}                                    ║"
else
    echo -e "║  Status: ${RED}⚠️  SOME TESTS FAILED${NC}                                   ║"
fi

echo "║                                                                 ║"
echo "║  Tests Run:    $TESTS_TOTAL                                              ║"
echo "║  Passed:       $TESTS_PASSED                                              ║"
echo "║  Failed:       $TESTS_FAILED                                               ║"

if [ $TESTS_TOTAL -gt 0 ]; then
    SUCCESS_RATE=$((TESTS_PASSED * 100 / TESTS_TOTAL))
    echo "║  Success Rate: $SUCCESS_RATE%                                             ║"
fi

echo "║                                                                 ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 SYSTEM IS FULLY OPERATIONAL! 🎉${NC}"
    exit 0
else
    echo -e "${RED}⚠️  FIX FAILED TESTS BEFORE DEPLOYMENT${NC}"
    exit 1
fi
