"use client";

import { SavedEmailsContext } from "@/domain/data/saveData";
import { parseVariableName } from "@/domain/parse/parse";
import { EditorContext, EditorState, Email, getStateFromEmail, STATUS_COLORS } from "@/domain/schema";
import { Values } from "@/domain/schema/valueCollection";
import { PROGRAM_COLORS } from "@/domain/settings/interface";
import { ActionIcon, Badge, Box, Button, Flex, Loader, Menu, ScrollArea, Text, ThemeIcon } from "@mantine/core";
import { useClickOutside } from "@mantine/hooks";
import { IconArrowRight, IconArrowRightBar, IconBrandTelegram, IconCalendar, IconCalendarCheck, IconCalendarFilled, IconDots, IconEdit, IconLayoutSidebar, IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand, IconMail, IconMailCheck, IconMailFilled, IconMailPlus, IconMessageQuestion, IconPlus, IconSend, IconSend2, IconTrash } from "@tabler/icons-react";
import moment from "moment-timezone";
import { MouseEventHandler, useContext, useEffect, useMemo, useRef, useState } from "react";


export function EmailMenuWrapper() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <Flex className="absolute top-0 left-0 w-0 bottom-0" gap={0} >
            <SidebarBumper setIsSidebarOpen={setIsSidebarOpen} />
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <SidebarIcon isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
        </Flex>
    );
}

function Sidebar({ isSidebarOpen, setIsSidebarOpen }: { isSidebarOpen: boolean, setIsSidebarOpen: (isOpen: boolean) => void }) {
    const [editorState, setEditorState] = useContext(EditorContext);
    const [emailStates, deleteEmail] = useContext(SavedEmailsContext);

    const [pinSidebar, setPinSidebar] = useState(false);

    const ref = useClickOutside(() => setIsSidebarOpen(false));

    const [selectedEmail, setSelectedEmail] = useState<string | undefined>(editorState.email?.name);
    const [isLoaded, setIsLoaded] = useState(false);

    if (selectedEmail !== editorState.email?.name) {
        setSelectedEmail(editorState.email?.name);
    }

    const sortedEmailStates = useMemo(() => {
        let sorted = emailStates.sort((a, b) => {
            const aDate = moment(a.email?.values?.resolveValue('Send Date', true));
            const bDate = moment(b.email?.values?.resolveValue('Send Date', true));
            return aDate.isAfter(bDate) ? 1 : -1;
        });
        return sorted.filter((state) => {
            const sendDate = state.email?.values?.resolveValue('Send Date', true);
            const isValidDate = moment(sendDate).isValid();
            const daysBeforeToday = moment(sendDate).diff(moment(), 'days') > -5;
            return isValidDate && daysBeforeToday;
        });
    }, [emailStates]);

    // Will be different between server and client
    useEffect(() => {
        setIsLoaded(true);
    }, []);

    if (!isLoaded)
        return null;

    return (
        <Flex className={" flex-col items-center  absolute transition-transform z-40 border-gray-200 border-r-1 overflow-y-hidden " + (isSidebarOpen || pinSidebar ? 'translate-x-[300px]' : 'translate-x-0')} w={300} h="100vh" left="-300px" top={0} bottom={0} bg="gray.0" suppressHydrationWarning ref={ref} >
            <ScrollArea className="w-full h-full" type="hover" offsetScrollbars scrollbarSize={8} styles={{ scrollbar: { backgroundColor: 'transparent' } }} >
                <Flex className=" flex-col items-center justify-start pt-22 px-2.5" gap={12}>
                    <NewEmailButton />
                    {sortedEmailStates.map((state) => {
                        const selected = selectedEmail === state.email?.name;
                        return (
                            <EmailItem
                                key={state.email?.name}
                                editorState={state}
                                selected={selected}
                                setSelectedEmail={setSelectedEmail}
                                deleteEmail={async (e: React.MouseEvent<HTMLButtonElement>) => {
                                    return await deleteEmail(state.email?.airtableId ?? state.email?.name);
                                }}
                                setPinSidebar={setPinSidebar}
                                setIsSidebarOpen={setIsSidebarOpen}
                            />
                        );
                    })}
                </Flex>
            </ScrollArea>

        </Flex>
    );
}

function NewEmailButton() {
    const [_, setEditorState] = useContext(EditorContext);

    return (
        <Button className=" !w-full h-12 mt-2.5" color="blue.5" size="md" leftSection={<IconPlus />} onClick={() => {
            setEditorState({
                step: 0,
                email: new Email(new Values([])),
            });
        }
        }>
            New Email
        </Button>
    );

}

function EmailItem({ editorState, selected, deleteEmail, setSelectedEmail, setPinSidebar, setIsSidebarOpen }: { editorState: EditorState, selected: boolean, deleteEmail: (e: React.MouseEvent<HTMLButtonElement>) => Promise<boolean>, setSelectedEmail: (airtableId: string) => void, setPinSidebar: (isPinned: boolean) => void, setIsSidebarOpen: (shouldOpen: boolean) => void }) {
    const [_, setEditorState] = useContext(EditorContext);
    const [hovered, setHovered] = useState(false);
    const [newlySelected, setNewlySelected] = useState(false);
    const [processing, setProcessing] = useState(false);


    const email = editorState.email;
    const emailId = email?.name as string;

    const values = useMemo(() => new Values(email?.values?.initialValues), [email?.values?.initialValues]);

    const sendDate = useMemo(() => moment(values?.resolveValue('Send Date', true)).format('ddd, MMMM D'), [email?.values?.initialValues]);

    const program = useMemo(() => values?.resolveValue('Program', true), [values.initialValues]);
    const programColor = useMemo(() => PROGRAM_COLORS[program as keyof typeof PROGRAM_COLORS] + 'ff', [values.initialValues]);
    const subject = useMemo(() => values?.resolveValue('Subject', true), [values.initialValues]);

    const emailName = useMemo(() => emailId.split(' ').slice(1).join(' '), [emailId]);
    const emailNameMinusProgram = useMemo(() => Object.keys(PROGRAM_COLORS).reduce((acc, program) => acc.replace(program, ''), emailName), [emailId]);

    const status = useMemo(() => getStateFromEmail(email), [email, values.initialValues]);
    const statusColor = useMemo(() => STATUS_COLORS[status || 'Editing'], [status]);

    // Rerender ever time the email states change
    useEffect(() => { }, [JSON.stringify(editorState)]);

    const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
        setPinSidebar(true);
        setProcessing(true);
        setIsSidebarOpen(true);

        const deleted = await deleteEmail(e);

        setProcessing(false);
        setPinSidebar(false);
    }

    const handleMenuClose = () => {
        setPinSidebar(false);
    }

    const handleSelect = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            console.log('Selected email:', editorState);
            setNewlySelected(true);
            setSelectedEmail(emailId);

            setEditorState({
                ...editorState,
                email: {
                    ...email,
                    values: new Values(email?.values?.initialValues),
                }
            });
        }
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
            <Flex gap={8} align='center' className="w-full z-40"  >
                <Box className=" absolute top-0 left-0 right-0 bottom-0 z-40" onClick={handleSelect}></Box>
                <Flex className={" justify-center items-center absolute top-0 left-0 right-0 bottom-0 z-30 pointer-events-none " + (processing ? ' backdrop-blur-xs' : '')}>
                    {processing ?
                        <Loader size="md" color="blue" type='dots' />
                        : null}
                </Flex>

                <Menu shadow="sm" width={200} radius='md' position="bottom-end"
                    onClose={handleMenuClose}
                    onOpen={() => setPinSidebar(true)}
                    onDismiss={handleMenuClose}
                    closeOnItemClick={false}
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
                        <Menu.Item color="red" onClick={handleDelete} leftSection={<IconTrash size={14} />}>
                            Remove Email
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>


                <Badge tt='none' radius='sm' px={4} color={programColor} className=" pointer-events-none" >
                    <Text fz={14} fw={600} c={'white'}>{program}</Text>
                </Badge>
                {/* <ThemeIcon color={programColor} autoContrast size={17} w={18} pb={0.1}>
                    <IconMail size={14} strokeWidth={2.5} className="" />
                </ThemeIcon> */}
                <Text fz={14} fw={600} className=" pointer-events-none">{emailNameMinusProgram}</Text>
            </Flex>
            <Flex gap={6} ml={0} w={'100%'} align='center' className="w-full pointer-events-none">
                <Badge tt='none' radius='sm' px={4} color='gray.4' autoContrast
                    leftSection={<IconCalendarFilled size={14} strokeWidth={2.5} opacity={0.6} className=" mb-[1.5px]" />}
                >
                    <Text fz={14} fw={500}>{sendDate}</Text>
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
        <Box className="absolute top-24 bottom-0 left-0 w-12 z-40" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseExit} />
    );
}