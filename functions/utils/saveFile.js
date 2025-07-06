import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';

export const saveFile = async (userId, body) => {
  const filename = `${uuidv4()}_${Date.now()}.epub`;
  const storage = new Storage();
  const bucket = storage.bucket('record-247.firebasestorage.app');
  const file = bucket.file(`books/${userId}/${filename}`);

  await file.save(body, {
    metadata: { contentType: 'application/epub+zip' },
  });

  const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;
  const [signedUrl] = await file.getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + ONE_DAY_IN_MS,
  });
  return signedUrl;
};
