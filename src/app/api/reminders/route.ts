import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getReminders, createReminder } from '@/lib/api/reminders';
import { createReminderSchema } from '@/lib/validations/reminder.schemas';

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reminders = await getReminders(user.id);
    return NextResponse.json({ data: reminders });
  } catch (err) {
    console.error('[API Error]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    try {
      const validated = await createReminderSchema.validate(body, {
        abortEarly: false,
      });
      const reminder = await createReminder(user.id, validated);
      return NextResponse.json({ data: reminder }, { status: 201 });
    } catch (validationError: unknown) {
      const errorMessage = validationError instanceof Error ? validationError.message : 'Validation error';
      return NextResponse.json(
        { error: errorMessage },
        { status: 422 },
      );
    }
  } catch (err) {
    console.error('[API Error]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
