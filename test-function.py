import sys
sys.path.insert(0, 'py_backend')

from export_synthese_cac_final import create_synthese_cac_from_template_final, SyntheseCAC_Request

# Create test request
request = SyntheseCAC_Request(
    frap_points=[],
    recos_revision_points=[],
    recos_controle_interne_points=[],
    date_rapport="2026-03-25"
)

try:
    print("Testing function...")
    buffer = create_synthese_cac_from_template_final(request)
    print(f"✓ Function executed successfully")
    print(f"✓ Buffer size: {len(buffer.getvalue())} bytes")
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
