import React, { useState, useEffect } from 'react';
import { Shield, User, Mail, Calendar, Eye, EyeOff, Trash2, ArrowLeft, Search, Download, Upload } from 'lucide-react';
import { db } from '../../db';

interface AdminDashboardProps {
  onBack: () => void;
}

interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  lastLogin?: Date;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [users, setUsers] = useState<StoredUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPasswords, setShowPasswords] = useState<Set<string>>(new Set());

  const ADMIN_PASSWORD = '1234';

  useEffect(() => {
    if (isAuthenticated) {
      loadUsers();
    }
  }, [isAuthenticated]);

  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Mot de passe administrateur incorrect');
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      console.log('🔍 AdminDashboard: Loading users...');
      const allUsers = await db.getAllUsers?.() || [];
      console.log('📊 AdminDashboard: Found users:', allUsers.length, allUsers);
      setUsers(allUsers);
    } catch (error) {
      setError('Erreur lors du chargement des utilisateurs');
      console.error('❌ AdminDashboard: Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await db.deleteUser?.(userId);
        await loadUsers();
      } catch (error) {
        setError('Erreur lors de la suppression de l\'utilisateur');
        console.error('Erreur:', error);
      }
    }
  };

  const togglePasswordVisibility = (userId: string) => {
    const newShowPasswords = new Set(showPasswords);
    if (newShowPasswords.has(userId)) {
      newShowPasswords.delete(userId);
    } else {
      newShowPasswords.add(userId);
    }
    setShowPasswords(newShowPasswords);
  };

  const exportUsers = () => {
    const dataStr = JSON.stringify(users, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `clara-users-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Accès Administrateur
            </h1>
            <p className="text-gray-400">
              Entrez le mot de passe administrateur pour continuer
            </p>
          </div>

          <div className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-gray-700/50">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mot de passe administrateur
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                    className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-600 bg-gray-700 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Mot de passe"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={handleAdminLogin}
                  className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-lg font-medium transition-all"
                >
                  Accéder au Dashboard
                </button>

                <button
                  onClick={onBack}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 border border-gray-600 text-gray-300 rounded-lg font-medium hover:bg-gray-600 transition-all"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Retour
                </button>
              </div>
            </div>
          </div>

          <div className="text-center mt-6 text-sm text-gray-500">
            <p>Mot de passe par défaut: 1234</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">Dashboard Administrateur</h1>
              <p className="text-gray-400">Gestion des utilisateurs E-audit</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={exportUsers}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
            >
              <Download className="w-4 h-4" />
              Exporter
            </button>
            <button
              onClick={loadUsers}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all"
            >
              <Upload className="w-4 h-4" />
              Actualiser
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800/80 backdrop-blur-md rounded-xl p-6 border border-gray-700/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600 rounded-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{users.length}</p>
                <p className="text-gray-400">Utilisateurs totaux</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/80 backdrop-blur-md rounded-xl p-6 border border-gray-700/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-600 rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {users.filter(u => u.lastLogin && 
                    new Date().getTime() - u.lastLogin.getTime() < 24 * 60 * 60 * 1000
                  ).length}
                </p>
                <p className="text-gray-400">Actifs (24h)</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/80 backdrop-blur-md rounded-xl p-6 border border-gray-700/50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-600 rounded-lg">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {new Set(users.map(u => u.email.split('@')[1])).size}
                </p>
                <p className="text-gray-400">Domaines uniques</p>
              </div>
            </div>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-600 bg-gray-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Rechercher par nom ou email..."
            />
          </div>
        </div>

        {/* Table des utilisateurs */}
        <div className="bg-gray-800/80 backdrop-blur-md rounded-xl border border-gray-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                    Mot de passe
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                    Créé le
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                    Dernière connexion
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                      <div className="flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin mr-2"></div>
                        Chargement des utilisateurs...
                      </div>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                      {searchTerm ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur enregistré'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-700/30">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-sakura-500 rounded-full flex items-center justify-center mr-3">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">{user.name}</div>
                            <div className="text-sm text-gray-400">ID: {user.id.slice(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-white font-mono">
                            {showPasswords.has(user.id) ? user.password : '••••••••'}
                          </span>
                          <button
                            onClick={() => togglePasswordVisibility(user.id)}
                            className="p-1 text-gray-400 hover:text-white transition-colors"
                          >
                            {showPasswords.has(user.id) ? 
                              <EyeOff className="w-4 h-4" /> : 
                              <Eye className="w-4 h-4" />
                            }
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{formatDate(user.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          {user.lastLogin ? formatDate(user.lastLogin) : 'Jamais'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all"
                          title="Supprimer l'utilisateur"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-900/20 border border-red-800 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
