export const extractCfiFromSelection = (range, contents) => {
  if (!range || !contents || typeof contents.cfiFromRange !== 'function') {
    console.warn('❌ 유효하지 않은 입력값으로 인해 CFI 추출 실패');
    return null;
  }

  try {
    const cfi = contents.cfiFromRange(range);
    return cfi;
  } catch (err) {
    console.error('💥 CFI 추출 중 오류 발생:', err);
    return null;
  }
};
