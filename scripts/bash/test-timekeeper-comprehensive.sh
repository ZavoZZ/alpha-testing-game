#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  🕐 THE TIMEKEEPER - COMPREHENSIVE TEST SUITE                  ║"
echo "║  Server: ovidiuguru.online (PRODUCTION)                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

BASE_URL="https://ovidiuguru.online"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
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
echo "║  TEST 1: Economy Server Health                                 ║"
echo "╚════════════════════════════════════════════════════════════════╝"
HEALTH=$(curl -s "$BASE_URL/api/economy/health")
if echo "$HEALTH" | grep -q '"status":"operational"'; then
  test_result 0 "Economy Server is operational"
  echo "   Response: $HEALTH"
else
  test_result 1 "Economy Server is NOT operational"
fi
echo ""

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  TEST 2: SystemState Exists in Database                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
docker compose exec -T mongo mongosh --quiet auth_db --eval "
  const state = db.systemstates.findOne({key: 'UNIVERSE_CLOCK'});
  if (state) {
    print('✅ SystemState found');
    print('   Last Tick:', new Date(state.last_tick_epoch).toISOString());
    print('   Total Ticks:', state.total_ticks_processed);
    print('   Is Processing:', state.is_processing);
    print('   Game Version:', state.game_version);
  } else {
    print('❌ SystemState NOT found');
    quit(1);
  }
" 2>&1 | grep -v "Current Mongosh"
if [ $? -eq 0 ]; then
  test_result 0 "SystemState singleton exists"
else
  test_result 1 "SystemState singleton NOT found"
fi
echo ""

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  TEST 3: GameClock Initialization Logs                         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
if docker compose logs economy-server | grep -q "Game Clock initialized successfully"; then
  test_result 0 "GameClock initialized successfully"
  LOCK_ID=$(docker compose logs economy-server | grep "Lock holder ID:" | tail -1 | awk '{print $NF}')
  echo "   Lock Holder ID: $LOCK_ID"
else
  test_result 1 "GameClock NOT initialized"
fi
echo ""

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  TEST 4: Cron Scheduler Active                                 ║"
echo "╚════════════════════════════════════════════════════════════════╝"
if docker compose logs economy-server | grep -q "Cron scheduler started"; then
  test_result 0 "Cron scheduler is active"
  echo "   Schedule: At minute 0 of every hour (0 * * * * UTC)"
else
  test_result 1 "Cron scheduler NOT active"
fi
echo ""

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  TEST 5: SystemState Fields Validation                         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
FIELDS_OK=$(docker compose exec -T mongo mongosh --quiet auth_db --eval "
  const state = db.systemstates.findOne({key: 'UNIVERSE_CLOCK'});
  const hasFields = state && 
                   state.hasOwnProperty('last_tick_epoch') &&
                   state.hasOwnProperty('is_processing') &&
                   state.hasOwnProperty('lock_timestamp') &&
                   state.hasOwnProperty('total_ticks_processed') &&
                   state.hasOwnProperty('global_stats');
  print(hasFields ? 'OK' : 'MISSING');
" 2>&1 | grep -o "OK\|MISSING")

if [ "$FIELDS_OK" == "OK" ]; then
  test_result 0 "All required fields present in SystemState"
else
  test_result 1 "Missing fields in SystemState"
fi
echo ""

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  TEST 6: Next Tick Countdown                                   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
CURRENT_TIME=$(date -u +"%H:%M:%S")
CURRENT_MINUTE=$(date -u +"%M" | sed 's/^0//')
NEXT_TICK=$(( 60 - CURRENT_MINUTE ))
echo "   Current UTC Time: $CURRENT_TIME"
echo "   Current Minute: $CURRENT_MINUTE"
if [ "$CURRENT_MINUTE" -eq 0 ]; then
  echo -e "   ${YELLOW}⚡ RIGHT NOW is minute 0 - tick is running!${NC}"
else
  echo "   ⏰ Next tick in: $NEXT_TICK minutes (at $(date -u -d "+${NEXT_TICK} minutes" +"%H:00:00 UTC"))"
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
  echo "🎉 The Timekeeper is ready and operational!"
  echo ""
  echo "📝 To see the first real tick, run:"
  echo "   docker compose logs -f economy-server"
  echo ""
  echo "   And wait for next hour (minute 0)."
fi
