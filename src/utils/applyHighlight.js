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

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  await delay(100);

  const contents = rendition.getContents();
  contents.forEach((content) => {
    const iframe = content.document?.defaultView?.frameElement;
    if (!iframe) return;

    const svgRects = iframe.contentDocument?.querySelectorAll(
      `.${className} rect`
    );

    if (!svgRects || svgRects.length === 0) {
      console.warn('❌ 하이라이트 시각화 실패', {
        highlight,
        cfi,
        className,
      });

      return;
    }

    svgRects.forEach((rect) => {
      rect.style.fill = color || 'yellow';
      rect.style.fillOpacity = '0.5';
    });
  });
};
