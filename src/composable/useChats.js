import { ref } from 'vue';
import {
  getFirestore,
  addDoc,
  FieldPath,
  collection,
  getDocs,
  onSnapshot,
  serverTimestamp,
  orderBy,
  query,
  where,
  limit,
} from 'firebase/firestore';

const db = getFirestore();
const chatRef = collection(db, 'chat-global');
const privateChatRef = collection(db, 'chats-private');

// Cache reactivo para referencias de chats privados
const privateRefCache = ref([]);

/**
 * Encapsula la lógica de chats globales y privados
 * @returns {Object} - Métodos y propiedades públicas del composable
 */
export function useChats() {
  // Funciones internas
  async function createPrivateChatRef(from, to) {
    const users = { [from]: true, [to]: true };
    const docRef = await addDoc(privateChatRef, {
      users,
      created_at: serverTimestamp(),
    });
    const id = docRef.id;
    const chatRef = collection(db, `/chats-private/${id}/messages`);

    addRefToCache(users, chatRef);
    return chatRef;
  }

  async function getPrivateChatRef(from, to) {
    const users = { [from]: true, [to]: true };
    const cachedRef = getCachedRef(from, to);
    if (cachedRef) return cachedRef;

    const queryChat = query(privateChatRef, where('users', '==', users), limit(1));
    const snap = await getDocs(queryChat);

    if (snap.empty) {
      return await createPrivateChatRef(from, to);
    }

    const id = snap.docs[0].id;
    const chatRef = collection(db, `/chats-private/${id}/messages`);

    addRefToCache(users, chatRef);
    return chatRef;
  }

  function addRefToCache(users, ref) {
    privateRefCache.value.push({ users, ref });
  }

  function getCachedRef(from, to) {
    return (
      privateRefCache.value.find(
        (refData) => refData.users[from] && refData.users[to]
      )?.ref || null
    );
  }

  // Funciones públicas
  async function saveMessage({ user, message }) {
    const data = { user, message, timestamp: serverTimestamp() };
    try {
      return await addDoc(chatRef, data);
    } catch (err) {
      console.error('Error al grabar el mensaje:', err);
    }
  }

  function subscribeToIncomingMessages(callback) {
    const q = query(chatRef, orderBy('timestamp'));
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => doc.data());
      callback(messages);
    });
  }

  async function savePrivateMessage(from, to, message) {
    const currentChatRef = await getPrivateChatRef(from, to);
    await addDoc(currentChatRef, {
      message,
      user: from,
      created_at: serverTimestamp(),
    });
  }

  async function subscribeToIncomingPrivateMessages(from, to, callback) {
    const ref = await getPrivateChatRef(from, to);
    const queryMessages = query(ref, orderBy('created_at'));
    return onSnapshot(queryMessages, (snapshot) => {
      const docs = snapshot.docs.map((item) => item.data());
      callback(docs);
    });
  }

  async function hasPrivateMessages(from, to) {
    const ref = await getPrivateChatRef(from, to);
    const queryMessages = query(ref, orderBy('created_at'));
    return new Promise((resolve) => {
      onSnapshot(queryMessages, (snapshot) => {
        const docs = snapshot.docs.map((item) => item.data());
        resolve(docs);
      });
    });
  }

  async function getChatsByEmail(email) {
    const chats = [];
    const fieldPath = new FieldPath('users', email);
    try {
      const q = query(
        privateChatRef,
        where(fieldPath, '==', true),
        orderBy('created_at', 'desc')
      );
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        const chat = doc.data();
        chats.push({
          idDoc: doc.id,
          user: chat.users,
          created_at: chat.created_at,
        });
      });
    } catch (err) {
      console.error('Error al obtener chats:', err);
    }
    return chats;
  }

  // Retornar las funciones públicas
  return {
    saveMessage,
    subscribeToIncomingMessages,
    savePrivateMessage,
    subscribeToIncomingPrivateMessages,
    hasPrivateMessages,
    getChatsByEmail,
    privateRefCache, // Opcional: exponer el caché si necesitas inspeccionarlo
  };
}