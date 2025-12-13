
import React, { Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Library from './pages/Library';
import { BookProvider } from './context/BookContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Loader2 } from 'lucide-react';

// Code Splitting for Performance (Lazy Load non-critical routes)
const CreateBook = React.lazy(() => import('./pages/CreateBook'));
const ReadBook = React.lazy(() => import('./pages/ReadBook'));
const ReadingRoom = React.lazy(() => import('./pages/ReadingRoom'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Terms = React.lazy(() => import('./pages/Terms'));
const Privacy = React.lazy(() => import('./pages/Privacy'));

// Lazy load Modals to reduce initial JS execution time
const DataSafetyModal = React.lazy(() => import('./components/DataSafetyModal'));
const InstallPwaNotification = React.lazy(() => import('./components/InstallPwaNotification'));

// Fallback Loading Component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-transparent">
     <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
  </div>
);

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <BookProvider>
            <HashRouter>
              <div className="min-h-screen bg-skin-base text-skin-text font-sans flex flex-col transition-colors duration-500">
                <Navbar />
                
                <Suspense fallback={null}>
                   <DataSafetyModal />
                   <InstallPwaNotification />
                </Suspense>

                {/* Main content expands to fill space */}
                <main className="flex-grow">
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      {/* Library is critical, keeping it eager if possible, but for now regular import */}
                      <Route path="/" element={<Library />} />
                      <Route path="/create" element={<CreateBook />} />
                      <Route path="/read/:bookId" element={<ReadBook />} />
                      <Route path="/community" element={<ReadingRoom />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/terms" element={<Terms />} />
                      <Route path="/privacy" element={<Privacy />} />
                    </Routes>
                  </Suspense>
                </main>
                
                <footer className="bg-skin-secondary border-t border-skin-border py-12 mt-auto z-10 relative transition-colors duration-500">
                  <div className="container mx-auto px-4 text-center text-sm text-skin-muted">
                    <p className="mb-4 text-lg font-serif italic text-brand-500">iabooks originals</p>
                    <div className="flex justify-center gap-6 mb-6">
                      <a href="#/terms" className="hover:text-brand-500 transition-colors">Termos de Uso</a>
                      <a href="#/privacy" className="hover:text-brand-500 transition-colors">Privacidade</a>
                      <a href="https://fabioarieira.com" target="_blank" rel="noopener noreferrer" className="hover:text-brand-500 transition-colors">Suporte</a>
                    </div>
                    <p>© {new Date().getFullYear()} Desenvolvido por <a href="https://fabioarieira.com" target="_blank" rel="noopener noreferrer" className="text-brand-500 font-bold hover:underline">Fábio Arieira</a>.</p>
                    <p className="mt-2 text-xs opacity-60">Tecnologia Client-Side Secure • Seus dados não saem do seu dispositivo.</p>
                  </div>
                </footer>
              </div>
            </HashRouter>
          </BookProvider>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
};

export default App;
