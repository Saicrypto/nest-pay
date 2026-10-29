
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import AuthService from "../services/AuthService";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      try {
        const currentSession = await AuthService.getSession();

        if (mounted) {
          setSession(currentSession);
        }
      } catch (error) {
        console.error("Session check failed:", error.message);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = AuthService.onAuthStateChange((_event, newSession) => {
      if (mounted) {
        setSession(newSession);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }

  return context;
}
