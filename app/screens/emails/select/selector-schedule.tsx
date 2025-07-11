import { EmailMenu } from "@/app/components/email/action-menu";
import { RemoteSource } from "@/app/components/remote/step-template";
import { DAY_OF_WEEK_COLOR, PROGRAM_COLORS, TIME_OF_DAY_COLOR } from "@/config/app-settings";
import { hasStringInLocalStorage, listKeysInLocalStorage, loadStringFromLocalStorage, saveStringToLocalStorage } from "@/domain/browser/localStorage";
import { EditorContext, GlobalSettingsContext } from "@/domain/context";
import { shortenIdentifier } from "@/domain/email/identifiers/parsePrograms";
import { isPreApprovedTemplate, SavedEmailsContext } from "@/domain/email/save/saveData";
import { DAYS_IN_PAST, EMAILS_IN_PAGE, Session } from "@/domain/email/schedule/sessions";
import { createVariableEdits } from "@/domain/integrations/google-drive/collabNotes";
import { createSiblingGoogleDoc, getGoogleDocContentByUrl } from "@/domain/integrations/google-drive/googleActions";
import { saveNotesDoc } from "@/domain/integrations/google-drive/notesActions";
import { createReferenceDoc } from "@/domain/integrations/google-drive/reference-doc";
import { AIRTABLE_LINK, createGoogleDocLink } from "@/domain/integrations/links";
import { createNotionCardForEmail } from "@/domain/integrations/notion/cards";
import { openPopup } from "@/domain/interface/popup";
import { EditorState, Email, getStatusFromEmail, STATUS_COLORS } from "@/domain/schema";
import { Values } from "@/domain/values/valueCollection";
import { normalizeName } from "@/domain/variables/normalize";
import { Variables } from "@/domain/variables/variableCollection";
import { ActionIcon, Badge, Button, Flex, Image, Loader, Modal, Pill, Progress, ScrollArea, TagsInput, Text } from "@mantine/core";
import { IconArrowRight, IconBrandTelegram, IconCalendarPlus, IconCalendarWeekFilled, IconCheck, IconClock, IconDots, IconEdit, IconFilePlus, IconMailFilled, IconMailPlus, IconRefresh, IconSearch } from "@tabler/icons-react";
import moment from "moment-timezone";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { AuthStatus } from "../publish/publish";
import { EmailCreator } from "./selector-manual";

export function EmailSchedule() {
    const [loadedEmails, setLoadedEmails] = useState<{ email?: Email | undefined; session?: Session | undefined; emailType?: string | undefined; }[] | null>(null);
    const totalEmails = useRef<number>(0);
    const [savedStates, deleteEmail] = useContext(SavedEmailsContext);

    const isLoading = useRef(false);

    const [sessionOffset, setSessionOffset] = useState<number>(0);
    const [refresh, setRefresh] = useState(false);
    const loadedSessions = useRef<string[]>([]);

    const [searchQuery, setSearchQuery] = useState<string[] | null>(null);
    if (searchQuery === null) {
        const string = hasStringInLocalStorage('scheduleSearch') ? loadStringFromLocalStorage('scheduleSearch') : '[]';
        const savedSearch = JSON.parse(string) ?? [];
        setSearchQuery(savedSearch);
    }

    const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        async function fetchSchedule() {
            console.log('[SCHEDULE] Fetching schedule with offset ' + sessionOffset + ', refresh ' + refresh + ', searchQuery ' + searchQuery + '\nAlready loaded sessions: ' + loadedSessions.current.join(', '));

            if (refresh) {
                setSessionOffset(0);
                loadedSessions.current = [];
                const keys = listKeysInLocalStorage();
                keys.forEach((key) => {
                    if (key.startsWith('schedule?')) {
                        console.log('[SCHEDULE] Removing cache for ' + key);
                        localStorage.removeItem(key);
                    }
                });
            }

            if (isLoading.current && !refresh) return;

            if (searchQuery !== null && searchQuery.length > 0) {
                saveStringToLocalStorage('scheduleSearch', JSON.stringify(searchQuery));
            } else {
                saveStringToLocalStorage('scheduleSearch', '[]');
            }

            isLoading.current = true;
            const params = new URLSearchParams({ sessionOffset: sessionOffset + '', refresh: refresh ? 'true' : 'false', searchQuery: searchQuery?.join(',') ?? '' });
            const cacheKey = sessionOffset + '+' + searchQuery?.join(',');

            if (loadedSessions.current.includes(cacheKey) && !refresh) {
                console.log('[SCHEDULE] Already loaded schedule with params ' + cacheKey);
                isLoading.current = false;
                return;
            }
            loadedSessions.current.push(cacheKey);

            let data: {
                emails: string;
                offset: number;
                totalEmails: number;
            };

            if (!refresh && hasStringInLocalStorage('schedule?' + cacheKey)) {
                console.log('[SCHEDULE] Hit cache for schedule with params ' + cacheKey);
                data = JSON.parse(loadStringFromLocalStorage('schedule?' + cacheKey));
            }
            else
                data = (await (await fetch('/api/schedule?' + params)).json());

            totalEmails.current = data?.totalEmails ?? 0;
            let newEmails = JSON.parse(data.emails) ?? [];
            newEmails = newEmails.map((email: { email?: Email | undefined; session?: Session | undefined; emailType?: string | undefined; }) => ({
                ...email,
                email: email.email ? new Email(email.email.values, email.email) : undefined,
                session: email.session,
            }));

            setLoadedEmails((prev) => {

                let emailsBefore = prev?.slice(0, data.offset) ?? [];
                if (data.offset === 0)
                    emailsBefore = [];

                let emailsAfter = prev?.slice(data.offset + EMAILS_IN_PAGE) ?? [];

                console.log('[SCHEDULE] Loaded ' + newEmails.length + ' emails (' + data.offset + ' -> ' + (data.offset + EMAILS_IN_PAGE) + ') out of ' + totalEmails.current + ' - schedule is [' + emailsBefore.length + ' old + ' + (newEmails ?? []).length + ' new + ' + emailsAfter.length + ' old]', prev, emailsBefore.concat((newEmails ?? []), emailsAfter));


                return emailsBefore.concat((newEmails ?? []), emailsAfter) ?? newEmails ?? []
            });

            console.log('[SCHEDULE] Saving cache for schedule with params ' + cacheKey);
            saveStringToLocalStorage('schedule?' + cacheKey, JSON.stringify(data));

            isLoading.current = false;

            if (refresh)
                setLastRefreshed(moment().toDate());

            setRefresh(false);
        }

        setTimeout(() => {
            fetchSchedule();
        }, 400);
    }, [refresh, sessionOffset, searchQuery]);

    useEffect(() => {
        handleScroll();
    }, [loadedEmails, searchQuery]);

    const inBoundary = useRef<boolean>(false);

    const handleScroll = async () => {
        if (!loadedEmails || !ref.current) return;
        const clientHeight = ref.current?.getBoundingClientRect().height;
        const scrollTop = ref.current?.scrollTop;
        const scrollHeight = ref.current?.scrollHeight;

        if (scrollTop + clientHeight >= scrollHeight - 1000) {
            if (inBoundary.current) return;
            if (isLoading.current) return;

            inBoundary.current = true;
            setSessionOffset((prevCount) => Math.min(prevCount + EMAILS_IN_PAGE, totalEmails.current ?? 0));
        } else {
            inBoundary.current = false;
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

            if (searchQuery?.length === 0) return true;
            return searchQuery?.filter((query) => {
                return !(
                    JSON.stringify(session.email).toLowerCase()?.includes(query.toLowerCase())
                );
            }).length === 0;
        });

        return manualEmails.map((email) => ({ email: email.email, session: undefined }));
    }, [JSON.stringify(savedStates)]);

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

    console.log('Rendering. total emails ' + sessionsByEmail?.length + ', offset ' + sessionOffset + ', searchQuery ' + searchQuery + ', refresh ' + refresh, sessionsByEmail);
    const className = ' !bg-gray-300';

    return (
        <Flex align="center" justify="center" direction='column' className="relative w-full h-screen p-20" gap={20}>
            <Flex align="start" direction='column' justify="center" className="h-full" gap={20}>



                <Flex align="start" justify="center" direction='column' className="p-4 border-gray-200 rounded-lg w-[38rem]  !bg-gray-50 border-1 relative" h={920} gap={20} pr={15}>
                    <Flex className=" absolute " top={-35} left={-5} ml={4} justify='space-between' w='38rem' dir="row" align='center' >
                        <RemoteSource
                            name="Airtable"
                            icon={<Flex className="" justify='center' align='center' w={16} h={16} mr={-2} ml={-4}><Image src='./interface/airtable.png' h={12} w={12} /></Flex>}
                            edit={() => openPopup(AIRTABLE_LINK)}
                            refresh={handleRefresh}
                            date={lastRefreshed}
                            className="!border-gray-200 !bg-gray-50 border-1 "
                        />
                        <AuthStatus className="pb-1" showAC={false} />
                    </Flex>

                    <Flex direction='row' align='center' justify='start' w="100%" gap={15}>
                        <TagsInput variant="unstyled" placeholder="Filter" bg='gray.1' pl="5" pr="sm" className=" rounded-md overflow-hidden" leftSection={<IconSearch stroke={2} opacity={0.6} className=" mr-2" />} onChange={handleSearch} value={searchQuery ?? []} maw={256} classNames={{ pill: ' !bg-gray-300' }} tt='uppercase' />
                        <ActionIcon variant="light" color='gray.5' w={36} h={36} onClick={handleRefresh}><IconRefresh size={24} /></ActionIcon>

                        <Button variant="outline" color="blue" ml='auto' mr={16} onClick={() => setCreateManual(true)} leftSection={<IconMailPlus size={20} strokeWidth={2.5} />} >Add Email</Button>
                    </Flex>
                    <Modal opened={createManual} onClose={handleClose} classNames={{ content: " border-gray-200 rounded-xl w-96 bg-gray-50 border-1 p-3 overflow-visible", title: " !font-bold" }} styles={{ content: { minHeight: '32rem' } }} title='New Email' centered>
                        <EmailCreator />
                    </Modal>
                    <ScrollArea className="max-w-full w-full overflow-x-hidden h-full " onBottomReached={handleScroll} scrollbars="y" viewportRef={ref} type="hover" >
                        <Flex align="start" justify="start" direction='column' className="max-w-full w-full h-full " gap={15} pr={15} >
                            {sessionsByEmail ? sessionsByEmail.map((session, i) => {
                                if ((!session.session || (session.session as Session).Program === undefined) && session.email) {
                                    // console.log('Found manual email ', session);
                                    return (
                                        <EmailEntry key={'me' + i} email={session.email} />
                                    )
                                }
                                if (!session.session) return null;
                                return (
                                    <SessionEntry key={'s' + i} session={session.session} email={session.email} emailType={session.emailType ?? ''} />
                                )
                            }) : <Flex className="w-full min-h-96" justify="center" align="center"><TimedProgress seconds={15} /></Flex>}
                        </Flex>
                        {sessionsByEmail && sessionsByEmail.length > 0 && sessionsByEmail.length < totalEmails.current ? <Loader className=" my-6 ml-auto mr-auto" color="blue" size="md" type="bars" /> : null}
                    </ScrollArea>
                </Flex >
            </Flex>

        </Flex>
    )
}

function TimedProgress({ seconds }: { seconds: number }) {
    const [progress, setProgress] = useState(0);
    const intervalTime = 500;

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                return prev + (intervalTime / (seconds * 1000)) * 100;
            });
        }, intervalTime);
        return () => clearInterval(interval);
    }, []);

    return (
        <Progress value={progress} transitionDuration={intervalTime * 2} w="100%" h={10} mx={20} />
    );
}

function SessionEntry({ session, email, emailType }: { session: Session, email?: Email, emailType?: string }) {
    const colorMain = PROGRAM_COLORS[session.Program as keyof typeof PROGRAM_COLORS] + '44';
    const colorPill = PROGRAM_COLORS[session.Program as keyof typeof PROGRAM_COLORS] + 'ff';
    const sessionDateMessage = useMemo(() => {
        return moment(session["Session Date"])?.format('ddd, MMM D');
    }, [])


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
                            {sessionDateMessage}
                        </Text>
                    </Flex>
                </Pill>
                {
                    session["Is Combined Workshop Session"] === undefined
                        && session["Is Combined Options Session"] === undefined ?
                        <Pill fw={700} bg={TIME_OF_DAY_COLOR(parseInt(moment(session["Session Date"])?.format('H') ?? '0')) + '.2'} radius={5} mr={-3} >
                            <Flex pt={2.5} gap={6}>
                                <Text fw={700} size="sm" c={TIME_OF_DAY_COLOR(parseInt(moment(session["Session Date"])?.format('H') ?? '0')) + '.9'} mt={-2}>
                                    {moment(session["Session Date"])?.format('h:mma').replace(':00', '')}
                                </Text>
                            </Flex>
                        </Pill>
                        : null
                }
                {
                    session["Is Combined Workshop Session"] !== undefined ?
                        <>
                            <Pill fw={700} bg={TIME_OF_DAY_COLOR(parseInt(moment(session["Lecture Date"])?.format('H') ?? '0')) + '.2'} radius={5} mr={-3} >
                                <Flex pt={2.5} gap={6}>
                                    <Text fw={700} size="sm" c={TIME_OF_DAY_COLOR(parseInt(moment(session["Lecture Date"])?.format('H') ?? '0')) + '.9'} mt={-2}>
                                        {moment(session["Lecture Date"])?.format('h:mma').replace(':00', '')}
                                    </Text>
                                </Flex>
                            </Pill>
                            <Pill fw={700} bg={TIME_OF_DAY_COLOR(parseInt(moment(session["Coaching Date"])?.format('H') ?? '0')) + '.2'} radius={5} mr={-3} >
                                <Flex pt={2.5} gap={6}>
                                    <Text fw={700} size="sm" c={TIME_OF_DAY_COLOR(parseInt(moment(session["Coaching Date"])?.format('H') ?? '0')) + '.9'} mt={-2}>
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
                            <Pill fw={700} bg={TIME_OF_DAY_COLOR(parseInt(moment(session["First Date"])?.format('H') ?? '0')) + '.2'} radius={5} mr={-3} >
                                <Flex pt={2.5} gap={6}>
                                    <Text fw={700} size="sm" c={TIME_OF_DAY_COLOR(parseInt(moment(session["First Date"])?.format('H') ?? '0')) + '.9'} mt={-2}>
                                        {moment(session["First Date"])?.format('h:mma').replace(':00', '')}
                                    </Text>
                                </Flex>
                            </Pill>
                            <Pill fw={700} bg={TIME_OF_DAY_COLOR(parseInt(moment(session["Second Date"])?.format('H') ?? '0')) + '.2'} radius={5} mr={-3} >
                                <Flex pt={2.5} gap={6}>
                                    <Text fw={700} size="sm" c={TIME_OF_DAY_COLOR(parseInt(moment(session["Second Date"])?.format('H') ?? '0')) + '.9'} mt={-2}>
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
                        <EmailEntry key={session.id + i + 'email'} email={emails[key]} />
                    )
                })}
            </Flex> : ''}
        </Flex>
    )
}

function EmailEntry({ email }: { email: Email, }) {
    const [editorState, setEditorState, isLoading, setEditorStateDelayed] = useContext(EditorContext);
    const [savedStates, loadEmail, deleteEmail, editEmail] = useContext(SavedEmailsContext);
    const [globalSettings] = useContext(GlobalSettingsContext);
    const [hovering, setHovering] = useState(false);

    useEffect(() => { }, [JSON.stringify(savedStates)]);

    const program = email.values?.getCurrentValue('Program');
    const colorMain = PROGRAM_COLORS[program as keyof typeof PROGRAM_COLORS] + '22';
    const colorPill = PROGRAM_COLORS[program as keyof typeof PROGRAM_COLORS] + 'ff';

    const type = email.values?.getCurrentValue('Email Type');
    const sendDate = email.values?.resolveValue('Send Date', true);

    const isManual = email.values?.getCurrentValue('Creation Type') === 'manual';

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

    const sendDateMessage = useMemo(() => {
        if (!sendDateMoment) return null;
        const day1 = sendDateMoment.dayOfYear();
        const day2 = moment().dayOfYear();
        if (day1 === day2) return 'Today';
        if (day1 - 1 === day2) return 'Tomorrow';
        return sendDateMoment?.format('ddd, MMM D');
    }, [])


    const emailSave = useMemo(() => {
        if (!email || !email.values || !savedStates) return null;
        const saveName = email.values.resolveValue('Email ID', true);
        const saveState = savedStates.find((state) => {
            return state && normalizeName(state.email?.name) === normalizeName(saveName)
        });
        return saveState;
    }, [email, JSON.stringify(savedStates)]);


    const handleSubmit = async () => {
        if (!emailSave) {
            console.log('Starting an email as ', email);
            email.values?.setValue('Last Populated', { value: new Date(), source: 'remote' });
            setEditorStateDelayed({ step: 1, email: email });
        } else {
            setEditorStateDelayed(emailSave)
        }
    };

    const emailStatus = getStatusFromEmail(isManual ? email : emailSave?.email);


    const isPreApproved = useMemo(() => {
        if (!emailSave || !emailSave.email) return false;
        return isPreApprovedTemplate(emailSave.email.template, savedStates);
    }, [emailSave]);

    const needsNotionCard = useMemo(() => {
        if (!emailSave || !emailSave.email) return true;
        return (!emailSave.email.notionURL || emailSave.email.notionURL.length == 0) && emailStatus !== 'Scheduled' && emailStatus !== 'Sent';
    }, [emailSave]);

    const [cardPending, setCardPending] = useState(false);

    const createCard = async () => {
        if (cardPending) return;

        setCardPending(true);
        let state: EditorState = await loadEmail(email?.values?.resolveValue('Email ID', true) ?? '') ?? { step: 1, email: email };

        if (!state || !state.email) {
            console.error('No state to create Notion card for email', email);
            setCardPending(false);
            return;
        }

        state.email.values = new Values(state.email.values?.initialValues);

        let newEmail = await createReferenceDoc(state?.email ?? email, globalSettings.googleAccessToken ?? '');
        console.log('[INLINE-NOTION] Created reference doc for email', newEmail);

        newEmail = await createNotionCardForEmail(newEmail, isPreApproved);
        if (!newEmail) {
            console.error('Failed to create Notion card for email', email);
            return;
        }
        console.log('[INLINE-NOTION] Created Notion card for email', newEmail);

        const newState = {
            ...state,
            email: newEmail
        };

        await editEmail(newState);
        console.log('[INLINE-NOTION] Saved email with new Notion card', newState);

        setCardPending(false);
    }

    const [notesPending, setNotesPending] = useState(false);
    const [madeNotes, setMadeNotes] = useState(false);

    const needsCollabNotes = useMemo(() => {
        if (madeNotes) return false;

        let state = emailSave?.email ?? email;

        const usesCollabNotes = state?.values?.getCurrentValue('Uses Collab Notes') === 'Uses Collab Notes';

        if (!usesCollabNotes) return false;

        const collabNotes = state?.values?.getCurrentValue('Collab Notes Link');
        if (!collabNotes || collabNotes.length === 0)
            return true;

    }, [email, emailSave]);

    const createCollabNotes = async () => {
        if (notesPending) return;

        setNotesPending(true);
        let state: EditorState = await loadEmail(email?.values?.resolveValue('Email ID', true) ?? '') ?? { step: 1, email: email };


        const values = new Values(state?.email?.values?.initialValues);
        if (!values)
            return console.error('No values for email', email);

        const sourceDoc = values.resolveValue("Source Collab Notes Doc", true) ?? '';
        if (!sourceDoc || sourceDoc.length === 0) {
            console.error('No source doc for collab notes', email);
            setNotesPending(false);
            return;
        }
        console.log("[INLINE-NOTES] Creating collab notes from source doc", sourceDoc);

        const contentRes = await getGoogleDocContentByUrl(sourceDoc, globalSettings.googleAccessToken ?? '');

        if (!contentRes.success || !contentRes.content || !contentRes.title) {
            console.log("Error getting doc content", contentRes.error);
            return;
        }
        console.log("[INLINE-NOTES] Got content for collab notes doc", contentRes.title);

        const requests = createVariableEdits(contentRes, values);

        const newTitle = new Variables(contentRes.title).resolveWith(values);

        const createRes = await createSiblingGoogleDoc(sourceDoc, newTitle, requests, globalSettings.googleAccessToken ?? '');

        const { success, newFileId, error } = createRes;
        if (!success || !newFileId) {
            console.log("Error creating sibling doc", error);
            return;
        }
        console.log("[INLINE-NOTES] Created collab notes doc", createRes);


        const url = createGoogleDocLink(newFileId);

        console.log("[INLINE-NOTES] Created new collaborative notes doc: ", url);
        values.setValue('Collab Notes Link', { value: url, source: 'remote' });

        if (!state) {
            console.error('No state to edit email with new collab notes', email);
            setNotesPending(false);
            return;
        }

        const notesName = values.resolveValue('Collab Notes Name', true) ?? new Variables('{Send Date (YYYY-MM-DD)} {Email Name}').resolveWith(values);
        let pdfUrl = values.resolveValue('Collab PDF Link', true) ?? '';
        let ids = [values.resolveValue('id', true)];
        let originalIds = [values.resolveValue('Original ID', true)];

        if (values.getCurrentValue('Is Combined Workshop Session') === 'Is Combined Workshop Session') {
            ids = [values.getCurrentValue('Lecture ID'), values.getCurrentValue('Coaching ID')];
            originalIds = [values.getCurrentValue('Original Lecture ID'), values.getCurrentValue('Original Coaching ID')];
        }
        if (values.getCurrentValue('Is Combined Options Session') === 'Is Combined Options Session') {
            ids = [values.getCurrentValue('First ID'), values.getCurrentValue('Second ID')];
            originalIds = [values.getCurrentValue('Original First ID'), values.getCurrentValue('Original Second ID')];
        }

        const pdfRes = await saveNotesDoc(notesName, url, ids, values.resolveValue('Calendar Table ID', true), originalIds, pdfUrl);
        console.log("[INLINE-NOTES] Saved notes doc as PDF", pdfRes);

        if (!pdfRes.success) {
            console.log("Error saving notes doc", pdfRes.error);
            return;
        }
        pdfUrl = pdfRes.pdfUrl;

        values.setValue('Collab PDF Link', { value: pdfUrl, source: 'remote' });

        const newState = {
            ...state,
            email: { ...state.email, values: new Values(values.initialValues) }
        };

        // await editEmail(newState);
        setMadeNotes(true);
        console.log("[INLINE-NOTES] Edited email with new collab notes", newState);

        setNotesPending(false);
    }


    const button = useMemo(() => {
        const sharedProps = {
            h: 24,
            onMouseUp: handleSubmit,
            variant: 'filled',
            color: '',
            px: 12,
        };
        if (!emailStatus)
            return <Button {...sharedProps}>Start</Button>;

        sharedProps.color = (STATUS_COLORS[emailStatus][1] as string).split('.')[0] + '.8';

        if (emailStatus === 'Editing')
            return <Button {...sharedProps} pr={10} rightSection={<IconEdit size={16} strokeWidth={2.5} className=" -ml-1" />}>Editing</Button>;
        if (emailStatus === 'Uploaded')
            return <Button {...sharedProps} pr={10} rightSection={<IconArrowRight size={16} strokeWidth={2.5} className=" -ml-1" />} >Uploaded</Button>;
        if (emailStatus === 'Review')
            return <Button {...sharedProps} pl={8} leftSection={<IconClock size={16} strokeWidth={2.5} className=" -mr-1" />}>Review</Button>;
        if (emailStatus === 'Ready')
            return <Button {...sharedProps} pr={10} rightSection={<IconBrandTelegram size={16} strokeWidth={2.5} className=" -ml-1" />} >Ready</Button>;
        if (emailStatus === 'Scheduled')
            return <Button {...sharedProps} pl={10} leftSection={<IconCheck size={16} strokeWidth={3} className=" -mr-0.5" />}>Done</Button>;
        if (emailStatus === 'Sent')
            return <Button {...sharedProps} pl={10} leftSection={<IconCheck size={16} strokeWidth={3} className=" -mr-0.5" />}>Done</Button>;
        return <Button h={24} onMouseUp={handleSubmit}>Open</Button>;
    }, [emailStatus]);





    return (
        <Flex align="center" justify="start" gap={10} className={`p-2 rounded-md w-full bg-gray-100 cursor-pointer relative overflow-hidden whitespace-nowrap hover:bg-gray-300 max-w-[545px]`}
            style={{ backgroundColor: colorMain }}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
        >
            <Pill fw={700} bg={colorPill} radius={5} >
                <Flex pt={2.5} gap={6}>
                    <IconMailFilled size={16} stroke={2} color="white" />
                    <Text fw={700} size="sm" c="white" mt={-2}>{type}</Text>
                </Flex>
            </Pill>
            <Pill fw={700} bg={DAY_OF_WEEK_COLOR[sendDateMoment?.format('dddd') as keyof typeof DAY_OF_WEEK_COLOR] + '.2'} radius={5} ml={1} >
                <Flex pt={2.5} gap={6}>
                    <Text fw={700} size="sm" c={DAY_OF_WEEK_COLOR[sendDateMoment?.format('dddd') as keyof typeof DAY_OF_WEEK_COLOR] + '.9'} mt={-2}>{sendDateMessage}</Text>
                </Flex>
            </Pill>
            <Pill fw={700} bg={TIME_OF_DAY_COLOR(parseInt(sendDateMoment?.format('H') ?? '0')) + '.2'} radius={5} ml={-3} >
                <Flex pt={2.5} gap={6}>
                    <Text fw={700} size="sm" c={TIME_OF_DAY_COLOR(parseInt(sendDateMoment?.format('H') ?? '0')) + '.9'} mt={-2}>{sendDateMoment?.format('h:mma').replace(':00', '')}</Text>
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
            {
                savedStates && savedStates.length > 0 ? (
                    <>
                        <EmailMenu editorState={emailSave ?? { step: 1, email: email }} target={
                            <ActionIcon c={colorPill} bg='none' radius='sm' size={24} w={24} ml='auto' opacity={hovering ? 1 : 0} className=" transition-opacity duration-200 ease-in-out" >
                                <IconDots size={30} strokeWidth={2} />
                            </ActionIcon>
                        } loader={
                            <ActionIcon radius='sm' size={24} w={30} ml='auto' opacity={1} className=" transition-opacity duration-200 ease-in-out">
                                <Loader color="white" type="dots" size={16} />
                            </ActionIcon>
                        } />
                        {needsNotionCard ? <ActionIcon
                            color={((STATUS_COLORS[emailStatus ?? 'Ready'][1] as string).split('.')[0] + '.6')}
                            size={24}
                            onMouseUp={createCard}
                        >
                            {
                                !cardPending ?
                                    <IconCalendarPlus size={16} strokeWidth={2.5} className="" />
                                    : <Loader color="white" type="oval" size={12} />
                            }
                        </ActionIcon> : null}
                        {needsCollabNotes ? <ActionIcon
                            color={((STATUS_COLORS[emailStatus ?? 'Ready'][1] as string).split('.')[0] + '.6')}
                            size={24}
                            onMouseUp={createCollabNotes}
                        >
                            {
                                !notesPending ?
                                    <IconFilePlus size={16} strokeWidth={2.5} className="" />
                                    : <Loader color="white" type="oval" size={12} />
                            }
                        </ActionIcon> : null}
                        {button}
                    </>)
                    : (<Loader color={colorPill} size={24} type="oval" className=" ml-auto mr-2" />)
            }
        </Flex>
    )
}