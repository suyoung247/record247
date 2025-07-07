import axios from 'axios';
import toast from 'react-hot-toast';

export const uploadEpubToServer = async (file, userId) => {
  const buffer = await file.arrayBuffer();

  try {
    const res = await axios.post(
      'https://us-central1-record-247.cloudfunctions.net/api/upload-epub',
      buffer,
      {
        headers: {
          'Content-Type': 'application/epub+zip',
          'x-user-id': userId,
        },
      }
    );
    return res.data;
  } catch (err) {
    const errorMessage =
      err.response?.data?.message || err.message || '알 수 없는 오류';
    toast.error(`❌ 서버 업로드 실패: ${errorMessage}`);
    return { success: false };
  }
};
