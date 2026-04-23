import { getApps, initializeApp, cert, getApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID!,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

const adminApp =
  getApps().length === 0
    ? initializeApp({ credential: cert(serviceAccount) })
    : getApp();

export const adminMessaging = getMessaging(adminApp);
export default adminApp;