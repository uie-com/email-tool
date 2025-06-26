import { EditorContext } from "@/domain/context";
import { deleteTemplate, postTemplate } from "@/domain/integrations/active-campaign/api";
import { createTemplateLink } from "@/domain/integrations/links";
import { openPopup } from "@/domain/interface/popup";
import { Button, Flex, Loader, ThemeIcon } from "@mantine/core";
import { IconAlertCircle, IconChecklist, IconExternalLink, IconUpload } from "@tabler/icons-react";
import { useContext } from "react";
import { RemoteStep, StateContent } from "../../step-template";

export function CreateTemplate({ shouldAutoStart }: { shouldAutoStart: boolean }) {
    const [editorState, setEditorState] = useContext(EditorContext);

    const stateContent: StateContent = {
        waiting: {
            icon: <ThemeIcon w={50} h={50} color="gray.2"><IconUpload size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Export to Active Campaigns',
            subtitle: 'Creates an editable Template with this HTML.',
            rightContent: '',
        },
        ready: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconUpload size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Export to Active Campaigns',
            subtitle: 'Creates an editable Template with this HTML.',
            rightContent: '',
        },
        manual: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconUpload size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Export to Active Campaigns',
            subtitle: 'Creates an editable Template with this HTML.',
            rightContent: <Button variant="outline" color="blue.5" h={40} >Export Template</Button>
        },
        pending: {
            icon: <ThemeIcon w={50} h={50} color="blue.5"><IconUpload size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Export to Active Campaigns',
            subtitle: 'Creating an editable Template with this HTML...',
            rightContent: <Loader variant="bars" color="blue.5" size={30} />
        },
        failed: {
            icon: <ThemeIcon w={50} h={50} color="orange.6"><IconAlertCircle size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Couldn\'t Create a Template',
            subtitle: 'You may need to create a Template manually.',
            rightContent:
                // <Anchor href={createTemplateLink(editorState.email?.templateId ?? '')} target="_blank">
                <Button variant="light" color="orange.9" h={40} rightSection={<IconExternalLink />} onClick={() => openPopup(createTemplateLink(editorState.email?.templateId ?? ''))} >
                    Edit Templates
                </Button>
            // </Anchor>
        },
        succeeded: {
            icon: <ThemeIcon w={50} h={50} color="green.6"><IconChecklist size={30} strokeWidth={2.5} /></ThemeIcon>,
            title: 'Created Template',
            subtitle: 'Created a Template with this HTML.',
            rightContent:
                <Flex gap={10}>
                    {/* <ActionIcon variant="light" color="gray.5" h={40} w={40} onClick={() => copy(editorState.email?.templateId)}>
                        <IconCopy />
                    </ActionIcon> */}
                    {editorState.email?.campaignId ? '' :
                        <Button variant="light" color="green.5" h={40} rightSection={<IconExternalLink />}
                            onClick={() => openPopup(createTemplateLink(editorState.email?.templateId))} >
                            Edit Template
                        </Button>
                    }
                </Flex>

        }
    };

    const isReady = () => {
        return editorState.email?.HTML !== undefined && editorState.email?.HTML.length > 0;
    }

    const isDone = () => {
        return editorState.email?.templateId !== undefined && editorState.email?.templateId.length > 0;
    }

    const tryAction = async (setMessage: (m: React.ReactNode) => void): Promise<boolean | void> => {
        const email = editorState.email;
        const values = email?.values;

        if (!email || !values) return setMessage('No email found.');

        const html = email.HTML ?? '';
        const emailName = values.resolveValue("Template Name", true) ?? '';

        if (html.trim().length === 0)
            return setMessage('Template HTML is required and wasn\'t found.');
        if (emailName.trim().length === 0)
            return setMessage('Email Name is required and wasn\'t found.');

        const template = (await postTemplate(emailName, html)).template;
        console.log("Created template " + emailName, template);

        if (!template.id) return setMessage(template);

        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                templateId: template.id,
            }
        }));

        return true;
    }

    const handleDeleteTemplate = async () => {
        const templateId = editorState.email?.templateId;
        if (!templateId) return;

        console.log("Deleting template", templateId);
        const res = await deleteTemplate(templateId);
        console.log("Deleted template", res);

        setEditorState((prev) => ({
            ...prev,
            email: {
                ...prev.email,
                templateId: undefined,
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
            tryUndo={handleDeleteTemplate}
            allowsUndo
        />
    )
}