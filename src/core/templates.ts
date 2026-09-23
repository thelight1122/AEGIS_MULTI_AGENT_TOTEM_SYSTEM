export function rootTotemTemplate(timestamp: string): string {
  return `# AEGIS Root Totem\n\nCreated: ${timestamp}\n\n## Purpose\n\nThis repository uses AEGIS Totem for append-only repo continuity and agent coordination.\n\n## Operating Rules\n\n- Read the relevant Totem before working.\n- Use an agent lane for working notes and messages.\n- Append verified updates after work.\n- Never rewrite or delete historical entries.\n\n## Append Log\n\n`;
}

export function folderTotemTemplate(folder: string, timestamp: string): string {
  return `# Folder Totem: ${folder}\n\nCreated: ${timestamp}\n\n## Folder Reference\n\nRecord conventions, ownership, risks, and useful reference information for this folder here.\n\n## Append Log\n\n`;
}

export function laneTemplate(name: string, timestamp: string): string {
  return `# AEGIS Agent Lane: ${name}\n\nCreated: ${timestamp}\n\nThis lane is append-only. Messages, handoffs, uncertainty, and verified work notes are added below.\n\n## Append Log\n\n`;
}
