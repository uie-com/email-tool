"use client";

import { SavedEmailsContext } from "@/domain/data/save";
import { parseVariableName } from "@/domain/parse/parse";
import { EditorContext, EditorState, Email, getStateFromEmail, STATUS_COLORS } from "@/domain/schema";
import { Values } from "@/domain/schema/valueCollection";
import { PROGRAM_COLORS } from "@/domain/settings/interface";
import { ActionIcon, Badge, Box, Button, Flex, Menu, Text, ThemeIcon } from "@mantine/core";
import { useClickOutside } from "@mantine/hooks";
import { IconArrowRight, IconArrowRightBar, IconBrandTelegram, IconCalendar, IconCalendarCheck, IconCalendarFilled, IconDots, IconEdit, IconLayoutSidebar, IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand, IconMail, IconMailCheck, IconMailFilled, IconMailPlus, IconMessageQuestion, IconPlus, IconSend, IconSend2, IconTrash } from "@tabler/icons-react";
import moment from "moment-timezone";
import { MouseEventHandler, useContext, useEffect, useMemo, useRef, useState } from "react";


export function EmailMenuWrapper({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <Flex className="w-full h-full max-w-screen flex-row items-center justify-center relative">
            <SidebarBumper setIsSidebarOpen={setIsSidebarOpen} />
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <SidebarIcon isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

            <Box className="relative w-full h-full">
                {children}
            </Box>
        </Flex>
    );
}

function Sidebar({ isSidebarOpen, setIsSidebarOpen }: { isSidebarOpen: boolean, setIsSidebarOpen: (isOpen: boolean) => void }) {
    const [editorState, setEditorState] = useContext(EditorContext);
    const [emailStates, deleteEmail] = useContext(SavedEmailsContext);

    const ref = useClickOutside(() => setIsSidebarOpen(false));

    const [isLoaded, setIsLoaded] = useState(false);

    const selectedEmailId = useMemo(() => {
        if (editorState?.email?.id) {
            return Object.keys(emailStates).find((k) => editorState.email && parseVariableName(emailStates[k].email?.id) === parseVariableName(editorState.email?.id));
        }
        return null;
    }, [emailStates, editorState]);

    // Will be different between server and client
    useEffect(() => {
        setIsLoaded(true);
    }, []);

    if (!isLoaded)
        return null;


    return (
        <Flex className={" flex-col items-center justify-start pt-22 px-2.5 absolute transition-transform z-40 border-gray-200 border-r-1 " + (isSidebarOpen ? 'translate-x-[300px]' : 'translate-x-0')} w={300} h="100vh" left="-300px" top={0} bottom={0} bg="gray.0" suppressHydrationWarning ref={ref} gap={12}>
            <NewEmailButton />
            {Object.keys(emailStates).map((key) => {
                const selected = selectedEmailId === key;
                return (
                    <EmailItem
                        key={key}
                        editorState={emailStates[key]}
                        selected={selected}
                        handleDelete={(e: React.MouseEvent<HTMLButtonElement>) => {
                            setIsSidebarOpen(true);
                            return deleteEmail(key)
                        }}
                    />
                );
            })}
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

function EmailItem({ editorState, selected, handleDelete }: { editorState: EditorState, selected: boolean, handleDelete: (e: React.MouseEvent<HTMLButtonElement>) => Promise<boolean> }) {
    const [_, setEditorState] = useContext(EditorContext);
    const [hovered, setHovered] = useState(false);
    const [newlySelected, setNewlySelected] = useState(false);

    const email = editorState.email;
    const emailId = email?.id as string;

    const values = useMemo(() => new Values(email?.values?.initialValues), [email?.values?.initialValues]);

    const sendDate = useMemo(() => moment(values?.resolveValue('Send Date', true)).format('dddd, MMMM Do'), [email?.values?.initialValues]);

    const program = useMemo(() => values?.resolveValue('Program', true), [values.initialValues]);
    const programColor = useMemo(() => PROGRAM_COLORS[program as keyof typeof PROGRAM_COLORS] + 'ff', [values.initialValues]);
    const subject = useMemo(() => values?.resolveValue('Subject', true), [values.initialValues]);

    const emailName = useMemo(() => emailId.split(' ').slice(1).join(' '), [emailId]);
    const emailNameMinusProgram = useMemo(() => Object.keys(PROGRAM_COLORS).reduce((acc, program) => acc.replace(program, ''), emailName), [emailId]);

    const status = useMemo(() => getStateFromEmail(email), [email, values.initialValues]);
    const statusColor = useMemo(() => STATUS_COLORS[status || 'Editing'], [status]);

    const handleSelect = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            console.log('Selected email:', editorState);
            setNewlySelected(true);

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
                {
                    hovered ?
                        <Menu shadow="sm" width={200} radius='md' position="bottom-end" >
                            <Menu.Target>
                                <ActionIcon color="gray.2" className=" !absolute top-0 right-0 z-50" size={32} onClick={(e) => { }}>
                                    <IconDots size={18} strokeWidth={2.5} color='black' />
                                </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown bg='gray.0'>
                                <Menu.Item color="red" onClick={handleDelete} leftSection={<IconTrash size={14} />}>
                                    Remove Email
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                        : null
                }

                <Badge tt='none' radius='sm' px={4} color={programColor} autoContrast className=" pointer-events-none" >
                    <Text fz={14} fw={600} >{program}</Text>
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
                {!selected ? !hovered ?
                    <ThemeIcon color={statusColor[1] as string} size={24} radius='sm' ml='auto'>
                        {statusColor[0]}
                    </ThemeIcon>
                    :
                    <Badge tt='none' radius='sm' ml='auto' px={6} h={24} color={statusColor[1] as string} rightSection={<IconArrowRight size={18} strokeWidth={2.5} opacity={1} className="" color={statusColor[2] as string} />} >
                        <Text fz={14} fw={600} c={statusColor[2] as string}>{status}</Text>
                    </Badge>
                    : null
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