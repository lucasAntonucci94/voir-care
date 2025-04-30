import {
    getFirestore,
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    doc,
    getDocs,
    writeBatch,
    updateDoc,
    addDoc,
    serverTimestamp,
    deleteDoc,
  } from 'firebase/firestore'
  
  const db = getFirestore()
  
  export function useNotifications() {
    function subscribeToAllUserNotifications(uid, callback) {
      const notifRef = collection(db, `users/${uid}/notifications`)
      const q = query(notifRef, orderBy('createdAt', 'desc'))
  
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        callback(notifs)
      })
  
      return unsubscribe
    }
    function subscribeToUnreadUserNotifications(uid, callback) {
        const notifRef = collection(db, `users/${uid}/notifications`)
        const q = query(
          notifRef,
          where('read', '==', false),
          orderBy('createdAt', 'desc')
        )
      
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const unreadNotifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
          callback(unreadNotifs)
        })
      
        return unsubscribe
    }
    async function markNotificationAsRead(uid, notifId) {
        try {
            const notifDoc = doc(db, `users/${uid}/notifications`, notifId)
            await updateDoc(notifDoc, { read: true })
        } catch (err) {
            console.error('Error al marcar como leída:', err)
        }
    }
  
    async function sendNotification({ toUid, fromUid, type, message, entityId, entityType, extra = {} }) {
        try{
            const notifRef = collection(db, `users/${toUid}/notifications`)
            await addDoc(notifRef, {
                type,
                senderId: fromUid,
                recipientId: toUid,
                entityId,
                entityType,
                message,
                createdAt: serverTimestamp(),
                read: false,
                viewed: false,
                extra
            })
        } catch (err) {
            console.error('Error al enviar notificación:', err)
        }
    }
    
    async function markNotificationAsViewed(uid, notifId) {
        const notifRef = doc(db, `users/${uid}/notifications`, notifId)
        await updateDoc(notifRef, { viewed: true })
    }
    
    async function markAllAsViewed(uid) {
        const q = query(
            collection(db, `users/${uid}/notifications`),
            where('viewed', '==', false)
        )
        const snapshot = await getDocs(q)
        const batch = writeBatch(db)
        snapshot.forEach(doc => {
            batch.update(doc.ref, { viewed: true })
        })
        await batch.commit()
    }
    
    async function markNotificationAsUnread(uid, notifId) {
      try {
        const notifDoc = doc(db, `users/${uid}/notifications`, notifId)
        await updateDoc(notifDoc, { read: false })
      } catch (err) {
        console.error('Error al marcar como no leída:', err)
      }
    }

    async function deleteNotification(uid, notifId) {
      try {
        const notifDoc = doc(db, `users/${uid}/notifications`, notifId)
        await deleteDoc(notifDoc)
      } catch (err) {
        console.error('Error al eliminar notificación:', err)
      }
    }

    return {
      subscribeToAllUserNotifications,
      subscribeToUnreadUserNotifications,
      markNotificationAsRead,
      sendNotification,
      markNotificationAsViewed,
      markAllAsViewed,
      markNotificationAsUnread,
      deleteNotification,
    }
  }
  