export const rootTotemAgentTutorial = `## For New AI Agents

AEGIS Totem is the repository's shared memory and coordination layer. Start every task by reading this Root Totem for repo-wide orientation, then read the nearest folder \`TOTEM.md\` before editing inside that folder. If you need active handoffs, uncertainty, or model-to-model messages, use your own lane under \`.aegis/lanes/\` instead of treating chat history as the only source of truth.

Write durable updates append-only. Use lanes for working notes and coordination, and append verified facts, decisions, risks, and completed changes to the relevant Root or Folder Totem after the work is checked. Do not rewrite or delete historical entries; corrections and supersessions are added as new records so future agents can see the lineage of what changed and why.`;

export function rootTotemTemplate(timestamp: string): string {
  return `# AEGIS Root Totem\n\nCreated: ${timestamp}\n\n${rootTotemAgentTutorial}\n\n## Purpose\n\nThis repository uses AEGIS Totem for append-only repo continuity and agent coordination.\n\n## Operating Rules\n\n- Read the relevant Totem before working.\n- Use an agent lane for working notes and messages.\n- Append verified updates after work.\n- Never rewrite or delete historical entries.\n\n## Append Log\n\n`;
}

export const agentInstructionsTemplate = `# AEGIS Totem Instructions

This repository uses AEGIS Totems as its append-only continuity and coordination system.

## Before Each Coding Turn

1. Read \`ROOT_TOTEM.md\`.
2. Read the nearest folder \`TOTEM.md\` before editing files in that folder.
3. Read the relevant agent lane for active work, handoffs, and model-to-model messages.
4. Verify Totem context against the current source and tests before relying on it.

## After Each Coding Turn

Append a concise update to the relevant agent lane describing work, uncertainty, and verification. Append verified durable reference updates to the relevant Folder Totem. Never rewrite or delete historical Totem or lane entries.
`;

export function folderTotemTemplate(folder: string, timestamp: string, subfolders: string[] = []): string {
  const subfolderList = subfolders.length > 0
    ? subfolders.map((subfolder) => `- ${subfolder}`).join("\n")
    : "- none";
  return `# Folder Totem: ${folder}\n\nCreated: ${timestamp}\n\n## Folder Reference\n\nRecord conventions, ownership, risks, and useful reference information for this folder here.\n\n## Subfolder Elements\n\n${subfolderList}\n\n## Append Log\n\n`;
}

export function laneTemplate(name: string, timestamp: string): string {
  return `# AEGIS Agent Lane: ${name}\n\nCreated: ${timestamp}\n\nThis lane is append-only. Messages, handoffs, uncertainty, and verified work notes are added below.\n\n## Append Log\n\n`;
}
