import React from 'react';
import { Image as ImageIcon, Folder, Trash2, Download, Calendar, HardDrive } from 'lucide-react';

const FileExplorer = ({ 
  folders, 
  images, 
  loading, 
  currentFolder, 
  setCurrentFolder, 
  refreshData,
  searchQuery
}) => {
  const deleteImage = async (imageId) => {
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/images/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        refreshData();
      } else {
        alert('Failed to delete image');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const currentFolderData = folders.find(f => f._id === currentFolder);
  const subfolders = folders.filter(f => f.parentFolder === currentFolder);

  const getBreadcrumb = () => {
    if (!currentFolder) return [{ name: 'All Images', id: null }];
    
    const breadcrumb = [];
    let folder = currentFolderData;
    
    while (folder) {
      breadcrumb.unshift({ name: folder.name, id: folder._id });
      folder = folders.find(f => f._id === folder.parentFolder);
    }
    
    breadcrumb.unshift({ name: 'Home', id: null });
    return breadcrumb;
  };

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="mb-6">
        <nav className="flex items-center space-x-2 text-sm">
          {getBreadcrumb().map((item, index) => (
            <React.Fragment key={item.id || 'root'}>
              {index > 0 && <span className="text-gray-400">/</span>}
              <button
                onClick={() => setCurrentFolder(item.id)}
                className={`px-3 py-1 rounded-lg transition-all duration-200 ${
                  index === getBreadcrumb().length - 1
                    ? 'bg-cyan-500/20 text-cyan-300 cursor-default'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.name}
              </button>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Images</p>
              <p className="text-2xl font-bold text-white">{images.length}</p>
            </div>
            <ImageIcon className="w-8 h-8 text-cyan-400" />
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Folders</p>
              <p className="text-2xl font-bold text-white">{subfolders.length}</p>
            </div>
            <Folder className="w-8 h-8 text-purple-400" />
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Storage Used</p>
              <p className="text-2xl font-bold text-white">
                {formatFileSize(images.reduce((sum, img) => sum + img.size, 0))}
              </p>
            </div>
            <HardDrive className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-white font-medium">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Folders */}
          {subfolders.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Folders</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {subfolders.map(folder => (
                  <div
                    key={folder._id}
                    onClick={() => setCurrentFolder(folder._id)}
                    className="group bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-cyan-500/50 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/20"
                  >
                    <div className="flex flex-col items-center space-y-3">
                      <Folder 
                        className="w-12 h-12 group-hover:scale-110 transition-transform duration-200" 
                        style={{ color: folder.color || '#3b82f6' }}
                      />
                      <span className="text-white font-medium text-center truncate w-full">
                        {folder.name}
                      </span>
                      <span className="text-gray-400 text-xs">
                        {formatDate(folder.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Images */}
          {images.length > 0 ? (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Images {searchQuery && `(Search: "${searchQuery}")`}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {images.map(image => (
                  <div
                    key={image._id}
                    className="group bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden border border-white/20 hover:border-cyan-500/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/20"
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={`http://localhost:4000/uploads/${image.filename}`}
                        alt={image.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    
                    <div className="p-4">
                      <h4 className="text-white font-medium truncate mb-2">{image.name}</h4>
                      
                      <div className="space-y-2 text-xs text-gray-400">
                        <div className="flex items-center justify-between">
                          <span>{formatFileSize(image.size)}</span>
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(image.createdAt)}</span>
                          </span>
                        </div>
                        
                        {image.folder && (
                          <div className="flex items-center space-x-1">
                            <Folder className="w-3 h-3" />
                            <span className="truncate">{image.folder.name}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/20">
                        <a
                          href={`http://localhost:4000/uploads/${image.filename}`}
                          download={image.originalName}
                          className="p-2 text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/20 rounded-lg transition-all duration-200"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        
                        <button
                          onClick={() => deleteImage(image._id)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {searchQuery ? 'No images found' : 'No images yet'}
              </h3>
              <p className="text-gray-400 mb-6">
                {searchQuery 
                  ? `No images match your search for "${searchQuery}"`
                  : 'Upload your first image to get started'
                }
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FileExplorer;