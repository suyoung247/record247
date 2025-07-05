import UploadBox from '@/components/UploadBox';
import Logout from '@/components/Logout';
import BookList from '@/components/libaray/BookList';

const Intro = () => {
  return (
    <div className="p-6">
      <Logout />
      <h2 className="text-2xl font-bold mb-4">📚 내 서재</h2>
      <BookList />
      <UploadBox />
    </div>
  );
};

export default Intro;
