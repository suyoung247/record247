import { useNote, useAddNote, useDeleteNote } from '@/hooks/useNote';
import { useAuth } from '@/hooks/useAuth';

const Notes = () => {
  const { user } = useAuth();
  const { data: notes, isLoading } = useNote(user?.uid);
  const addNote = useAddNote(user?.uid);
  const deleteNote = useDeleteNote(user?.uid);

  if (isLoading) return <div>Notes Page</div>;

  const handleAddNote = () => {
    addNote.mutate('세 메모 내용');
  };

  const handleDeletNote = (id) => {
    deleteNote.mutate(id);
  };

  return (
    <div>
      <h1>Notes Page</h1>
      <button onClick={handleAddNote}>매모 추가</button>
      <ul>
        {notes?.map((note) => (
          <li key={note.id}>
            {note.content}
            <button onClick={() => handleDeletNote(note.id)}>삭제</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notes;
