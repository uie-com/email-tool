


"use client";

import { delCampaign, delTemplate } from "@/domain/data/activeCampaignActions";
import { ShowMessage, MessageContext, EditorContext, GlobalSettingsContext } from "@/domain/schema";
import { Anchor, Box, Button, Flex, Loader, Modal, Text, TextInput, Title } from "@mantine/core";
import { IconBrandGoogleDrive, IconExternalLink } from "@tabler/icons-react";
import { ChangeEvent, JSX, useContext, useEffect, useState } from "react";

export type MessageType = 'Deleting While Uploaded' | 'Resetting While Uploaded' | 'Editing While Uploaded' | 'Google Drive Login' | 'Active Campaign Login';
type Message = { title: string, body: JSX.Element, onClose?: () => void };

export function MessageContextProvider({ children }: { children: React.ReactNode }) {
    // const [editorState, setEditorState] = useContext(EditorContext);
    const [globalSettings, setGlobalSettings] = useContext(GlobalSettingsContext);
    const [message, setMessage] = useState<Message | null>(null);
    const [processing, setProcessing] = useState(false);

    const deletingWhileUploaded = (options: any) => {
        const templateId = options.templateId;
        const campaignId = options.campaignId;
        const deleteEmail = options.deleteEmail;

        return {
            title: `Remove before deleting ${templateId ? 'Template' : ''} ${templateId && campaignId ? '&' : ''} ${campaignId ? 'Campaign' : ''} from Active Campaign?`,
            body:
                (<Flex direction="column" align="center" justify="center" gap={30} className="w-full h-full">
                    <Text c="black">
                        <b>This email has been uploaded to Active Campaign as a {templateId ? 'Template' : ''}{templateId && campaignId ? ' and ' : ''}{campaignId ? 'Campaign' : ''}.</b> If you remove this email from the editor, it will be removed from the editor but not from Active Campaign. You will still be able to delete the old email in Active Campaign by going to the {templateId ? 'Campaign Templates' : ''} {templateId && campaignId ? 'and' : ''} {campaignId ? 'Campaigns' : ''} page.
                    </Text>
                    <Flex justify="start" align="center" className="w-full" gap={20}>
                        <Button variant="light" color="gray" className="min-h-10 max-w-48" onClick={() => {
                            handleClose();
                        }}>Cancel</Button>
                        <Button variant="outline" color="red" className="min-h-10 max-w-48 ml-auto" onClick={() => {
                            deleteEmail();
                            handleClose();
                        }}>Just Remove Email</Button>
                        <Button variant="filled" color="red" className="min-h-10 max-w-48" onClick={async () => {
                            setProcessing(true);
                            let result = true;

                            if (templateId)
                                result = result && await delTemplate(templateId);
                            if (campaignId)
                                result = result && await delCampaign(campaignId, globalSettings.activeCampaignToken ?? '');

                            if (result)
                                deleteEmail();

                            handleClose();
                            setProcessing(false);
                        }}>Delete All</Button>
                    </Flex>
                </Flex>),
        };
    }

    const resettingWhileUploaded = (options: any) => {
        const templateId = options.templateId;
        const campaignId = options.campaignId;
        const resetEmail = options.resetEmail;

        return {
            title: `Remove before resetting ${templateId ? 'Template' : ''} ${templateId && campaignId ? '&' : ''} ${campaignId ? 'Campaign' : ''} from Active Campaign?`,
            body:
                (<Flex direction="column" align="center" justify="center" gap={30} className="w-full h-full">
                    <Text c="black">
                        <b>This email has been uploaded to Active Campaign as a {templateId ? 'Template' : ''}{templateId && campaignId ? ' and ' : ''}{campaignId ? 'Campaign' : ''}.</b> If you reset this email in the editor, it will be unlinked from the existing {templateId ? 'Template' : ''}{templateId && campaignId ? ' and ' : ''}{campaignId ? 'Campaign' : ''}. You will still be able to delete the old email in Active Campaign by going to the {templateId ? 'Campaign Templates' : ''} {templateId && campaignId ? 'and' : ''} {campaignId ? 'Campaigns' : ''} page.
                    </Text>
                    <Flex justify="start" align="center" className="w-full" gap={20}>
                        <Button variant="light" color="gray" className="min-h-10 max-w-48" onClick={() => {
                            handleClose();
                        }}>Cancel</Button>
                        <Button variant="outline" color="red" className="min-h-10 max-w-48 ml-auto" onClick={() => {
                            resetEmail();
                            handleClose();
                        }}>Just Remove Email</Button>
                        <Button variant="filled" color="red" className="min-h-10 max-w-48" onClick={async () => {
                            setProcessing(true);
                            let result = true;

                            if (templateId)
                                result = result && await delTemplate(templateId);
                            if (campaignId)
                                result = result && await delCampaign(campaignId, globalSettings.activeCampaignToken ?? '');

                            if (result)
                                resetEmail();
                            handleClose();
                            setProcessing(false);
                        }}>Delete All</Button>
                    </Flex>
                </Flex>),
        };
    }

    const editingWhileUploaded = (options: any) => {
        const templateId = options.templateId;
        const campaignId = options.campaignId;
        const editEmail = options.onConfirm;

        return {
            title: `Remove ${templateId ? 'Template' : ''} ${templateId && campaignId ? '&' : ''} ${campaignId ? 'Campaign' : ''} from Active Campaign before editing?`,
            body:
                (<Flex direction="column" align="center" justify="center" gap={30} className="w-full h-full">
                    <Text c="black">
                        This email has already been uploaded to Active Campaign. <b>Further edits will not be reflected in the {templateId ? 'Template' : ''}{templateId && campaignId ? ' or ' : ''}{campaignId ? 'Campaign' : ''}.</b><br /><br /> If you edit out-of-sync and upload a duplicate, it will be difficult to distinguish.
                    </Text>
                    <Flex justify="start" align="center" className="w-full" gap={20}>
                        <Button variant="light" color="gray" className="min-h-10 max-w-48" onClick={() => {
                            handleClose();
                        }}>Cancel</Button>
                        <Button variant="light" color="red" className="min-h-10 max-w-48 ml-auto" onClick={() => {
                            editEmail();
                            handleClose();
                        }}>Edit Out-of-Sync</Button>
                        <Button variant="outline" color="red" className="min-h-10 max-w-48" onClick={async () => {
                            setProcessing(true);
                            let result = true;

                            if (templateId)
                                result = result && await delTemplate(templateId);
                            if (campaignId)
                                result = result && await delCampaign(campaignId, globalSettings.activeCampaignToken ?? '');

                            if (result)
                                editEmail();
                            handleClose();
                            setProcessing(false);
                        }}>Delete {templateId ? 'Template' : ''}{templateId && campaignId ? ' and ' : ''}{campaignId ? 'Campaign' : ''}</Button>
                    </Flex>
                </Flex>),
        };
    }

    const loginToActiveCampaign = (options: any) => {

        const onChange = options.onChange;
        return {
            title: `Authenticate with Active Campaign`,
            body:
                (<Flex direction="column" align="center" justify="center" gap={30} className="w-full h-full">
                    <Text c="black">
                        <b>To take actions on your behalf, this program needs an Active Campaign OAuth token.</b> Active Campaign does not provide a way to generate a token, so you need to login to your Active Campaign account, and copy the <i>ac</i> token from <i>Session Storage</i>.
                    </Text>
                    <Box className="relative overflow-hidden rounded-md shadow-lg" w={700} h={400} mt={-20} >
                        <video src="./tutorials/ac-token.mp4" autoPlay muted className=" absolute -top-0.5 -left-0.5 w-[705px] max-w-none h-[405px] "></video>
                    </Box>
                    <TextInput onChange={onChange} label={'Token'} w='100%' defaultValue={globalSettings.activeCampaignToken} />
                    <Flex justify="start" align="center" className="w-full" gap={20}>
                        <Button variant="light" color="gray" className="min-h-10 max-w-48" onClick={() => {
                            onChange({ target: { value: '' } } as ChangeEvent<HTMLInputElement>);
                            handleClose();
                        }}>Cancel</Button>
                        <Anchor ml='auto' href={`https://centercentre.activehosted.com/admin/index.php?error_mesg=timeout&redir=aHR0cHM6Ly9jZW50ZXJjZW50cmUuYWN0aXZlaG9zdGVkLmNvbS9hcHAvb3ZlcnZpZXc_`} target="_blank" >
                            <Button variant="outline" color="blue" className="min-h-10" rightSection={<IconExternalLink size={24} />}>
                                Open Active Campaign
                            </Button>
                        </Anchor>
                        <Button variant="filled" color="blue" className="min-h-10 max-w-48" onClick={() => {
                            handleClose();
                        }}>Submit</Button>
                    </Flex>
                </Flex >),
        };
    }

    const loginToGoogle = (options: any) => {
        console.log('Google Login: ', process.env);
        return {
            title: `Authenticate Google Drive`,
            body:
                (<Flex direction="column" align="center" justify="center" gap={30} className="w-full h-full">
                    <Text c="black">
                        <b>To create reference documents in Google Drive, you need to authenticate to your Google account.</b> Please click the button below to authenticate.
                    </Text>
                    <Flex justify="start" align="center" className="w-full" gap={20}>
                        <Button variant="light" color="gray" className="min-h-10 max-w-48" onClick={() => {
                            handleClose();
                        }}>Cancel</Button>
                        <Anchor ml='auto' onClick={() => {
                            setGlobalSettings((prev) => ({ ...prev, googleAccessToken: undefined, googleRefreshToken: undefined, googleRefreshTime: undefined }));
                            window.location.href = (`https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&scope=https://www.googleapis.com/auth/drive&access_type=offline&prompt=consent`);
                        }} >
                            <Button variant="outline" color="blue" className="min-h-10 max-w-48" leftSection={<IconBrandGoogleDrive size={24} />}>
                                Click to login
                            </Button>
                        </Anchor>
                    </Flex>
                </Flex >),
        };
    }

    const messages: Record<MessageType, (options: any) => Message> = {
        'Deleting While Uploaded': deletingWhileUploaded,
        'Resetting While Uploaded': resettingWhileUploaded,
        'Editing While Uploaded': editingWhileUploaded,
        'Google Drive Login': loginToGoogle,
        'Active Campaign Login': loginToActiveCampaign,
    };

    const showMessage: ShowMessage = (messageType: MessageType, options: any) => {
        console.log('Showing message: ', messageType, options);
        const message = messages[messageType](options);
        setProcessing(false);
        setMessage(message);
    }

    const handleClose = () => {
        setMessage(null);
        if (message?.onClose)
            message.onClose();
    }


    return (
        <MessageContext.Provider value={showMessage}>
            <Modal opened={!!message} onClose={handleClose} title={message?.title} centered size="xl" classNames={{
                title: '!text-2xl !font-bold',
                content: 'p-2'
            }}>
                {processing ? <Flex className=" absolute top-0 left-0 w-full h-full justify-center items-center "><Loader color="black" type="dots" opacity={0.1} /></Flex> : null}
                <Flex direction="column" align="center" justify="center" gap={10} className={"w-full h-full transition-opacity " + (processing ? 'opacity-0' : 'opacity-100')} >
                    {message?.body}
                </Flex>
            </Modal>
            {children}
        </MessageContext.Provider>
    );
}