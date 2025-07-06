import express from 'express';
import cors from 'cors';

import { parseZip } from '@/utils/parseZip';
import { isValidate } from '@/utils/isValidate';
import { saveFile } from '@/utils/saveFile';

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: 'http://localhost:5173',
      methods: ['POST'],
      allowedHeaders: ['Content-Type', 'x-user-id'],
    })
  );

  app.use(express.raw({ type: 'application/epub+zip', limit: '50mb' }));

  app.post('/upload-epub', async (req, res) => {
    try {
      const contentType = req.headers['content-type'];
      const userId = req.headers['x-user-id'];

      if (contentType !== 'application/epub+zip') {
        return res.status(400).json({ error: '잘못된 Content-Type입니다.' });
      }
      if (!userId) {
        return res
          .status(401)
          .json({ error: '인증된 사용자만 업로드할 수 있습니다.' });
      }

      const { zip, mimetype, parsed } = await parseZip(req);
      isValidate(zip, mimetype, parsed);
      const signedUrl = await saveFile(userId, req.body);

      return res.status(200).json({ success: true, url: signedUrl });
    } catch (err) {
      console.error('🔥 처리 실패:', err.message);
      if (
        err.message.includes('구조 분석 실패') ||
        err.message.includes('OPF') ||
        err.message.includes('EPUB')
      ) {
        return res.status(400).json({ error: err.message });
      }
      return res.status(500).json({ error: '서버 오류' });
    }
  });

  return app;
};
