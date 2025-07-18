import { useState, useEffect } from 'react';
import { format } from 'date-fns';

const NoteModal = ({
  visible,
  onClose,
  onSave,
  highlightInfo = {},
  position,
}) => {
  const [memo, setMemo] = useState('');
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    setMemo(highlightInfo.memo || '');
    setCharCount((highlightInfo.memo || '').length);
  }, [highlightInfo]);

  if (!visible || !position) return null;

  const handleChange = (e) => {
    const val = e.target.value;
    setMemo(val);
    setCharCount(val.length);
  };

  const handleSave = () => {
    if (onSave) onSave(memo);
  };

  return (
    <div
      className="absolute z-50"
      style={{
        top: `${position.top + 40}px`,
        left: `${position.left}px`,
        transform: 'translate(-50%, 0)',
      }}
    >
      <div className="bg-white rounded-xl shadow-lg w-[480px] p-6 relative">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-500 font-medium">
            메모 ({charCount} / 500)
          </span>
          <button
            onClick={handleSave}
            className="text-sm bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-4 py-1 rounded"
          >
            저장
          </button>
        </div>

        <div className="flex items-start space-x-2 mb-4">
          <div
            className="w-4 h-4 rounded-full mt-1 flex-shrink-0"
            style={{ backgroundColor: highlightInfo.color || '#facc15' }}
          ></div>
          <p className="text-sm text-gray-800 whitespace-pre-wrap">
            {highlightInfo.text || '선택된 문장이 없습니다.'}
          </p>
        </div>

        <div className="bg-gray-100 rounded-md p-3 min-h-[100px]">
          <textarea
            className="w-full bg-transparent resize-none outline-none text-sm text-gray-800 placeholder-gray-400"
            rows={4}
            maxLength={500}
            placeholder="메모를 입력해주세요..."
            value={memo}
            onChange={handleChange}
          />
        </div>

        {highlightInfo.createdAt &&
          !isNaN(new Date(highlightInfo.createdAt)) && (
            <p className="text-xs text-gray-400 mt-2 text-right">
              {format(new Date(highlightInfo.createdAt), 'yyyy.MM.dd')}
            </p>
          )}
      </div>
    </div>
  );
};

export default NoteModal;
