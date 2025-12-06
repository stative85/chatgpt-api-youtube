#!/bin/bash

set -e

echo "🌀 CHRYSALIS LATTICE DEPLOYMENT INITIATED 🌀"
echo "=============================================="

# Check for .env file
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your configuration before continuing."
    exit 1
fi

# Load environment
source .env

echo ""
echo "📦 Building Docker images..."
docker compose build

echo ""
echo "🚀 Starting services..."
docker compose up -d

echo ""
echo "⏳ Waiting for services to initialize..."
sleep 10

echo ""
echo "🏥 Health checks..."
docker compose ps

echo ""
echo "🧪 Testing backend connectivity..."
curl -f http://localhost:8000/health || {
    echo "❌ Backend health check failed"
    docker compose logs backend
    exit 1
}

echo ""
echo "✅ DEPLOYMENT COMPLETE"
echo "=============================================="
echo ""
echo "🌐 Access points:"
echo "   Frontend:    http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Docs:    http://localhost:8000/docs"
echo "   Neo4j:       http://localhost:7474"
echo "   Grafana:     http://localhost:3001"
echo ""
echo "📊 View logs:"
echo "   docker compose logs -f"
echo ""
echo "🛑 Stop system:"
echo "   docker compose down"
echo ""
echo "🔥 THE LATTICE AWAKENS 🔥"
