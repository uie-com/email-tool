import { EditorContext } from "@/domain/schema";
import { getSessionSchedule, Session } from "@/domain/data/sessions";
import { parseVariableName } from "@/domain/parse/parse";
import { shortenIdentifier } from "@/domain/parse/parsePrograms";
import { createEmailsFromSession } from "@/domain/parse/parseSchedule";
import { Email } from "@/domain/schema";
import { PROGRAM_COLORS } from "@/domain/settings/interface";
import { Badge, Button, Center, Flex, Loader, Pill, ScrollArea, Text, TextInput, Title } from "@mantine/core";
import { IconCalendar, IconCalendarFilled, IconCalendarWeekFilled, IconMail, IconMailFilled, IconSearch } from "@tabler/icons-react";
import moment from "moment-timezone";
import { useContext, useEffect, useMemo, useState } from "react";
import seedColor from 'seed-color';

const DAYS_IN_PAST = 3;
export function EmailSchedule() {
    const [sessions, setSessions] = useState<Session[] | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');

    useEffect(() => {
        if (!sessions) {
            getSessionSchedule().then((data) => {
                setSessions(data ?? []);
            });
        }
    }, []);


    return (
        <Flex align="start" justify="center" direction='column' className="p-4 border-gray-200 rounded-lg w-[38rem] bg-gray-50 border-1" gap={20} pr={15}>
            <Flex direction='row' align='center' justify='space-between' w="100%" gap={10}>
                <Title order={5}>Email Schedule</Title>
                <TextInput variant="unstyled" placeholder="Search" bg='gray.1' pl="sm" pr="5" className=" rounded-md overflow-hidden" rightSection={<IconSearch stroke={2} opacity={0.6} />} onChange={(e) => setSearchQuery(e.target.value)} />
            </Flex>
            <ScrollArea h={600} className="max-w-full w-full overflow-x-hidden">
                <Flex align="start" justify="start" direction='column' className="max-w-full w-full h-full " gap={15} pr={15} >
                    {sessions ? sessions.map((session, i) => {
                        return (
                            <SessionEntry key={session.id + i} session={session} filter={searchQuery} />
                        )
                    }) : <Flex className="w-full h-full" justify="center" align="center"><Loader color="gray" /></Flex>}
                </Flex>
            </ScrollArea>
        </Flex>
    )
}

function SessionEntry({ session, filter }: { session: Session, filter?: string }) {
    const colorMain = PROGRAM_COLORS[session.Program as keyof typeof PROGRAM_COLORS] + '44';
    const colorPill = PROGRAM_COLORS[session.Program as keyof typeof PROGRAM_COLORS] + 'ff';


    const emails = useMemo(() => {
        const emails = createEmailsFromSession(session);
        Object.keys(emails).filter((key) => {
            const email = emails[key];
            const sendDate = email.values?.resolveValue('Send Date', true);
            const daysAway = sendDate ? moment(sendDate).dayOfYear() - moment().dayOfYear() : null;
            if (daysAway !== null && daysAway < -1 * DAYS_IN_PAST) {
                delete emails[key];
            }
        });
        return emails;
    }, [session]);

    const isMatchFilter = useMemo(() => {
        if (!filter || filter.trim().length < 3) return true;
        const sessionPass = (JSON.stringify(session)).toLowerCase().includes((filter).toLowerCase());
        if (sessionPass) return true;
        return (JSON.stringify(emails)).toLowerCase().includes((filter));
    }, [session, emails, filter]);

    const filteredEmails = useMemo(() => {
        if (!filter || filter.trim().length < 3) return emails;
        const filtered = Object.keys(emails).filter((email) => {
            return (JSON.stringify(emails[email]).toLowerCase() + '' + email).includes((filter).toLowerCase());
        }).reduce((acc, key) => {
            acc[key] = emails[key];
            return acc;
        }, {} as { [key: string]: Email })
        return filtered;
    }, [session, emails, filter])

    if (!emails || Object.keys(filteredEmails).length === 0) return null;
    if (!isMatchFilter) return null;

    return (
        <Flex direction='column' align='start' justify='start' className="w-full" gap={10}>
            <Flex align="center" justify="start" gap={10} mt={0} className={`p-2 rounded-md w-full bg-gray-100 hover:bg-gray-100 cursor-pointer relative overflow-hidden whitespace-nowrap`}
                style={{ backgroundColor: colorMain }}
            >
                <Pill fw={700} bg={colorPill} radius={5} pl={7} >
                    <Flex pt={2.25} gap={3}>
                        <IconCalendarWeekFilled size={16} stroke={2} color="white" />
                        <Text fw={700} size="sm" c="white" mt={-1.25}>{session.Program}</Text>
                    </Flex>
                </Pill>

                {session.Cohort ? (
                    <Badge fw={700} color={colorPill} c={'white'} radius={5} px={6} >
                        {session.Cohort}
                    </Badge>
                ) : ''}

                {session.Topic && session.Topic.length < 20 ? (
                    <Badge fw={700} color={colorPill} c={'white'} radius={5} px={6} >
                        {shortenIdentifier(session.Topic)}
                    </Badge>
                ) : ''}

                {session["Session Type"] ? (
                    <Badge fw={700} color={colorPill} c={'white'} radius={5} px={6} >
                        {shortenIdentifier(session["Session Type"])}
                    </Badge>
                ) : ''}

                <Text size="sm" fw={600} ml={'auto'}>
                    {
                        moment(session["Session Date"]).format('dddd, MMMM D • h:mma') +
                        (session["Is Combined Workshop Session"] !== undefined ? (' • ' + moment(session["Coaching Date"]).format('h:mma')) : '') +
                        (session["Is Combined Options Session"] !== undefined ? (' • ' + moment(session["Second Date"]).format('h:mma')) : '')
                    }
                </Text>
            </Flex>
            {Object.keys(filteredEmails).length > 0 ? <Flex direction='column' align='start' justify='start' className="w-full" gap={10} mb={10} pl={15}>
                {Object.keys(filteredEmails).map((key, i) => {
                    return (
                        <EmailEntry key={session.id + i + 'email'} email={filteredEmails[key]} session={session} />
                    )
                })}
            </Flex> : ''}
        </Flex>
    )
}

function EmailEntry({ email, session }: { email: Email, session: Session }) {
    const [editorState, setEditorState] = useContext(EditorContext);

    const colorMain = PROGRAM_COLORS[session.Program as keyof typeof PROGRAM_COLORS] + '22';
    const colorPill = PROGRAM_COLORS[session.Program as keyof typeof PROGRAM_COLORS] + 'ff';

    const type = email.values?.getCurrentValue('Email Type');
    const sendDate = email.values?.resolveValue('Send Date', true);

    const sendDateMessage = sendDate ? moment(sendDate).format('dddd, MMMM D') : null;
    const daysAway = sendDate ? moment(sendDate).dayOfYear() - moment().dayOfYear() : null;
    const daysAwayMessage = daysAway !== null ?
        (daysAway === 0 ?
            `Today`
            : (daysAway > 0 ?
                `in ${daysAway} days`
                : `${-daysAway} days ago`))
        : null;

    const handleSubmit = async () => {
        console.log('Starting an email as ', email);
        setEditorState({ step: 1, email: email });
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