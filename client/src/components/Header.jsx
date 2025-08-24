import React from 'react';
import { Search, Upload, FolderPlus, Menu, LogOut, Zap, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';

const Header = ({ 
  user, 
  sidebarOpen, 
  setSidebarOpen, 
  searchQuery, 
  setSearchQuery,
  setShowUploadModal,
  setShowCreateFolderModal
}) => {
  const { logout } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-white/10 shadow-neon">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 hover-scale focus-ring"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center shadow-neon animate-pulse-glow">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white text-glow">
              Neural<span className="text-gradient animate-gradient">Vault</span>
            </h1>
          </div>
        </div>

        <div className="flex-1 max-w-2xl mx-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your images..."
              className="input-field w-full pl-12 pr-4 py-3 focus-ring"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowCreateFolderModal(true)}
            className="btn-secondary flex items-center space-x-2 px-4 py-2 text-white rounded-lg focus-ring"
          >
            <FolderPlus className="w-4 h-4" />
            <span className="hidden sm:inline">New Folder</span>
          </button>
          
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-primary flex items-center space-x-2 px-4 py-2 text-white rounded-lg focus-ring"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Upload</span>
          </button>

          <div className="flex items-center space-x-3 px-4 py-2 glass rounded-lg border border-white/20 hover-glow">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-violet-600 rounded-full flex items-center justify-center shadow-neon-pink">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-white text-sm font-medium text-glow">{user?.username}</p>
              <p className="text-gray-400 text-xs">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 hover-scale focus-ring"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;