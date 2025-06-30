import { Route, Routes } from 'react-router-dom';
import Login from '@/pages/Login';
import Intro from '@/pages/Intro';
import Viewer from '@/pages/Viewer';
import Notes from '@/pages/Notes';
import Review from '@/pages/Review';
import NotFound from '@/pages/Review';

const Router = () => {
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
