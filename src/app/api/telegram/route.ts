import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramNotification } from '@/lib/telegram';
import { AnnouncementPriority } from '@/types/database';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, content, priority, authorName, authorTitle } = body;

    if (!title || !content || !priority) {
      return NextResponse.json(
        { error: 'Başlık, içerik ve öncelik alanları zorunludur' },
        { status: 400 }
      );
    }

    const result = await sendTelegramNotification({
      title,
      content,
      priority: priority as AnnouncementPriority,
      authorName: authorName || 'HYMF Üyesi',
      authorTitle: authorTitle || 'Araştırmacı',
    });

    return NextResponse.json({
      success: result.success,
      messageId: result.messageId,
      error: result.error,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
