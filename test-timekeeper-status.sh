#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  🕐 THE TIMEKEEPER - STATUS CHECK                              ║"
echo "║  Server: ovidiuguru.online                                     ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

echo "📝 Step 1: Check Economy Server Status..."
docker compose ps economy-server
echo ""

echo "📝 Step 2: Check GameClock Initialization Logs..."
docker compose logs economy-server | grep "TIMEKEEPER" | tail -15
echo ""

echo "📝 Step 3: Query SystemState from Database..."
docker compose exec -T mongo mongosh --quiet auth_db --eval "
  const state = db.systemstates.findOne({key: 'UNIVERSE_CLOCK'});
  if (state) {
    print('✅ SystemState Found:');
    print('   Key:', state.key);
    print('   Last Tick:', new Date(state.last_tick_epoch).toISOString());
    print('   Is Processing:', state.is_processing);
    print('   Lock Holder:', state.lock_holder || 'none');
    print('   Total Ticks:', state.total_ticks_processed);
    print('   Game Version:', state.game_version);
    print('   Active Users:', state.global_stats.active_users_count);
  } else {
    print('❌ SystemState NOT found!');
  }
" 2>&1 | grep -v "Current Mongosh"
echo ""

echo "📝 Step 4: Get Current Time..."
echo "   Current UTC Time: $(date -u +"%Y-%m-%d %H:%M:%S UTC")"
CURRENT_MINUTE=$(date -u +"%M")
echo "   Current Minute: $CURRENT_MINUTE"
if [ "$CURRENT_MINUTE" -eq 0 ]; then
  echo "   ⚠️  RIGHT NOW is minute 0 - tick should be running!"
else
  NEXT_TICK=$(( 60 - 10#$CURRENT_MINUTE ))
  echo "   ⏰ Next tick in: $NEXT_TICK minutes"
fi
echo ""

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  ✅ STATUS CHECK COMPLETE                                       ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Next Steps:"
echo "1. Wait for next hour (minute 0)"
echo "2. Run: docker compose logs -f economy-server"
echo "3. Watch for: [TIMEKEEPER] 🔔 HOURLY TICK TRIGGERED"
echo "4. Verify: [TIMEKEEPER] ✅ Tick completed successfully"
