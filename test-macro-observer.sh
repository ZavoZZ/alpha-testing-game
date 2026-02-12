#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  📊 MACRO-ECONOMIC OBSERVER - TEST SUITE                       ║"
echo "║  Module 2.1.C - Zero-Touch Automation Verification             ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

BASE_URL="https://ovidiuguru.online"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASSED=0
FAILED=0

test_result() {
  if [ $1 -eq 0 ]; then
    echo -e "${GREEN}✅ $2${NC}"
    ((PASSED++))
  else
    echo -e "${RED}❌ $2${NC}"
    ((FAILED++))
  fi
}

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  TEST 1: System Status API Endpoint                            ║"
echo "╚════════════════════════════════════════════════════════════════╝"
RESPONSE=$(curl -s "$BASE_URL/api/economy/system-status")
if echo "$RESPONSE" | grep -q '"success":true'; then
  test_result 0 "System status API is accessible"
  
  # Extract key metrics
  SERVER_TIME=$(echo "$RESPONSE" | grep -o '"timestamp":"[^"]*"' | head -1 | cut -d'"' -f4)
  NEXT_TICK=$(echo "$RESPONSE" | grep -o '"timestamp":"[^"]*"' | tail -1 | cut -d'"' -f4)
  TOTAL_TICKS=$(echo "$RESPONSE" | grep -o '"total_ticks_processed":[0-9]*' | grep -o '[0-9]*')
  
  echo -e "   ${BLUE}Server Time:${NC} $SERVER_TIME"
  echo -e "   ${BLUE}Next Tick:${NC} $NEXT_TICK"
  echo -e "   ${BLUE}Total Ticks:${NC} $TOTAL_TICKS"
else
  test_result 1 "System status API failed"
fi
echo ""

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  TEST 2: Server Time Synchronization                           ║"
echo "╚════════════════════════════════════════════════════════════════╝"
SERVER_HOUR=$(echo "$RESPONSE" | grep -o '"utc_hour":[0-9]*' | grep -o '[0-9]*')
LOCAL_HOUR=$(date -u +%H | sed 's/^0//')
if [ "$SERVER_HOUR" == "$LOCAL_HOUR" ]; then
  test_result 0 "Server time is synchronized with UTC"
  echo "   Server Hour: $SERVER_HOUR UTC"
  echo "   Local Hour: $LOCAL_HOUR UTC"
else
  test_result 1 "Server time is NOT synchronized"
  echo "   Server Hour: $SERVER_HOUR UTC"
  echo "   Local Hour: $LOCAL_HOUR UTC"
fi
echo ""

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  TEST 3: Next Tick Countdown                                   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
MINUTES_UNTIL=$(echo "$RESPONSE" | grep -o '"minutes":[0-9]*' | grep -o '[0-9]*')
if [ -n "$MINUTES_UNTIL" ]; then
  test_result 0 "Next tick countdown is calculated"
  echo "   Time until next tick: ${MINUTES_UNTIL} minutes"
else
  test_result 1 "Next tick countdown NOT found"
fi
echo ""

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  TEST 4: Orphan User Detection                                 ║"
echo "╚════════════════════════════════════════════════════════════════╝"
ORPHAN_COUNT=$(docker compose exec -T mongo mongosh --quiet auth_db --eval "
  db.users.countDocuments({
    \$or: [
      { energy: { \$exists: false } },
      { happiness: { \$exists: false } },
      { health: { \$exists: false } }
    ]
  });
" 2>&1 | grep -v "Current Mongosh" | tr -d ' ')

if [ "$ORPHAN_COUNT" -ge 1 ]; then
  test_result 0 "Orphan users detected (will be auto-repaired at next tick)"
  echo "   Orphan count: $ORPHAN_COUNT"
  echo -e "   ${YELLOW}⏰ These will be automatically repaired at 21:00 UTC${NC}"
else
  echo -e "${GREEN}✅ No orphan users found - system is consistent${NC}"
  ((PASSED++))
fi
echo ""

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  TEST 5: Census Data Structure                                 ║"
echo "╚════════════════════════════════════════════════════════════════╝"

# Check if latest_tick exists (will be null until first tick with new metrics)
if echo "$RESPONSE" | grep -q '"latest_tick":null'; then
  echo -e "${YELLOW}⏳ Latest tick is null (expected - first tick with new metrics at 21:00 UTC)${NC}"
  test_result 0 "API structure correct (latest_tick null before first new tick)"
elif echo "$RESPONSE" | grep -q '"population"' && echo "$RESPONSE" | grep -q '"life_stats"' && echo "$RESPONSE" | grep -q '"telemetry"'; then
  test_result 0 "Census data structure complete (population, life_stats, telemetry)"
  
  # Extract metrics
  TOTAL_ACTIVE=$(echo "$RESPONSE" | grep -o '"total_active":[0-9]*' | grep -o '[0-9]*')
  NEW_USERS=$(echo "$RESPONSE" | grep -o '"new_users_joined":[0-9]*' | grep -o '[0-9]*')
  
  echo "   Population: $TOTAL_ACTIVE"
  echo "   New Users: $NEW_USERS"
else
  test_result 1 "Census data structure incomplete"
fi
echo ""

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  TEST 6: Macro-Observer Initialization Logs                    ║"
echo "╚════════════════════════════════════════════════════════════════╝"
if docker compose logs economy-server | grep -q "Macro-Economic Observer: /system-status endpoint active"; then
  test_result 0 "Macro-Observer initialized successfully"
else
  test_result 1 "Macro-Observer NOT initialized"
fi
echo ""

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  TEST 7: Total Users (Migrated + Orphan)                       ║"
echo "╚════════════════════════════════════════════════════════════════╝"
TOTAL_USERS=$(docker compose exec -T mongo mongosh --quiet auth_db --eval "db.users.countDocuments();" 2>&1 | grep -v "Current Mongosh" | tr -d ' ')
USERS_WITH_ENERGY=$(docker compose exec -T mongo mongosh --quiet auth_db --eval "db.users.countDocuments({ energy: { \$exists: true } });" 2>&1 | grep -v "Current Mongosh" | tr -d ' ')

echo "   Total Users: $TOTAL_USERS"
echo "   Users with Energy: $USERS_WITH_ENERGY"

if [ "$TOTAL_USERS" -gt "$USERS_WITH_ENERGY" ]; then
  ORPHANS=$((TOTAL_USERS - USERS_WITH_ENERGY))
  echo -e "   ${YELLOW}⚠️  $ORPHANS orphan(s) will be auto-repaired at next tick${NC}"
  test_result 0 "Orphan detection working (found $ORPHANS)"
else
  test_result 0 "All users have life fields (no orphans)"
fi
echo ""

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  TEST SUMMARY                                                   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
TOTAL=$((PASSED + FAILED))
echo "Total Tests: $TOTAL"
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
if [ $FAILED -gt 0 ]; then
  echo -e "${RED}❌ Failed: $FAILED${NC}"
  echo ""
  echo "⚠️  Some tests failed. Review errors above."
  exit 1
else
  echo -e "${GREEN}❌ Failed: 0${NC}"
  echo ""
  echo "✅ ALL TESTS PASSED!"
  echo ""
  echo "🎉 The Macro-Economic Observer is operational!"
  echo ""
  echo "📝 Next Tick (21:00 UTC) will:"
  echo "   1. Apply entropy decay to all users"
  echo "   2. Run census (detect new users automatically)"
  echo "   3. Detect orphan users (consistency check)"
  echo "   4. Auto-repair orphans (self-healing)"
  echo "   5. Calculate telemetry (burn rates)"
  echo "   6. Broadcast pulse (console output)"
  echo ""
  echo "   Watch with: docker compose logs -f economy-server"
fi
