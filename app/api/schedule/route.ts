import { getEmailSchedule } from '@/domain/email/schedule/scheduleActions';
import { NextRequest } from 'next/server';

// This route allows the server to process and cache schedule-generation logic.
export async function GET(request: NextRequest) {
    const offset = request.nextUrl.searchParams.get('sessionOffset') || '0';
    const queries = request.nextUrl.searchParams.get('searchQuery') || '';
    const refresh = request.nextUrl.searchParams.get('refresh') || 'false';

    const data = await getEmailSchedule(
        parseInt(offset as string),
        queries.split(','),
        refresh === 'true' ? true : false
    )

    return Response.json(data);
}