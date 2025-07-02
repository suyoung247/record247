import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Login from '@/pages/Login';
import Intro from '@/pages/Intro';
import Viewer from '@/pages/Viewer';
import Notes from '@/pages/Notes';
import Review from '@/pages/Review';
import NotFound from '@/pages/NotFound';
import { useAuth } from '@/hooks/useAuth';

const Router = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  const protectedPaths = ['/intro', '/viewer', '/notes', '/review'];
  const isGuestAccessBlocked =
    !user && protectedPaths.includes(location.pathname);

  if (isLoading) return null;
  if (isGuestAccessBlocked) {
    return <Navigate to="/" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/intro" element={<Intro />} />
      <Route path="/viewer" element={<Viewer />} />
      <Route path="/notes" element={<Notes />} />
      <Route path="/review" element={<Review />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default Router;
