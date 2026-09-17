import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role, Action } from '../types';
import { api, setApiUserId } from '../lib/api';
import { auth, loginWithGoogle as firebaseGoogleLogin, logoutFirebase } from '../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { firestoreService } from '../lib/firestore-service';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  usersList: User[];
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  switchUser: (targetUser: User) => void;
  canAdmin: boolean;
  canApprove: boolean;
  canConsolidate: boolean;
  canCreateAction: boolean;
  canEditAction: (action: Action) => boolean;
  canSubmitAction: (action: Action) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      try {
        const users = await api.getUsers();
        setUsersList(users);

        const savedId = localStorage.getItem('paa_user_id') || 'usr-admin';
        const matched = users.find(u => u.id === savedId) || users[0] || null;
        if (matched) {
          setUser(matched);
          setApiUserId(matched.id);
        }
      } catch (err) {
        console.error('Erro ao inicializar autenticação:', err);
      } finally {
        setLoading(false);
      }
    }
    initAuth();

    // Firebase Auth State Listener
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser && fbUser.email) {
        // Find existing user or bind to admin if email matches user
        const users = await api.getUsers();
        let matched = users.find(u => u.email.toLowerCase() === fbUser.email?.toLowerCase());
        if (!matched && fbUser.email === 'francinaldo.lima@ifma.edu.br') {
          matched = {
            id: 'usr-admin',
            nome: fbUser.displayName || 'Francinaldo Lima (Admin)',
            email: fbUser.email,
            role: 'ADMIN',
            ativo: true,
            created_at: new Date().toISOString()
          };
        } else if (!matched) {
          matched = {
            id: `usr-${fbUser.uid.substring(0, 10)}`,
            nome: fbUser.displayName || fbUser.email.split('@')[0],
            email: fbUser.email,
            role: fbUser.email.includes('ifma.edu.br') ? 'GESTOR_SETOR' : 'CONSULTA',
            ativo: true,
            created_at: new Date().toISOString()
          };
        }
        if (matched) {
          setUser(matched);
          setApiUserId(matched.id);
          try {
            await firestoreService.syncUser(matched);
          } catch (e) {
            console.warn('Could not sync user to firestore:', e);
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password?: string) => {
    const res = await api.login(email, password);
    setUser(res.user);
    setApiUserId(res.user.id);
  };

  const loginWithGoogle = async () => {
    const fbUser = await firebaseGoogleLogin();
    if (fbUser && fbUser.email) {
      const users = await api.getUsers();
      let matched = users.find(u => u.email.toLowerCase() === fbUser.email?.toLowerCase());
      if (!matched && fbUser.email === 'francinaldo.lima@ifma.edu.br') {
        matched = {
          id: 'usr-admin',
          nome: fbUser.displayName || 'Francinaldo Lima (Admin)',
          email: fbUser.email,
          role: 'ADMIN',
          ativo: true,
          created_at: new Date().toISOString()
        };
      }
      if (matched) {
        setUser(matched);
        setApiUserId(matched.id);
      }
    }
  };

  const logout = () => {
    setUser(null);
    logoutFirebase().catch(console.error);
    localStorage.removeItem('paa_user_id');
  };

  const switchUser = (targetUser: User) => {
    setUser(targetUser);
    setApiUserId(targetUser.id);
  };

  const canAdmin = user?.role === 'ADMIN';
  const canApprove = user?.role === 'ADMIN' || user?.role === 'VALIDADOR';
  const canConsolidate = user?.role === 'ADMIN';
  const canCreateAction = user?.role === 'ADMIN' || user?.role === 'GESTOR_SETOR' || user?.role === 'RESPONSAVEL_ACAO';

  const canEditAction = (action: Action): boolean => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    if (user.role === 'CONSULTA' || user.role === 'VALIDADOR') return false;

    // Ações aprovadas ou consolidadas só podem ser editadas pelo admin ou no módulo de execução
    if (['APROVADA', 'CONSOLIDADA', 'PUBLICADA', 'EM_EXECUCAO', 'CONCLUIDA'].includes(action.status)) {
      return false;
    }

    if (user.role === 'GESTOR_SETOR') {
      return action.setor_id === user.sector_id;
    }

    if (user.role === 'RESPONSAVEL_ACAO') {
      return action.responsavel_id === user.id;
    }

    return false;
  };

  const canSubmitAction = (action: Action): boolean => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    if (action.status !== 'RASCUNHO' && action.status !== 'DEVOLVIDA') return false;
    if (user.role === 'GESTOR_SETOR') return action.setor_id === user.sector_id;
    if (user.role === 'RESPONSAVEL_ACAO') return action.responsavel_id === user.id;
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        usersList,
        loading,
        login,
        loginWithGoogle,
        logout,
        switchUser,
        canAdmin,
        canApprove,
        canConsolidate,
        canCreateAction,
        canEditAction,
        canSubmitAction
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return context;
};
