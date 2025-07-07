import JSZip from 'jszip';
import { parseStringPromise } from 'xml2js';

export const parseZip = async (req) => {
  try {
    const zip = await JSZip.loadAsync(req.body);
    const mimetype = await zip.file('mimetype')?.async('text');
    const containerXml = await zip
      .file('META-INF/container.xml')
      ?.async('text');
    const parsed = await parseStringPromise(containerXml);
    return { zip, mimetype, parsed };
  } catch (err) {
    console.error('📦 EPUB 압축 해제/파싱 실패:', err);
    throw new Error('EPUB 구조 분석 실패');
  }
};
