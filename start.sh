#!/bin/bash

# Terminate both background processes on exit / Ctrl+C
trap 'kill $(jobs -p) 2>/dev/null' SIGINT SIGTERM EXIT

echo "========================================================"
echo " Starting SAKSHAM Portal (Backend + Frontend)"
echo " Local UI Link: http://localhost:5173"
echo " Backend API:   http://localhost:3001"
echo " Press Ctrl+C to stop both servers anytime."
echo "========================================================"

# Start backend
(cd backend && npm run dev) &

# Start frontend
(cd frontend && npm run dev) &

# Wait for processes
wait
