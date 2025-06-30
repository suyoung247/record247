import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

function Login() {
  const { user, googleSignIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/intro');
    }
  }, [user, navigate]);

  if (user) {
    return null;
  }

  return (
    <main className="h-screen w-full overflow-x-hidden bg-black text-white flex flex-col items-center justify-center">
      <header className="mb-8">
        <h1 className="text-4xl font-bold">기록 247</h1>
      </header>
      <section className="flex items-center gap-x-[150px]">
        <p className="text-xl">로그인이 필요합니다.</p>
        <button
          onClick={googleSignIn}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          로그인
        </button>
      </section>
    </main>
  );
}

export default Login;
