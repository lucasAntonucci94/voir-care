import { ref } from 'vue';
import { doc, getFirestore, addDoc,  FieldPath, collection, getDocs, onSnapshot, serverTimestamp, orderBy, query, where, limit, deleteDoc } from 'firebase/firestore';
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
        user: {
          email: user?.value?.email ?? from,
          displayName: user?.value?.displayName,
          photoURLFile: user?.value?.photoURLFile
        },
        created_at: serverTimestamp(),
      });
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
     * Elimina un chat por su ID.
     * @param {string} id - ID del chat
     * @returns {Promise<void>}
     */
    async function deleteChat(chatId) {
      try {
        const docRef = doc(db, 'chats-private', chatId);
        await deleteDoc(docRef);
      } catch (err) {
        console.error('Error al eliminar post:', err);
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

  /**
   * Obtiene el chatId de un chat privado entre dos usuarios específicos
   * @param {string} activeUser Email del usuario activo
   * @param {string} authUser Email del usuario autenticado
   * @returns {Promise<string|null>} Retorna el chatId si existe, null si no se encuentra
   */
  async function getChatIdByReference(authUser, activeUser) {
    try {
      const fieldPath = new FieldPath('users', authUser);

      // Crear la query buscando donde ambos usuarios existen con valor true
      const q = query(
        privateChatRef,
        where(fieldPath, '==', true),
        orderBy('created_at', 'desc'),
       );
      
      // Ejecutar la query
      const querySnapshot = await getDocs(q);

      // Si no hay resultados, retornar null
      if (querySnapshot.empty) {
        return null;
      }
      debugger
      // Filtrar los documentos para encontrar el que contiene activeUser
      const chatDoc = querySnapshot.docs.find((doc) => {
      debugger
      const docData = doc.data();
      return docData.users && docData.users[activeUser] === true;
    });
    debugger

    // Retornar el id si se encuentra, null si no
    return chatDoc ? chatDoc.id : null;

    } catch (err) {
      console.error('Error al obtener el chatId por referencia:', err);
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
        callback(filterUniqueChats(updatedChats));
      }, (err) => {
        console.error('Error subscribing to private chats:', err);
      });   
        
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

      return unsubscribe;
    }

    return {
      savePrivateMessage,
      subscribeToIncomingPrivateMessages,
      hasPrivateMessages,
      getChatsByEmail,
      subscribeToPrivateChats,
      deleteChat,
      deleteChatMessage,
      privateRefCache,
      getChatIdByReference
    };
}