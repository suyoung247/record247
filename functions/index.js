import 'module-alias/register';
import { onRequest } from 'firebase-functions/v2/https';
import { createApp } from '@/app';
export const api = onRequest(
  {
    region: 'us-central1',
    memory: '512MiB',
    cpu: 1,
    timeoutSeconds: 60,
    maxInstances: 10,
  },
  createApp()
);
