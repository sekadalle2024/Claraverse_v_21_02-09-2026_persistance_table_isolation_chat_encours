import re
import os

filepath = 'src/components/Clara_Components/DemarrerMenu.tsx'
if not os.path.exists(filepath):
    filepath = 'h:/ClaraVerse/src/components/Clara_Components/DemarrerMenu.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Target specifically E-audit pro -> phase-realisation -> feuille-couverture
pattern = r"""(\{
\s+id: 'phase-realisation',
\s+label: 'Phase de réalisation',
\s+etapes: \[
\s+\{
\s+id: 'feuille-couverture',
\s+label: 'Feuille couverture',
\s+norme: '14\.6 Documentation relative à la mission',
\s+icon: <FileCheck className="w-4 h-4" />,
\s+)command: `(.*?)`(\s+\}
\s+\]
\s+\})"""

def convert_to_modes(match):
    prefix = match.group(1)
    command = match.group(2)
    suffix = match.group(3)
    
    # Add [Demo] = Activate after [Nb de lignes]
    # Note: user said "[Nb de ligne]" (singular) sometimes and "[Nb de lignes]" (plural) others.
    # In the code it is "[Nb de lignes]"
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

new_content = re.sub(pattern, convert_to_modes, content, flags=re.DOTALL)

if new_content != content:
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Updated Feuille couverture successfully")
else:
    print("Could not find the target section for Feuille couverture")
