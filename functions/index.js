import functions from 'firebase-functions';
import express from 'express';
import cors from 'cors';
import JSZip from 'jszip';
import { parseStringPromise } from 'xml2js';

const app = express();
app.use(cors({ origin: true }));
app.use(express.raw({ type: 'application/epub+zip', limit: '50mb' }));

app.post('/check-epub', async (req, res) => {
  try {
    const zip = await JSZip.loadAsync(req.body);
    const mimetype = await zip.file('mimetype')?.async('text');
    const containerXml = await zip
      .file('META-INF/container.xml')
      ?.async('text');

    const parsed = await parseStringPromise(containerXml);
    const opfPath =
      parsed?.container?.rootfiles?.[0]?.rootfile?.[0]?.$?.['full-path'];
    const opfExists = opfPath && zip.file(opfPath);

    const isValid = mimetype?.trim() === 'application/epub+zip' && opfExists;

    res.json({ valid: isValid, opfPath });
  } catch (e) {
    console.error('❌ 검사 실패:', e.message);
    res.status(500).json({ valid: false, error: e.message });
  }
});

export const api = functions.https.onRequest(app);
