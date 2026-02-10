import fs from 'fs/promises';
import path from 'path';

const STATE_FILE = path.join(process.cwd(), 'data', 'automation-state.json');

interface AutomationState {
  processedApplicants: string[];
  processedMembers: string[];
  lastCheck: {
    applicants?: number;
    members?: number;
  };
}

export async function getState(): Promise<AutomationState> {
  try {
    const data = await fs.readFile(STATE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {
      processedApplicants: [],
      processedMembers: [],
      lastCheck: {}
    };
  }
}

export async function saveState(state: AutomationState): Promise<void> {
  await fs.mkdir(path.dirname(STATE_FILE), { recursive: true });
  await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2));
}

export async function markApplicantProcessed(email: string): Promise<void> {
  const state = await getState();
  if (!state.processedApplicants.includes(email)) {
    state.processedApplicants.push(email);
    state.lastCheck.applicants = Date.now();
    await saveState(state);
  }
}

export async function markMemberProcessed(email: string): Promise<void> {
  const state = await getState();
  if (!state.processedMembers.includes(email)) {
    state.processedMembers.push(email);
    state.lastCheck.members = Date.now();
    await saveState(state);
  }
}

export async function isApplicantProcessed(email: string): Promise<boolean> {
  const state = await getState();
  return state.processedApplicants.includes(email);
}

export async function isMemberProcessed(email: string): Promise<boolean> {
  const state = await getState();
  return state.processedMembers.includes(email);
}
