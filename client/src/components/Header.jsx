import React, { useState, useEffect, useRef } from 'react';
import { Search, Upload, FolderPlus, Menu, LogOut, Zap, User, X } from 'lucide-react';
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
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Fetch search suggestions
  const fetchSuggestions = async (query) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/images/suggestions?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.slice(0, 5)); // Limit to 5 suggestions
        setShowSuggestions(data.length > 0);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search suggestions
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchSuggestions(searchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current && 
        !searchRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.name || suggestion.originalName || suggestion);
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    searchRef.current?.focus();
  };

  const handleSearchFocus = () => {
    if (suggestions.length > 0 && searchQuery.length >= 2) {
      setShowSuggestions(true);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-white/10 shadow-neon">
      <div className="flex items-center justify-between px-4 py-2 md:px-6 md:py-3">
        {/* Left: Logo + Sidebar toggle */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 hover-scale focus-ring"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center shadow-neon animate-pulse-glow">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg md:text-xl font-bold text-white text-glow">
              Filo<span className="text-gradient animate-gradient">Vault</span>
            </h1>
          </div>
        </div>

        {/* Middle: Search with Suggestions */}
        <div className="flex-1 max-w-xl mx-4 hidden sm:block relative">
          <div className="relative" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400 w-5 h-5 pointer-events-none z-10" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={handleSearchFocus}
              placeholder="Search your images..."
              className="input-field w-full pl-12 pr-10 py-2 rounded-lg focus-ring text-sm"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            
            {loading && (
              <div className="absolute right-10 top-1/2 -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-cyan-500 border-t-transparent"></div>
              </div>
            )}
          </div>

          {/* Search Suggestions Dropdown */}
          {showSuggestions && (
            <div 
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 mt-2 bg-gray-800/95 backdrop-blur-md border border-white/20 rounded-lg shadow-2xl z-50 max-h-64 overflow-y-auto"
            >
              {suggestions.length > 0 ? (
                <>
                  <div className="px-3 py-2 text-xs text-gray-400 border-b border-white/10">
                    Suggestions
                  </div>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-3 py-2 text-left text-white hover:bg-white/10 transition-colors flex items-center space-x-3 border-b border-white/5 last:border-b-0"
                    >
                      <Search className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm truncate">
                          {suggestion.name || suggestion.originalName || suggestion}
                        </div>
                        {suggestion.folder && (
                          <div className="text-xs text-gray-400 truncate">
                            in {suggestion.folder}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </>
              ) : (
                <div className="px-3 py-4 text-center text-gray-400 text-sm">
                  No suggestions found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCreateFolderModal(true)}
            className="btn-secondary flex items-center space-x-1 md:space-x-2 px-3 py-2 text-white rounded-lg focus-ring text-sm"
          >
            <FolderPlus className="w-4 h-4" />
            <span className="hidden sm:inline">New</span>
          </button>
          
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-primary flex items-center space-x-1 md:space-x-2 px-3 py-2 text-white rounded-lg focus-ring text-sm"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Upload</span>
          </button>

          {/* User section */}
          <div className="flex items-center space-x-2 px-3 py-1.5 glass rounded-lg border border-white/10 hover-glow">
            <div className="w-7 h-7 bg-gradient-to-r from-pink-500 to-violet-600 rounded-full flex items-center justify-center shadow-neon-pink">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden md:block leading-tight">
              <p className="text-white text-sm font-medium truncate max-w-[120px]">{user?.username}</p>
              <p className="text-gray-400 text-xs truncate max-w-[120px]">{user?.email}</p>
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