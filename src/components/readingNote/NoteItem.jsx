import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDeleteNote, useUpdateNote } from '@/hooks/useNote';

const NoteItem = ({ note }) => {
  const { user } = useAuth();
  const updateNote = useUpdateNote(user?.uid);
  const deleteNote = useDeleteNote(user?.uid);

  const [isEditing, setIsEditing] = useState(false);
  const [memo, setMemo] = useState(note.memo || '');

  const handleUpdate = () => {
    updateNote.mutate({ id: note.id, memo });
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteNote.mutate(note.id);
  };

  return (
    <div className="p-4 border rounded bg-white shadow-sm relative hover:bg-gray-50">
      <p className="text-gray-800 font-semibold line-clamp-2">
        {note.color && (
          <span
            className="inline-block w-3 h-3 rounded-full mr-2 align-middle"
            style={{ backgroundColor: note.color }}
          />
        )}
        {note.text}
      </p>

      {isEditing ? (
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          onBlur={handleUpdate}
          autoFocus
          className="w-full mt-2 p-2 border rounded resize-none text-sm"
        />
      ) : (
        <p
          className="text-yellow-700 mt-2 bg-yellow-50 p-2 rounded text-sm cursor-text whitespace-pre-wrap"
          onClick={() => setIsEditing(true)}
        >
          ✍️ {note.memo || '메모가 없습니다. 클릭해서 입력하세요.'}
        </p>
      )}

      <div className="flex justify-between items-center mt-2">
        <p className="text-xs text-gray-400">{note.page} 페이지</p>
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            className="text-xs text-red-500 hover:underline"
          >
            삭제
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs text-blue-500 hover:underline"
          >
            수정
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteItem;
