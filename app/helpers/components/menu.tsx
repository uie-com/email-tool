import { delTemplate, delCampaign } from "@/domain/data/activeCampaignActions";
import { SavedEmailsContext } from "@/domain/data/saveData";
import { openPopup } from "@/domain/parse/parse";
import { createTemplateLink, createCampaignLink, createAutomationLink } from "@/domain/parse/parseLinks";
import { EditorState } from "@/domain/schema";
import { EditorContext, GlobalSettingsContext, MessageContext } from "@/domain/schema/context";
import { Menu, ActionIcon } from "@mantine/core";
import { IconDots, IconArrowBackUp, IconCheck, IconExternalLink, IconFile, IconMail, IconRouteOff, IconBackspace, IconTrash } from "@tabler/icons-react";
import { useContext, useState } from "react";


export function EmailMenu({ editorState, target, loader }: { editorState?: EditorState, target?: React.ReactNode, loader?: React.ReactNode }) {
    const [_, setEditorState, isLoaded, setEditorStateDelayed] = useContext(EditorContext);
    const [emailStates, deleteEmail, editEmail] = useContext(SavedEmailsContext);
    const [globalSettings, setGlobalSettings] = useContext(GlobalSettingsContext);
    const showMessage = useContext(MessageContext);

    const [isLoading, setIsLoading] = useState(false);

    const id = editorState?.email?.airtableId ?? editorState?.email?.values?.resolveValue('Email ID', true);
    const templateId = editorState?.email?.templateId;
    const campaignId = editorState?.email?.campaignId;
    const automationId = editorState?.email?.values?.resolveValue('Automation ID', true);

    const publishType = editorState?.email?.values?.resolveValue('Publish Type', true);
    const isMarkedDone = editorState?.email?.isSentOrScheduled;


    const handleToggleMarkDone = async () => {
        setIsLoading(true);

        console.log('Marking email as done:', editorState);
        if (editorState?.email?.isSentOrScheduled === 'skipped' && editorState?.email?.templateId === 'skipped')
            return handleDelete(true);

        const newState = {
            step: 1,
            ...editorState,
            email: {

                ...editorState?.email,
                isSentOrScheduled: editorState?.email?.isSentOrScheduled ? undefined : (
                    editorState?.email?.templateId ?? 'skipped'
                ),
                templateId: editorState?.email?.isSentOrScheduled ?
                    editorState?.email?.templateId === 'skipped' ? undefined : editorState?.email?.templateId
                    : editorState?.email?.templateId ?? 'skipped',
            }
        }

        console.log('Marking email as done:', newState);

        await editEmail(id, newState);
        setIsLoading(false);
    }

    const deleteTemplate = async (e: React.MouseEvent<HTMLButtonElement>) => {
        setIsLoading(true);
        const response = await delTemplate(templateId as string);

        const newState = {
            step: 1,
            ...editorState,
            email: {

                ...editorState?.email,
                templateId: undefined,
            }
        }

        if (response)
            await editEmail(id, newState);
        setIsLoading(false);
    }

    const deleteCampaign = async (e: React.MouseEvent<HTMLButtonElement>) => {
        setIsLoading(true);
        const response = await delCampaign(campaignId as string, globalSettings.activeCampaignToken ?? '');

        const newState = {
            step: 1,
            ...editorState,
            email: {

                ...editorState?.email,
                campaignId: undefined,
            }
        }

        if (response)
            await editEmail(id, newState);
        setIsLoading(false);
    }

    const handleDelete = async (force: boolean = false) => {
        setIsLoading(true);
        if ((templateId || campaignId) && !force)
            return showMessage('Deleting While Uploaded', {
                templateId: templateId,
                campaignId: campaignId,
                deleteEmail: () => handleDelete(true),
            });

        await deleteEmail(id);
        setIsLoading(false);
    }


    return (
        <Menu shadow="sm" width={200} radius='md' position="bottom-end"
            closeOnItemClick={true}
        >
            <Menu.Target>

                {isLoading ? loader : target}
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

                {/* Danger area */}
                {templateId ? <Menu.Item color="red" onClick={deleteTemplate} leftSection={<IconBackspace size={14} />}>
                    Delete Template
                </Menu.Item> : null}
                {campaignId ? <Menu.Item color="red" onClick={deleteCampaign} leftSection={<IconBackspace size={14} />}>
                    Delete Campaign
                </Menu.Item> : null}

                {editorState ? <Menu.Item color="red" onClick={() => handleDelete(false)} leftSection={<IconTrash size={14} />}>
                    Remove Email
                </Menu.Item> : null}
            </Menu.Dropdown>
        </Menu>
    )
}