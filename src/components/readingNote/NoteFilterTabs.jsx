const NoteFilterTabs = ({ selected, onChange }) => {
  const tabs = [
    { key: 'all', label: '전체' },
    { key: 'highlight', label: '형광펜' },
    { key: 'note', label: '메모' },
  ];

  return (
    <div className="flex border-b">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`flex-1 text-center px-2 py-2 text-sm sm:text-base border-b-2 transition-all ${
            selected === tab.key
              ? 'border-black font-semibold'
              : 'border-transparent text-gray-400'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default NoteFilterTabs;
