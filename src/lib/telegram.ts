import { AnnouncementPriority } from '@/types/database';

interface SendTelegramNotificationParams {
  title: string;
  content: string;
  priority: AnnouncementPriority;
  authorName: string;
  authorTitle?: string;
  linkUrl?: string;
}

export async function sendTelegramNotification({
  title,
  content,
  priority,
  authorName,
  authorTitle = 'Araştırmacı',
  linkUrl,
}: SendTelegramNotificationParams): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId || botToken === 'your_telegram_bot_token') {
    console.warn('[Telegram] Bot token veya Chat ID yapılandırılmamış, bildirim atlanıyor.');
    return { success: false, error: 'Telegram bot bilgileri ayarlanmamış' };
  }

  // Yalnızca Acil ve Toplantı için bildirimli gönderim (PDF kuralı: diğerleri sessiz veya portalda kalır)
  const isUrgentOrMeeting = priority === 'acil' || priority === 'toplanti';
  const disableNotification = !isUrgentOrMeeting;

  // Başlık emojileri ve formatlama
  const badgeMap: Record<AnnouncementPriority, string> = {
    acil: '🚨 <b>[HYMF ACİL DUYURU]</b>',
    toplanti: '📅 <b>[HYMF TOPLANTI BİLDİRİMİ]</b>',
    soru_yardim: '💬 <b>[HYMF SORU / YARDIM]</b>',
    kaynak_paylasimi: '📚 <b>[HYMF YENİ KAYNAK]</b>',
  };

  const badge = badgeMap[priority] || '📢 <b>[HYMF DUYURU]</b>';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const destinationUrl = linkUrl || `${siteUrl}/duyurular`;

  const htmlMessage = `
${badge}

<b>${escapeHtml(title)}</b>

${escapeHtml(content)}

━━━━━━━━━━━━━━━━━━━━
👤 <b>Ekleyen:</b> ${escapeHtml(authorName)} (${escapeHtml(authorTitle)})
🔗 <a href="${destinationUrl}">HYMF Portalında Görüntüle</a>
`.trim();

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: htmlMessage,
        parse_mode: 'HTML',
        disable_web_page_preview: false,
        disable_notification: disableNotification,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      console.error('[Telegram] Mesaj gönderilemedi:', data);
      return { success: false, error: data.description || 'Telegram API hatası' };
    }

    return { success: true, messageId: String(data.result?.message_id) };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Bilinmeyen bağlantı hatası';
    console.error('[Telegram] İstek hatası:', errorMsg);
    return { success: false, error: errorMsg };
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
