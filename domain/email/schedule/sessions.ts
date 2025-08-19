import { fetchRecords } from "@/domain/integrations/airtable/airtableActions";
import moment, { Moment } from "moment-timezone";

export type AirtableSessionRecord = {
    id: string;
    fields: {
        "Record ID"?: string;

        "Date": string;
        "Program": string[];
        "Calendar Title": string;
        "Cohort": string[];

        "Title"?: string;
        "Description"?: string;
        "Lecture Link"?: string;
        "Recording Link"?: string;
        "Event Link"?: string;
        "Collab Notes Link"?: string;
        "Collab PDF Link"?: string;

        "First Homework"?: string;
        "Second Homework"?: string;
    };
}

export type Session = {
    // targets airtable assignments
    id: string;
    "Original ID"?: string;
    "Session Date": Date;
    "Program": string;
    "Topic"?: string;
    "Session Type"?: string;
    "Cohort"?: string;

    "Description"?: string;
    "Lecture Link"?: string;
    "Recording Link"?: string;
    "Event Link"?: string;
    "Collab Notes Link"?: string;
    "Collab PDF Link"?: string;

    // For TUXS
    "Topic Type"?: string;

    "Session of Week"?: string;
    "Sessions in Week"?: string;
    "Sessions in Next Week"?: string;
    "Sessions in Prev Week"?: string;

    "Is First Session Of Week"?: string;
    "Is Last Session Of Week"?: string;

    "Is First Session Of Program"?: string;
    "Is Last Session Of Program"?: string;

    "Is Before Break"?: string;
    "Is After Break"?: string;

    //for Workshops
    'Is Combined Workshop Session'?: string;
    "Lecture Date"?: Date;
    "Coaching Date"?: Date;
    "Lecture Event Link"?: string;
    "Coaching Event Link"?: string;

    //for WIN
    "Is Combined Options Session"?: string;
    "First Date"?: Date;
    "Second Date"?: Date;
    "First Event Link"?: string;
    "Second Event Link"?: string;

    "First Homework"?: string;
    "Second Homework"?: string;

    "Previous Topic"?: string;
    "Previous Session Type"?: string;

    // For TUXS
    "Number of Upcoming Sessions"?: string;

    'Is DST'?: string;
    'Session Day of Week'?: string;
    'Session Week Type'?: string;

    [key: string]: any;
}

export const DAYS_IN_PAST = 3;
export const EMAILS_IN_PAGE = 20;

export async function getSessionSchedule(refresh: boolean = false): Promise<Session[] | null> {
    let sessions: Session[] = [];
    try {

        let records: AirtableSessionRecord[] = await fetchRecords(undefined, undefined, !refresh);
        // console.log('Initial sessions: ', records);
        moment.tz.setDefault("America/New_York");


        records.forEach((record) => {
            const cohorts = record.fields["Cohort"];
            const date = record.fields["Date"];
            const program = record.fields["Program"][0];
            const splitTitle = record.fields["Calendar Title"].split("•");
            let topic = (splitTitle.length === 3) ? splitTitle[1].trim() : undefined;
            let sessionType: string | undefined = (splitTitle.length === 3) ? splitTitle[2].trim() : splitTitle[1].trim();
            let topicType: string | undefined = undefined, lab: string | undefined = undefined;

            if (program === 'TUXS') {
                [topic, sessionType] = [sessionType, topic];
                sessionType = sessionType + ' Topic';
                topicType = sessionType;
            }

            if (program === 'Win') {
                lab = sessionType.replace('Live ', '');
            }

            if (cohorts && cohorts.length >= 1)
                cohorts.forEach((cohort) => {
                    sessions.push({
                        id: record.id,
                        "Original ID": record.fields["Record ID"] || record.id,
                        "Session Date": moment(date).toDate(),
                        Program: program,
                        Topic: topic,
                        "Session Type": sessionType,
                        "Lab": lab,
                        Cohort: cohort,

                        'All Cohorts': cohorts.map((c) => c).join(', '),

                        TopicType: topicType,

                        "Title": record.fields["Title"],
                        Description: record.fields["Description"],
                        "Lecture Link": record.fields["Lecture Link"],
                        "Recording Link": record.fields["Recording Link"],
                        "Event Link": record.fields["Event Link"],
                        "Collab Notes Link": record.fields["Collab Notes Link"],
                        "Collab PDF Link": record.fields["Collab PDF Link"],

                        "First Homework": record.fields["First Homework"],
                        "Second Homework": record.fields["Second Homework"],
                    });
                });
            else
                sessions.push({
                    id: record.id,
                    "Original ID": record.fields["Record ID"] || record.id,
                    "Session Date": moment(date).toDate(),
                    Program: program,
                    Topic: topic,
                    "Session Type": sessionType,
                    "Lab": lab,

                    TopicType: topicType,

                    "Title": record.fields["Title"],
                    Description: record.fields["Description"],
                    "Lecture Link": record.fields["Lecture Link"],
                    "Recording Link": record.fields["Recording Link"],
                    "Event Link": record.fields["Event Link"],
                    "Collab Notes Link": record.fields["Collab Notes Link"],
                    "Collab PDF Link": record.fields["Collab PDF Link"],

                    "First Homework": record.fields["First Homework"],
                    "Second Homework": record.fields["Second Homework"],
                });

        });

        sessions = sortSessionsByDate(sessions);

        sessions = combineWorkshopSessions(sessions);
        sessions = combineOptionsSessions(sessions);

        sessions = addSessionWeekContext(sessions);
        sessions = markPreviousSession(sessions);
        sessions = markBreaks(sessions);

        sessions = addSessionDateValues(sessions);
        sessions = addSessionProgramContext(sessions);

        sessions = addWeekNumbers(sessions);
        sessions = addProgramWeekSessionsContext(sessions);



        // console.log('Sessions: ', sessions);

        return sessions;

    } catch (error) {
        console.error('Error fetching session schedule:', error);
        return null;
    }

}

function addWeekNumbers(sessions: Session[]): Session[] {
    sessions.forEach((session) => {
        const sessionDate = moment(session["Session Date"]);
        const weekNumber = sessionDate.isoWeek();
        let firstSessionOfProgram = sessions.find((s) => (
            s.id !== session.id
            && s.Cohort === session.Cohort
            && s.Program === session.Program
            && moment(s["Session Date"]).isBefore(sessionDate)
        ));
        if (!firstSessionOfProgram) firstSessionOfProgram = session;
        const firstSessionWeek = moment(firstSessionOfProgram["Session Date"]).isoWeek();

        const weekNumberInProgram = weekNumber - firstSessionWeek + 1;
        session["Week"] = 'Week ' + weekNumberInProgram;
        session["Next Week"] = 'Week ' + (weekNumberInProgram + 1);
        session["Last Week"] = 'Week ' + (weekNumberInProgram - 1);
    });
    return sessions;
}

function addProgramWeekSessionsContext(sessions: Session[]): Session[] {
    const programs = [...new Set(sessions.map((session) => session.Program))];

    programs.forEach((program) => {
        const cohorts = [...new Set(sessions.filter((session) => session.Program === program).map((session) => session.Cohort))];
        cohorts.forEach((cohort) => {
            const weeklySessionContext: { [key: string]: string } = {};
            const programSessions = sessions.filter((session) => (
                session.Cohort === cohort
                && session.Program === program
            ));

            programSessions.forEach((session, i) => {
                const weekName = session["Week"];
                const sessionOfWeek = session["Session of Week"];
                let prefix = weekName + ' ' + sessionOfWeek + ' ';
                Object.keys(session).forEach((key) => {
                    if (key === "id") return;
                    if (key === "Program") return;
                    if (key === "Cohort") return;
                    weeklySessionContext[prefix + key.replaceAll('Sessions', '').replaceAll('Session', '')] = session[key];
                });

                if (i === 0)
                    Object.keys(session).forEach((key) => {
                        weeklySessionContext['First Session' + key.replaceAll('Sessions', '').replaceAll('Session', '')] = session[key];
                    });

                if (i === programSessions.length - 1)
                    Object.keys(session).forEach((key) => {
                        weeklySessionContext['Last Session' + key.replaceAll('Sessions', '').replaceAll('Session', '')] = session[key];
                    });

            });

            sessions.forEach((session) => {
                if (session.Cohort === cohort && session.Program === program) {
                    Object.keys(weeklySessionContext).forEach((key) => {
                        session[key] = weeklySessionContext[key];
                    });
                }
            });

        });

        return sessions;
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
        const sessionsAfterInProgram = sessions.filter((s) => (
            s.id !== session.id
            && s.Cohort === session.Cohort
            && s.Program === session.Program
            && moment(s["Session Date"]).isAfter(session["Session Date"])
        ));

        if (sessionsAfterInProgram.length === 0)
            session["Is Last Session Of Program"] = 'Is Last Session Of Program';
        if (!sessionBeforeInProgram)
            session["Is First Session Of Program"] = 'Is First Session Of Program';

        session["Number of Upcoming Sessions"] = sessionsAfterInProgram.length + '';
        if (session.Program === 'TUXS')
            sessionsAfterInProgram.forEach((s, i) => {
                const prefix = 'Upcoming Session #' + (i + 1);
                Object.keys(s).forEach((key) => {
                    if (key === "id") return;
                    if (key === "Program") return;
                    if (key === "Cohort") return;
                    session[prefix + ' ' + key.replaceAll('Sessions', '').replaceAll('Session', '')] = s[key];
                });
            });
    });

    return sessions;
}

function addSessionWeekContext(sessions: Session[]): Session[] {
    sessions.forEach((session, index) => {
        const sessionDate = moment(session["Session Date"]);
        const sessionWeek = sessionDate.isoWeek();

        const sessionsInWeek = sessions.filter((s) => (
            s.Cohort === session.Cohort
            && s.Program === session.Program
            && moment(s["Session Date"]).isoWeek() === sessionWeek
        ));

        const sessionBeforeInWeek = sessionsInWeek.find((s) => (
            s.id !== session.id
            && s.Cohort === session.Cohort
            && s.Program === session.Program
            && moment(s["Session Date"]).isoWeek() === sessionWeek
            && moment(s["Session Date"]).isBefore(sessionDate)
        ));

        const sessionAfterInWeek = sessionsInWeek.find((s) => (
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

        const indexInWeek = sessionsInWeek.findIndex((s) => s.id === session.id);

        session["Session of Week"] = 'Session #' + (indexInWeek + 1);
        session["Sessions in Week"] = sessionsInWeek.length + '';


        const sessionsInNextWeek = sessions.filter((s) => (
            s.Cohort === session.Cohort
            && s.Program === session.Program
            && moment(s["Session Date"]).isoWeek() === sessionWeek + 1
        ));
        const sessionsInPrevWeek = sessions.filter((s) => (
            s.Cohort === session.Cohort
            && s.Program === session.Program
            && moment(s["Session Date"]).isoWeek() === sessionWeek - 1
        ));

        session["Sessions in Next Week"] = sessionsInNextWeek.length + '';
        session["Sessions in Prev Week"] = sessionsInPrevWeek.length + '';
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

function markPreviousSession(sessions: Session[]): Session[] {
    sessions.forEach((session, index) => {
        const sessionsBefore = sessions.filter((s) => (
            s.Cohort === session.Cohort
            && s.Program === session.Program
            && moment(s["Session Date"]).isBefore(session["Session Date"])
        ));
        const lastSession = sessionsBefore[sessionsBefore.length - 1];

        if (!lastSession || !lastSession.Topic) return;

        session["Previous Topic"] = lastSession.Topic;
        session["Previous Session Type"] = lastSession["Session Type"];


    });
    return sessions;
}

function markBreaks(sessions: Session[]): Session[] {
    const programs = [...new Set(sessions.map((session) => session.Program))];
    programs.forEach((program) => {
        const cohorts = [...new Set(sessions.filter((session) => session.Program === program).map((session) => session.Cohort))];
        cohorts.forEach((cohort) => {
            sessions = markBreaksForProgram(sessions, program, cohort);
        });
    });
    return sessions;
}

function markBreaksForProgram(sessions: Session[], program: string, cohort?: string): Session[] {
    let lastSession: Session | null = null;
    sessions.forEach((session, index) => {
        if (session.Program !== program) return;
        if (!cohort || session.Cohort !== cohort) return;

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
                "Lecture Event Link": firstSession["Event Link"],
                "Coaching Event Link": secondSession["Event Link"],
                "Session Type": '',
                "Lecture ID": firstSession.id,
                "Coaching ID": secondSession.id,
                "Original Lecture ID": firstSession["Original ID"],
                "Original Coaching ID": secondSession["Original ID"],
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
                "First Date": firstSession["Session Date"],
                "Second Date": secondSession["Session Date"],
                "First Event Link": firstSession["Event Link"],
                "Second Event Link": secondSession["Event Link"],
                "First ID": firstSession.id,
                "Second ID": secondSession.id,
                "Original First ID": firstSession["Original ID"],
                "Original Second ID": secondSession["Original ID"],
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
    const newSessions = sessions.map((session) => {
        return { ...session, ...getSessionDateValues(moment(session["Session Date"])) };
    });
    return newSessions;
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