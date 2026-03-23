#!/bin/bash
set -e

echo "🛑 Stoppe und entferne alle laufenden Container (inklusive verwaister Prozesse)..."
docker-compose down --remove-orphans || true

echo "🧹 Bereinige fehlerhafte oder unvollständige Docker-Images..."
docker system prune -f || true

echo "📥 Hole neuste Änderungen aus dem Git Repository..."
git pull

echo "🏗 Baue das Projekt sauber neu (ohne alten kaputten Cache)..."
docker-compose build --no-cache

echo "🚀 Starte String Tracker..."
docker-compose up -d

echo "✅ Deployment erfolgreich abgeschlossen!"
