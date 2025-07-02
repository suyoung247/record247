import NoteItem from '@/components/readingNote/NoteItem';

const NoteList = ({ notes }) => {
  if (!notes || notes.length === 0) {
    return <p className="text-gray-400 mt-4">아직 남겨진 메모가 없습니다.</p>;
  }

  return (
    <div className="mt-4 space-y-4">
      {notes.map((note) => (
        <NoteItem key={note.id} note={note} />
      ))}
    </div>
  );
};

export default NoteList;
