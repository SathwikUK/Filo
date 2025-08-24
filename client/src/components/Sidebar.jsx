import React, { useState } from 'react';
import { Folder, Home, ChevronRight, ChevronDown, Trash2 } from 'lucide-react';

const Sidebar = ({ isOpen, folders, currentFolder, setCurrentFolder, refreshData }) => {
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  const toggleFolderExpansion = (folderId) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const deleteFolder = async (folderId, e) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this folder?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://filo-one.vercel.app/api/folders/${folderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        if (currentFolder === folderId) {
          setCurrentFolder(null);
        }
        refreshData();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to delete folder');
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
      alert('Failed to delete folder');
    }
  };

  const buildFolderTree = (folders) => {
    const tree = [];
    const folderMap = new Map();

    // Create folder map
    folders.forEach(folder => {
      folderMap.set(folder._id, { ...folder, children: [] });
    });

    // Build tree
    folders.forEach(folder => {
      if (folder.parentFolder) {
        const parent = folderMap.get(folder.parentFolder._id || folder.parentFolder);
        if (parent) {
          parent.children.push(folderMap.get(folder._id));
        }
      } else {
        tree.push(folderMap.get(folder._id));
      }
    });

    return tree;
  };

  const FolderItem = ({ folder, level = 0 }) => {
    const hasChildren = folder.children && folder.children.length > 0;
    const isExpanded = expandedFolders.has(folder._id);
    const isSelected = currentFolder === folder._id;

    return (
      <div>
        <div
          className={`flex items-center justify-between px-4 py-2 mx-2 rounded-lg cursor-pointer transition-all duration-200 group ${
            isSelected 
              ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30' 
              : 'hover:bg-white/10'
          }`}
          style={{ marginLeft: `${level * 16}px` }}
          onClick={() => setCurrentFolder(folder._id)}
        >
          <div className="flex items-center space-x-2 flex-1">
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolderExpansion(folder._id);
                }}
                className="p-1 hover:bg-white/20 rounded transition-all duration-200"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </button>
            )}
            <Folder 
              className="w-5 h-5 text-blue-400" 
              style={{ color: folder.color || '#3b82f6' }}
            />
            <span className="text-white text-sm font-medium truncate">{folder.name}</span>
          </div>
          
          <button
            onClick={(e) => deleteFolder(folder._id, e)}
            className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded transition-all duration-200 opacity-0 group-hover:opacity-100"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="ml-2">
            {folder.children.map(child => (
              <FolderItem key={child._id} folder={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const folderTree = buildFolderTree(folders);

  return (
    <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-80 bg-black/20 backdrop-blur-xl border-r border-white/10 transition-transform duration-300 z-40 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="p-6 h-full overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">File Explorer</h2>
          
          <div
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${
              !currentFolder 
                ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30' 
                : 'hover:bg-white/10'
            }`}
            onClick={() => setCurrentFolder(null)}
          >
            <Home className="w-5 h-5 text-cyan-400" />
            <span className="text-white font-medium">All Images</span>
          </div>
        </div>

        {folderTree.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-400 mb-3 px-2">Folders</h3>
            <div className="space-y-1">
              {folderTree.map(folder => (
                <FolderItem key={folder._id} folder={folder} />
              ))}
            </div>
          </div>
        )}

        {folders.length === 0 && (
          <div className="text-center py-8">
            <Folder className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No folders yet</p>
            <p className="text-gray-500 text-sm">Create your first folder to get started</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;