
import { ActionIcon, Anchor, Button, Flex, Group, HoverCard, Loader, Stack, Text, ThemeIcon } from "@mantine/core";
import { useContext, useEffect, useState, createContext } from "react";
import { RequireValues } from "../components/require";
import { EmailViewCard } from "../components/email";
import { IconAlertCircle, IconArrowBackUp, IconExternalLink, IconFileExport, IconProgressX, IconRefresh, IconUpload, IconX } from "@tabler/icons-react";
import { postTemplate } from "@/domain/data/activeCampaignActions";
import { createTemplateLink } from "@/domain/data/activeCampaign";
import { EditorContext } from "@/domain/schema";

export const HadIssue = createContext<[boolean, React.Dispatch<React.SetStateAction<boolean>>]>([false, () => { }]);
export type StepState = 'waiting' | 'ready' | 'manual' | 'pending' | 'failed' | 'succeeded';
export type StateContent = {
    [key in StepState]: {
        icon: React.ReactNode,
        title: string,
        subtitle: string,
        rightContent: React.ReactNode
    }
};

export function RemoteStep(
    { shouldAutoStart, stateContent, isReady, tryAction, tryUndo, isDone, allowsRedo, allowsUndo }:
        {
            shouldAutoStart: boolean,
            stateContent: StateContent,
            isReady: () => boolean,
            isDone: () => boolean,
            tryAction: (setMessage: (m: React.ReactNode) => void) => Promise<boolean | void>,
            tryUndo?: (setMessage: (m: React.ReactNode) => void) => Promise<boolean | void>,
            allowsRedo?: boolean,
            allowsUndo?: boolean
        }) {
    const [editorState, setEditorState] = useContext(EditorContext);
    const [hadIssue, setHadIssue] = useContext(HadIssue);

    const [stepState, setStepState] = useState<StepState>('waiting');

    const [result, setResult] = useState<any>(undefined);
    const [message, setMessage] = useState<React.ReactNode | undefined>(undefined);

    const [showSecondaryAction, setShowSecondaryAction] = useState(false);

    const currentStateContent = stateContent[stepState];

    useEffect(() => {
        if (stepState === 'waiting' && isReady() && !isDone())
            setStepState('ready');
        else if (stepState === 'waiting' && isReady() && isDone())
            setStepState('succeeded');

        if (stepState === 'ready' || stepState === 'manual' && !isReady())
            setStepState('waiting');

    }, [JSON.stringify(editorState)]);

    useEffect(() => {
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
        await handleUndo();
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
        />
    );
}

function RemoteStepIndicator({ iconContent, rightContent, title, subtitle, errorMessage }: { iconContent: React.ReactNode, rightContent: React.ReactNode, title: string, subtitle: string, errorMessage: React.ReactNode | undefined }) {

    return (
        <HoverCard width={280} shadow="md">
            <HoverCard.Target>
                <Flex align="center" justify="start" direction='row' className="py-4 px-5 border-gray-200 rounded-lg w-full border-1" gap={20}>
                    {iconContent}
                    <Stack gap={0}>
                        <Text fw={600}>{title}</Text>
                        <Text size="sm" c="dimmed">{subtitle}</Text>
                    </Stack>

                    <Flex align="center" justify="end" direction='row' className="ml-auto">
                        {rightContent}
                    </Flex>
                </Flex>
            </HoverCard.Target>
            {errorMessage ? <HoverCard.Dropdown>
                {errorMessage}
            </HoverCard.Dropdown> : null}
        </HoverCard>
    );
}