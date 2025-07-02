import useStore from '@/store/useStore';
import { useDeleteNote } from '@/hooks/useNote';
import { useAuth } from '@/hooks/useAuth';

export default function NoteModal() {
  const { user } = useAuth();
  const deleteNote = useDeleteNote(user?.uid);

  const { isNoteModalOpen, selectedNote } = useStore();

  if (!isNoteModalOpen || !selectedNote) return null;

  const handleDelete = () => {
    if (!selectedNote?.id) return;
    deleteNote.mutate(selectedNote.id);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow w-[400px]">
        <h2 className="text-xl font-bold mb-2">📌 하이라이트 / 메모</h2>
        <p className="text-gray-700">{selectedNote.text}</p>
        {selectedNote.memo && (
          <p className="text-yellow-700 bg-yellow-50 mt-2 p-2 rounded hover:bg-gray-200">
            ✍️ {selectedNote.memo}
          </p>
        )}
        <p className="text-sm text-gray-400 mt-2">{selectedNote.page} 페이지</p>

        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={handleDelete}
            className="px-4 py-1 bg-red-500 text-white rounded"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}
