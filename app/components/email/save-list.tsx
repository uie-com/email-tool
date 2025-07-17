"use client";

import { PROGRAM_COLORS } from "@/config/app-settings";
import { EditorContext, GlobalSettingsContext, MessageContext } from "@/domain/context";
import { markEmailDone, markEmailIncomplete } from "@/domain/email/email-actions";
import { shortenIdentifier } from "@/domain/email/identifiers/parsePrograms";
import { SavedEmailsContext, saveScheduleOpen } from "@/domain/email/save/saveData";
import { getEmailFromSchedule } from "@/domain/email/schedule/scheduleActions";
import { deleteCampaign, deleteTemplate } from "@/domain/integrations/active-campaign/api";
import { createAutomationLink, createCampaignLink, createTemplateLink } from "@/domain/integrations/links";
import { openPopup } from "@/domain/interface/popup";
import { EditorState, Email, STATUS_COLORS, Saves, getStatusFromEmail } from "@/domain/schema";
import { Values } from "@/domain/values/valueCollection";
import { ActionIcon, Anchor, Badge, Box, Button, Flex, Loader, Menu, ScrollArea, Text, ThemeIcon } from "@mantine/core";
import { useClickOutside } from "@mantine/hooks";
import { IconArrowBackUp, IconArrowLeft, IconArrowRight, IconBackspace, IconCalendarFilled, IconCheck, IconDots, IconExternalLink, IconFile, IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand, IconMail, IconMailPlus, IconPlus, IconRouteOff, IconTrash } from "@tabler/icons-react";
import moment from "moment-timezone";
import { useContext, useEffect, useMemo, useRef, useState } from "react";

export function EmailMenuWrapper() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <Flex className="absolute top-0 bottom-0 left-0 w-0" gap={0} >
            <SidebarBumper setIsSidebarOpen={setIsSidebarOpen} />
            <ScheduleButton isSidebarOpen={isSidebarOpen} />
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <SidebarIcon isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        </Flex>
    );
}

function ScheduleButton({ isSidebarOpen }: { isSidebarOpen: boolean }) {
    const [editorState, setEditorState] = useContext(EditorContext);

    const handleOpenSchedule = () => {
        saveScheduleOpen();
        setEditorState({
            step: 0
        });
    }

    if (editorState.step === 0)
        return null;

    return (
        <Button className={" absolute left-18 top-5.5 min-w-48 z-50 transition-transform  " + (isSidebarOpen ? ' translate-x-[1px]' : 'translate-x-0 ')} px={0} pr={8} h={36} color="gray.6" variant="light" leftSection={<IconArrowLeft size={20} strokeWidth={2.5} style={{ marginBottom: '1px' }} />} onClick={handleOpenSchedule} >
            Return to Schedule
        </Button >
    )

}

function Sidebar({ isSidebarOpen, setIsSidebarOpen }: { isSidebarOpen: boolean, setIsSidebarOpen: (isOpen: boolean) => void }) {
    const [editorState, setEditorState] = useContext(EditorContext);
    const [emailStates, loadEmail, deleteEmail, editEmail] = useContext(SavedEmailsContext);

    const [pinSidebar, setPinSidebar] = useState(false);

    const ref = useClickOutside(() => setIsSidebarOpen(false));

    const [selectedEmail, setSelectedEmail] = useState<string | undefined>(editorState.email?.name ?? undefined);
    useEffect(() => {
        console.log('Selected email changed:', selectedEmail);
        if (!editorState.email?.name)
            setSelectedEmail(undefined);
        else
            setSelectedEmail(editorState.email?.name);

    }, [editorState.email?.name]);

    const [isLoaded, setIsLoaded] = useState(false);

    const [showFinished, setShowFinished] = useState(false);

    // Update on save state change
    const [sortedEmailStates, setSortedEmailStates] = useState<Saves>([]);
    useEffect(() => {
        let sorted = emailStates.sort((a, b) => {
            const aDate = moment(a.email?.values?.resolveValue('Send Date', true));
            const bDate = moment(b.email?.values?.resolveValue('Send Date', true));

            let score = showFinished ?
                (aDate.isAfter(bDate) ? -1 : 1)
                : (aDate.isAfter(bDate) ? 1 : -1);

            if (aDate.isSame(bDate)) {
                score = a.email?.name?.localeCompare(b.email?.name ?? '') ?? 0;
                if (a.email?.values?.getCurrentValue('Is Variation') === 'Is Variation')
                    score = 1; // Variations should always be on bottom
            }

            return score;
        });
        const result = showFinished ? sorted : sorted.filter((state) => {
            const sendDate = state.email?.values?.resolveValue('Send Date', true);
            const isValidDate = moment(sendDate).isValid();
            const daysBeforeToday = moment(sendDate).diff(moment(), 'days') > -5;
            return isValidDate && daysBeforeToday;
        });
        setSortedEmailStates(result);
    }, [emailStates, showFinished]);

    // Will be different between server and client
    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const handleToggleShowFinished = () => {
        setShowFinished((prev) => !prev);
    }

    const handleDefaultClick = (e: React.MouseEvent<HTMLDivElement>) => {
        console.log('Clicked outside', e.target, e.currentTarget);
        if (e.target === e.currentTarget) {
            setEditorState({ step: 0 });
        }
    }

    if (!isLoaded)
        return null;

    return (
        <Flex className={" flex-col items-center  absolute transition-transform z-40 border-gray-200 border-r-1 overflow-y-hidden " + (isSidebarOpen || pinSidebar ? 'translate-x-[300px]' : 'translate-x-0')} w={300} h="100vh" left="-300px" top={0} bottom={0} bg="gray.0" suppressHydrationWarning ref={ref} pb={72} pt={72} >
            <ScrollArea className="w-full h-full" type="hover" offsetScrollbars scrollbarSize={8} styles={{ scrollbar: { backgroundColor: 'transparent' } }} viewportProps={{ onClick: handleDefaultClick }}>
                <Flex className=" flex-col items-center justify-start px-2.5" gap={12}>
                    {/* <NewEmailButton /> */}
                    <Flex justify='space-between' align='center' direction='row' className="w-full pl-2 mt-4 ">
                        <Text fz={14} fw={600} c='dimmed'>{showFinished ? 'All Saved Emails' : 'Pending Emails'}</Text>
                        <Anchor fz={14} fw={400} c='dimmed' onClick={handleToggleShowFinished}>{showFinished ? 'Hide Finished' : 'Show All'}</Anchor>
                    </Flex>
                    {sortedEmailStates.length > 0 ? sortedEmailStates.map((state) => {
                        const selected = selectedEmail === state.email?.name;

                        if (!selected && !showFinished && (getStatusFromEmail(state.email) === 'Sent' || getStatusFromEmail(state.email) === 'Scheduled'))
                            return null;

                        if (state.email?.isPreliminary)
                            return null;

                        return (
                            <EmailItem
                                key={state.email?.name}
                                editorState={state}
                                selected={selected}
                                setSelectedEmail={setSelectedEmail}
                                setPinSidebar={setPinSidebar}
                                setIsSidebarOpen={setIsSidebarOpen}
                            />
                        );
                    }) : <Loader className="mt-4" size="md" color="gray" type='oval' />}
                </Flex>
            </ScrollArea>

        </Flex>
    );
}

function NewEmailButton() {
    const [_, setEditorState, isLoaded, setEditorStateDelayed] = useContext(EditorContext);

    return (
        <Button className=" !w-full h-12 mt-2.5" color="blue.5" size="md" leftSection={<IconPlus />} onClick={() => {
            setEditorStateDelayed({
                step: 0,
                email: new Email(new Values([])),
            },);
        }
        }>
            New Email
        </Button>
    );

}

function EmailItem({ editorState, selected, setSelectedEmail, setPinSidebar, setIsSidebarOpen }: { editorState: EditorState, selected: boolean, setSelectedEmail: (airtableId: string) => void, setPinSidebar: (isPinned: boolean) => void, setIsSidebarOpen: (shouldOpen: boolean) => void, }) {
    const [_, setEditorState, isLoaded, setEditorStateDelayed] = useContext(EditorContext);
    const [globalSettings, setGlobalSettings] = useContext(GlobalSettingsContext);
    const [emailStates, loadEmail, deleteEmail, editEmail] = useContext(SavedEmailsContext);


    const [hovered, setHovered] = useState(false);
    const [newlySelected, setNewlySelected] = useState(false);
    const [processing, setProcessing] = useState(false);

    const showMessage = useContext(MessageContext);


    const email = editorState.email;
    const emailId = email?.name as string;
    const id = editorState.email?.airtableId as string ?? emailId;

    const values = useMemo(() => new Values(email?.values?.initialValues), [email?.values?.initialValues]);

    const sendDate = useMemo(() => moment(values?.resolveValue('Send Date', true)).format('ddd, MMMM D'), [email?.values?.initialValues]);

    const program = useMemo(() => values?.resolveValue('Program', true), [values.initialValues]);
    const programColor = useMemo(() => PROGRAM_COLORS[program as keyof typeof PROGRAM_COLORS] + 'ff', [values.initialValues]);

    const emailName = useMemo(() => shortenIdentifier(values.resolveValue('Email Name', true)), [emailId]);
    const emailNameMinusProgram = useMemo(() => Object.keys(PROGRAM_COLORS).reduce((acc, program) => acc.replace(program, ''), emailName), [emailId]);

    const status = useMemo(() => getStatusFromEmail(email), [email, values.initialValues]);
    const statusColor = useMemo(() => STATUS_COLORS[status || 'Editing'], [status]);

    const publishType = useMemo(() => email?.values?.resolveValue('Send Type', true), [email?.values?.initialValues]);

    const isMarkedDone = useMemo(() => email?.isSentOrScheduled, [email]);
    const templateId = useMemo(() => email?.templateId, [email]);
    const campaignId = useMemo(() => email?.campaignId, [email]);
    const automationId = useMemo(() => values.resolveValue('Automation ID', true), [email]);

    const variationVariable = editorState?.email?.values?.resolveValue('Variation Variable', true);
    const variationValues = editorState?.email?.values?.resolveValue('Variation Values', true);
    const currentVariationValue = values.getCurrentValue(variationVariable);
    const isVariation = email?.values?.getCurrentValue('Is Variation') === 'Is Variation';
    const hasVariation = variationVariable && variationValues && !isVariation;
    console.log(currentVariationValue, variationVariable, variationValues);

    if (variationVariable)
        console.log('EmailMenu: hasVariation', variationVariable, variationValues);

    // Rerender ever time the email states change
    useEffect(() => { }, [JSON.stringify(editorState), JSON.stringify(emailStates)]);

    const handleToggleMarkDone = async () => {
        setPinSidebar(true);
        setIsSidebarOpen(true);
        setProcessing(true);


        const newState = {
            ...editorState,
            email: {
                ...email,
                isSentOrScheduled: email?.isSentOrScheduled ? undefined : (
                    email?.templateId ?? 'skipped'
                ),
                templateId: email?.isSentOrScheduled ?
                    email?.templateId === 'skipped' ? undefined : email?.templateId
                    : email?.templateId ?? 'skipped',
            }
        }

        console.log('Marking email as done:', newState);

        if (newState.email?.isSentOrScheduled !== undefined)
            await markEmailDone(editorState);
        else
            await markEmailIncomplete(editorState);

        await editEmail(newState);

        setPinSidebar(false);
        setProcessing(false);
    }

    const handleDeleteTemplate = async (e: React.MouseEvent<HTMLButtonElement>) => {
        setPinSidebar(true);
        setProcessing(true);
        setIsSidebarOpen(true);

        const response = await deleteTemplate(templateId as string);

        const newState = {
            ...editorState,
            email: {
                ...email,
                templateId: undefined,
            }
        }

        if (response)
            await editEmail(newState);

        setProcessing(false);
        setPinSidebar(false);
    }

    const handleDeleteCampaign = async (e: React.MouseEvent<HTMLButtonElement>) => {
        setPinSidebar(true);
        setProcessing(true);
        setIsSidebarOpen(true);
        const response = await deleteCampaign(campaignId as string, globalSettings.activeCampaignToken ?? '');

        const newState = {
            ...editorState,
            email: {
                ...email,
                campaignId: undefined,
            }
        }

        if (response)
            await editEmail(newState);

        setProcessing(false);
        setPinSidebar(false);
    }

    const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>, force: boolean = false) => {
        if ((templateId || campaignId) && !force)
            return showMessage('Deleting While Uploaded', {
                templateId: templateId,
                campaignId: campaignId,
                deleteEmail: () => handleDelete(e, true),
            });


        setPinSidebar(true);
        setProcessing(true);
        setIsSidebarOpen(true);

        await deleteEmail(id);

        setProcessing(false);
        setPinSidebar(false);
    }

    const handleMenuClose = () => {
        setPinSidebar(false);
    }

    const handleSelect = async (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            console.log('Selected email:', editorState);
            setNewlySelected(true);
            setSelectedEmail(emailId);

            const loadedState = await loadEmail(emailId);
            if (!loadedState) {
                console.log('Email not found:', emailId);
                return;
            }

            setEditorStateDelayed({
                ...loadedState,
                email: {
                    ...loadedState?.email,
                    values: new Values(loadedState.email?.values?.initialValues),
                }
            });
        }
    }

    const getIdForVariation = (variationValue: string) => {
        if (!variationVariable || !variationValues || !values) return;

        variationValue = variationValue.trim();

        if (variationValue.includes('20')) // Shorten Win cohorts
            variationValue = variationValue.substring(0, 3);

        let oldVariationValue = values.getCurrentValue(variationVariable);

        if (oldVariationValue && oldVariationValue.includes('20')) // Shorten Win cohorts
            oldVariationValue = oldVariationValue.substring(0, 3);

        const newId = editorState?.email?.name?.replace(oldVariationValue, variationValue);

        return newId
    }

    const createVariation = async (variationValue: string) => {
        if (!variationVariable || !variationValues || !values) return;

        setProcessing(true);
        setIsSidebarOpen(true);
        setPinSidebar(true);


        const userValues = values.source('user');

        console.log('Creating variation for', editorState.email?.name + ' with ' + variationVariable + ' as value ' + variationValue + '. Saving user changes: ', userValues);

        const newEmailId = getIdForVariation(variationValue);

        const hasExisting = emailStates.find((state) => state.email?.name === newEmailId);

        let newEmail: Email | undefined = undefined;

        if (values.getCurrentValue('Creation Type') === 'manual') {
            const manualValues = values.source('email');
            const newValues = new Values(manualValues.initialValues);
            newValues.setValue(variationVariable, { value: variationValue, source: 'email' });

            newEmail = new Email(newValues);
            newEmail.name = newEmailId;
            newEmail.template = email?.template;
        }
        else {
            const newEmailStr = await getEmailFromSchedule(newEmailId);
            newEmail = JSON.parse(newEmailStr ?? '{}');
            newEmail = new Email(newEmail?.values, newEmail);
        }

        if (!newEmail || !newEmail.values) {
            console.error('Failed to create new email:', newEmailId);
            setProcessing(false);
            setPinSidebar(false);
            return;
        }

        newEmail.values.setValue('Last Populated', { value: new Date(), source: 'remote' });
        newEmail.values.setValue('Is Variation', { value: 'Is Variation', source: 'user' });

        newEmail.notionURL = editorState.email?.notionURL;
        newEmail.notionId = editorState.email?.notionId;
        newEmail.referenceDocURL = editorState.email?.referenceDocURL;


        userValues.initialValues.map((value) => {
            newEmail.values?.addValue(value.name, { value: value.getCurrentValue(), source: 'user' });
        });

        await (newEmail as Email).values?.populateRemote();



        editEmail({ step: 1, email: newEmail });
        setEditorState({ step: 1, email: newEmail });

        setProcessing(false);
        setProcessing(false);
        setPinSidebar(false);

    }

    return (
        <Flex
            className={"relative flex-col justify-start items-start w-full h-18 px-2.5 py-2.5 border-gray-200  rounded-sm border-1 cursor-pointer transition-all duration-75 " + (selected ? ' !border-blue-200 !border-1' : '') + (hovered ? ' scale-[103%] opacity-100 !border-gray-200' : ' opacity-95')}
            bg={hovered && !newlySelected ?
                (selected ? 'blue.1' : 'gray.2') : (selected ? 'blue.1' : 'gray.1')
            }
            gap={8}

            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => { setHovered(false); setNewlySelected(false); }}

        >
            <Flex gap={8} align='center' className="z-40 w-full"  >
                <Box className="absolute top-0 bottom-0 left-0 right-0 z-40 " onClick={handleSelect}></Box>
                <Flex className={" justify-center items-center absolute top-0 left-0 right-0 bottom-0 z-30 pointer-events-none " + (processing ? ' backdrop-blur-xs' : '')}>
                    {processing ?
                        <Loader size="md" color="blue" type='dots' />
                        : null}
                </Flex>

                <Menu shadow="sm" width={200} radius='md' position="bottom-end"
                    onClose={handleMenuClose}
                    onOpen={() => setPinSidebar(true)}
                    onDismiss={handleMenuClose}
                    closeOnItemClick={true}
                >
                    <Menu.Target>

                        <ActionIcon className=" !absolute top-0 right-0 z-50" style={{ background: 'none' }} size={32}>
                            {
                                hovered ?
                                    <IconDots size={18} strokeWidth={2.5} color='black' />
                                    : null}
                        </ActionIcon>

                    </Menu.Target>
                    <Menu.Dropdown bg='gray.0' >
                        <Menu.Item color="blue" onClick={handleToggleMarkDone} leftSection={isMarkedDone ? <IconArrowBackUp size={14} /> : <IconCheck size={14} />}>
                            {isMarkedDone ? 'Mark incomplete' : 'Mark as Done'}
                        </Menu.Item>

                        {templateId ?
                            // <Anchor target="_blank" href={createTemplateLink(templateId)}>
                            <Menu.Item color="blue" onClick={() => openPopup(createTemplateLink(templateId))} leftSection={<IconExternalLink size={14} />}>
                                Open Template
                            </Menu.Item>
                            // </Anchor>
                            : <Menu.Item color="gray" disabled leftSection={<IconFile size={14} />}>
                                No Template Made
                            </Menu.Item>}
                        {campaignId ?
                            // <Anchor target="_blank" href={createCampaignLink(campaignId)}>
                            <Menu.Item color="blue" onClick={() => openPopup(createCampaignLink(campaignId))} leftSection={<IconExternalLink size={14} />}>
                                Open Campaign
                            </Menu.Item>
                            // </Anchor>
                            : null}
                        {!campaignId && publishType === 'CAMPAIGN' ? <Menu.Item color="gray" disabled leftSection={<IconMail size={14} />}>
                            No Campaign Made
                        </Menu.Item> : null}
                        {automationId ?
                            // <Anchor target="_blank" href={createAutomationLink(automationId)}>
                            <Menu.Item color="blue" onClick={() => openPopup(createAutomationLink(automationId))} leftSection={<IconExternalLink size={14} />}>
                                Open Automation
                            </Menu.Item>
                            //  </Anchor>
                            : null}
                        {!automationId && publishType === 'AUTOMATION' ? <Menu.Item color="gray" disabled leftSection={<IconRouteOff size={14} />}>
                            No Automation Setting
                        </Menu.Item> : null}

                        <Menu.Divider />

                        {
                            hasVariation ?
                                (
                                    <>
                                        <Menu.Label>Create Variation</Menu.Label>
                                        {variationValues.split(',').filter((v: string) => !emailStates.find((state) => state.email?.name === getIdForVariation(v)) && v.trim() !== currentVariationValue).map((value: string) => (
                                            <Menu.Item key={value} onClick={() => createVariation(value.trim())} leftSection={<IconMailPlus size={14} />}>
                                                {variationVariable} - {value.trim()}
                                            </Menu.Item>
                                        ))}
                                        <Menu.Divider />
                                    </>
                                )
                                : null
                        }

                        {/* Danger area */}
                        {templateId ? <Menu.Item color="red" onClick={handleDeleteTemplate} leftSection={<IconBackspace size={14} />}>
                            Delete Template
                        </Menu.Item> : null}
                        {campaignId ? <Menu.Item color="red" onClick={handleDeleteCampaign} leftSection={<IconBackspace size={14} />}>
                            Delete Campaign
                        </Menu.Item> : null}

                        <Menu.Item color="red" onClick={handleDelete} leftSection={<IconTrash size={14} />}>
                            Remove Email
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>


                <Badge tt='none' radius='sm' px={4} color={programColor} className="pointer-events-none " >
                    <Text fz={14} fw={600} c={'white'}>{program}</Text>
                </Badge>
                {/* <ThemeIcon color={programColor} autoContrast size={17} w={18} pb={0.1}>
                    <IconMail size={14} strokeWidth={2.5} className="" />
                </ThemeIcon> */}
                <Text fz={14} fw={600} className="pointer-events-none ">{(isVariation ? '+ ' : '') + emailNameMinusProgram}</Text>
            </Flex>
            <Flex gap={6} ml={0} w={'100%'} align='center' className="w-full pointer-events-none">
                <Badge tt='none' radius='sm' px={4} color='gray.3' autoContrast
                    leftSection={<IconCalendarFilled size={14} strokeWidth={2.5} opacity={1} className=" mb-[1.5px]" />}
                >
                    <Text fz={14} fw={600}>{sendDate}</Text>
                </Badge>
                {/* <Badge tt='none' radius='lg' ml='auto' px={9} color='pink.3' autoContrast>
                    <Text fz={14} fw={600} c='pink.9'>Ready</Text>
                </Badge> */}
                {
                    !hovered ?
                        <ThemeIcon color={selected ? statusColor[1] as string : statusColor[1] as string} size={24} radius='sm' ml='auto' >
                            {statusColor[0]}
                        </ThemeIcon>
                        :
                        <Badge tt='none' radius='sm' ml='auto' px={6} h={24} color={statusColor[1] as string} rightSection={<IconArrowRight size={18} strokeWidth={2.5} opacity={1} className="" color={statusColor[2] as string} />} >
                            <Text fz={14} fw={600} c={statusColor[2] as string}>{status}</Text>
                        </Badge>
                }
            </Flex>


        </Flex >
    )

}

function SidebarIcon({ isSidebarOpen, setIsSidebarOpen }: { isSidebarOpen: boolean, setIsSidebarOpen: (isOpen: boolean) => void }) {

    return (
        <ActionIcon c='gray.6' bg='none' size={45} className={"!absolute transition-transform top-4 left-4 z-50 " + (isSidebarOpen ? ' translate-x-[1px]' : 'translate-x-0 ')} onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {
                isSidebarOpen ? <IconLayoutSidebarLeftCollapse width={30} height={30} />
                    : <IconLayoutSidebarLeftExpand width={30} height={30} />
            }
        </ActionIcon>
    )
}

function SidebarBumper({ setIsSidebarOpen }: { setIsSidebarOpen: (isOpen: boolean) => void }) {
    const timeoutId = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        if (timeoutId.current) {
            clearTimeout(timeoutId.current);
        }

        timeoutId.current = setTimeout(() => {
            setIsSidebarOpen(true);
        }, 200);
    }

    const handleMouseExit = () => {
        if (timeoutId.current) {
            clearTimeout(timeoutId.current);
        }
    }

    return (
        <Box className="absolute bottom-0 left-0 z-40 w-24 top-24" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseExit} />
    );
}