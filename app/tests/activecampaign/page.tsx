"use client";

import { createCampaign, createTemplate, getCampaign, getMessage, getTemplate } from "@/domain/data/activeCampaignActions";
import { Email } from "@/domain/schema";
import { Values } from "@/domain/schema/valueCollection";
import { Variables } from "@/domain/schema/variableCollection";
import { Button, Flex, Group, HoverCard, Stack, Text, Textarea, TextInput } from "@mantine/core";
import { useMemo, useState } from "react";

export default function Page() {
    const [attributes, setAttributes] = useState<{ [key: string]: string }>({ subject: 'Test Subject', 'send date': '2025-04-10' });
    const [html, setHtml] = useState<string>('<p>Test HTML</p>');
    const [templateResponse, setTemplateResponse] = useState<any>('');
    const [campaignResponse, setCampaignResponse] = useState<any>('');

    const [id, setId] = useState<string | undefined>(undefined);

    const email = useMemo(() => {
        const values = new Values();
        values.addDict(attributes, 'email');
        const email = new Email(values);
        email.HTML = html;
        return email;
    }, [attributes, html]);

    const tryCreateTemplate = async () => {
        const response = await createTemplate(email);
        setTemplateResponse(response);
    }

    const tryCreateCampaign = async () => {
        const response = await createCampaign(email, process.env.AC_TOKEN ?? '');
        setCampaignResponse(response);
    }

    const tryGetCampaign = async () => {
        const response = await getCampaign(id ?? '');
        setCampaignResponse(response);
    }

    const tryGetTemplate = async () => {
        const response = await getTemplate(id ?? '');
        setCampaignResponse(response);
    }

    const tryGetMessage = async () => {
        const response = await getMessage(id ?? '');
        setCampaignResponse(response);
    }

    return (
        <Flex align="center" justify="center" direction='column' className="w-full h-full p-20" gap={20} style={{ position: 'relative' }}>
            <Textarea onChange={(event) => {
                const value = event.currentTarget.value;
                const lines = value.split('\n');
                const newAttributes = lines.reduce<{ [key: string]: string }>((acc, line) => {
                    if (!line || !line.includes(':')) return acc;
                    const [key, value] = line.split(':');
                    acc[key] = value;
                    return acc;
                }, {});
                setAttributes(newAttributes);
            }} defaultValue={'subject:Test Subject\nsend date:2025-04-10'} placeholder="name:value" label="Email values" autosize />
            <Textarea onChange={(e) => setHtml(e.target.value)} label='HTML' defaultValue={html} />
            <HoverCard width='auto' shadow="md">
                <HoverCard.Target>
                    <Stack>
                        <TextInput onChange={(e) => setId(e.target.value)} label='ID' defaultValue={id} />
                        <Button variant="filled" onClick={tryGetCampaign}>Get Campaign by ID</Button>
                        <Button variant="filled" onClick={tryGetTemplate}>Get Template by ID</Button>
                        <Button variant="filled" onClick={tryGetMessage}>Get Message by ID</Button>
                    </Stack>
                </HoverCard.Target>
                <HoverCard.Dropdown>
                    <Text className="whitespace-pre-wrap" size="sm">
                        {JSON.stringify(campaignResponse, null, 2)}
                    </Text>
                </HoverCard.Dropdown>
            </HoverCard>
            <Flex gap={20}>
                <HoverCard width='auto' shadow="md">
                    <HoverCard.Target>
                        <Button variant="filled" onClick={tryCreateTemplate}>Create Template</Button>
                    </HoverCard.Target>
                    <HoverCard.Dropdown>
                        <Text className="whitespace-pre-wrap" size="sm">
                            {JSON.stringify(templateResponse, null, 2)}
                        </Text>
                    </HoverCard.Dropdown>
                </HoverCard>

                <HoverCard width='auto' shadow="md">
                    <HoverCard.Target>
                        <Button variant="filled" onClick={tryCreateCampaign}>Create Campaign</Button>
                    </HoverCard.Target>
                    <HoverCard.Dropdown>
                        <Text className="whitespace-pre-wrap" size="sm">
                            {JSON.stringify(campaignResponse, null, 2)}
                        </Text>
                    </HoverCard.Dropdown>
                </HoverCard>
            </Flex>
            <h1>Email</h1>
            <div className="p-4 border-gray-200 rounded-lg min-w-96 border-1">
                <p>{JSON.stringify(email)}</p>
            </div>
        </Flex>
    );
}