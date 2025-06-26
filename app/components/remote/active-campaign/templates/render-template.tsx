import { EditorContext } from "@/domain/context";
import { createTemplateLink } from "@/domain/integrations/links";
import { openPopup } from "@/domain/interface/popup";
import { Anchor, Button, Loader, ThemeIcon } from "@mantine/core";
import { IconExternalLink, IconFile, IconFileCheck, IconFileX } from "@tabler/icons-react";
import { useContext } from "react";
import { RemoteStep, StateContent } from "../../step-template";

export function RenderTemplate({ shouldAutoStart }: { shouldAutoStart: boolean }) {
    const [editorState, setEditorState] = useContext(EditorContext);

    const stateContent: StateContent = {
        waiting: {
            icon: <ThemeIcon w={50} h={50} color="gray.2"><IconFile size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Review Template',
            subtitle: 'Review template, then save and exit.',
            rightContent: '',
        },
        ready: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconFile size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Review Template',
            subtitle: 'Review template, then save and exit.',
            rightContent:
                // <Anchor href={createTemplateLink(editorState.email?.templateId)} target="_blank">
                <Button variant="outline" color="blue.5" h={40} rightSection={<IconExternalLink />} onClick={() => openPopup(createTemplateLink(editorState.email?.templateId))} >Open Template</Button>
            // </Anchor>,
        },
        manual: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconFile size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Review Template',
            subtitle: 'Review template, then save and exit.',
            rightContent:
                // <Anchor href={createTemplateLink(editorState.email?.templateId)} target="_blank">
                <Button variant="outline" color="blue.5" h={40} rightSection={<IconExternalLink />} onClick={() => openPopup(createTemplateLink(editorState.email?.templateId))} >Open Template</Button>
            // </Anchor>,
        },
        pending: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconFile size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Review Template',
            subtitle: 'Open popup, review template, then save and exit.',
            rightContent: <Loader variant="bars" color="blue.5" size={30} />
        },
        failed: {
            icon: <ThemeIcon w={50} h={50} color="orange.6"><IconFileX size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Couldn\'t Open Template',
            subtitle: 'Review template, then save and exit.',
            rightContent:
                <Anchor href={createTemplateLink(editorState.email?.templateId)} target="_blank">
                    <Button variant="outline" color="blue.5" h={40} rightSection={<IconExternalLink />} >Open Template</Button>
                </Anchor>
        },
        succeeded: {
            icon: <ThemeIcon w={50} h={50} color="green.6"><IconFileCheck size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Reviewed Template',
            subtitle: 'Make sure preview appears correctly for template.',
            rightContent: null
        }
    };

    const isReady = () => {
        return editorState.email?.templateId !== undefined && editorState.email?.templateId.length > 0;
    }

    const isDone = () => {
        return editorState.email?.templateId !== undefined && editorState.email?.templateId.length > 0 &&
            editorState.email?.hasRendered !== undefined && editorState.email?.hasRendered === editorState.email?.templateId;
    }

    const tryUndo = async (setMessage: (m: React.ReactNode) => void): Promise<boolean | void> => {

        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                hasRendered: undefined,
            }
        }));

        return true;
    }

    const tryAction = async (setMessage: (m: React.ReactNode) => void): Promise<boolean | void> => {
        // openPopup(createTemplateLink(editorState.email?.templateId));

        await new Promise((resolve) => setTimeout(resolve, 5000));

        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                hasRendered: editorState.email?.templateId,
            }
        }));

        return true;
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