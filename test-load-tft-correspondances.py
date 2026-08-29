#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Test de chargement des correspondances TFT"""
import json
import sys

try:
    with open('py_backend/correspondances_syscohada.json', 'r', encoding='utf-8') as f:
        corresp = json.load(f)
    
    if 'tft' in corresp:
        print('OK')
        sys.exit(0)
    else:
        print('ERREUR: Section TFT non chargee')
        sys.exit(1)
except Exception as e:
    print(f'ERREUR: {e}')
    sys.exit(1)
