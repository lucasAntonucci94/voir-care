import { useAuth } from '../api/auth/useAuth';
import { useClipboard } from '@vueuse/core';

export function useShare() {
  const { user } = useAuth();
  const { copy } = useClipboard();

  // Mock DM sending
  async function sendDM(postId, recipientEmail, message) {
    // Mock validation and processing
    if (!user.value) {
      throw new Error('Usuario no autenticado');
    }
    if (!recipientEmail) {
      throw new Error('Correo del destinatario requerido');
    }

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Log mock message
    // console.log('Mock DM sent:', {
    //   senderId: user.value.uid,
    //   recipientEmail,
    //   postId,
    //   message,
    //   timestamp: new Date().toISOString(),
    // });

    return { success: true };
  }

  // Share via WhatsApp
  function shareViaWhatsApp(post) {
    const url = encodeURIComponent(`https://yourapp.com/post/${post.id}`);
    const text = encodeURIComponent(`Mira esta publicación: ${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }

  // Share via Social Media (Web Share API or fallback)
  async function shareViaSocial(post) {
    const shareData = {
      title: post.title || 'Publicación',
      text: post.description || 'Mira esta publicación',
      url: `https://yourapp.com/post/${post.id}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: Open Twitter share URL as an example
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`;
      window.open(twitterUrl, '_blank');
    }
  }

  // Copy post link
  function copyLink(post) {
    copy(`https://yourapp.com/post/${post.id}`);
    alert('Enlace copiado al portapapeles');
  }

  return { sendDM, shareViaWhatsApp, shareViaSocial, copyLink };
}