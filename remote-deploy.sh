#!/bin/bash
set -e

# Server Login (gemäss deinem Screenshot 'server@srv1150536')
SERVER="server@72.62.43.134"

# Entspricht genau der Ordnerstruktur auf dem Server
REMOTE_PATH="~/app/standalone/tennis-tracker" 

echo "🌐 Verbinde mit $SERVER..."
echo "📂 Wechsle ins Verzeichnis $REMOTE_PATH..."
echo "🚀 Führe lokales deploy.sh auf dem Remote-Server aus..."

ssh $SERVER "cd $REMOTE_PATH && ./deploy.sh"

echo "✅ Remote-Deployment erfolgreich ausgelöst!"
