import React, { useState, useEffect } from 'react';
import { User, Mail, Lock, Shield, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { db } from '../../db';
import logo from '../../assets/logo.png';
import { applyTheme, getCurrentTheme } from '../../utils/themeManager';

interface AuthPageProps {
  onSignIn: (userData: any) => void;
  onSignUp: () => void;
  onAdminAccess: () => void;
}

interface UserCredentials {
  email: string;
  password: string;
}

interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  lastLogin?: Date;
}

const AuthPage: React.FC<AuthPageProps> = ({ onSignIn, onSignUp, onAdminAccess }) => {
  const [mode] = useState<'signin' | 'signup'>('signin');
  const [credentials, setCredentials] = useState<UserCredentials>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedUsers, setSavedUsers] = useState<StoredUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');

  // Charger les utilisateurs sauvegardés au démarrage
  useEffect(() => {
    loadSavedUsers();
  }, []);

  const loadSavedUsers = async () => {
    try {
      const users = await db.getAllUsers?.() || [];
      setSavedUsers(users);
      
      // Pré-remplir avec le dernier utilisateur connecté
      if (users.length > 0) {
        const lastUser = users.sort((a, b) => 
          (b.lastLogin?.getTime() || 0) - (a.lastLogin?.getTime() || 0)
        )[0];
        setSelectedUser(lastUser.id);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    }
  };

  const handleUserSelect = (userId: string) => {
    const user = savedUsers.find(u => u.id === userId);
    if (user) {
      setSelectedUser(userId);
    }
  };

  const handleSignIn = async () => {
    if (!selectedUser || !credentials.password) {
      alert('Veuillez sélectionner un utilisateur et entrer le mot de passe');
      return;
    }

    try {
      const user = await db.getUser(selectedUser);
      console.log('🔐 AuthPage: Attempting sign in for user:', selectedUser);
      console.log('🔐 AuthPage: User found:', user ? { id: user.id, name: user.name, email: user.email } : 'null');
      
      if (user && user.password === credentials.password) {
        await db.setCurrentUser(user.id);
        console.log('✅ AuthPage: User authenticated, current user set to:', user.id);
        
        // Verify the current user was set correctly
        const verifyCurrentUser = await db.getCurrentUser();
        console.log('🔍 AuthPage: Verification - current user ID:', verifyCurrentUser);
        
        // Apply gray theme if no theme is set, or keep existing theme
        const currentTheme = getCurrentTheme();
        // Only apply dark mode if explicitly selected, not for "system"
        const isDarkMode = user.personalInfo?.theme_preference === 'dark';
        
        // If theme is default (gray), apply it in LIGHT mode by default
        if (currentTheme === 'gray' || !localStorage.getItem('e-audit-theme')) {
          console.log('🎨 AuthPage: Applying gray theme with dark mode:', isDarkMode);
          applyTheme('gray', isDarkMode);
        }
        
        onSignIn(user);
      } else {
        console.log('❌ AuthPage: Invalid credentials');
        alert('Identifiants invalides');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      alert('Échec de la connexion');
    }
  };

  const handleSignUp = async () => {
    // For now, just redirect to onboarding since sign up is handled there
    onSignUp();
  };

  const handleAdminAccess = () => {
    onAdminAccess();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (mode === 'signin') {
        handleSignIn();
      } else {
        handleSignUp();
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-sakura-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <img src={logo} alt="E-audit Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Bienvenue sur E-audit
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Connectez-vous ou créez un nouveau compte
          </p>
        </div>

        {/* Formulaire principal */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
          {/* Sélecteur d'utilisateur sauvegardé */}
          {savedUsers.length > 0 && mode === 'signin' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Utilisateurs enregistrés
              </label>
              <div className="space-y-2">
                {savedUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleUserSelect(user.id)}
                    className={`w-full p-3 rounded-lg border text-left transition-all ${
                      selectedUser === user.id
                        ? 'border-sakura-500 bg-sakura-50 dark:bg-sakura-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-sakura-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-sakura-500 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Champs de saisie */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sakura-500 focus:border-transparent"
                  placeholder="votre.email@exemple.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sakura-500 focus:border-transparent"
                  placeholder="Votre mot de passe"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="mt-6 space-y-3">
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-sakura-500 to-pink-500 hover:from-sakura-600 hover:to-pink-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn className="w-5 h-5" />
              )}
              Se connecter
            </button>

            <button
              onClick={handleSignUp}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-all"
            >
              <UserPlus className="w-5 h-5" />
              Créer un nouveau compte
            </button>

            <button
              onClick={handleAdminAccess}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              <Shield className="w-5 h-5" />
              Accès Administrateur
            </button>
          </div>
        </div>

        {/* Footer - Removed as per user request */}
      </div>
    </div>
  );
};

export default AuthPage;
