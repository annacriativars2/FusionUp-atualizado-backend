import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';

import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/pages/Services';
import FeaturedProjects from './components/FeaturedProjects';
import Testimonials from './components/Testimonials';
import CallToAction from './components/CallToAction';
import Footer from './components/Footer';
import Scheduling from './components/Scheduling';
import BlogPage from './components/pages/BlogPage';
import AboutPage from './components/pages/AboutPage';
import TeamPage from './components/pages/TeamPage';
import ContactPage from './components/pages/ContactPage';
import DashboardPage from './components/pages/admin/DashboardPage';
import AdminLogin from './components/pages/admin/LoginPage';
import RegisterPage from './components/pages/admin/RegisterPage';
import PostListPage from './components/pages/admin/PostListPage';
import PostCreatePage from './components/pages/admin/PostCreatePage';
import PostEditPage from './components/pages/admin/PostEditPage';
import UserListPage from './components/pages/admin/UserListPage';
import UserCreatePage from './components/pages/admin/UserCreatePage';
import UserEditPage from './components/pages/admin/UserEditPage';
import ConfigurationListPage from './components/pages/admin/ConfigurationListPage';
import ConfigurationCreatePage from './components/pages/admin/ConfigurationCreatePage';

const NotFound = () => (
  <div className="text-center p-8">
    <h1 className="text-2xl font-bold text-red-600">404 - Página não encontrada</h1>
    <p className="mt-2">
      Verifique a URL ou volte para a{' '}
      <a href="/" className="text-blue-600 underline">página inicial</a>.
    </p>
  </div>
);

// Layout para páginas administrativas
const AdminLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-gray-100">
    {children}
  </div>
);

// Layout para páginas públicas
const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-grow">
      {children}
    </main>
    <Footer />
    <Scheduling />
  </div>
);

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { loading, isAuthenticated } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading || loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#F0F0F2]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#0066B3] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-[#0066B3]">SocialMídia</h2>
          <p className="text-gray-600">Carregando experiência...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Rotas públicas */}
      <Route
        path="/"
        element={
          <PublicLayout>
            <Hero />
            <Services />
            <FeaturedProjects />
            <Testimonials />
            <CallToAction />
          </PublicLayout>
        }
      />
      <Route path="/contato" element={<PublicLayout><ContactPage /></PublicLayout>} />
      <Route path="/sobre" element={<PublicLayout><AboutPage /></PublicLayout>} />
      <Route path="/equipe" element={<PublicLayout><TeamPage /></PublicLayout>} />
      <Route path="/servicos" element={<PublicLayout><Services /></PublicLayout>} />
      <Route path="/blog" element={<PublicLayout><BlogPage /></PublicLayout>} />

      {/* Redirecionar /dashboard para /admin/dashboard */}
      <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />

      {/* Rotas administrativas protegidas */}
      <Route
        path="/admin/dashboard"
        element={
          isAuthenticated ? (
            <AdminLayout><DashboardPage /></AdminLayout>
          ) : (
            <Navigate to="/admin/login" replace />
          )
        }
      />
      <Route
        path="/admin/posts"
        element={
          isAuthenticated ? (
            <AdminLayout><PostListPage /></AdminLayout>
          ) : (
            <Navigate to="/admin/login" replace />
          )
        }
      />
      <Route
        path="/admin/posts/create"
        element={
          isAuthenticated ? (
            <AdminLayout><PostCreatePage /></AdminLayout>
          ) : (
            <Navigate to="/admin/login" replace />
          )
        }
      />
      <Route
        path="/admin/posts/edit/:slug"
        element={
          isAuthenticated ? (
            <AdminLayout><PostEditPage /></AdminLayout>
          ) : (
            <Navigate to="/admin/login" replace />
          )
        }
      />
      <Route
        path="/admin/users"
        element={
          isAuthenticated ? (
            <AdminLayout><UserListPage /></AdminLayout>
          ) : (
            <Navigate to="/admin/login" replace />
          )
        }
      />
      <Route
        path="/admin/users/create"
        element={
          isAuthenticated ? (
            <AdminLayout><UserCreatePage /></AdminLayout>
          ) : (
            <Navigate to="/admin/login" replace />
          )
        }
      />
      <Route
        path="/admin/users/edit/:userId"
        element={
          isAuthenticated ? (
            <AdminLayout><UserEditPage /></AdminLayout>
          ) : (
            <Navigate to="/admin/login" replace />
          )
        }
      />
      <Route
        path="/admin/configurations"
        element={
          isAuthenticated ? (
            <AdminLayout><ConfigurationListPage /></AdminLayout>
          ) : (
            <Navigate to="/admin/login" replace />
          )
        }
      />
      <Route
        path="/admin/configurations/create"
        element={
          isAuthenticated ? (
            <AdminLayout><ConfigurationCreatePage /></AdminLayout>
          ) : (
            <Navigate to="/admin/login" replace />
          )
        }
      />

      {/* Rotas públicas administrativas */}
      <Route path="/login" element={<AdminLogin />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin/register" element={<RegisterPage />} />

      {/* Redirecionamento raiz admin */}
      <Route
        path="/admin"
        element={
          isAuthenticated ? (
            <Navigate to="/admin/dashboard" replace />
          ) : (
            <Navigate to="/admin/login" replace />
          )
        }
      />

      {/* 404 */}
      <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
    </Routes>
  );
}

export default App;

