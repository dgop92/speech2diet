import {
  Firestore,
  CollectionReference,
  DocumentData,
} from "firebase-admin/firestore";

export const createFirestoreCollection = <T = DocumentData>(
  firestore: Firestore,
  collectionName: string
) => firestore.collection(collectionName) as CollectionReference<T>;

export type FirestoreCollection<T = DocumentData> = CollectionReference<T>;
