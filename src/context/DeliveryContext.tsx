import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { 
  db, auth, onAuthStateChanged, onSnapshot, collection, doc, setDoc, deleteDoc, updateDoc, query, where, User, getDoc 
} from "../firebase";

export interface Delivery {
  id: string;
  customer: string;
  address: string;
  type: string;
  value: string;
  status: string;
  eta: string;
  quantity?: number;
  sugarCane?: number;
  unitPrice?: number;
  deliveryDateTime?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  observations?: string;
  paymentDate?: string;
  ownerUid?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  joinDate: string;
  ownerUid?: string;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface DeliveryContextType {
  allDeliveries: Delivery[];
  customers: Customer[];
  addDelivery: (delivery: Delivery) => void;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;
  deleteDelivery: (id: string) => void;
  updateDelivery: (delivery: Delivery) => void;
  setAllDeliveries: (deliveries: Delivery[]) => void;
  user: User | null;
  loading: boolean;
}

const DeliveryContext = createContext<DeliveryContextType | undefined>(undefined);

export const DeliveryProvider = ({ children }: { children: ReactNode }) => {
  const [allDeliveries, setAllDeliveries] = useState<Delivery[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (!userDoc.exists()) {
            const adminEmails = ["ramosryan020@gmail.com", "wrizckryan123@gmail.com", "kicanarenato@gmail.com"];
            await setDoc(userDocRef, {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              role: adminEmails.includes(currentUser.email || "") ? "admin" : "user"
            });
          }
        } catch (error) {
          console.error("Error creating user profile:", error);
        }
      }
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      setAllDeliveries([]);
      setCustomers([]);
      return;
    }

    const qDeliveries = query(collection(db, "deliveries"), where("ownerUid", "==", user.uid));
    const unsubscribeDeliveries = onSnapshot(qDeliveries, (snapshot) => {
      const docs = snapshot.docs.map(doc => doc.data() as Delivery);
      setAllDeliveries(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "deliveries");
    });

    const qCustomers = query(collection(db, "customers"), where("ownerUid", "==", user.uid));
    const unsubscribeCustomers = onSnapshot(qCustomers, (snapshot) => {
      const docs = snapshot.docs.map(doc => doc.data() as Customer);
      setCustomers(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "customers");
    });

    return () => {
      unsubscribeDeliveries();
      unsubscribeCustomers();
    };
  }, [user]);

  const addDelivery = async (delivery: Delivery) => {
    if (!user) return;
    const path = `deliveries/${delivery.id}`;
    try {
      await setDoc(doc(db, "deliveries", delivery.id), { ...delivery, ownerUid: user.uid });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const addCustomer = async (customer: Customer) => {
    if (!user) return;
    const path = `customers/${customer.id}`;
    try {
      await setDoc(doc(db, "customers", customer.id), { ...customer, ownerUid: user.uid });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const updateCustomer = async (updatedCustomer: Customer) => {
    if (!user) return;
    const path = `customers/${updatedCustomer.id}`;
    try {
      await updateDoc(doc(db, "customers", updatedCustomer.id), { ...updatedCustomer });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const deleteCustomer = async (id: string) => {
    if (!user) return;
    const path = `customers/${id}`;
    try {
      await deleteDoc(doc(db, "customers", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const deleteDelivery = async (id: string) => {
    if (!user) return;
    const path = `deliveries/${id}`;
    try {
      await deleteDoc(doc(db, "deliveries", id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const updateDelivery = async (updatedDelivery: Delivery) => {
    if (!user) return;
    const path = `deliveries/${updatedDelivery.id}`;
    try {
      await updateDoc(doc(db, "deliveries", updatedDelivery.id), { ...updatedDelivery });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  return (
    <DeliveryContext.Provider value={{ 
      allDeliveries, customers, addDelivery, addCustomer, updateCustomer, deleteCustomer, deleteDelivery, updateDelivery, setAllDeliveries,
      user, loading
    }}>
      {children}
    </DeliveryContext.Provider>
  );
};

export const useDeliveries = () => {
  const context = useContext(DeliveryContext);
  if (context === undefined) {
    throw new Error("useDeliveries must be used within a DeliveryProvider");
  }
  return context;
};
