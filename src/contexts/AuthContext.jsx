import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Check if we're in demo mode (no Firebase config)
const DEMO_MODE = !import.meta.env.VITE_FIREBASE_API_KEY ||
                  import.meta.env.VITE_FIREBASE_API_KEY === 'demo-api-key';

// Demo storage helpers
const STORAGE_KEY = 'vocab_master_demo';

function getDemoStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { users: {}, currentUser: null };
  } catch {
    return { users: {}, currentUser: null };
  }
}

function setDemoStorage(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize from localStorage in demo mode
  useEffect(() => {
    if (DEMO_MODE) {
      const storage = getDemoStorage();
      if (storage.currentUser) {
        const savedUser = storage.users[storage.currentUser];
        if (savedUser) {
          setUser({ uid: storage.currentUser, email: savedUser.email });
          setUserData(savedUser);
        }
      }
      setLoading(false);
    } else {
      // Firebase mode - dynamic import to avoid errors when not configured
      import('firebase/auth').then(({ onAuthStateChanged }) => {
        import('../config/firebase').then(({ auth, db }) => {
          import('firebase/firestore').then(({ doc, getDoc }) => {
            const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
              setUser(firebaseUser);
              if (firebaseUser) {
                try {
                  const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                  if (userDoc.exists()) {
                    setUserData(userDoc.data());
                  }
                } catch (error) {
                  console.error('Error fetching user data:', error);
                }
              } else {
                setUserData(null);
              }
              setLoading(false);
            });
            return () => unsubscribe();
          });
        });
      }).catch(() => {
        // Firebase not available, switch to demo mode
        setLoading(false);
      });
    }
  }, []);

  const signup = async (email, password, name, role = 'student') => {
    if (DEMO_MODE) {
      const uid = 'demo_' + Date.now();
      const newUserData = {
        name,
        email,
        role,
        totalScore: 0,
        xp: 0,
        level: 1,
        badges: [],
        masteredWords: [],
        streakDays: 0,
        lastPractice: null,
        createdAt: new Date().toISOString(),
      };

      const storage = getDemoStorage();
      storage.users[uid] = newUserData;
      storage.currentUser = uid;
      setDemoStorage(storage);

      setUser({ uid, email });
      setUserData(newUserData);
      return { uid, email };
    }

    // Firebase signup
    const { createUserWithEmailAndPassword } = await import('firebase/auth');
    const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
    const { auth, db } = await import('../config/firebase');

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { uid } = userCredential.user;

    const newUserData = {
      name,
      email,
      role,
      totalScore: 0,
      xp: 0,
      level: 1,
      badges: [],
      masteredWords: [],
      streakDays: 0,
      lastPractice: null,
      createdAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'users', uid), newUserData);
    setUserData(newUserData);
    return userCredential.user;
  };

  const login = async (email, password) => {
    if (DEMO_MODE) {
      // In demo mode, find user by email or create new one
      const storage = getDemoStorage();
      let uid = Object.keys(storage.users).find(
        (id) => storage.users[id].email === email
      );

      if (!uid) {
        // Auto-create demo user on login attempt
        return signup(email, password, email.split('@')[0], 'student');
      }

      storage.currentUser = uid;
      setDemoStorage(storage);

      setUser({ uid, email });
      setUserData(storage.users[uid]);
      return { uid, email };
    }

    // Firebase login
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    const { doc, getDoc } = await import('firebase/firestore');
    const { auth, db } = await import('../config/firebase');

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    if (userDoc.exists()) {
      setUserData(userDoc.data());
    }
    return userCredential.user;
  };

  const logout = async () => {
    if (DEMO_MODE) {
      const storage = getDemoStorage();
      storage.currentUser = null;
      setDemoStorage(storage);
      setUser(null);
      setUserData(null);
      return;
    }

    const { signOut } = await import('firebase/auth');
    const { auth } = await import('../config/firebase');
    await signOut(auth);
    setUser(null);
    setUserData(null);
  };

  const updateUserData = async (updates) => {
    if (!user) return;

    if (DEMO_MODE) {
      const storage = getDemoStorage();
      storage.users[user.uid] = { ...storage.users[user.uid], ...updates };
      setDemoStorage(storage);
      setUserData((prev) => ({ ...prev, ...updates }));
      return;
    }

    const { doc, setDoc } = await import('firebase/firestore');
    const { db } = await import('../config/firebase');
    await setDoc(doc(db, 'users', user.uid), updates, { merge: true });
    setUserData((prev) => ({ ...prev, ...updates }));
  };

  const refreshUserData = async () => {
    if (!user) return;

    if (DEMO_MODE) {
      const storage = getDemoStorage();
      setUserData(storage.users[user.uid]);
      return;
    }

    const { doc, getDoc } = await import('firebase/firestore');
    const { db } = await import('../config/firebase');
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      setUserData(userDoc.data());
    }
  };

  const value = {
    user,
    userData,
    loading,
    signup,
    login,
    logout,
    updateUserData,
    refreshUserData,
    isStudent: userData?.role === 'student',
    isTeacher: userData?.role === 'teacher',
    isDemoMode: DEMO_MODE,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
