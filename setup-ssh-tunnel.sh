#!/bin/bash

# Script pentru configurarea SSH tunnel pentru Ollama
# Rulează acest script pe SERVER

echo "=== Configurare SSH pentru Ollama Tunnel ==="
echo ""

# Backup configurație SSH
echo "1. Backup configurație SSH..."
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup.$(date +%Y%m%d_%H%M%S)

# Verifică și activează GatewayPorts
echo "2. Configurare GatewayPorts..."
if grep -q "^GatewayPorts" /etc/ssh/sshd_config; then
    sudo sed -i 's/^GatewayPorts.*/GatewayPorts yes/' /etc/ssh/sshd_config
else
    echo "GatewayPorts yes" | sudo tee -a /etc/ssh/sshd_config
fi

# Verifică și activează AllowTcpForwarding
echo "3. Configurare AllowTcpForwarding..."
if grep -q "^AllowTcpForwarding" /etc/ssh/sshd_config; then
    sudo sed -i 's/^AllowTcpForwarding.*/AllowTcpForwarding yes/' /etc/ssh/sshd_config
else
    echo "AllowTcpForwarding yes" | sudo tee -a /etc/ssh/sshd_config
fi

# Restart SSH service
echo "4. Restart SSH service..."
sudo systemctl restart sshd

# Verifică status
echo "5. Verificare configurație..."
echo ""
echo "GatewayPorts:"
grep "^GatewayPorts" /etc/ssh/sshd_config
echo ""
echo "AllowTcpForwarding:"
grep "^AllowTcpForwarding" /etc/ssh/sshd_config
echo ""

# Verifică SSH service
if systemctl is-active --quiet sshd; then
    echo "✓ SSH service rulează corect"
else
    echo "✗ EROARE: SSH service nu rulează!"
    exit 1
fi

echo ""
echo "=== Configurare completă! ==="
echo ""
echo "Următorii pași:"
echo "1. Pe mașina ta LOCALĂ, rulează:"
echo "   ssh -R 11434:localhost:11434 root@$(hostname -I | awk '{print $1}') -N"
echo ""
echo "2. Verifică tunnel-ul pe server cu:"
echo "   netstat -tlnp | grep 11434"
echo ""
echo "3. Testează conexiunea:"
echo "   curl http://localhost:11434/api/tags"
echo ""
