import { ref, onUnmounted } from 'vue';
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
const privateChatRef = collection(db, 'chats-private');

// Cache reactivo para referencias de chats privados
const privateRefCache = ref([]);

/**
 * Encapsula la lógica de chats privados
 * @returns {Object} - Métodos y propiedades públicas del composable
 */
export function usePrivateChats() {
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

    if(snap.empty) {
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
    return privateRefCache.value.find(
      (refData) => refData.users[from] && refData.users[to]
    )?.ref || null;
  }

  // Funciones públicas
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
        resolve(!snapshot.empty);
      });
    });
  }

  async function getChatsByEmail(email) {
    const fieldPath = new FieldPath('users', email);
    try {
      const q = query(
        privateChatRef,
        where(fieldPath, '==', true),
        orderBy('created_at', 'desc'),
        limit(1)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      const chatData = doc.data();
      const chatId = doc.id;

      const messagesQuery = query(
        collection(privateChatRef, chatId, 'messages'),
        orderBy('created_at', 'desc'),
        limit(1)
      );
      const messagesSnapshot = await getDocs(messagesQuery);

      if (!messagesSnapshot.empty) {
        const latestMessage = messagesSnapshot.docs[0].data();
        return {
          idDoc: chatId,
          user: chatData.users,
          created_at: chatData.created_at,
          message: latestMessage,
        };
      }

      return null;
    } catch (err) {
      console.error('Error al obtener el último chat:', err);
      return null;
    }
  }

  function subscribeToPrivateChats(email, callback) {
    const fieldPath = new FieldPath('users', email);
    const q = query(
      privateChatRef,
      where(fieldPath, '==', true),
      orderBy('created_at', 'desc')
    );
    const updatedChats = [];
    // instancio unsubscribe para poder cancelar la suscripción
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      for (const doc of snapshot.docs) {
        const chatData = doc.data();
        const chatId = doc.id;

        const messagesQuery = query(
          collection(privateChatRef, chatId, 'messages'),
          orderBy('created_at', 'desc'),
          limit(1)
        );
        const messagesSnapshot = await getDocs(messagesQuery);

        if (!messagesSnapshot.empty) {
          const latestMessage = messagesSnapshot.docs[0].data();
          updatedChats.push({
            idDoc: chatId,
            user: chatData.users,
            created_at: chatData.created_at,
            message: latestMessage,
          });
        }
      }
      callback(updatedChats);
    }, (err) => {
      console.error('Error subscribing to private chats:', err);
    });

    onUnmounted(() => {
      unsubscribe();
    });

    return unsubscribe;
  }

  return {
    savePrivateMessage,
    subscribeToIncomingPrivateMessages,
    hasPrivateMessages,
    getChatsByEmail,
    subscribeToPrivateChats,
    privateRefCache,
  };
}