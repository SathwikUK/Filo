import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import Header from './Header';
import Sidebar from './Sidebar';
import FileExplorer from './FileExplorer';
import UploadModal from './UploadModal';
import CreateFolderModal from './CreateFolderModal';

const Dashboard = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [folders, setFolders] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    fetchFolders();
    fetchImages();
  }, [refreshTrigger, currentFolder]);

  const fetchFolders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/folders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFolders(data);
      }
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  const fetchImages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      if (currentFolder) {
        params.append('folderId', currentFolder);
      }
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`http://localhost:4000/api/images?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setImages(data);
      }
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchImages();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative bg-pattern">
      <Header
        user={user}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setShowUploadModal={setShowUploadModal}
        setShowCreateFolderModal={setShowCreateFolderModal}
      />
      
      <div className="flex pt-16">
        <Sidebar
          isOpen={sidebarOpen}
          folders={folders}
          currentFolder={currentFolder}
          setCurrentFolder={setCurrentFolder}
          refreshData={refreshData}
        />
        
        <main className={`flex-1 transition-all duration-300 animate-fade-scale ${sidebarOpen ? 'ml-80' : 'ml-0'}`}>
          <FileExplorer
            folders={folders}
            images={images}
            loading={loading}
            currentFolder={currentFolder}
            setCurrentFolder={setCurrentFolder}
            refreshData={refreshData}
            searchQuery={searchQuery}
          />
        </main>
      </div>

      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          currentFolder={currentFolder}
          folders={folders}
          refreshData={refreshData}
        />
      )}

      {showCreateFolderModal && (
        <CreateFolderModal
          onClose={() => setShowCreateFolderModal(false)}
          currentFolder={currentFolder}
          refreshData={refreshData}
        />
      )}
    </div>
  );
};

export default Dashboard;