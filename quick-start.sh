#!/bin/bash

set -e

echo "⚡ QUICK START: CHRYSALIS LATTICE ⚡"
echo "===================================="

# Install dependencies
echo ""
echo "📦 Installing dependencies..."

# Backend
echo "  → Backend..."
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r backend/requirements.txt
deactivate

# Frontend
echo "  → Frontend..."
cd frontend
npm install
cd ..

# Start services
echo ""
echo "🚀 Starting local development..."

# Start backend
echo "  → Starting backend..."
source .venv/bin/activate
uvicorn nexus.api:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
deactivate

# Wait for backend
sleep 5

# Start frontend
echo "  → Starting frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ LATTICE RUNNING (Local Mode)"
echo "===================================="
echo ""
echo "🌐 Access:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:8000"
echo ""
echo "🛑 Stop: Ctrl+C"
echo ""

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
