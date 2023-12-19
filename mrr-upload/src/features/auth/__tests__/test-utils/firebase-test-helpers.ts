import { FirestoreCollection } from "@common/firebase/utils";

export const RANDOM_USER_ID = "G1J2tcEfOFYBycm8ZcXi9tZjN852";

export async function deleteAllDocumentsFromCollection<T>(
  collection: FirestoreCollection<T>
) {
  const documents = await collection.get();
  const promises = documents.docs.map((doc) => doc.ref.delete());
  await Promise.all(promises);
}
