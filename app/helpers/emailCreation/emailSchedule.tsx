import { EditorContext, EditorState, getStatusFromEmail, Saves, STATUS_COLORS } from "@/domain/schema";
import { getSessionSchedule, Session } from "@/domain/data/sessions";
import { parseVariableName } from "@/domain/parse/parse";
import { shortenIdentifier } from "@/domain/parse/parsePrograms";
import { createEmailsFromSession } from "@/domain/parse/parseSchedule";
import { Email } from "@/domain/schema";
import { DAY_OF_WEEK_COLOR, HOURS_TO_COLOR, PROGRAM_COLORS } from "@/domain/settings/interface";
import { ActionIcon, Badge, Button, Center, em, Flex, Loader, Modal, Pill, ScrollArea, Text, TextInput, Title } from "@mantine/core";
import { IconArrowRight, IconCalendar, IconCalendarFilled, IconCalendarWeekFilled, IconCheck, IconCheckbox, IconClock, IconEdit, IconMail, IconMailFilled, IconMailPlus, IconMessage, IconRefresh, IconSearch } from "@tabler/icons-react";
import moment from "moment-timezone";
import { ForwardedRef, JSX, useContext, useEffect, useMemo, useRef, useState } from "react";
import seedColor from 'seed-color';
import { hasStringInLocalStorage, loadStringFromLocalStorage, saveStringToLocalStorage } from "@/domain/data/localStorage";
import { loadLocally } from "@/domain/data/saveData";
import { on } from "events";
import { EmailCreator } from "./emailCreator";

const DAYS_IN_PAST = 3;
export function EmailSchedule() {
    const loadedSessions = useRef<Session[] | null>(null);
    const [sessionCount, setSessionCount] = useState<number>(0);
    const [refresh, setRefresh] = useState(false);

    const [searchQuery, setSearchQuery] = useState<string>('');

    const [savedStates, setSavedStates] = useState<Saves>([]);

    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const loadSessionsLocally = async () => {
            const loadedStrSessions = loadStringFromLocalStorage('sessions');
            const parsedSessions = JSON.parse(loadedStrSessions);
            loadedSessions.current = (parsedSessions);
            setSessionCount(10);
            console.log('Loaded sessions locally', loadedSessions.current);
        }

        if (!loadedSessions.current || refresh) {
            setSessionCount(0);
            if (hasStringInLocalStorage('sessions') && !refresh) {
                setTimeout(() => {
                    loadSessionsLocally();
                }, 100);
            } else {
                getSessionSchedule().then((data) => {
                    loadedSessions.current = (data ?? []);
                    saveStringToLocalStorage('sessions', JSON.stringify(loadedSessions.current));
                    setSessionCount(10);
                    console.log('Loaded sessions remotely', loadedSessions.current);
                });
            }
        }

        setSavedStates(loadLocally());
        setRefresh(false);
    }, [refresh]);

    useEffect(() => {
        handleScroll();
    }, [loadedSessions.current, searchQuery]);

    const handleScroll = async () => {
        if (!loadedSessions.current || !ref.current) return;
        const clientHeight = ref.current?.getBoundingClientRect().height;
        const scrollTop = ref.current?.scrollTop;
        const scrollHeight = ref.current?.scrollHeight;

        if (scrollTop + clientHeight >= scrollHeight - 10) {
            setSessionCount((prevCount) => Math.min(prevCount + 10, loadedSessions.current?.length ?? 0));

            setTimeout(() => {
                handleScroll();
            }, 10);
        }
    }

    const handleRefresh = async () => {
        loadedSessions.current = null;
        setSessionCount(0);
        setRefresh(true);
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
    }

    const [createManual, setCreateManual] = useState(false);

    const handleClose = () => {
        setCreateManual(false);
    }

    const manualEmails = useMemo(() => {
        const manualEmails = savedStates.filter((session) => {
            return session && session.email && session.email.values?.hasValueFor('Creation Type');
        });
        return manualEmails.map((email) => ({ email: email.email, session: undefined }));
    }, [savedStates]);

    const sessionsByEmail = useMemo(() => {
        if (!loadedSessions.current) return null;
        let sessionEmails: { email?: Email, session?: Session, emailType?: string }[] = [];

        sessionEmails = loadedSessions.current?.map((session) => {
            const emails = createEmailsFromSession(session);
            const filteredKeys = Object.keys(emails).filter((key) => {
                const email = emails[key];
                const sendDate = email.values?.resolveValue('Send Date', true);
                const daysAway = sendDate ? moment(sendDate).dayOfYear() - moment().dayOfYear() : null;
                if (daysAway !== null && daysAway < -1 * DAYS_IN_PAST) {
                    return false;
                }
                return true;
            });
            return filteredKeys.map((key) => ({
                email: emails[key],
                emailType: key,
                session: session,
            } as { email?: Email, session?: Session, emailType?: string }));
        }).flat() ?? [];

        const allEmailsBySession = sessionEmails?.concat(manualEmails) ?? manualEmails ?? [];

        const sortedEmailsBySession = allEmailsBySession.sort((a, b) => {
            const dateA = moment((a.email as Email)?.values?.resolveValue('Send Date', true));
            const dateB = moment((b.email as Email)?.values?.resolveValue('Send Date', true));
            return dateA.diff(dateB);
        });
        return sortedEmailsBySession;
    }, [loadedSessions.current, manualEmails, refresh]);

    return (
        <Flex align="start" justify="center" direction='column' className="p-4 border-gray-200 rounded-lg w-[38rem] bg-gray-50 border-1" h={920} gap={20} pr={15}>
            <Flex direction='row' align='center' justify='start' w="100%" gap={15}>
                <TextInput variant="unstyled" placeholder="Filter" bg='gray.1' pl="5" pr="sm" className=" rounded-md overflow-hidden" leftSection={<IconSearch stroke={2} opacity={0.6} className=" mr-2" />} onChange={handleSearch} />
                <ActionIcon variant="light" color='gray.5' w={36} h={36} onClick={handleRefresh}><IconRefresh size={24} /></ActionIcon>

                <Button variant="outline" color="blue" ml='auto' mr={16} onClick={() => setCreateManual(true)} leftSection={<IconMailPlus size={20} strokeWidth={2.5} />} >Add Email</Button>


            </Flex>
            <Modal opened={createManual} onClose={handleClose} classNames={{ content: " border-gray-200 rounded-xl w-96 bg-gray-50 border-1 p-3 overflow-visible", title: " !font-bold" }} styles={{ content: { minHeight: '32rem' } }} title='New Email' centered>
                <EmailCreator />
            </Modal>
            <ScrollArea className="max-w-full w-full overflow-x-hidden h-full " onBottomReached={handleScroll} viewportRef={ref} type="hover" >
                <Flex align="start" justify="start" direction='column' className="max-w-full w-full h-full " gap={15} pr={15} >
                    {sessionsByEmail ? sessionsByEmail.slice(0, sessionCount).map((session, i) => {
                        if ((!session.session || (session.session as Session).Program === undefined) && session.email) {
                            console.log('Found manual email ', session);
                            return (
                                <EmailEntry key={'me' + i} email={session.email} savedStates={savedStates} />
                            )
                        }
                        if (!session.session) return null;
                        return (
                            <SessionEntry key={'s' + i} session={session.session} filter={searchQuery} savedStates={savedStates} email={session.email} emailType={session.emailType ?? ''} />
                        )
                    }) : <Flex className="w-full min-h-96" justify="center" align="center"><Loader color="gray" /></Flex>}
                </Flex>
            </ScrollArea>
        </Flex>
    )
}

function SessionEntry({ session, filter, savedStates, email, emailType }: { session: Session, filter?: string, savedStates?: Saves, email?: Email, emailType?: string }) {
    const colorMain = PROGRAM_COLORS[session.Program as keyof typeof PROGRAM_COLORS] + '44';
    const colorPill = PROGRAM_COLORS[session.Program as keyof typeof PROGRAM_COLORS] + 'ff';


    const emails = {
        ...(emailType ? { [emailType]: email } : {}),
    }

    const isMatchFilter = useMemo(() => {
        if (!filter || filter.trim().length < 3) return true;
        const sessionPass = parseVariableName(JSON.stringify(session)).includes(parseVariableName(filter));
        if (sessionPass) return true;
        return (JSON.stringify(emails)).toLowerCase().includes((filter));
    }, [session, emails, filter]);

    const filteredEmails = useMemo(() => {
        if (!filter || filter.trim().length < 3) return emails;
        const filtered = Object.keys(emails).filter((email) => {
            return (parseVariableName(JSON.stringify(emails[email])) + '' + email).includes(parseVariableName(filter));
        }).reduce((acc, key) => {
            if (emails[key]) {
                acc[key] = emails[key] as Email;
            }
            return acc;
        }, {} as { [key: string]: Email })
        return filtered;
    }, [session, emails, filter])

    if (!emails || !filteredEmails || Object.keys(filteredEmails).length === 0) return null;
    if (!isMatchFilter) return null;

    return (
        <Flex direction='column' align='start' justify='start' className="w-full relative" gap={10}>
            <Flex align="center" justify="start" gap={10} mt={0} className={`p-2 rounded-md w-full bg-gray-100 hover:bg-gray-100 cursor-pointer  overflow-hidden whitespace-nowrap`}
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

                <Pill fw={700} bg={DAY_OF_WEEK_COLOR[moment(session["Session Date"])?.format('dddd') as keyof typeof DAY_OF_WEEK_COLOR] + '.2'} radius={5} mr={1} ml={'auto'} >
                    <Flex pt={2.5} gap={6}>
                        <Text fw={700} size="sm" c={DAY_OF_WEEK_COLOR[moment(session["Session Date"])?.format('dddd') as keyof typeof DAY_OF_WEEK_COLOR] + '.9'} mt={-2}>
                            {moment(session["Session Date"])?.format('ddd, MMM D')}
                        </Text>
                    </Flex>
                </Pill>
                {
                    session["Is Combined Workshop Session"] === undefined
                        && session["Is Combined Options Session"] === undefined ?
                        <Pill fw={700} bg={HOURS_TO_COLOR(parseInt(moment(session["Session Date"])?.format('H') ?? '0')) + '.2'} radius={5} mr={-3} >
                            <Flex pt={2.5} gap={6}>
                                <Text fw={700} size="sm" c={HOURS_TO_COLOR(parseInt(moment(session["Session Date"])?.format('H') ?? '0')) + '.9'} mt={-2}>
                                    {moment(session["Session Date"])?.format('h:mma').replace(':00', '')}
                                </Text>
                            </Flex>
                        </Pill>
                        : null
                }
                {
                    session["Is Combined Workshop Session"] !== undefined ?
                        <>
                            <Pill fw={700} bg={HOURS_TO_COLOR(parseInt(moment(session["Lecture Date"])?.format('H') ?? '0')) + '.2'} radius={5} mr={-3} >
                                <Flex pt={2.5} gap={6}>
                                    <Text fw={700} size="sm" c={HOURS_TO_COLOR(parseInt(moment(session["Lecture Date"])?.format('H') ?? '0')) + '.9'} mt={-2}>
                                        {moment(session["Lecture Date"])?.format('h:mma').replace(':00', '')}
                                    </Text>
                                </Flex>
                            </Pill>
                            <Pill fw={700} bg={HOURS_TO_COLOR(parseInt(moment(session["Coaching Date"])?.format('H') ?? '0')) + '.2'} radius={5} mr={-3} >
                                <Flex pt={2.5} gap={6}>
                                    <Text fw={700} size="sm" c={HOURS_TO_COLOR(parseInt(moment(session["Coaching Date"])?.format('H') ?? '0')) + '.9'} mt={-2}>
                                        {moment(session["Coaching Date"])?.format('h:mma').replace(':00', '')}
                                    </Text>
                                </Flex>
                            </Pill>
                        </>
                        : null
                }
                {
                    session["Is Combined Options Session"] !== undefined ?
                        <>
                            <Pill fw={700} bg={HOURS_TO_COLOR(parseInt(moment(session["First Date"])?.format('H') ?? '0')) + '.2'} radius={5} mr={-3} >
                                <Flex pt={2.5} gap={6}>
                                    <Text fw={700} size="sm" c={HOURS_TO_COLOR(parseInt(moment(session["First Date"])?.format('H') ?? '0')) + '.9'} mt={-2}>
                                        {moment(session["First Date"])?.format('h:mma').replace(':00', '')}
                                    </Text>
                                </Flex>
                            </Pill>
                            <Pill fw={700} bg={HOURS_TO_COLOR(parseInt(moment(session["Second Date"])?.format('H') ?? '0')) + '.2'} radius={5} mr={-3} >
                                <Flex pt={2.5} gap={6}>
                                    <Text fw={700} size="sm" c={HOURS_TO_COLOR(parseInt(moment(session["Second Date"])?.format('H') ?? '0')) + '.9'} mt={-2}>
                                        {moment(session["Second Date"])?.format('h:mma').replace(':00', '')}
                                    </Text>
                                </Flex>
                            </Pill>
                        </>
                        : null
                }
            </Flex>
            {Object.keys(filteredEmails).length > 0 ? <Flex direction='column' align='start' justify='start' className="w-full" gap={10} mb={10} pl={15}>
                {Object.keys(filteredEmails).map((key, i) => {
                    if (!filteredEmails[key]) return null;
                    return (
                        <EmailEntry key={session.id + i + 'email'} email={filteredEmails[key]} savedStates={savedStates} />
                    )
                })}
            </Flex> : ''}
        </Flex>
    )
}

function EmailEntry({ email, savedStates }: { email: Email, savedStates?: Saves }) {
    const [editorState, setEditorState] = useContext(EditorContext);

    const program = email.values?.getCurrentValue('Program');
    const colorMain = PROGRAM_COLORS[program as keyof typeof PROGRAM_COLORS] + '22';
    const colorPill = PROGRAM_COLORS[program as keyof typeof PROGRAM_COLORS] + 'ff';

    const type = email.values?.getCurrentValue('Email Type');
    const sendDate = email.values?.resolveValue('Send Date', true);

    const sendDateMoment = sendDate ? moment(sendDate) : null;
    const sendTimeMessage = sendDate ? moment(sendDate).format('h:mma') : null;
    const daysAway = sendDate ? moment(sendDate).dayOfYear() - moment().dayOfYear() : null;
    const daysAwayMessage = daysAway !== null ?
        (daysAway === 0 ?
            `Today`
            : (daysAway > 0 ?
                `in ${daysAway} days`
                : `${-daysAway} days ago`))
        : null;

    const emailSave = useMemo(() => {
        if (!email || !email.values || !savedStates) return null;
        const saveName = email.values.resolveValue('Email ID', true);
        const saveState = savedStates.find((state) => {
            return state && parseVariableName(state.email?.name) === parseVariableName(saveName)
        });
        return saveState;
    }, [email, savedStates]);


    const handleSubmit = async () => {
        if (!emailSave) {
            console.log('Starting an email as ', email);
            setEditorState({ step: 1, email: email });
        } else {
            setEditorState(emailSave)
        }
    };

    const emailStatus = getStatusFromEmail(emailSave?.email);
    const button = useMemo(() => {
        const sharedProps = {
            h: 24,
            onMouseUp: handleSubmit,
            variant: 'filled',
            color: '',
            px: 12,
            ml: 'auto',
        };
        if (!emailStatus)
            return <Button {...sharedProps}>Start</Button>;

        sharedProps.color = (STATUS_COLORS[emailStatus][1] as string).split('.')[0] + '.8';

        if (emailStatus === 'Editing')
            return <Button {...sharedProps} pr={8} rightSection={<IconArrowRight size={16} strokeWidth={2.5} className=" -ml-1" />}>Edit</Button>;
        if (emailStatus === 'Uploaded')
            return <Button {...sharedProps} pr={8} rightSection={<IconArrowRight size={16} strokeWidth={2.5} className=" -ml-1" />} >Uploaded</Button>;
        if (emailStatus === 'Review')
            return <Button {...sharedProps} pl={8} leftSection={<IconClock size={16} strokeWidth={2.5} className=" -mr-1" />}>Review</Button>;
        if (emailStatus === 'Ready')
            return <Button {...sharedProps} >Ready</Button>;
        if (emailStatus === 'Scheduled')
            return <Button {...sharedProps} pl={8} leftSection={<IconCheck size={16} strokeWidth={3} className=" -mr-0.5" />}>Done</Button>;
        if (emailStatus === 'Sent')
            return <Button {...sharedProps} pl={8} leftSection={<IconCheck size={16} strokeWidth={3} className=" -mr-0.5" />}>Done</Button>;
        return <Button h={24} onMouseUp={handleSubmit}>Open</Button>;
    }, [emailStatus]);



    return (
        <Flex align="center" justify="start" gap={10} className={`p-2 rounded-md w-full bg-gray-100 cursor-pointer relative overflow-hidden whitespace-nowrap hover:bg-gray-300`}
            style={{ backgroundColor: colorMain }}
            onMouseUp={handleSubmit}
        >
            <Pill fw={700} bg={colorPill} radius={5} >
                <Flex pt={2.5} gap={6}>
                    <IconMailFilled size={16} stroke={2} color="white" />
                    <Text fw={700} size="sm" c="white" mt={-2}>{type}</Text>
                </Flex>
            </Pill>
            <Pill fw={700} bg={DAY_OF_WEEK_COLOR[sendDateMoment?.format('dddd') as keyof typeof DAY_OF_WEEK_COLOR] + '.2'} radius={5} ml={1} >
                <Flex pt={2.5} gap={6}>
                    <Text fw={700} size="sm" c={DAY_OF_WEEK_COLOR[sendDateMoment?.format('dddd') as keyof typeof DAY_OF_WEEK_COLOR] + '.9'} mt={-2}>{sendDateMoment?.format('ddd, MMM D')}</Text>
                </Flex>
            </Pill>
            <Pill fw={700} bg={HOURS_TO_COLOR(parseInt(sendDateMoment?.format('H') ?? '0')) + '.2'} radius={5} ml={-3} >
                <Flex pt={2.5} gap={6}>
                    <Text fw={700} size="sm" c={HOURS_TO_COLOR(parseInt(sendDateMoment?.format('H') ?? '0')) + '.9'} mt={-2}>{sendDateMoment?.format('h:mma').replace(':00', '')}</Text>
                </Flex>
            </Pill>
            {/* {sendDate ? (
                <>
                    <Text fw={600} size="sm" ml='auto' opacity={0.6} >{daysAwayMessage}</Text>
                    <Flex className=" absolute left-48" align='center' justify='center' gap={5} >
                        <Text fw={700} size="sm">{sendDate}</Text>
                        <Text fw={700} size="sm">•</Text>
                        <Text fw={700} size="sm"  >{sendTimeMessage?.replace(':00', '')}</Text>
                    </Flex>

                </>
            ) : null} */}
            {button}
        </Flex>
    )
}