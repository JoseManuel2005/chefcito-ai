// lib/firebaseAdmin.ts
import { getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

if (!getApps().length) {
  initializeApp({
    credential: {
      getAccessToken: () => {
        return Promise.resolve({
          access_token: process.env.FIREBASE_PRIVATE_KEY!,
          expires_in: 3600,
        });
      },
    },
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

export const adminAuth = getAuth();