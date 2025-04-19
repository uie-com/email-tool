import moment from "moment-timezone";
import { Moment } from "moment-timezone";
import { fetchRecords } from "./airtable";

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

    "Is First Session Of Week"?: string;
    "Is Last Session Of Week"?: string;

    "Is First Session Of Program"?: string;
    "Is Last Session Of Program"?: string;

    "Is Transition"?: string;
    "Is Before Break"?: string;
    "Is After Break"?: string;

    'Is Combined Workshop Session'?: string;
    "Lecture Date"?: Date;
    "Lecture Time"?: string;
    "Coaching Date"?: Date;
    "Coaching Time"?: string;

    "Is Combined Options Session"?: string;
    "First Option Date"?: Date;
    "First Time"?: string;
    "Second Option Date"?: Date;
    "Second Time"?: string;

    'Is DST'?: string;
    'Session Day of Week'?: string;
    'Session Week Type'?: string;

    [key: string]: any;
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
                sessionType = sessionType + ' Topic';
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

    sessions = combineWorkshopSessions(sessions);
    sessions = combineOptionsSessions(sessions);

    sessions = addSessionWeekContext(sessions);
    sessions = markTransitions(sessions);
    sessions = markBreaks(sessions);

    sessions = addSessionDateValues(sessions);
    sessions = addSessionProgramContext(sessions);

    sessions = addNextWeekSessions(sessions);

    console.log('Sessions: ', sessions);
    return sessions;
}

function addNextWeekSessions(sessions: Session[]): Session[] {
    sessions.forEach((session) => {
        const sessionDate = moment(session["Session Date"]);
        let nextWeekSessions = sessions.filter((s) => (
            s.id !== session.id
            && s.Cohort === session.Cohort
            && s.Program === session.Program
            && moment(s["Session Date"]).isoWeek() === sessionDate.isoWeek() + 1
            && moment(s["Session Date"]).isAfter(sessionDate)
        ));
        if (!nextWeekSessions || nextWeekSessions.length === 0)
            return;
        nextWeekSessions = sortSessionsByDate(nextWeekSessions);

        nextWeekSessions.forEach((nextSession, i) => {
            let prefix = 'Next Session #' + (i + 1) + ' ';
            prefix = prefix.charAt(0).toUpperCase() + prefix.slice(1);
            Object.keys(nextSession).forEach((key) => {
                if (key === "id") return;
                if (key === "Program") return;
                key = key.replace('Session', '');
                session[prefix + key] = nextSession[key];
            });
        });

    });

    return sessions;
}

function addSessionProgramContext(sessions: Session[]): Session[] {
    sessions.forEach((session, index) => {
        const sessionBeforeInProgram = sessions.find((s) => (
            s.id !== session.id
            && s.Cohort === session.Cohort
            && s.Program === session.Program
            && moment(s["Session Date"]).isBefore(session["Session Date"])
        ));
        const sessionAfterInProgram = sessions.find((s) => (
            s.id !== session.id
            && s.Cohort === session.Cohort
            && s.Program === session.Program
            && moment(s["Session Date"]).isAfter(session["Session Date"])
        ));

        if (!sessionAfterInProgram)
            session["Is Last Session Of Program"] = 'Is Last Session Of Program';
        if (!sessionBeforeInProgram)
            session["Is First Session Of Program"] = 'Is First Session Of Program';
    });
    return sessions;
}

function addSessionWeekContext(sessions: Session[]): Session[] {
    sessions.forEach((session, index) => {
        const sessionDate = moment(session["Session Date"]);
        const sessionWeek = sessionDate.isoWeek();

        const sessionBeforeInWeek = sessions.find((s) => (
            s.id !== session.id
            && s.Cohort === session.Cohort
            && s.Program === session.Program
            && moment(s["Session Date"]).isoWeek() === sessionWeek
            && moment(s["Session Date"]).isBefore(sessionDate)
        ));

        const sessionAfterInWeek = sessions.find((s) => (
            s.id !== session.id
            && s.Cohort === session.Cohort
            && s.Program === session.Program
            && moment(s["Session Date"]).isoWeek() === sessionWeek
            && moment(s["Session Date"]).isAfter(sessionDate)
        ));

        if (!sessionAfterInWeek)
            session["Is Last Session Of Week"] = 'Is Last Session Of Week';
        if (!sessionBeforeInWeek)
            session["Is First Session Of Week"] = 'Is First Session Of Week';

    })
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
        session["Is Transition"] = 'Is Transition';
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
            const lastSessionWeek = moment(lastSessionDate).isoWeek();
            const currentSessionWeek = moment(currentSessionDate).isoWeek();

            if (currentSessionWeek - lastSessionWeek > 1) {
                lastSession["Is Before Break"] = "Is Before Break";
                session["Is After Break"] = "Is After Break";
            }
        }
        lastSession = session;
    }
    );
    return sessions;
}

function combineWorkshopSessions(sessions: Session[]): Session[] {
    let combinedSessions: Session[] = [], skip: Session[] = [];
    sessions.forEach((session, index) => {
        if (skip.includes(session)) return;
        const firstSession = session;
        const secondSession = sessions.find((secondSession) => (
            secondSession
            && firstSession !== secondSession
            && firstSession.Cohort === secondSession.Cohort
            && firstSession.Topic === secondSession.Topic
            && firstSession.Program === secondSession.Program
            && firstSession["Session Type"] === "Lecture"
            && secondSession["Session Type"] === "Coaching"
            && moment(firstSession["Session Date"]).format('YYYY-MM-DD') === moment(secondSession["Session Date"]).format('YYYY-MM-DD')
        ));

        if (secondSession) {
            const combinedSession: Session = {
                ...firstSession,
                "Is Combined Workshop Session": "Is Combined Workshop Session",
                "Lecture Date": firstSession["Session Date"],
                "Coaching Date": secondSession["Session Date"],
                "Session Type": '',
            };
            combinedSessions.push(combinedSession);
            skip.push(secondSession);
        } else {
            combinedSessions.push(session);
        }
    });
    return combinedSessions;
}

function combineOptionsSessions(sessions: Session[]): Session[] {
    let combinedSessions: Session[] = [], skip: Session[] = [];
    sessions.forEach((session, index) => {
        if (skip.includes(session)) return;

        const firstSession = session;
        const secondSession = sessions.find((secondSession) => (
            secondSession
            && firstSession !== secondSession
            && firstSession.Cohort === secondSession.Cohort
            && firstSession.Topic === secondSession.Topic
            && firstSession.Program === secondSession.Program
            && firstSession["Session Type"] === secondSession["Session Type"]
            && moment(firstSession["Session Date"]).format('YYYY-MM-DD') === moment(secondSession["Session Date"]).format('YYYY-MM-DD')
        ));

        if (secondSession) {
            const combinedSession: Session = {
                ...firstSession,
                "Is Combined Options Session": "Is Combined Options Session",
                "First Session Date": firstSession["Session Date"],
                "Second Session Date": secondSession["Session Date"],
            };
            combinedSessions.push(combinedSession);
            skip.push(secondSession);
        } else {
            combinedSessions.push(session);
        }
    });
    return combinedSessions;
}

function addSessionDateValues(sessions: Session[]): Session[] {
    sessions.map((session) => {
        return { ...session, ...getSessionDateValues(moment(session["Session Date"])) };
    });
    return sessions;
}

const special = ['zeroth', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth'];
const deca = ['twent', 'thirt', 'fort', 'fift', 'sixt', 'sevent', 'eight', 'ninet'];
function stringifyNumber(n: number) {
    if (n < 20) return special[n];
    if (n % 10 === 0) return deca[Math.floor(n / 10) - 2] + 'ieth';
    return ((deca[Math.floor(n / 10) - 2] + 'y-' + special[n % 10]) as string);
}


/**
 * Generates contextual, time-based identifiers for emails based on the provided date.
 * @param date - The date to generate identifiers for.
 * @returns An array of global identifiers.
 */
export function getSessionDateValues(date: Moment): { [key: string]: string } {
    const globalIdentifiers: { [key: string]: string } = {};

    if (date.isDST()) {
        globalIdentifiers['Is DST'] = ('Is DST');
    }

    const dayOfWeek = date.format('dddd');
    globalIdentifiers['Session Day of Week'] = (dayOfWeek);

    const weekOfYear = date.format('w');
    const isOddWeek = parseInt(weekOfYear) % 2 === 1;
    globalIdentifiers['Session Week Type'] = (isOddWeek ? 'Odd Week' : 'Even Week');

    return globalIdentifiers;
}