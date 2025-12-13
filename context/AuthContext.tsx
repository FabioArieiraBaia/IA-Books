
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, ReadingProgress } from '../types';
import { encryptVault, decryptVault } from '../services/cryptoService';

interface User extends UserProfile {
    token: string;
}

// The structure of the portable JSON file
interface UserVault {
    meta: {
        version: number;
        exportedAt: number;
        platform: "iabooks";
    };
    profile: UserProfile;
    settings: {
        apiKey?: string;
        theme?: string;
    };
}

interface AuthContextType {
  user: User | null;
  login: (name: string, email: string) => void;
  logout: () => void;
  toggleFavorite: (bookId: string) => void;
  updateReadingProgress: (bookId: string, percentage: number, chapterId: string) => void;
  exportIdentity: (password: string) => Promise<void>;
  importIdentity: (file: File, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check localStorage for user data on load
    const storedUser = localStorage.getItem('iabooks_user_profile');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('iabooks_user_profile');
      }
    }
  }, []);

  // Save user changes to persistence
  useEffect(() => {
    if (user) {
        localStorage.setItem('iabooks_user_profile', JSON.stringify(user));
    } else {
        localStorage.removeItem('iabooks_user_profile');
    }
  }, [user]);

  const login = (name: string, email: string) => {
    const token = btoa(JSON.stringify({ name, email, exp: Date.now() + 86400000 }));
    const isAdmin = email.trim().toLowerCase() === 'fabioarieira2@gmail.com';

    const newUser: User = { 
        id: email,
        name, 
        email, 
        token, 
        isAdmin,
        favorites: [],
        readingProgress: [],
        createdBooks: [],
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f59e0b&color=fff`
    };

    // If we had a stored profile with this email, restore it (simulate database fetch)
    const storedProfileStr = localStorage.getItem(`profile_${email}`);
    if (storedProfileStr) {
        const storedProfile = JSON.parse(storedProfileStr);
        setUser({ ...newUser, ...storedProfile, token }); 
    } else {
        setUser(newUser);
    }
  };

  const logout = () => {
    setUser(null);
  };

  const toggleFavorite = (bookId: string) => {
      if (!user) return;
      
      const isFav = user.favorites.includes(bookId);
      let newFavs = [];
      if (isFav) {
          newFavs = user.favorites.filter(id => id !== bookId);
      } else {
          newFavs = [...user.favorites, bookId];
      }
      
      const updatedUser = { ...user, favorites: newFavs };
      setUser(updatedUser);
      localStorage.setItem(`profile_${user.email}`, JSON.stringify(updatedUser));
  };

  const updateReadingProgress = (bookId: string, percentage: number, chapterId: string) => {
      if (!user) return;
      
      const newProgress: ReadingProgress = {
          bookId,
          lastChapterId: chapterId,
          percentage,
          lastReadAt: Date.now()
      };

      const otherProgress = user.readingProgress.filter(p => p.bookId !== bookId);
      const updatedUser = { ...user, readingProgress: [...otherProgress, newProgress] };
      
      setUser(updatedUser);
      localStorage.setItem(`profile_${user.email}`, JSON.stringify(updatedUser));
  };

  // ----------------------------------------------------
  // IDENTITY WALLET LOGIC
  // ----------------------------------------------------

  const exportIdentity = async (password: string) => {
      if (!user) throw new Error("Nenhum usuário logado.");

      const apiKey = localStorage.getItem('iabooks_api_key') || undefined;
      const theme = localStorage.getItem('iabooks_theme') || 'dark';

      const vault: UserVault = {
          meta: {
              version: 1,
              exportedAt: Date.now(),
              platform: "iabooks"
          },
          profile: user,
          settings: {
              apiKey,
              theme
          }
      };

      // Encrypt
      const encryptedString = await encryptVault(vault, password);
      
      // Download
      const blob = new Blob([encryptedString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `identity_${user.name.replace(/\s+/g, '_').toLowerCase()}.iabooks`;
      a.click();
      URL.revokeObjectURL(url);
  };

  const importIdentity = async (file: File, password: string) => {
      return new Promise<void>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = async (e) => {
              try {
                  const content = e.target?.result as string;
                  const vault: UserVault = await decryptVault(content, password);
                  
                  // Restore User
                  const restoredUser: User = {
                      ...vault.profile,
                      token: "restored_session_token" // Re-hydrate session
                  };
                  setUser(restoredUser);
                  localStorage.setItem(`profile_${restoredUser.email}`, JSON.stringify(restoredUser));

                  // Restore Settings
                  if (vault.settings.apiKey) {
                      localStorage.setItem('iabooks_api_key', vault.settings.apiKey);
                  }
                  if (vault.settings.theme) {
                      localStorage.setItem('iabooks_theme', vault.settings.theme);
                      // Trigger theme update if possible or reload
                      window.location.reload(); 
                  }

                  resolve();
              } catch (err) {
                  reject(err);
              }
          };
          reader.readAsText(file);
      });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, toggleFavorite, updateReadingProgress, exportIdentity, importIdentity }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
