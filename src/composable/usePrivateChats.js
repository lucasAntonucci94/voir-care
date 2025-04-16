import { ref } from 'vue';
import { doc, getFirestore, addDoc,  updateDoc, increment, FieldPath,  collection, getDocs, onSnapshot, serverTimestamp, orderBy, query, where, limit, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../api/auth/useAuth';


const { user } = useAuth();
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
      const users = [from,to];
      const chatKey = [from, to].sort().join('_');
      const docRef = await addDoc(privateChatRef, {
        users,
        chatKey,
        created_at: serverTimestamp(),
        unreadCount: {
          [from]: 0,
          [to]: 0
        }
      });
      const id = docRef.id;
      const chatRef = collection(db, `/chats-private/${id}/messages`);

      addRefToCache(users, chatRef);
      return chatRef;
    }

    async function getPrivateChatRef(from, to) {
      // const users = { [from]: true, [to]: true };
      const users = [from,to];
      const cachedRef = getCachedRef(from, to);
      if (cachedRef) return cachedRef;

      const chatKey = [from, to].sort().join('_');
      const queryChat = query(
        privateChatRef,
        where('chatKey', '==', chatKey),
        limit(1)
      );
      // const queryChat = query(privateChatRef, where('users', '==', users), limit(1));
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
      return privateRefCache.value.find(refData =>
        refData.users.includes(from) && refData.users.includes(to)
      )?.ref || null;
    }

    // Funciones públicas
    async function savePrivateMessage(from, to, message) {
      const currentChatRef = await getPrivateChatRef(from, to);
      const chatId = currentChatRef.path.split('/')[1]; // Extraer chatId
      const senderEmail = user?.value?.email ?? from;
    
      await addDoc(currentChatRef, {
        message,
        user: {
          email: senderEmail,
          displayName: user?.value?.displayName,
          photoURLFile: user?.value?.photoURLFile
        },
        created_at: serverTimestamp(),
        readBy: [senderEmail]
      });
    
      // Incrementar unreadCount del receptor
      const chatDocRef = doc(db, 'chats-private', chatId);
      await updateDoc(chatDocRef, new FieldPath('unreadCount', to), increment(1));
    }

    async function markMessagesAsRead(chatId, userEmail) {
      debugger
      const messagesRef = collection(db, 'chats-private', chatId, 'messages');
      const q = query(messagesRef, where('readBy', 'array-contains', userEmail));
      const snapshot = await getDocs(q);
  
      let unreadCountReduction = 0;
      const updates = snapshot.docs.map(async (msgDoc) => {
        const msgData = msgDoc.data();
        if (!msgData.readBy.includes(userEmail)) {
          await updateDoc(doc(messagesRef, msgDoc.id), {
            readBy: arrayUnion(userEmail)
          });
          unreadCountReduction++;
        }
      });
  
      await Promise.all(updates);
  
      if (unreadCountReduction > 0) {
        const chatDocRef = doc(db, 'chats-private', chatId);
        await updateDoc(chatDocRef, {
          [`unreadCount.${userEmail}`]: increment(-unreadCountReduction)
        });
      }
    }

    async function subscribeToIncomingPrivateMessages(from, to, callback) {
        const ref = await getPrivateChatRef(from, to);
        const queryMessages = query(ref, orderBy('created_at'));
        return onSnapshot(queryMessages, (snapshot) => {
          const messages = snapshot.docs.map((doc) => {
          const message = doc.data();
          return {
              idDoc: doc.id,
              message: message.message,
              user: message.user,
              created_at: message.created_at,
              readBy: message.readBy
            };
        }
        );
        callback(messages);
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

    /**
     * Elimina un chat junto con su subcolección de mensajes.
     * @param {string} chatId - ID del chat
     */
    async function deleteChat(chatId) {
      try {
        const chatRef = doc(db, 'chats-private', chatId);
        const messagesRef = collection(chatRef, 'messages');

        // Obtener todos los mensajes del chat
        const messagesSnap = await getDocs(messagesRef);

        // Eliminar cada mensaje individualmente
        const deletePromises = messagesSnap.docs.map((messageDoc) =>
          deleteDoc(messageDoc.ref)
        );
        await Promise.all(deletePromises);

        // Eliminar el documento del chat
        await deleteDoc(chatRef);

        console.log('Chat y mensajes eliminados correctamente.');
      } catch (err) {
        console.error('Error al eliminar el chat y sus mensajes:', err);
        throw err;
      }
    }
  
  /**
   * Elimina un mensaje específico de un chat por su chatId y messageId.
   * @param {string} chatId - ID del chat
   * @param {string} messageId - ID del mensaje
   * @returns {Promise<void>}
   */
    async function deleteChatMessage(chatId, messageId) {
      try {
        // Referencia al documento específico del mensaje dentro de la subcolección 'messages'
        const messageRef = doc(db, 'chats-private', chatId, 'messages', messageId);
        await deleteDoc(messageRef);
      } catch (err) {
        console.error('Error al eliminar el mensaje:', err);
        throw err;
      }
    }

   /**
   * Hereado de proyecto viejo, adaptado en la subscripción
   * @param {*} email 
   * @returns 
   */
    async function getChatsByEmail(email) {
      try {
        const q = query(
          privateChatRef,
          where('users', 'array-contains', email),
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
            users: chatData.users,
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

    /**
     * Obtiene el chatId de un chat privado entre dos usuarios específicos. Si no existe, lo crea.
     * @param {string} authUser Email del usuario autenticado
     * @param {string} activeUser Email del usuario activo
     * @returns {Promise<string>} Retorna el chatId existente o el del chat recién creado
     */
    async function getChatIdByReference(authUser, activeUser) {
      try {
        const chatKey = [authUser, activeUser].sort().join('_');
        const q = query(
          privateChatRef,
          where('chatKey', '==', chatKey)
        );
    
        const querySnapshot = await getDocs(q);
    
        if (querySnapshot.empty) {
          const newChatRef = await createPrivateChatRef(authUser, activeUser);
          return newChatRef.path.split('/')[1]; // Extraer el ID del path
        }
    
        return querySnapshot.docs[0].id; // Retornar el ID del chat existente
      } catch (err) {
        console.error('Error al obtener o crear el chatId por referencia:', err);
        throw err;
      }
    }

    function subscribeToPrivateChats(email, callback) {
      const q = query(
        privateChatRef,
        where('users', 'array-contains', email),
        orderBy('created_at', 'desc')
      );
      const updatedChats = [];
      
      const unsubscribe = onSnapshot(q, async (snapshot) => {
        for (const doc of snapshot.docs) {
          const chatData = doc.data();
          const chatId = doc.id;
          
          // Validar que users sea un array válido
          if (!isValidUsers(chatData.users)) {
            console.warn(`Chat ${chatId} tiene referencias inválidas y será omitido`);
            continue;
          }
    
          const messagesQuery = query(
            collection(privateChatRef, chatId, 'messages'),
            orderBy('created_at', 'desc'),
            limit(1)
          );
          const messagesSnapshot = await getDocs(messagesQuery);
          let latestMessage = null;
    
          if (!messagesSnapshot.empty) {
            latestMessage = messagesSnapshot.docs[0].data();
          }
    
          updatedChats.push({
            idDoc: chatId,
            users: chatData.users,
            created_at: chatData.created_at,
            message: latestMessage,
            unreadCount: chatData.unreadCount
          });
        }
        callback(filterUniqueChats(updatedChats));
      }, (err) => {
        console.error('Error subscribing to private chats:', err);
      });
    
      return unsubscribe;
    }

    // Función auxiliar para validar el array users
    function isValidUsers(users) {
      if (!Array.isArray(users) || users.length === 0) {
        return false;
      }

      return users.every(email => 
        email !== null && 
        email !== undefined && 
        typeof email === 'string' && 
        email.trim() !== '' && 
        email.includes('@')
      );
    }

    /**
     * Metodo para quitar duplicados
     * @param {*} chats 
     * @returns chats filtrados / Distinct
     */
    function filterUniqueChats(chats){
      const uniqueIds = new Set();
      return chats.filter(chat => {
        if (uniqueIds.has(chat.idDoc)) {
          return false; // Si es duplicado lo filtramos
        }
        uniqueIds.add(chat.idDoc);
        return true; // sino lo mantenemos
      });
    };

    const resetUnreadCount = async (chatId, userEmail) => {
      const chatDocRef = doc(db, 'chats-private', chatId);
      await updateDoc(chatDocRef, {
        [`unreadCount.${userEmail}`]: 0
      });
    };

    
  return {
    savePrivateMessage,
    subscribeToIncomingPrivateMessages,
    hasPrivateMessages,
    getChatsByEmail,
    subscribeToPrivateChats,
    deleteChat,
    deleteChatMessage,
    privateRefCache,
    getChatIdByReference,
    markMessagesAsRead
  };
}