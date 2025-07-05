import axios from 'axios';
import toast from 'react-hot-toast';

export const uploadEpubToServer = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(
      'https://us-central1-record-247.cloudfunctions.net/api/upload-epub',
      formData
    );

    return response.data.url;
  } catch (error) {
    toast.error('업로드 실패');

    return null;
  }
};
