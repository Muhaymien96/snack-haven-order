import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchSessionAndAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      const user = session?.user ?? null;
      setUser(user);

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('mobile')
          .eq('id', user.id)
          .single();

        if (profile?.mobile === '0662538342') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      }

      setLoading(false);
    };

    fetchSessionAndAdmin();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        const user = session?.user ?? null;
        setUser(user);

        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('mobile')
            .eq('id', user.id)
            .single();

          if (profile?.mobile === '0662538342') {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } else {
          setIsAdmin(false);
        }

        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, isAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
