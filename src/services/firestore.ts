import {
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  getDocFromServer,
} from 'firebase/firestore';
import { auth, app } from './auth.ts';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  AgencyClient,
  ProspectLead,
  EmailTemplate,
  Campaign,
  EmailDispatchLog,
  ProjectMilestone,
} from '../types/index.ts';

// Initialize Firestore with custom database ID from config
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Quick connection validation per skill guidelines
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore is running in offline/cached mode.');
    }
  }
}

// -------------------------------------------------------------
// CLIENTS (CRM)
// -------------------------------------------------------------
export async function fetchClientsFromFirestore(userId: string): Promise<AgencyClient[]> {
  const path = 'clients';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data() as AgencyClient);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

export async function saveClientToFirestore(userId: string, client: AgencyClient): Promise<void> {
  const path = 'clients';
  try {
    const docRef = doc(db, path, client.id);
    await setDoc(docRef, { ...client, userId }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${path}/${client.id}`);
  }
}

export async function deleteClientFromFirestore(clientId: string): Promise<void> {
  const path = 'clients';
  try {
    await deleteDoc(doc(db, path, clientId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${path}/${clientId}`);
  }
}

// -------------------------------------------------------------
// PROSPECT LEADS (AI Hunter)
// -------------------------------------------------------------
export async function fetchProspectsFromFirestore(userId: string): Promise<ProspectLead[]> {
  const path = 'prospects';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data() as ProspectLead);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

export async function saveProspectToFirestore(userId: string, prospect: ProspectLead): Promise<void> {
  const path = 'prospects';
  try {
    const docRef = doc(db, path, prospect.id);
    await setDoc(docRef, { ...prospect, userId }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${path}/${prospect.id}`);
  }
}

export async function deleteProspectFromFirestore(prospectId: string): Promise<void> {
  const path = 'prospects';
  try {
    await deleteDoc(doc(db, path, prospectId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${path}/${prospectId}`);
  }
}

// -------------------------------------------------------------
// EMAIL TEMPLATES
// -------------------------------------------------------------
export async function fetchTemplatesFromFirestore(userId: string): Promise<EmailTemplate[]> {
  const path = 'templates';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data() as EmailTemplate);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

export async function saveTemplateToFirestore(userId: string, template: EmailTemplate): Promise<void> {
  const path = 'templates';
  try {
    const docRef = doc(db, path, template.id);
    await setDoc(docRef, { ...template, userId }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${path}/${template.id}`);
  }
}

// -------------------------------------------------------------
// CAMPAIGNS
// -------------------------------------------------------------
export async function fetchCampaignsFromFirestore(userId: string): Promise<Campaign[]> {
  const path = 'campaigns';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data() as Campaign);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

export async function saveCampaignToFirestore(userId: string, campaign: Campaign): Promise<void> {
  const path = 'campaigns';
  try {
    const docRef = doc(db, path, campaign.id);
    await setDoc(docRef, { ...campaign, userId }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${path}/${campaign.id}`);
  }
}

// -------------------------------------------------------------
// PROJECT MILESTONES
// -------------------------------------------------------------
export async function fetchMilestonesFromFirestore(userId: string): Promise<ProjectMilestone[]> {
  const path = 'milestones';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data() as ProjectMilestone);
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
    return [];
  }
}

export async function saveMilestoneToFirestore(userId: string, milestone: ProjectMilestone): Promise<void> {
  const path = 'milestones';
  try {
    const docRef = doc(db, path, milestone.id);
    await setDoc(docRef, { ...milestone, userId }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${path}/${milestone.id}`);
  }
}

export async function deleteMilestoneFromFirestore(milestoneId: string): Promise<void> {
  const path = 'milestones';
  try {
    await deleteDoc(doc(db, path, milestoneId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${path}/${milestoneId}`);
  }
}
