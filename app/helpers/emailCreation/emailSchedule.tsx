import { EditorContext } from "@/app/page";
import { getSessionSchedule, Session } from "@/domain/data/airtableSessions";
import { createEmailsFromSession } from "@/domain/parse/parseSchedule";
import { getSettings } from "@/domain/parse/parseSettings";
import { fillTextVariables, sanitizeValueDict } from "@/domain/parse/parseVariables";
import { Email } from "@/domain/schema";
import { PROGRAM_COLORS } from "@/domain/settings/interface";
import { EMAIL_SCHEDULE } from "@/domain/settings/schedule";
import { SETTINGS } from "@/domain/settings/settings";
import { Button, Center, Flex, Loader, Pill, ScrollArea, Text, Title } from "@mantine/core";
import { IconCalendar, IconCalendarFilled, IconCalendarWeekFilled, IconMail, IconMailFilled } from "@tabler/icons-react";
import moment from "moment-timezone";
import { useContext, useEffect, useMemo, useState } from "react";

export function EmailSchedule() {
    const [sessions, setSessions] = useState<Session[] | null>(null);

    useEffect(() => {
        if (!sessions) {
            getSessionSchedule().then((data) => {
                setSessions(data ?? []);
            });
        }
    }, []);


    return (
        <Flex align="start" justify="center" direction='column' className="p-4 border-gray-200 rounded-lg w-[36rem] bg-gray-50 border-1 max-h-full" gap={20} pr={15}>
            <Title order={5}>Email Schedule</Title>
            <ScrollArea h={600} className="w-full">
                <Flex align="start" justify="start" direction='column' className="w-full" gap={15} pr={15} >
                    {sessions ? sessions.map((session, i) => {
                        return (
                            <SessionEntry key={session.id + i} session={session} />
                        )
                    }) : <Center className="w-full"><Loader color="gray" /></Center>}
                </Flex>
            </ScrollArea>
        </Flex>
    )
}

function SessionEntry({ session }: { session: Session }) {
    const colorMain = PROGRAM_COLORS[session.Program] + '44';
    const colorPill = PROGRAM_COLORS[session.Program] + 'ff';

    const emails = useMemo(() => createEmailsFromSession(EMAIL_SCHEDULE, session), [EMAIL_SCHEDULE, session]);

    if (!emails || Object.keys(emails).length === 0) return null;

    return (
        <Flex direction='column' align='start' justify='start' className="w-full" gap={10}>
            <Flex align="center" justify="start" gap={10} mt={0} className={`p-2 rounded-md w-full bg-gray-100 hover:bg-gray-100 cursor-pointer relative overflow-hidden whitespace-nowrap`}
                style={{ backgroundColor: colorMain }}
            >
                <Pill fw={700} bg={colorPill} radius={5} pl={7} ><Flex pt={2.25} gap={3}><IconCalendarWeekFilled size={16} stroke={2} color="white" /><Text fw={700} size="sm" c="white" mt={-1.25}>{session.Program}</Text></Flex></Pill>
                {session.Cohort ? (<Text fw={600} size="sm">{session.Cohort}</Text>) : null}
                {session.Program != 'TUXS' ? (<Text fw={500} size="sm" >{session.Topic}</Text>) : null}
                {session["Session Type"] ? (<Text fw={500} size="sm" >{session["Session Type"]}</Text>) : null}
                <Text size="sm" fw={600} ml={'auto'}>{moment(session["Session Date"]).format('dddd, MMMM D • h:mma')}</Text>
            </Flex>
            {Object.keys(emails).length > 0 ? <Flex direction='column' align='start' justify='start' className="w-full" gap={10} mb={10} pl={15}>
                {Object.keys(emails).map((key, i) => {
                    return (
                        <EmailEntry key={session.id + i + 'email'} email={emails[key]} session={session} />
                    )
                })}
            </Flex> : ''}
        </Flex>
    )
}

function EmailEntry({ email, session }: { email: Email, session: Session }) {
    const [editorState, setEditorState] = useContext(EditorContext);

    const colorMain = PROGRAM_COLORS[session.Program] + '22';
    const colorPill = PROGRAM_COLORS[session.Program] + 'ff';

    const settings = email.settings ?? {};
    if (!settings) return null;
    const type = settings["Email Type"].value && typeof settings["Email Type"].value === 'string' ? settings["Email Type"].value : 'Unknown';
    const sendDate = fillTextVariables(settings["Send Date"].value as string, settings, ["Send Date"]);

    const sendDateMessage = sendDate ? moment(sendDate).format('dddd, MMMM D') : null;
    const daysAway = sendDate ? moment(sendDate).diff(moment(), 'days') : null;
    const daysAwayMessage = daysAway ? (daysAway > 0 ? `in ${daysAway} days` : `${-daysAway} days ago`) : null;

    const handleSubmit = async () => {
        const identifiers = email.identifiers;
        const emailData = {
            identifiers: identifiers,
            settings: { ...email.settings, ...getSettings(SETTINGS, email.settings) },
        }
        console.log('Starting an email as ', emailData);
        setEditorState({ step: 1, email: emailData });
    };


    return (
        <Flex align="center" justify="start" gap={10} className={`p-2 rounded-md w-full bg-gray-100  cursor-pointer relative overflow-hidden whitespace-nowrap hover:bg-gray-300`}
            style={{ backgroundColor: colorMain }}
            onMouseUp={handleSubmit}
        >
            <Pill fw={700} bg={colorPill} radius={5} ><Flex pt={2.5} gap={6}><IconMailFilled size={16} stroke={2} color="white" /><Text fw={700} size="sm" c="white" mt={-2}>{type}</Text></Flex></Pill>
            {sendDate ? (<Text fw={600} size="sm">{sendDateMessage}</Text>) : null}
            {sendDate ? (<Text fw={600} size="sm" ml='auto' opacity={0.4}>{daysAwayMessage}</Text>) : null}
            <Button h={24} onMouseUp={handleSubmit}>Start</Button>
        </Flex>
    )
}