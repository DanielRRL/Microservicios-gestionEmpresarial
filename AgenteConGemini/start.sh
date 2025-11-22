#!/bin/bash
# Script para iniciar el agente con el entorno correcto

# Activar entorno virtual
source .venv/bin/activate

# Cargar variables de entorno desde .env
export $(cat .env | xargs)

# Ejecutar el agente
python run.py
