import JSZip from 'jszip';
import toast from 'react-hot-toast';

export const isValidEpubFile = async (file) => {
  try {
    if (!file.name.endsWith('.epub')) {
      toast.error('EPUB 파일만 업로드 가능합니다.');
      return;
    }
    const buffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(buffer);

    const containerFile = zip.file('META-INF/container.xml');
    if (!containerFile) return false;

    const mimetypeFile = zip.file('mimetype');
    const hasMimetypeText =
      mimetypeFile &&
      (await mimetypeFile.async('text')).trim() === 'application/epub+zip';

    const containerXml = await containerFile.async('text');
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(containerXml, 'application/xml');

    const opfPath = xmlDoc.querySelector('rootfile')?.getAttribute('full-path');
    const hasOpfFile = Boolean(opfPath && zip.file(opfPath));

    const isValidFile = Boolean(hasMimetypeText && hasOpfFile);
    return isValidFile;
  } catch (error) {
    toast.error('유효하지 않은 EPUB 파일입니다');
    return false;
  }
};
