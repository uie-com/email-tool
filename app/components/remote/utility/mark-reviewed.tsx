import { copyToClipboard } from "@/domain/browser/clipboard";
import { EditorContext } from "@/domain/context";
import { createNotionUri } from "@/domain/integrations/links";
import { openPopup } from "@/domain/interface/popup";
import { Anchor, Button, Flex, Loader, ThemeIcon } from "@mantine/core";
import { IconCopy, IconExternalLink, IconListCheck, IconPlaylistX, IconRosetteDiscountCheck } from "@tabler/icons-react";
import { useContext } from "react";
import { RemoteStep, StateContent } from "../step-template";

export function MarkReviewed({ shouldAutoStart }: { shouldAutoStart: boolean }) {
    const [editorState, setEditorState] = useContext(EditorContext);



    const stateContent: StateContent = {
        waiting: {
            icon: <ThemeIcon w={50} h={50} color="gray.2"><IconListCheck size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Review Test Email',
            subtitle: 'Review email against Notion QA Checklist.',
            rightContent: '',
        },
        ready: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconListCheck size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Review Test Email',
            subtitle: 'Review email against Notion QA Checklist.',
            rightContent: <Button variant="outline" color="blue.5" h={40} leftSection={<IconRosetteDiscountCheck />} >Mark Reviewed</Button>,
            expandedContent:
                <Flex gap={20} direction="column" align="start" justify="space-between" w='100%' className="">
                    <Anchor onClick={process.env.OPEN_NOTION_IN_WEB === 'true' ? () => openPopup(createNotionUri(editorState.email?.notionURL ?? '')) : undefined} href={process.env.OPEN_NOTION_IN_WEB === 'true' ? '' : createNotionUri(editorState.email?.notionURL ?? '')} target="_blank">
                        <Button variant="light" color="green.5" h={40} rightSection={<IconExternalLink />} mt={5}>
                            Open Checklist
                        </Button>
                    </Anchor>
                </Flex>
        },
        manual: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconListCheck size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Review Test Email',
            subtitle: 'Review email against Notion QA Checklist.',
            rightContent: <Button variant="outline" color="blue.5" h={40} leftSection={<IconRosetteDiscountCheck />} >Mark Reviewed</Button>,
            expandedContent:
                <Flex gap={20} direction="row" align="start" justify="end" w='100%' className="">

                    <Button variant="light" color="blue.6" h={40} rightSection={<IconCopy />} mt={10} onClick={() => copyToClipboard(editorState.email?.values?.resolveValue('Subject', true) ?? '')}>
                        Copy Subject
                    </Button>
                    <Anchor onClick={process.env.OPEN_NOTION_IN_WEB === 'true' ? () => openPopup(createNotionUri(editorState.email?.notionURL ?? '')) : undefined} href={process.env.OPEN_NOTION_IN_WEB === 'true' ? '' : createNotionUri(editorState.email?.notionURL ?? '')} target="_blank">
                        <Button variant="filled" color="blue.5" h={40} rightSection={<IconExternalLink />} mt={10}>
                            Open Checklist
                        </Button>
                    </Anchor>
                </Flex>
        },
        pending: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconListCheck size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Reviewing Test Email',
            subtitle: 'Reviewing email against Notion QA Checklist.',
            rightContent: <Loader variant="bars" color="blue.5" size={30} />
        },
        failed: {
            icon: <ThemeIcon w={50} h={50} color="orange.6"><IconPlaylistX size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Error Marking Test Email Reviewed',
            subtitle: 'Review email against Notion QA Checklist.',
            rightContent: <Button variant="outline" color="blue.5" h={40} leftSection={<IconRosetteDiscountCheck />} >Mark Reviewed</Button>
        },
        succeeded: {
            icon: <ThemeIcon w={50} h={50} color="green.6"><IconListCheck size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Reviewed Test Email',
            subtitle: 'Reviewed email against Notion QA Checklist.',
            rightContent: null
        }
    };

    const isReady = () => {
        return editorState.email?.templateId !== undefined
            && editorState.email?.templateId.length > 0
            && editorState.email?.sentTest !== undefined
            && (
                editorState.email?.sentTest === editorState.email?.templateId
                || editorState.email?.sentTest === editorState.email?.campaignId
            );
    }

    const isDone = () => {
        return editorState.email?.isDevReviewed !== undefined && editorState.email?.isDevReviewed === true;
    }

    const tryUndo = async (setMessage: (m: React.ReactNode) => void): Promise<boolean | void> => {
        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                isDevReviewed: undefined,
            }
        }));

        return true;
    }

    const tryAction = async (setMessage: (m: React.ReactNode) => void): Promise<boolean | void> => {
        console.log('[MARK REVIEWED] Attempting to mark email reviewed', editorState.email?.name);

        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                isDevReviewed: true,
            }
        }));

        return true;
    }

    if (editorState.email?.values?.getCurrentValue('Is Excluded From QA Checklist') === 'Is Excluded From QA Checklist' || editorState.email?.values?.getCurrentValue('Is Variation') === 'Is Variation') {
        if (isReady() && !isDone())
            tryAction(() => { });
        return null; // Skip if this is a variation email or excluded from QA checklist
    }

    return (
        <RemoteStep
            shouldAutoStart={shouldAutoStart}
            stateContent={stateContent}
            isReady={isReady}
            isDone={isDone}
            tryAction={tryAction}
            tryUndo={tryUndo}
            allowsUndo={true}
        />
    )
}