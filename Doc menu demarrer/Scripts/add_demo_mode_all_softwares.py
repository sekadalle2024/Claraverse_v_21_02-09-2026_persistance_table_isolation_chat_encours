import re
import os

filepath = 'h:/ClaraVerse/src/components/Clara_Components/DemarrerMenu.tsx'

print(f"Reading {filepath}...")
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

def add_demo_mode_to_step(match):
    # This match is for a step object with either command or modes
    step_block = match.group(0)
    
    # If it already has demo mode, skip
    if "id: 'demo'" in step_block:
        return step_block
    
    # Case 1: Has direct command property
    if 'command: `' in step_block and 'modes: [' not in step_block:
        command_match = re.search(r"command: `(.*?)`", step_block, re.DOTALL)
        if command_match:
            command = command_match.group(1)
            # Only apply if it has audit variables like [Nb de lignes] or [Command]
            if '[Command] =' in command or '[Nb de lignes] =' in command:
                if '[Nb de lignes] =' in command:
                    demo_command = re.sub(r'(\[Nb de lignes\] = \d+)', r'\1\n[Demo] = Activate', command)
                else:
                    demo_command = command.strip() + "\n[Demo] = Activate"
                
                # Convert to modes structure
                # We need to extract the prefix (everything before command:)
                prefix_match = re.search(r"(.*?)\s+command: `", step_block, re.DOTALL)
                prefix = prefix_match.group(1) if prefix_match else ""
                
                # Extract suffix (everything after command block)
                suffix_match = re.search(r"`(\s+\})", step_block, re.DOTALL)
                suffix = suffix_match.group(1) if suffix_match else ""
                
                return f"""{prefix}
            modes: [
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

    # Case 2: Has modes: [...] array but missing demo
    if 'modes: [' in step_block:
        # Find normal mode to copy its command
        normal_match = re.search(r"\{\s+id: 'normal',.*?command: `(.*?)`\s+\}", step_block, re.DOTALL)
        if not normal_match:
            normal_match = re.search(r"\{\s+id: 'normal',.*?command: `(.*?)`\s+\}", step_block, re.DOTALL)
            
        if normal_match:
            normal_command = normal_match.group(1)
            if '[Nb de lignes] =' in normal_command:
                demo_command = re.sub(r'(\[Nb de lignes\] = \d+)', r'\1\n[Demo] = Activate', normal_command)
            else:
                demo_command = normal_command.strip() + "\n[Demo] = Activate"
            
            demo_mode = f"""              {{
                id: 'demo',
                label: 'Demo',
                command: `{demo_command}`
              }},"""
            
            return step_block.replace("modes: [", "modes: [\n" + demo_mode)
            
    return step_block

# We target step objects inside the MENU_DATA array
# Steps are objects inside etapes: [...] or tests: [...]
# We find them by searching for { id: '...', label: '...', ... }
# This is a bit tricky with regex for a 13k line file.

# Instead, let's target the software sections one by one.
softwares = ['e-audit-pro', 'e-audit-plan', 'e-cartographie', 'e-controle', 'e-syscohada-revise']

for sw in softwares:
    print(f"Processing software: {sw}")
    # Find the software block
    sw_pattern = rf"(id: '{sw}'.*?)(?=id: 'e-|\s+\]\s+const)"
    sw_match = re.search(sw_pattern, content, re.DOTALL)
    if not sw_match: continue
    sw_content = sw_match.group(1)
    new_sw_content = sw_content
    
    # Process each step block in this software
    # A step block usually looks like { id: '...', ... }
    # We search for blocks that have either command or modes
    
    # Strategy: Find all objects that look like steps
    # We look for { id: '...', label: '...', ... }
    # We limit it to objects that are NOT software items
    
    def process_sw_step(match):
        return add_demo_mode_to_step(match)

    # Regex for a step/test object
    step_pattern = r"\{\s+id: '[^']+',\s+label: '[^']+',.*?\}"
    # Note: We need a non-greedy but balanced brace matching or a very specific pattern.
    # Since we know the structure, we can assume a step ends with } and a comma or newline then another { or ]
    
    # Let's try to match blocks that have command or modes
    step_with_content_pattern = r"\{\s+id: '[^']+',\s+label: '[^']+',.*?(?:command: `|modes: \[).*?\n\s+\}"
    
    new_sw_content = re.sub(step_with_content_pattern, process_sw_step, new_sw_content, flags=re.DOTALL)
    
    content = content.replace(sw_content, new_sw_content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Final update completed")
