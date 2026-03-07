import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getReminderById, updateReminder, deleteReminder } from '@/lib/api/reminders';
import { updateReminderSchema } from '@/lib/validations/reminder.schemas';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reminder = await getReminderById(user.id, id);
    
    if (!reminder) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ data: reminder });
  } catch (err) {
    console.error('[API Error]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      const validated = await updateReminderSchema.validate(body, {
        abortEarly: false,
      });
      const reminder = await updateReminder(user.id, id, validated);
      return NextResponse.json({ data: reminder });
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    
    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await deleteReminder(user.id, id);
    return NextResponse.json({ data: { success: true } });
  } catch (err) {
    console.error('[API Error]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
