
import { EditorContext } from "@/domain/context";
import { ActionIcon, Badge, Box, Flex, HoverCard, Loader, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconArrowBackUp, IconExternalLink, IconRefresh } from "@tabler/icons-react";
import moment from "moment-timezone";
import { createContext, useContext, useEffect, useState } from "react";

export const HadIssue = createContext<[boolean, React.Dispatch<React.SetStateAction<boolean>>]>([false, () => { }]);
export type StepState = 'waiting' | 'ready' | 'manual' | 'pending' | 'failed' | 'succeeded';
export type StateContent = {
    [key in StepState]: {
        icon: React.ReactNode,
        title: string,
        subtitle: string,
        rightContent: React.ReactNode
        expandedContent?: React.ReactNode
    }
};

export function RemoteStatus({ name, icon, onClick, status, className }: { name: string, icon: React.ReactNode, onClick: () => void, status: string, className?: string }) {
    const color = status !== 'loading' ? status === 'success' ? 'green' : 'red' : 'yellow';
    return (
        <Badge color="white" onClick={onClick} className={" !cursor-pointer mr-1 !border-gray-200 border-1 " + (status === 'success' ? 'hover:!bg-green-100' : 'hover:!bg-orange-100')} leftSection={icon} rightSection={
            <Box className=" relative -mr-0.5 ">
                {status !== 'loading' ?
                    <>
                        <Box className=" absolute rounded-full blur-sm " h={10} w={10} top={-2} left={-2} ml={4} bg={color} tt='none' opacity={0.6}></Box>
                        <Box className=" absolute rounded-full blur-lg " h={10} w={26} top={-2} left={-20} ml={4} bg={color} tt='none' opacity={0.4}></Box>
                    </>
                    : null}
                <Box className=" rounded-full " h={6} w={6} ml={4} bg={color} tt='none'></Box>
            </Box>
        }>
            <Box className=" relative">
                {/* <Text className="absolute" fw={700} tt='none' size="xs" c={color} opacity={0} px={0}>{name}</Text> */}
                <Text fw={500} tt='none' size="xs" c={'gray.8'}>{name}</Text>
            </Box>

        </Badge>
    );
}

export function RemoteSource({ name, icon, refresh, edit, date, className, refreshMessage = 'Refresh', isLoading }: { name: string, icon: React.ReactNode, refresh: () => void, edit: () => void, date?: Date | null, className?: string, refreshMessage?: string, isLoading?: boolean }) {
    const [hover, setHover] = useState(false);
    const agoMessage = date ? moment(date).fromNow() : '';
    return (
        <Badge color="white" className={" !cursor-pointer mr-1 !h-6 " + className} leftSection={icon}
            onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        >
            <Flex direction='row' align="center" justify="start" gap={5} pl={2} className="relative">
                {
                    isLoading ?
                        <Loader w={28} h={16} size='xs' type="dots" color="gray.6"></Loader>
                        :
                        hover ?
                            (<>
                                <Text fw={500} tt='none' size="xs" c={'gray.6'} className="hover:!text-black" onClick={edit}>{('Open ') + name}</Text>
                                <ThemeIcon variant="light" c="gray.6" h={16} w={14} bg='none' ml={-5} >
                                    <IconExternalLink size={16} strokeWidth={2} />
                                </ThemeIcon>

                                <Text fw={500} tt='none' size="xs" c={'gray.6'} onClick={refresh} ml={10} className=" hover:!text-black">{refreshMessage}</Text>
                                <ThemeIcon variant="light" c="gray.6" h={16} w={14} bg='none' ml={-5} mr={-5} >
                                    <IconRefresh size={16} strokeWidth={2} />
                                </ThemeIcon>

                            </>)
                            :
                            (<>
                                <Text fw={500} tt='none' size="xs" c={'gray.8'}>{(date ? '' : 'Loading from ') + name + (date ? '' : '...')}</Text>
                                <Text size="xs" c={'gray.6'} tt='none'>{agoMessage}</Text>
                            </>)
                }
            </Flex>
        </Badge>

    );
}

export function RemoteStep(
    { shouldAutoStart, stateContent, isReady, tryAction, tryUndo, isDone, allowsRedo, allowsUndo, noUndoOnRedo }:
        {
            shouldAutoStart: boolean,
            stateContent: StateContent,
            isReady: () => boolean,
            isDone: () => boolean,
            tryAction: (setMessage: (m: React.ReactNode) => void) => Promise<boolean | void>,
            tryUndo?: (setMessage: (m: React.ReactNode) => void) => Promise<boolean | void>,
            allowsRedo?: boolean,
            allowsUndo?: boolean,
            noUndoOnRedo?: boolean
        }) {
    const [editorState, setEditorState] = useContext(EditorContext);
    const [hadIssue, setHadIssue] = useContext(HadIssue);

    const [stepState, setStepState] = useState<StepState>('waiting');

    const [result, setResult] = useState<any>(undefined);
    const [message, setMessage] = useState<React.ReactNode | undefined>(undefined);

    const [showSecondaryAction, setShowSecondaryAction] = useState(false);

    const currentStateContent = stateContent[stepState];

    // Mark ready when waiting and state changes
    useEffect(() => {
        if (stepState === 'succeeded' && !isReady() && tryUndo)
            handleUndo();

        if (stepState === 'succeeded' && !isDone())
            setStepState('waiting');

        if (stepState === 'waiting' && isReady() && !isDone())
            setStepState('ready');
        else if (stepState === 'waiting' && isReady() && isDone())
            setStepState('succeeded');

        if (stepState === 'ready' || stepState === 'manual' && !isReady())
            setStepState('waiting');

    }, [JSON.stringify(editorState)]);

    // Auto start the action if the step is ready and shouldAutoStart is true
    useEffect(() => {
        if ((stepState === 'ready' || stepState === 'manual') && !isReady())
            setStepState('waiting');


        if (stepState === 'ready' && shouldAutoStart) {
            handleStart();
        } else if (stepState === 'ready' && !shouldAutoStart) {
            setStepState('manual');
        }
    }, [stepState]);

    const handleStart = async () => {
        if (stepState !== 'ready' && stepState !== 'manual')
            return;

        setStepState('pending');
        try {
            const isSuccess = await tryAction(setMessage);

            if (isSuccess)
                setStepState('succeeded');
            else {
                setStepState('failed');
                setHadIssue(true);
            }

            setShowSecondaryAction(false);
            setResult(result);
        } catch (error) {
            setStepState('failed');
            setHadIssue(true);
            setMessage('Failed take action. Please try again. \n' + error);
        }
    }

    const handleRedo = async () => {
        if (!noUndoOnRedo)
            await handleUndo();
        else
            setStepState('ready');

        await handleStart();
    }

    const handleUndo = async () => {
        if (stepState !== 'succeeded' && stepState !== 'failed' || !tryUndo)
            return;

        setHadIssue(true);
        setStepState('pending');
        try {
            const isSuccess = await tryUndo(setMessage);

            if (isSuccess)
                setStepState('ready');
            else {
                setStepState('failed');
                setHadIssue(true);
            }
        } catch (error) {
            setStepState('failed');
            setHadIssue(true);
            setMessage('Failed to delete template. Please try again. \n' + error);
        }
    }

    return (
        <RemoteStepIndicator
            iconContent={currentStateContent.icon}
            title={currentStateContent.title}
            subtitle={currentStateContent.subtitle}
            rightContent={
                <Flex gap={10} onMouseEnter={() => setShowSecondaryAction(true)} onMouseLeave={() => setShowSecondaryAction(false)}>
                    {stepState === 'succeeded' && tryUndo && allowsUndo ?
                        <ActionIcon variant="light" color="gray.5" h={40} w={40} onClick={handleUndo} opacity={showSecondaryAction ? 0.99 : 0} className="transition-opacity"><IconArrowBackUp /></ActionIcon>
                        : null}
                    {stepState === 'failed' || (stepState === 'succeeded' && allowsRedo) ?
                        <ActionIcon variant="light" color="gray.5" h={40} w={40} onClick={handleRedo} opacity={showSecondaryAction || allowsRedo ? 0.99 : 0} className="transition-opacity"><IconRefresh /></ActionIcon>
                        : null}
                    <div onClick={handleStart} className="cursor-pointer">
                        {currentStateContent.rightContent}
                    </div>
                </Flex>
            }
            errorMessage={message}
            expandedContent={currentStateContent.expandedContent ? currentStateContent.expandedContent : null}
        />
    );
}

function RemoteStepIndicator({ iconContent, rightContent, title, subtitle, errorMessage, expandedContent }: { iconContent: React.ReactNode, rightContent: React.ReactNode, title: string, subtitle: string, errorMessage: React.ReactNode | undefined, expandedContent?: React.ReactNode }) {

    return (
        <HoverCard width={280} shadow="md">
            <HoverCard.Target>
                <Flex align="start" justify="start" direction='column' className="py-4 px-5 rounded-lg w-full relative" gap={20}>
                    <Flex align="center" justify="start" direction='row' className="w-full rounded-lg relative" gap={20} h={50} >
                        {iconContent}
                        <Stack gap={0}>
                            <Text fw={600}>{title}</Text>
                            <Text size="sm" c="dimmed">{subtitle}</Text>
                        </Stack>

                        <Flex align="center" justify="end" direction='row' className="ml-auto">
                            {rightContent}
                        </Flex>
                        <Box className="absolute rounded-lg -z-10 border-gray-200 border-1" top={-16} bottom={-16} left={-20} right={-20} bg='white' ></Box>
                    </Flex>
                    {expandedContent}
                    <Box className="absolute rounded-lg -z-20" top={0} bottom={0} left={0} right={0} bg='gray.0'></Box>
                </Flex>
            </HoverCard.Target>
            {errorMessage ? <HoverCard.Dropdown>
                {errorMessage}
            </HoverCard.Dropdown> : null}
        </HoverCard>
    );
}