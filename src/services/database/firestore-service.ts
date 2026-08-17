import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { auth, db } from "../../firebase";

export interface QRCodeData {
  id: string;
  userId: string;
  targetUrl: string;
  counter: number;
  createdAt?: unknown;
}

const QR_CODES_COLLECTION = "qrCodes";

/**
 * Aktuell eingeloggten Benutzer holen
 */
const getCurrentUser = () => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Kein Benutzer eingeloggt.");
  }

  return user;
};


/**
 * Alle QR-Codes des aktuell eingeloggten Users laden
 */
export const getQRCodes = async (): Promise<QRCodeData[]> => {
  const user = getCurrentUser();

  const qrCodesRef = collection(
    db,
    QR_CODES_COLLECTION
  );

  const q = query(
    qrCodesRef,
    where("userId", "==", user.uid)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((document) => {
    const data = document.data();

    return {
      id: document.id,
      userId: data.userId,
      targetUrl: data.targetUrl,
      counter: data.counter ?? 0,
      createdAt: data.createdAt,
    };
  });
};


/**
 * Neuen QR-Code erstellen
 *
 * Dabei wird automatisch die UID des aktuell
 * eingeloggten Users gespeichert.
 */
export const createQRCode = async (
  targetUrl: string
): Promise<string> => {
  const user = getCurrentUser();

  const qrCodesRef = collection(
    db,
    QR_CODES_COLLECTION
  );

  const document = await addDoc(qrCodesRef, {
    userId: user.uid,
    targetUrl: targetUrl.trim(),
    counter: 0,
    createdAt: serverTimestamp(),
  });

  return document.id;
};


/**
 * Einen einzelnen QR-Code laden
 *
 * Diese Funktion wird beim Scannen verwendet.
 *
 * Wichtig:
 * Der Scanner muss NICHT eingeloggt sein.
 */
export const getQRCode = async (
  id: string
): Promise<QRCodeData | null> => {
  const qrRef = doc(
    db,
    QR_CODES_COLLECTION,
    id
  );

  const snapshot = await getDoc(qrRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data();

  return {
    id: snapshot.id,
    userId: data.userId,
    targetUrl: data.targetUrl,
    counter: data.counter ?? 0,
    createdAt: data.createdAt,
  };
};


/**
 * Counter eines QR-Codes um 1 erhöhen
 */
export const incrementQRCodeCounter = async (
  id: string
): Promise<void> => {
  const qrRef = doc(
    db,
    QR_CODES_COLLECTION,
    id
  );

  await updateDoc(qrRef, {
    counter: increment(1),
  });
};