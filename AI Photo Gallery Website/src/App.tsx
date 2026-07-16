import { useCallback, useMemo, useRef, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { UploadSection } from './components/UploadSection';
import { SearchBar } from './components/SearchBar';
import { Gallery } from './components/Gallery';
import { ImageModal } from './components/ImageModal';
import { Footer } from './components/Footer';
import { useTheme } from './hooks/useTheme';
import { useDebounce } from './hooks/useDebounce';
import { useGallery } from './hooks/useGallery';
import { useUpload } from './hooks/useUpload';
import type { GalleryImage } from './types';

function App() {
  const { theme, toggleTheme } = useTheme();
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 300);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const uploadSectionRef = useRef<HTMLDivElement>(null);

  const { images, isLoading, isRefreshing, refresh, removeImage } = useGallery(debouncedSearch);
  const { uploads, addFiles, cancelUpload, dismissUpload } = useUpload(refresh);

  const isSearching = searchInput !== debouncedSearch;

  const handleScrollToUpload = useCallback(() => {
    uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleImageClick = useCallback((image: GalleryImage) => {
    setSelectedImage(image);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedImage(null);
  }, []);

  const handleDeleteImage = useCallback(
    async (imageId: string) => {
      return removeImage(imageId);
    },
    [removeImage]
  );

  const toastOptions = useMemo(
    () => ({
      duration: 3800,
      style: {
        background: theme === 'dark' ? 'rgba(18, 20, 29, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        color: theme === 'dark' ? '#f1f5f9' : '#0f172a',
        border: theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)',
        borderRadius: '14px',
        fontSize: '13.5px',
        boxShadow: '0 12px 30px -10px rgba(0,0,0,0.4)',
      },
      success: { iconTheme: { primary: '#22d3ee', secondary: '#0a0b10' } },
      error: { iconTheme: { primary: '#ec4899', secondary: '#0a0b10' } },
    }),
    [theme]
  );

  return (
    <div className="min-h-screen bg-slate-50 transition-colors duration-300 dark:bg-ink-900">
      <Toaster position="top-right" toastOptions={toastOptions} />

      <Navbar
        imageCount={images.length}
        isRefreshing={isRefreshing}
        onRefresh={refresh}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main>
        <Hero onScrollToUpload={handleScrollToUpload} />

        <div ref={uploadSectionRef} className="scroll-mt-20">
          <UploadSection
            uploads={uploads}
            onFilesAdded={addFiles}
            onCancel={cancelUpload}
            onDismiss={dismissUpload}
          />
        </div>

        <SearchBar
          value={searchInput}
          onChange={setSearchInput}
          resultCount={images.length}
          isSearching={isSearching || isLoading}
        />

        <Gallery
          images={images}
          isLoading={isLoading}
          searchTerm={debouncedSearch}
          onImageClick={handleImageClick}
        />
      </main>

      <Footer />

      <ImageModal image={selectedImage} onClose={handleCloseModal} onDelete={handleDeleteImage} />
    </div>
  );
}

export default App;
