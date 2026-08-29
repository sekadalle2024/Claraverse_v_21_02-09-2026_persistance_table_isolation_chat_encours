import sys
sys.path.insert(0, 'py_backend')

try:
    from export_synthese_cac_final import router, TEMPLATE_PATH
    print(f"✓ Module imported successfully")
    print(f"✓ Template path: {TEMPLATE_PATH}")
    print(f"✓ Template exists: {TEMPLATE_PATH.exists()}")
    print(f"✓ Router routes: {[r.path for r in router.routes]}")
except Exception as e:
    print(f"✗ Error importing: {e}")
    import traceback
    traceback.print_exc()
