#!/bin/bash

echo "🔄 Restarting Cracker Shop servers..."

# Kill existing processes
echo "Stopping existing servers..."
pkill -f "react-scripts start" 2>/dev/null
pkill -f "node server" 2>/dev/null
sleep 2

# Start backend server first
echo "🚀 Starting backend server on port 3002..."
cd server
npm start &
BACKEND_PID=$!
sleep 3

# Start frontend server
echo "🌐 Starting frontend server on port 3000..."
cd ..
npm start &
FRONTEND_PID=$!

echo "✅ Servers started!"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Backend: http://localhost:3002"
echo "Frontend: http://localhost:3000"
echo ""
echo "To stop servers: kill $BACKEND_PID $FRONTEND_PID"