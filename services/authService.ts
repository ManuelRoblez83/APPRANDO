import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email?: string;
}

// Inscription avec email et mot de passe
export const signUp = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    return { user: data.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message || 'Erreur lors de l\'inscription' };
  }
};

// Connexion avec email et mot de passe
export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return { user: data.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message || 'Erreur lors de la connexion' };
  }
};

// Déconnexion
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    return { error: error.message || 'Erreur lors de la déconnexion' };
  }
};

// Obtenir l'utilisateur actuel
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return null;
  }
};

// Écouter les changements d'authentification
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
};

// Changer le mot de passe
export const updatePassword = async (newPassword: string): Promise<{ error: string | null }> => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    return { error: error.message || 'Erreur lors de la modification du mot de passe' };
  }
};

// Mettre à jour l'email
export const updateEmail = async (newEmail: string): Promise<{ error: string | null }> => {
  try {
    const { error } = await supabase.auth.updateUser({
      email: newEmail,
    });

    if (error) throw error;
    return { error: null };
  } catch (error: any) {
    return { error: error.message || 'Erreur lors de la modification de l\'email' };
  }
};



