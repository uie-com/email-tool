"use client";

import { Box, Button, DefaultMantineColor, Flex, Group, Image, ThemeIcon } from "@mantine/core";
import { ChangeEvent, useContext, useEffect, useMemo, useRef, useState } from "react";
import { RequireValues } from "../components/require";
import { parseVariableName } from "@/domain/parse/parse";
import { CampaignPublisher } from "./campaignPublisher";
import { AutomationPublisher } from "./automationPublisher";
import { RemoteStatus } from "../components/remote";
import { IconLink, IconMail, IconMailFilled } from "@tabler/icons-react";
import { testActiveCampaignToken } from "@/domain/data/activeCampaignActions";
import { useSearchParams } from "next/navigation";
import { getToken, testGoogleToken } from "@/domain/data/googleActions";
import { getStatusFromEmail, STATUS_COLORS, STATUS_MESSAGES } from "@/domain/schema";
import { EditorContext, MessageContext, GlobalSettingsContext } from "@/domain/schema/context";


export function EmailPublisher() {
    const [editorState, setEditorState] = useContext(EditorContext);
    const showMessage = useContext(MessageContext)
    const sendType = parseVariableName(editorState.email?.values?.resolveValue('Send Type'));
    const emailStatus = getStatusFromEmail(editorState.email);

    const handleBack = () => {
        if (editorState.email?.templateId !== undefined) {
            return showMessage('Editing While Uploaded', {
                onConfirm: () => {
                    setEditorState((prev) => ({ ...prev, step: prev.step - 1, email: { ...prev.email } }));
                },
                templateId: editorState.email?.templateId,

            });
        }

        setEditorState((prev) => ({ ...prev, step: prev.step - 1, email: { ...prev.email } }));
    }
    return (
        <Flex align="center" justify="center" direction='column' className=" h-full  py-20" gap={20}>

            <RequireValues requiredValues={['Send Type']} />
            <Flex align="center" justify="center" direction='column' className=" h-full w-[48rem] p-20 relative" gap={20}>
                <Flex justify="space-between" align="start" className="w-full px-4">
                    <Button color='gray' variant="outline" onClick={handleBack}>
                        Edit Email
                    </Button>
                    {emailStatus ?
                        <Button variant="light" className=" pointer-events-none" color={(STATUS_COLORS[emailStatus][1] as string).split('.')[0] as DefaultMantineColor} >
                            {STATUS_MESSAGES[emailStatus]}
                        </Button>
                        : null}
                </Flex>
                {
                    sendType === 'campaign' ?
                        <CampaignPublisher />
                        : null
                }
                {
                    sendType === 'automation' ?
                        <AutomationPublisher />
                        : null
                }


            </Flex>
        </Flex>
    );
}

export function AuthStatus({ className, showAC = true }: { className?: string, showAC?: boolean }) {
    const [globalSettings, setGlobalSettings] = useContext(GlobalSettingsContext);
    const showMessage = useContext(MessageContext)
    const [acStatus, setAcStatus] = useState('loading');
    const [gdStatus, setGdStatus] = useState('loading');
    const gdRefreshTimeout = useRef<NodeJS.Timeout | null>(null);

    const searchParams = useSearchParams()

    useEffect(() => {
        const testAC = async () => {
            if (!globalSettings.activeCampaignToken) {
                setAcStatus('error');
                return;
            }
            const res = await testActiveCampaignToken(globalSettings.activeCampaignToken ?? '');
            console.log('[AUTH] Active Campaign Test Response: ', res);
            if (!res || res.content === undefined)
                setAcStatus('error');
            else
                setAcStatus('success');
        }

        const testGD = async () => {
            if (!globalSettings.googleAccessToken) {
                setGdStatus('error');
                return;
            }
            const res = await testGoogleToken(globalSettings.googleAccessToken ?? '');
            console.log('[AUTH] Google Drive Test Response: ', res);
            if (!res || res.scope === undefined)
                setGdStatus('error');
            else
                setGdStatus('success');

        }

        const recieveGDCode = async () => {
            const code = searchParams.get('code');
            if (!code || globalSettings.googleRefreshToken) return;
            const response = await getToken(code);
            if (response.refresh_token)
                setGlobalSettings((prev) => ({
                    ...prev,
                    googleAccessToken: response.access_token,
                    googleRefreshToken: response.refresh_token,
                    googleRefreshTime: ((response.expires_in as number) * 1000) + Date.now(),
                }));

            console.log('[AUTH] Google Drive Response: ', response);

        }

        const startRefreshingGDToken = async () => {
            if (!globalSettings.googleRefreshToken) return;
            if (gdRefreshTimeout.current) clearTimeout(gdRefreshTimeout.current);
            const refreshTimeFromNow = (globalSettings.googleRefreshTime ?? 0) - Date.now();
            console.log('[AUTH] Google refresh scheduled in ' + (refreshTimeFromNow / (1000 * 60)) + ' minutes');
            if (refreshTimeFromNow <= 0)
                refreshGDToken();
            else
                gdRefreshTimeout.current = setTimeout(() => {
                    refreshGDToken();
                }, refreshTimeFromNow);

        }

        const refreshGDToken = async () => {
            const response = await getToken(undefined, globalSettings.googleRefreshToken);
            console.log('[AUTH] Google Drive Refresh Response: ', response);
            if (response.access_token)
                setGlobalSettings((prev) => ({
                    ...prev,
                    googleAccessToken: response.access_token,
                    googleRefreshTime: ((response.expires_in as number) * 1000) + Date.now(),
                }));
            else
                setGdStatus('error');
        }

        setTimeout(() => {
            testAC();
            testGD();

            recieveGDCode();
            startRefreshingGDToken();
        }, 500);
    }, [globalSettings, searchParams]);

    const handleACClick = () => {
        showMessage('Active Campaign Login', {
            onChange: (e: ChangeEvent<HTMLInputElement>) => {
                setGlobalSettings((prev) => ({ ...prev, activeCampaignToken: e.target.value.trim() }));
            }

        })
    }

    const handleGDClick = () => {
        showMessage('Google Drive Login', {})
    }

    return (
        <Flex align="center" className={"h-2 w-full relative "}>
            <Flex align="center" justify="end" className={"h-12 w-full absolute " + className} gap={10} left={0} right={0} top={-16}>
                {showAC ? <RemoteStatus
                    name="Active Campaign"
                    icon={<Flex className="" w={16} h={16} mr={-2} ml={-4}><Image src='./interface/activecampaign.png' h={15} w={15} /></Flex>}
                    onClick={handleACClick}
                    status={acStatus}
                /> : null}

                <RemoteStatus
                    name="Google Drive"
                    icon={<Flex w={16} h={16} mr={-2} ml={-4}><Image className=" relative" src='./interface/drive.png' h={10} w={10} top={3} left={3} /></Flex>}
                    onClick={handleGDClick}
                    status={gdStatus}
                />

            </Flex>
        </Flex >
    );
}