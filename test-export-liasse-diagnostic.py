#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script de diagnostic pour l'export de la liasse officielle
Vérifie les problèmes identifiés:
1. BILAN ACTIF: Valeurs brutes et amortissements manquants pour N
2. BILAN ACTIF: Totalisation manquante
3. TFT: Toujours vierge
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'py_backend'))

import pandas as pd
from openpyxl import load_workbook
import json

def diagnostic_template():
    """Analyse le template pour identifier les colonnes exac