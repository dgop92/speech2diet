import { HealthData } from "@features/auth/entities/health-data";
import { Timestamp } from "firebase-admin/firestore";

// userId is used as the document identifier
export type FirestoreAppUser = {
  // this id is an attribute in the document and for now is the same as the userId
  id: string;
  firstName: string;
  lastName: string;
  healthData: HealthData;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deletedAt: Timestamp | null;
};
