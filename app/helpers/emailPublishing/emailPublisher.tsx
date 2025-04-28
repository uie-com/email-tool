"use client";

import { EditorContext, GlobalSettingsContext, MessageContext } from "@/domain/schema";
import { Box, Button, Flex, Group, Image, ThemeIcon } from "@mantine/core";
import { ChangeEvent, useContext, useEffect, useMemo, useRef, useState } from "react";
import { RequireValues } from "../components/require";
import { parseVariableName } from "@/domain/parse/parse";
import { CampaignPublisher } from "./campaignPublisher";
import { AutomationPublisher } from "./automationPublisher";
import { RemoteStatus } from "../components/remote";
import { IconLink, IconMail, IconMailFilled } from "@tabler/icons-react";
import { testActiveCampaignToken } from "@/domain/data/activeCampaignActions";


export function EmailPublisher() {
    const [editorState, setEditorState] = useContext(EditorContext);
    const sendType = parseVariableName(editorState.email?.values?.resolveValue('Send Type'));

    const handleBack = () => {
        setEditorState((prev) => ({ ...prev, step: prev.step - 1, email: { ...prev.email } }));
    }
    return (
        <Flex align="center" justify="center" direction='column' className=" h-full  p-20" gap={20}>

            <RequireValues requiredValues={['Send Type']} />
            <Flex align="center" justify="center" direction='column' className=" h-full w-[48rem] p-20 relative" gap={20}>
                <Group justify="start" align="start" className="w-full px-4">
                    <Button color='gray' variant="outline" onClick={handleBack}>
                        Edit Email
                    </Button>
                </Group>
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

export function AuthStatus() {
    const [globalSettings, setGlobalSettings] = useContext(GlobalSettingsContext);
    const showMessage = useContext(MessageContext)
    const [acStatus, setAcStatus] = useState(false);
    const [gdStatus, setGdStatus] = useState(false);
    const tempToken = useRef<string>('');

    useEffect(() => {
        const testAC = async () => {
            const res = await testActiveCampaignToken(globalSettings.activeCampaignToken ?? '');
            console.log('[AUTH] Active Campaign Test Response: ', res);
            if (!res || res.content === undefined)
                setAcStatus(false);
            else
                setAcStatus(true);
        }

        const testGD = async () => {

        }

        testAC();
        testGD();
    }, [globalSettings.activeCampaignToken, globalSettings.googleToken]);

    const handleACClick = () => {
        showMessage('Active Campaign Login', {
            onChange: (e: ChangeEvent<HTMLInputElement>) => {
                setGlobalSettings((prev) => ({ ...prev, activeCampaignToken: e.target.value.trim() }));
            }
        })
    }

    return (
        <Flex align="center" justify="end" className="h-2 w-full relative">
            <Flex align="center" justify="end" className="h-12 w-full absolute" gap={10} left={0} right={0} top={-16}>
                <RemoteStatus
                    name="Active Campaign"
                    icon={<Flex className="" w={16} h={16} mr={-2} ml={-4}><Image src='./interface/activecampaign.png' h={15} w={15} /></Flex>}
                    onClick={handleACClick}
                    status={acStatus ? 'success' : 'error'}
                />

                <RemoteStatus
                    name="Google Drive"
                    icon={<Flex w={16} h={16} mr={-2} ml={-4}><Image className=" relative" src='./interface/drive.png' h={10} w={10} top={3} left={3} /></Flex>}
                    onClick={() => { }}
                    status={gdStatus ? 'success' : 'error'}
                />

            </Flex>
        </Flex >
    );
}