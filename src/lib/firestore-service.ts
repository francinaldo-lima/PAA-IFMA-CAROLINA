import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { handleFirestoreError, OperationType } from './firestore-errors';
import { Action, PAA, Sector, Axis, User, AuditLog, Notification } from '../types';

export const firestoreService = {
  // Actions
  async getActions(): Promise<Action[]> {
    const path = 'actions';
    try {
      const snap = await getDocs(collection(db, path));
      return snap.docs.map((d) => d.data() as Action);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async saveAction(action: Action): Promise<void> {
    const path = `actions/${action.id}`;
    try {
      await setDoc(doc(db, 'actions', action.id), {
        ...action,
        updated_at: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteAction(actionId: string): Promise<void> {
    const path = `actions/${actionId}`;
    try {
      await deleteDoc(doc(db, 'actions', actionId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  subscribeActions(onUpdate: (actions: Action[]) => void): () => void {
    const path = 'actions';
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        const actions = snapshot.docs.map((d) => d.data() as Action);
        onUpdate(actions);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, path);
      }
    );
  },

  // Audit Logs
  async logAudit(log: Omit<AuditLog, 'id'> & { id?: string }): Promise<void> {
    const logId = log.id || `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const path = `audit_logs/${logId}`;
    try {
      await setDoc(doc(db, 'audit_logs', logId), {
        ...log,
        id: logId,
        created_at: log.created_at || new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  // Users
  async syncUser(user: User): Promise<void> {
    const path = `users/${user.id}`;
    try {
      await setDoc(doc(db, 'users', user.id), user, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }
};
