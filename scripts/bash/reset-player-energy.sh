#!/bin/bash

echo "🔄 Resetting player energy via MongoDB..."

ssh root@ovidiuguru.online "mongo auth_db --eval \"db.users.updateMany({}, {\\\$set: {energy: 100, happiness: 100, health: 100, work_cooldown_until: null, consumption_cooldown_until: null}})\""

echo "✅ All players reset to 100 energy, 100 happiness, 100 health"
echo "✅ All cooldowns cleared"
echo ""
echo "🎮 You can now work and play!"
