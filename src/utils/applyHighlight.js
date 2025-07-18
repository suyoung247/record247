function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const applyHighlight = async (rendition, highlight, onClick) => {
  const { cfi, id, color } = highlight;

  if (!cfi || !id) {
    console.warn('❌ highlight 파라미터에 cfi 또는 id 누락됨');
    return;
  }

  const className = `epubjs-hl-highlight-${id}`;
  rendition.annotations.remove(cfi, 'highlight');

  rendition.annotations.highlight(
    cfi,
    {},
    (e) => {
      e.stopPropagation();
      if (onClick) onClick(highlight);
    },
    className
  );

  await delay(100);

  const contents = rendition.getContents();
  contents.forEach((content) => {
    const iframe = content.document?.defaultView?.frameElement;
    if (!iframe) return;

    const svgRects = iframe.contentDocument?.querySelectorAll(
      `.${className} rect`
    );
    if (!svgRects || svgRects.length === 0) {
      console.warn('❌ rect 없음, 하지만 하이라이트는 추가됨');
      return;
    }

    svgRects.forEach((rect) => {
      rect.style.fill = color || 'yellow';
      rect.style.fillOpacity = '0.5';
    });
  });
};
