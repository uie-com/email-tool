import moment from "moment-timezone";
import { Moment } from "moment-timezone";
import { MIN_DAYS_IN_BREAK, SESSION_BASE, SESSION_TABLE } from "../settings/schedule";

export type AirtableSessionRecord = {
    id: string;
    fields: {
        "Date": string;
        "Sync Source": string;
        "Calendar Title": string;
        "Cohort": string[];
    };
}

export type Session = {
    "id": string;
    "Session Date": Date;
    "Program": string;
    "Topic"?: string;
    "Session Type"?: string;
    "Cohort"?: string;
    "Is Transition"?: string;
    "Is Before Break"?: string;
    "Is After Break"?: string;

    [key: string]: any;
}

async function fetchRecords(): Promise<AirtableSessionRecord[]> {
    let records: AirtableSessionRecord[] = [];
    let offset: string | undefined = '';

    while (offset !== undefined) {
        const response: Response = await fetch(`https://api.airtable.com/v0/${SESSION_BASE}/${SESSION_TABLE}${offset ? '?offset=' + offset : ''}`, {
            headers: {
                Authorization: `Bearer ${process.env.AIRTABLE_READ_API_KEY}`,
            },
        });
        const data = await response.json()
        if (data.records) {
            records = records.concat(data.records);
        }
        offset = data.offset ?? undefined;
    }
    return records;
}

export async function getSessionSchedule() {
    let sessions: Session[] = [];
    try {
        let records: AirtableSessionRecord[] = await fetchRecords();

        records.forEach((record) => {
            const cohorts = record.fields["Cohort"];
            const date = record.fields["Date"];
            const program = record.fields["Sync Source"];
            const splitTitle = record.fields["Calendar Title"].split("•");
            let topic = (splitTitle.length === 3) ? splitTitle[1].trim() : undefined;
            let sessionType: string | undefined = (splitTitle.length === 3) ? splitTitle[2].trim() : splitTitle[1].trim();

            if (program === 'TUXS') {
                [topic, sessionType] = [sessionType, topic];
            }

            if (cohorts && cohorts.length >= 1)
                cohorts.forEach((cohort) => {
                    sessions.push({
                        id: record.id,
                        "Session Date": new Date(date),
                        Program: program,
                        Topic: topic,
                        "Session Type": sessionType,
                        Cohort: cohort,
                    });
                });
            else
                sessions.push({
                    id: record.id,
                    "Session Date": new Date(date),
                    Program: program,
                    Topic: topic,
                    "Session Type": sessionType
                });
        });
    } catch (error) {
        console.error('Error fetching session schedule:', error);
        return null;
    }

    sessions = sortSessionsByDate(sessions);

    sessions = markTransitions(sessions);
    sessions = markBreaks(sessions);
    sessions = addSessionDateValues(sessions);

    return sessions;
}

function sortSessionsByDate(sessions: Session[]): Session[] {
    sessions = sessions.filter((session) => session["Session Date"] !== undefined || session["Session Date"] !== null);

    return sessions.sort((a, b) => {
        const dateA = new Date(a["Session Date"]).getTime();
        const dateB = new Date(b["Session Date"]).getTime();
        return dateA - dateB;
    }
    );
}

function markTransitions(sessions: Session[]): Session[] {
    sessions.forEach((session, index) => {
        if (session.Program !== 'Win') return;

        const lastSession = sessions.slice(index - 1, index).sort((a, b) => {
            return new Date(b["Session Date"]).getTime() - new Date(a["Session Date"]).getTime();
        }).filter((s) => s.Program === session.Program && s.Cohort === session.Program)[0];

        if (!lastSession || !lastSession.Topic || !session.Topic) return;

        const lastSessionTopicNumber = parseInt(lastSession.Topic.split(" ")[1]);
        const currentSessionTopicNumber = parseInt(session.Topic.split(" ")[1]);
        const isTransition = lastSessionTopicNumber + 1 !== currentSessionTopicNumber;
        session["Is Transition"] = 'Transition';
    });
    return sessions;
}

function markBreaks(sessions: Session[]): Session[] {
    const programs = [...new Set(sessions.map((session) => session.Program))];
    programs.forEach((program) => {
        sessions = markBreaksForProgram(sessions, program);
    });
    return sessions;
}

function markBreaksForProgram(sessions: Session[], program: string): Session[] {
    let lastSession: Session | null = null;
    sessions.forEach((session, index) => {
        if (session.Program !== program) return;

        if (lastSession && session.Cohort === lastSession.Cohort) {
            const lastSessionDate = moment(lastSession["Session Date"]);
            const currentSessionDate = moment(session["Session Date"]);
            const diffInDays = currentSessionDate.diff(lastSessionDate, 'days');
            if (diffInDays > MIN_DAYS_IN_BREAK) {
                lastSession["Is Before Break"] = "Before Break";
                session["Is After Break"] = "After Break";
            }
        }
        lastSession = session;
    }
    );
    return sessions;
}

function addSessionDateValues(sessions: Session[]): Session[] {
    sessions.map((session) => {
        return { ...session, ...getSessionDateValues(moment(session["Session Date"])) };
    });
    return sessions;
}


/**
 * Generates contextual, time-based identifiers for emails based on the provided date.
 * @param date - The date to generate identifiers for.
 * @returns An array of global identifiers.
 */
export function getSessionDateValues(date: Moment): { [key: string]: string } {
    const globalIdentifiers: { [key: string]: string } = {};

    if (date.isDST()) {
        globalIdentifiers['Session DST'] = ('EDT');
    }

    const dayOfWeek = date.format('dddd');
    globalIdentifiers['Session Day of Week'] = (dayOfWeek);

    const weekOfYear = date.format('w');
    const isOddWeek = parseInt(weekOfYear) % 2 === 1;
    globalIdentifiers['Session Week Type'] = (isOddWeek ? 'Odd Week' : 'Even Week');

    return globalIdentifiers;
}