import ReadingNote from '@/components/readingNote/ReadingNote';
import NoteModal from '@/components/readingNote/NoteModal';
import { useAddNote } from '@/hooks/useNote';
import { useAuth } from '@/hooks/useAuth';

const Notes = () => {
  const { user } = useAuth();
  const addNote = useAddNote(user?.uid);

  const handleTestAdd = () => {
    const dummyNote = {
      text: '이건 테스트용 메모입니다.',
      memo: '✅ 삭제/수정 테스트용 메모',
      type: 'note',
      page: 42,
      color: '#facc15',
    };
    addNote.mutate(dummyNote);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">📓 독서노트</h1>
      <button
        onClick={handleTestAdd}
        className="mb-4 px-3 py-1 bg-green-600 text-white rounded"
      >
        테스트 메모 추가
      </button>

      <ReadingNote />
      <NoteModal />
    </div>
  );
};

export default Notes;
