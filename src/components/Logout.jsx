import { useQueryClient } from '@tanstack/react-query';
import { logout } from '@/services/authService';
import useStore from '@/store/useStore';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    queryClient.clear();
    useStore.getState().reset();
    navigate('/');
  };

  return <button onClick={handleLogout}>로그아웃</button>;
};

export default Logout;
