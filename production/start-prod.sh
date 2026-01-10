#!/bin/bash
echo "Avvio ambiente di produzione Gestionale KS..."
docker-compose up --build -d
echo "Ambiente di produzione avviato!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:8080"
echo "Database: localhost:5432"
