import { EditorState, getStatusFromEmail, Saves, STATUS_COLORS } from "@/domain/schema";
import { DAYS_IN_PAST, EMAILS_IN_PAGE, getSessionSchedule, Session } from "@/domain/data/sessions";
import { parseVariableName } from "@/domain/parse/parse";
import { shortenIdentifier } from "@/domain/parse/parsePrograms";
import { createEmailsFromSession } from "@/domain/parse/parseSchedule";
import { Email } from "@/domain/schema";
import { DAY_OF_WEEK_COLOR, HOURS_TO_COLOR, PROGRAM_COLORS } from "@/domain/settings/interface";
import { ActionIcon, Badge, Button, Center, em, Flex, Loader, Modal, Pill, ScrollArea, TagsInput, Text, TextInput, Title } from "@mantine/core";
import { IconArrowRight, IconCalendar, IconCalendarFilled, IconCalendarWeekFilled, IconCheck, IconCheckbox, IconClock, IconEdit, IconMail, IconMailFilled, IconMailPlus, IconMessage, IconRefresh, IconSearch } from "@tabler/icons-react";
import moment from "moment-timezone";
import { ForwardedRef, JSX, useContext, useEffect, useMemo, useRef, useState } from "react";
import seedColor from 'seed-color';
import { hasStringInLocalStorage, loadStringFromLocalStorage, saveStringToLocalStorage } from "@/domain/data/localStorage";
import { loadLocally } from "@/domain/data/saveData";
import { on } from "events";
import { EmailCreator } from "./emailCreator";
import { getEmailSchedule } from "@/domain/data/scheduleActions";
import { EditorContext } from "@/domain/schema/context";

export function EmailSchedule() {
    const [loadedEmails, setLoadedEmails] = useState<{ email?: Email | undefined; session?: Session | undefined; emailType?: string | undefined; }[] | null>(null);
    const totalEmails = useRef<number>(0);

    const isLoading = useRef(false);

    const [sessionOffset, setSessionOffset] = useState<number>(0);
    const [refresh, setRefresh] = useState(false);

    const [searchQuery, setSearchQuery] = useState<string[]>([]);

    const [savedStates, setSavedStates] = useState<Saves>([]);

    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {

        if (refresh)
            setSessionOffset(0);

        if (isLoading.current && !refresh) return;
        console.log('Loading emails', sessionOffset, searchQuery, refresh);


        isLoading.current = true;
        getEmailSchedule(sessionOffset, searchQuery, refresh).then((data) => {
            totalEmails.current = data?.totalEmails ?? 0;
            let newEmails = JSON.parse(data.emails) ?? [];
            newEmails = newEmails.map((email: { email?: Email | undefined; session?: Session | undefined; emailType?: string | undefined; }) => ({
                ...email,
                email: email.email ? new Email(email.email.values, email.email) : undefined,
                session: email.session,
            }));
            setLoadedEmails(loadedEmails?.slice(0, sessionOffset)?.concat((newEmails ?? [])) ?? newEmails ?? []);

            isLoading.current = false;
            console.log('Loaded sessions remotely', loadedEmails);
        });

        setSavedStates(loadLocally());
        setRefresh(false);
    }, [refresh, sessionOffset, searchQuery]);

    useEffect(() => {
        handleScroll();
    }, [loadedEmails, searchQuery]);

    const handleScroll = async () => {
        if (!loadedEmails || !ref.current) return;
        const clientHeight = ref.current?.getBoundingClientRect().height;
        const scrollTop = ref.current?.scrollTop;
        const scrollHeight = ref.current?.scrollHeight;

        if (scrollTop + clientHeight >= scrollHeight - 10) {
            if (isLoading.current) return;
            setSessionOffset((prevCount) => Math.min(prevCount + EMAILS_IN_PAGE, totalEmails.current ?? 0));

            setTimeout(() => {
                handleScroll();
            }, 10);
        }
    }

    const handleRefresh = async () => {
        setLoadedEmails(null);
        setSessionOffset(0);
        setRefresh(true);
    }

    const handleSearch = (v: string[]) => {
        setSearchQuery(v);
        setSessionOffset(0);
        setLoadedEmails(null);
    }

    const [createManual, setCreateManual] = useState(false);

    const handleClose = () => {
        setCreateManual(false);
    }

    const manualEmails = useMemo(() => {
        const manualEmails = savedStates.filter((session) => {
            if (!(session && session.email && session.email.values?.hasValueFor('Creation Type'))) return false;
            const date = session.email.values?.resolveValue('Send Date', true);
            const daysAway = date ? moment(date).dayOfYear() - moment().dayOfYear() : null;
            if (daysAway !== null && daysAway < -1 * DAYS_IN_PAST)
                return false;

            if (!loadedEmails) return false;
            const lastDate = loadedEmails[loadedEmails.length - 1]?.email?.values?.resolveValue('Send Date', true);
            if (lastDate && moment(date).isAfter(moment(lastDate)))
                return false;

            if (searchQuery.length === 0) return true;
            return searchQuery.filter((query) => {
                return !(
                    JSON.stringify(session.email).toLowerCase()?.includes(query.toLowerCase())
                );
            }).length === 0;
        });

        return manualEmails.map((email) => ({ email: email.email, session: undefined }));
    }, [savedStates]);

    const sessionsByEmail = useMemo(() => {
        if (!loadedEmails) return null;

        const allEmailsBySession = loadedEmails?.concat(manualEmails) ?? manualEmails ?? [];

        const sortedEmailsBySession = allEmailsBySession.sort((a, b) => {
            const dateA = moment((a.email as Email)?.values?.resolveValue('Send Date', true));
            const dateB = moment((b.email as Email)?.values?.resolveValue('Send Date', true));
            return dateA.diff(dateB);
        });
        return sortedEmailsBySession;
    }, [loadedEmails, manualEmails, refresh]);

    console.log('Rendering. total emails ' + sessionsByEmail?.length + ', offset ' + sessionOffset + ', searchQuery ' + searchQuery + ', refresh ' + refresh);
    const className = ' !bg-gray-300';

    return (
        <Flex align="start" justify="center" direction='column' className="p-4 border-gray-200 rounded-lg w-[38rem]  !bg-gray-50 border-1" h={920} gap={20} pr={15}>
            <Flex direction='row' align='center' justify='start' w="100%" gap={15}>
                <TagsInput variant="unstyled" placeholder="Filter" bg='gray.1' pl="5" pr="sm" className=" rounded-md overflow-hidden" leftSection={<IconSearch stroke={2} opacity={0.6} className=" mr-2" />} onChange={handleSearch} maw={256} classNames={{ pill: ' !bg-gray-300' }} tt='uppercase' />
                <ActionIcon variant="light" color='gray.5' w={36} h={36} onClick={handleRefresh}><IconRefresh size={24} /></ActionIcon>

                <Button variant="outline" color="blue" ml='auto' mr={16} onClick={() => setCreateManual(true)} leftSection={<IconMailPlus size={20} strokeWidth={2.5} />} >Add Email</Button>
            </Flex>
            <Modal opened={createManual} onClose={handleClose} classNames={{ content: " border-gray-200 rounded-xl w-96 bg-gray-50 border-1 p-3 overflow-visible", title: " !font-bold" }} styles={{ content: { minHeight: '32rem' } }} title='New Email' centered>
                <EmailCreator />
            </Modal>
            <ScrollArea className="max-w-full w-full overflow-x-hidden h-full " onBottomReached={handleScroll} viewportRef={ref} type="hover" >
                <Flex align="start" justify="start" direction='column' className="max-w-full w-full h-full " gap={15} pr={15} >
                    {sessionsByEmail ? sessionsByEmail.map((session, i) => {
                        if ((!session.session || (session.session as Session).Program === undefined) && session.email) {
                            // console.log('Found manual email ', session);
                            return (
                                <EmailEntry key={'me' + i} email={session.email} savedStates={savedStates} />
                            )
                        }
                        if (!session.session) return null;
                        return (
                            <SessionEntry key={'s' + i} session={session.session} savedStates={savedStates} email={session.email} emailType={session.emailType ?? ''} />
                        )
                    }) : <Flex className="w-full min-h-96" justify="center" align="center"><Loader color="gray" /></Flex>}
                </Flex>
                {sessionsByEmail && sessionsByEmail.length > 0 && sessionsByEmail.length < totalEmails.current ? <Loader className=" my-6 ml-auto mr-auto" color="blue" size="md" type="bars" /> : null}
            </ScrollArea>
        </Flex>
    )
}

function SessionEntry({ session, savedStates, email, emailType }: { session: Session, savedStates?: Saves, email?: Email, emailType?: string }) {
    const colorMain = PROGRAM_COLORS[session.Program as keyof typeof PROGRAM_COLORS] + '44';
    const colorPill = PROGRAM_COLORS[session.Program as keyof typeof PROGRAM_COLORS] + 'ff';


    const emails = {
        ...(emailType ? { [emailType]: email } : {}),
    }

    if (!emails) return null;

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
            {Object.keys(emails).length > 0 ? <Flex direction='column' align='start' justify='start' className="w-full" gap={10} mb={10} pl={15}>
                {Object.keys(emails).map((key, i) => {
                    if (!emails[key]) return null;
                    return (
                        <EmailEntry key={session.id + i + 'email'} email={emails[key]} savedStates={savedStates} />
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