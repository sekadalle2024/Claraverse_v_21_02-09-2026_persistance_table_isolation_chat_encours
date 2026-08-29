import re
import os

filepath = 'src/components/Clara_Components/DemarrerMenu.tsx'

if not os.path.exists(filepath):
    # Try with full path if relative fails (though I should be in the right CWD)
    filepath = 'h:/ClaraVerse/src/components/Clara_Components/DemarrerMenu.tsx'

print(f"Reading {filepath}...")
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Target E-audit pro section (lines 122-1105 approx)
e_audit_pro_match = re.search(r"(id: 'e-audit-pro'.*?)(?=id: 'e-revision')", content, re.DOTALL)
if not e_audit_pro_match:
    print("Could not find E-audit pro section")
    # Try a broader search if IDs are different
    e_audit_pro_match = re.search(r"(label: 'E-audit pro'.*?)(?=label: 'E-revision')", content, re.DOTALL)

if not e_audit_pro_match:
    print("Failed to isolate E-audit pro section")
    exit(1)

e_audit_pro_content = e_audit_pro_match.group(1)
new_e_audit_pro_content = e_audit_pro_content

# Function to add demo mode to a modes array
def add_demo_to_modes(match):
    modes_inner = match.group(2)
    if "id: 'demo'" in modes_inner:
        return match.group(0)
    
    # Find normal mode to copy its command
    # We look for normal mode and its command
    normal_match = re.search(r"\{\s+id: 'normal',.*?command: `(.*?)`\s+\}", modes_inner, re.DOTALL)
    if not normal_match:
        # Try id: 'normal' without spaces
        normal_match = re.search(r"\{id:'normal',.*?command:`(.*?)`\}", modes_inner.replace(" ", ""), re.DOTALL)
    
    if normal_match:
        normal_command = normal_match.group(1)
        # Add [Demo] = Activate after [Nb de lignes] if present, else at the end
        if '[Nb de lignes] =' in normal_command:
            demo_command = re.sub(r'(\[Nb de lignes\] = \d+)', r'\1\n[Demo] = Activate', normal_command)
        else:
            demo_command = normal_command.strip() + "\n[Demo] = Activate"
        
        demo_mode = f"""              {{
                id: 'demo',
                label: 'Demo',
                command: `{demo_command}`
              }},"""
        
        # Insert after normal mode or at the beginning
        return match.group(1) + "\n" + demo_mode + modes_inner + match.group(3)
    
    return match.group(0)

# Apply to existing modes arrays in E-audit pro
new_e_audit_pro_content = re.sub(r"(modes: \[)(.*?)(\])", add_demo_to_modes, new_e_audit_pro_content, flags=re.DOTALL)

# 2. Handle Feuille couverture specifically (convert command to modes)
# This one currently has a direct command property
feuille_couverture_pattern = r"""(\s+\{\s+id: 'feuille-couverture',.*?icon: <FileCheck className="w-4 h-4" />,\s+)command: `(.*?)`(\s+\})"""

def convert_feuille_couverture(match):
    prefix = match.group(1)
    command = match.group(2)
    suffix = match.group(3)
    
    # Already converted check
    if 'modes:' in prefix: return match.group(0)
    
    demo_command = re.sub(r'(\[Nb de lignes\] = \d+)', r'\1\n[Demo] = Activate', command)
    
    return f"""{prefix}modes: [
              {{
                id: 'normal',
                label: 'Normal',
                command: `{command}`
              }},
              {{
                id: 'demo',
                label: 'Demo',
                command: `{demo_command}`
              }}
            ]{suffix}"""

new_e_audit_pro_content = re.sub(feuille_couverture_pattern, convert_feuille_couverture, new_e_audit_pro_content, flags=re.DOTALL)

# 3. Replace back in content
final_content = content.replace(e_audit_pro_content, new_e_audit_pro_content)

if final_content != content:
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(final_content)
    print("Successfully updated DemarrerMenu.tsx")
else:
    print("No changes were made. Check regex matches.")
