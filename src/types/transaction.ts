// Transaction types for Nexus Syndicate
import { TransactionType, TransactionStatus } from '../services/firestoreService';

// Transaction status for Firestore
export enum FirestoreTransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

// Transaction interface for blockchain transactions
export interface BlockchainTransaction {
  hash: string;
  status: "pending" | "success" | "failed";
  timestamp: number;
}

// Transaction interface for Firestore
export interface FirestoreTransaction {
  id?: string;
  userId: string;
  txHash: string;
  type: TransactionType;
  itemId: string;
  itemName: string;
  itemType: 'resource' | 'nft';
  quantity: number;
  price: number;
  status: FirestoreTransactionStatus;
  createdAt: Date;
  updatedAt?: Date;
}

export default {
  FirestoreTransactionStatus,
  TransactionType
};
