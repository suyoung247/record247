export async function getToolbarPositionFromCfi({ rendition, cfi, viewerRef }) {
  if (!rendition || !cfi || !viewerRef?.current) return null;

  try {
    const range = await rendition.getRange(cfi);
    if (!range) return null;

    const rects = range.getClientRects();
    const firstRect = rects[0];
    if (!firstRect) return null;

    const contents = rendition.getContents();
    const content = contents.find((content) => {
      return content.document?.contains?.(range.startContainer) ?? false;
    });

    if (!content) return null;

    const viewerRect = viewerRef.current.getBoundingClientRect();

    const top = firstRect.top + content.window.scrollY - viewerRect.top - 40;
    const left =
      firstRect.left +
      content.window.scrollX -
      viewerRect.left +
      firstRect.width / 2;

    return { top, left };
  } catch (err) {
    console.error('📌 툴바 위치 계산 실패:', err);
    return null;
  }
}
