import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { auth, db, handleFirestoreError, OperationType } from "../firebase";
import { toast } from "sonner";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  addXp: (amount: number) => Promise<void>;
  incrementStreak: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Synchronize Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const userDocRef = doc(db, "users", currentUser.uid);
      const todayKey = new Date().toISOString().split("T")[0];

      try {
        const docSnap = await getDoc(userDocRef);

        if (!docSnap.exists()) {
          // Initialize New User Profile
          const newProfile: UserProfile = {
            uid: currentUser.uid,
            email: currentUser.email || "",
            displayName: currentUser.displayName || "Explorer",
            photoURL: currentUser.photoURL || "",
            xp: 0,
            level: 1,
            streak: 1,
            lastActiveDate: todayKey,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          await setDoc(userDocRef, newProfile);
          setProfile(newProfile);
          toast.success("Welcome to NeuroList! Your productivity gateway is initialized.");
        } else {
          // Exists: Check Streak Loyalty
          const existingData = docSnap.data() as UserProfile;
          let updatedStreak = existingData.streak;
          
          if (existingData.lastActiveDate !== todayKey) {
            const lastActive = new Date(existingData.lastActiveDate);
            const today = new Date(todayKey);
            const diffTime = Math.abs(today.getTime() - lastActive.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
              updatedStreak += 1;
              toast.success(`Active Streak extended! Day ${updatedStreak} 🔥`);
            } else if (diffDays > 1) {
              updatedStreak = 1;
              toast.info("Streak reset. Ready to rebuild momentum? 🌱");
            }

            const updatedProfile = {
              ...existingData,
              streak: updatedStreak,
              lastActiveDate: todayKey,
              updatedAt: new Date().toISOString()
            };
            await setDoc(userDocRef, updatedProfile);
          }
        }

        // Realtime Subscription for User profile (XP/Level/Streak/etc.)
        const unsubProfileSnap = onSnapshot(userDocRef, (snap) => {
          if (snap.exists()) {
            setProfile(snap.data() as UserProfile);
          }
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
        });

        setLoading(false);
        return () => unsubProfileSnap();

      } catch (err) {
        console.error("Auth syncing profiles fail:", err);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Award User XP & Handle Dynamic Level Up Animation (XP = Level * 100)
  const addXp = async (amount: number) => {
    if (!user || !profile) return;
    const userDocRef = doc(db, "users", user.uid);

    const newXp = profile.xp + amount;
    const currentMaxXpNeeded = profile.level * 100;
    let newLevel = profile.level;
    let leveledUp = false;

    if (newXp >= currentMaxXpNeeded) {
      newLevel += 1;
      leveledUp = true;
    }

    try {
      const updatedProfile = {
        ...profile,
        xp: leveledUp ? (newXp - currentMaxXpNeeded) : newXp,
        level: newLevel,
        updatedAt: new Date().toISOString()
      };
      await setDoc(userDocRef, updatedProfile);
      
      if (leveledUp) {
        toast.success(`LEVEL UP! You are now Level ${newLevel}! 🎉`, {
          description: `Keep crushing goals. Active XP multiplier is now active!`,
          duration: 5000
        });
      } else {
        toast(`+${amount} XP Awarded! 📈`, {
          description: `Total XP: ${updatedProfile.xp}/${newLevel * 100}`,
          duration: 1500
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const incrementStreak = async () => {
    if (!user || !profile) return;
    const userDocRef = doc(db, "users", user.uid);
    try {
      await setDoc(userDocRef, {
        ...profile,
        streak: profile.streak + 1,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, addXp, incrementStreak }}>
      {children}
    </AuthContext.Provider>
  );
};
