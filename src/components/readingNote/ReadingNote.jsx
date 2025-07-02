import { useState, useEffect } from 'react';
import { useNote } from '@/hooks/useNote';
import { useAuth } from '@/hooks/useAuth';
import useStore from '@/store/useStore';
import NoteFilterTabs from '@/components/readingNote/NoteFilterTabs';
import NoteList from '@/components/readingNote/NoteList';
import toast from 'react-hot-toast';

const highlightColors = ['#facc15', '#86efac', '#a5b4fc', '#fda4af'];

const ReadingNote = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const { highlightColor, setHighlightColor } = useStore();
  const { data: notes = [], isLoading, isError } = useNote(user?.uid);

  useEffect(() => {
    if (isLoading) {
      toast.loading('메모 불러오는 중', { id: 'note-loading' });
    } else {
      toast.dismiss('note-loading');
    }

    if (isError) {
      toast.error('메모를 불러오지 못했습니다.');
    }
  }, [isLoading, isError]);

  const filteredNotes = notes.filter((note) => {
    if (filter === 'all') return true;
    if (filter === 'note' && !note.color) return true;
    if (filter === 'highlight' && highlightColor === note.color) return true;

    return false;
  });

  return (
    <div>
      <NoteFilterTabs selected={filter} onChange={(key) => setFilter(key)} />

      {filter === 'highlight' && (
        <div className="flex gap-2 py-3 justify-center">
          {highlightColors.map((color) => (
            <button
              key={color}
              onClick={() => setHighlightColor(color)}
              className={`w-6 h-6 rounded-full border-2 ${
                highlightColor === color && 'ring-2 ring-blue-500'
              }`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      )}
      <NoteList notes={filteredNotes} />
    </div>
  );
};

export default ReadingNote;
