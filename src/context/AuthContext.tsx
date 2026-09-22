import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role, Action } from '../types';
import { api, setApiUserId } from '../lib/api';
import { auth, loginWithGoogle as firebaseGoogleLogin, logoutFirebase } from '../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { firestoreService } from '../lib/firestore-service';

export const ADMIN_EMAILS = [
  'fernando.lima@ifma.edu.br',
  'francinaldo.lima@ifma.edu.br',
  'admin@ifma.edu.br'
];

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isGoogleAuthenticated: boolean;
  usersList: User[];
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  loginDirectly: (email: string) => Promise<{
    allowed: boolean;
    isAdmin: boolean;
    isChefia: boolean;
    user?: User;
    chefiaNome?: string;
    message?: string;
  }>;
  loginWithGoogle: (onAuthorized?: (info: { isChefia: boolean; isAdmin: boolean; chefiaNome?: string }) => void) => Promise<void>;
  logout: () => void;
  switchUser: (targetUser: User) => void;
  canAdmin: boolean;
  isInstitutionalAdmin: boolean;
  isSectorChief: boolean;
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

        const savedId = localStorage.getItem('paa_user_id');
        let matched: User | null = null;
        if (savedId) {
          matched = users.find(u => u.id === savedId) || null;
        }
        // Default to Francinaldo Lima (Institutional Administrator) or Fernando Lima
        if (!matched) {
          matched = users.find(u => u.email.toLowerCase() === 'francinaldo.lima@ifma.edu.br')
            || users.find(u => u.email.toLowerCase() === 'fernando.lima@ifma.edu.br')
            || users[0]
            || null;
        }
        if (matched) {
          setUser(matched);
          setApiUserId(matched.id);
          localStorage.setItem('paa_user_id', matched.id);
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
        try {
          const access = await api.checkAccess(fbUser.email);
          if (access.allowed && access.user) {
            setUser(access.user);
            setApiUserId(access.user.id);
            localStorage.setItem('paa_user_id', access.user.id);
            try {
              await firestoreService.syncUser(access.user);
            } catch (e) {
              console.warn('Could not sync user to firestore:', e);
            }
          } else if (!access.allowed) {
            // Not allowed sector chief or admin
            console.warn('Acesso negado para o email:', fbUser.email);
          }
        } catch (err) {
          console.error('Erro na validação de acesso institucional:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password?: string) => {
    const res = await api.login(email, password);
    setUser(res.user);
    setApiUserId(res.user.id);
    localStorage.setItem('paa_user_id', res.user.id);
  };

  const loginDirectly = async (email: string) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const access = await api.checkAccess(cleanEmail);
    if (!access.allowed || !access.user) {
      throw new Error(
        access.message ||
        'Acesso restrito: O e-mail informado não consta como Chefia de Setor nem Administrador do Campus Carolina.'
      );
    }

    setUser(access.user);
    setApiUserId(access.user.id);
    localStorage.setItem('paa_user_id', access.user.id);

    try {
      await firestoreService.syncUser(access.user);
    } catch (e) {
      console.warn('Could not sync user to firestore:', e);
    }

    return access;
  };

  const loginWithGoogle = async (onAuthorized?: (info: { isChefia: boolean; isAdmin: boolean; chefiaNome?: string }) => void) => {
    let fbUser;
    try {
      fbUser = await firebaseGoogleLogin();
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/popup-blocked') {
        throw new Error('O pop-up de login foi bloqueado pelo navegador ou iFrame. Utilize o Acesso Rápido Institucional ou digite seu e-mail institucional.');
      } else if (code === 'auth/cancelled-popup-request' || code === 'auth/popup-closed-by-user') {
        throw new Error('Janela de login fechada antes da conclusão.');
      }
      throw new Error(err.message || 'Falha ao autenticar com a conta Google institucional.');
    }

    if (!fbUser || !fbUser.email) {
      throw new Error('Falha ao autenticar com a conta Google institucional.');
    }

    // Validate if the user is a sector chief or institutional admin
    const access = await api.checkAccess(fbUser.email);
    if (!access.allowed || !access.user) {
      await logoutFirebase().catch(() => {});
      throw new Error(
        access.message ||
        'Acesso restrito: Somente servidores em Chefia de Setor ou os Administradores Institucionais autorizados (Fernando Lima e Francinaldo Lima) podem efetuar login.'
      );
    }

    // Set authorized user
    setUser(access.user);
    setApiUserId(access.user.id);
    localStorage.setItem('paa_user_id', access.user.id);

    try {
      await firestoreService.syncUser(access.user);
    } catch (e) {
      console.warn('Could not sync user to firestore:', e);
    }

    if (onAuthorized) {
      onAuthorized({
        isChefia: access.isChefia,
        isAdmin: access.isAdmin,
        chefiaNome: access.chefiaNome
      });
    }
  };

  const logout = () => {
    setUser(null);
    setFirebaseUser(null);
    logoutFirebase().catch(console.error);
    localStorage.removeItem('paa_user_id');
  };

  const switchUser = (targetUser: User) => {
    setUser(targetUser);
    setApiUserId(targetUser.id);
    localStorage.setItem('paa_user_id', targetUser.id);
  };

  const isInstitutionalAdmin = !!user && (ADMIN_EMAILS.includes(user.email?.toLowerCase() || '') || user.role === 'ADMIN');
  const canAdmin = isInstitutionalAdmin || (!!user && user.role === 'ADMIN');
  const isSectorChief = !!user && (user.role === 'GESTOR_SETOR' || user.role === 'ADMIN' || isInstitutionalAdmin);
  const canApprove = canAdmin || user?.role === 'VALIDADOR';
  const canConsolidate = canAdmin;
  const canCreateAction = isSectorChief || user?.role === 'RESPONSAVEL_ACAO';

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
        isGoogleAuthenticated: !!firebaseUser,
        usersList,
        loading,
        login,
        loginDirectly,
        loginWithGoogle,
        logout,
        switchUser,
        canAdmin,
        isInstitutionalAdmin,
        isSectorChief,
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
