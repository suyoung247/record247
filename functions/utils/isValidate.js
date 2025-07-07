export const isValidate = (zip, mimetype, parsed) => {
  const container = parsed?.container;
  const rootfiles = container?.rootfile?.[0];
  const rootfile = rootfiles?.rootfile?.[0];
  const opfPath = rootfile?.$?.['full-path'];

  if (!opfPath || !zip.file(opfPath)) {
    throw new Error('OPF 경로나 파일 없음');
  }

  if (mimetype?.trim() !== 'application/epub+zip') {
    throw new Error('유효하지 않은 EPUB');
  }
};