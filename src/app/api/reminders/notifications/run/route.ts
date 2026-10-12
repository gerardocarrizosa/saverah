import { NextRequest, NextResponse } from 'next/server';
import { runReminderEmailNotifications } from '@/lib/api/reminderNotifications';

function isAuthorized(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get('authorization');

  return Boolean(
    cronSecret && authHeader === `Bearer ${cronSecret}`,
  );
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const notificationDate =
      typeof body.notification_date === 'string'
        ? body.notification_date
        : undefined;
    const result = await runReminderEmailNotifications(notificationDate);

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('[API Error]', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 },
    );
  }
}
