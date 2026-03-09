import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { Messaging, getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

/**
 * Returns Firebase Messaging instance, or null if not supported (e.g. SSR, Safari without permission).
 */
export const getFirebaseMessaging = async (): Promise<Messaging | null> => {
  const supported = await isSupported();
  if (!supported) return null;
  return getMessaging(app);
};

export default app;