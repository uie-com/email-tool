"use client";
import { getAllTemplates } from "@/domain/data/templates";
import { parseVariableName } from "@/domain/parse/parse";
import { getAllIdentifiers, getAllPossibleEmailTypes } from "@/domain/parse/parsePrograms";
import { initializeSettings } from "@/domain/parse/parseSettings";
import { Values } from "@/domain/schema/valueCollection";
import { Variable, Variables } from "@/domain/schema/variableCollection";
import { EMAIL_TYPES } from "@/domain/settings/emails";
import { PROGRAM_COLORS } from "@/domain/settings/interface";
import { Accordion, Badge, Box, Code, Flex, Pill, ScrollArea, ScrollAreaAutosize, Text } from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import seedColor from 'seed-color';

type VariableOccurance = {
    [key: string]: { variables: Variable[], templates: string[], values: string[], programUses: string[] }
};

export function VariableTracker() {
    const [templates, setTemplates] = useState<{ path: string, html: string }[]>([]);

    useEffect(() => {
        getAllTemplates().then(setTemplates);
    }, []);

    const values = useMemo(() => {
        let values = new Values()
        values.addArrayDict(getAllPossibleEmailTypes(), 'email');
        values = initializeSettings(values)
        console.log('ValueDict: ', values);
        console.log('Pillar', values.resolveValue('pillar'));
        return values;
    }, []);

    const variableOccurance: VariableOccurance = useMemo(() => {
        const dict: VariableOccurance = {};
        templates.forEach((template) => {
            const templateVariables = new Variables(template.html);
            templateVariables.variables.forEach((variable) => {
                if (!dict[variable.key])
                    dict[variable.key] = { variables: [], templates: [], values: [], programUses: [] };
                dict[variable.key].variables.push(variable);
                dict[variable.key].templates.push(template.path.replace('./public/templates/', ''));
                dict[variable.key].values.push(...(values.getValueObj(variable.name)?.toArray() ?? ''));
                dict[variable.key].programUses.push(Object.keys(PROGRAM_COLORS).find((program) => parseVariableName(template.path).includes(parseVariableName(program))) ?? '');
            });
        });

        console.log('Variable Occurance:', dict);

        Object.keys(dict).forEach((key) => {
            dict[key].values = Array.from(new Set(dict[key].values)).filter((v) => v && v !== '');
            dict[key].programUses = Array.from(new Set(dict[key].programUses)).filter((v) => v && v !== '');
            dict[key].programUses = Array.from(new Set(dict[key].programUses)).filter((v) => v && v !== '');
        });



        // sort dict alphabetically by key
        const sortedKeys = Object.keys(dict).sort((a, b) => a.localeCompare(b));
        const sortedDict: VariableOccurance = {};
        sortedKeys.forEach((key) => {
            sortedDict[key] = dict[key];
        });

        console.log('Sorted Occurance:', dict);


        return sortedDict;
    }, [templates]);

    return (
        <ScrollArea style={{ height: '100%', width: '100%' }} type="always" offsetScrollbars={false} scrollbarSize={0} >
            <Flex align="center" justify="center" direction='column' className="w-full h-full py-20" gap={20} style={{ position: 'relative' }}>
                <Accordion variant="contained" w="100%">
                    {
                        Object.keys(variableOccurance).map((key) => (
                            <Accordion.Item value={key} key={key} p={4}>
                                <Accordion.Control>
                                    <Flex align="center" justify="start" direction='row' className=" max-w-[64rem] w-full" gap={10}>
                                        {variableOccurance[key].programUses.map((program) => {
                                            const color = program && program in PROGRAM_COLORS ? PROGRAM_COLORS[program as keyof typeof PROGRAM_COLORS] : '';
                                            return (
                                                <Box key={program + key} bg={color} w={12} h={12} className="rounded-full"></Box>
                                            );
                                        })}
                                        <Text tt="none" c={`rgb(${variableOccurance[key].variables.length * 10}, 50, 50)`} size='md' fz='sm' fw={800} opacity={1} p={0}>{variableOccurance[key].variables.length}</Text>
                                        <Box ><Code c="black" fz='md' bd={1} fw={600} lts={-0.75} px={7} py={6} >{"{" + variableOccurance[key].variables[0].name + "}"}</Code></Box>
                                        <Badge tt="none" color={seedColor(variableOccurance[key].variables[0].type).toHex() + '66'} autoContrast size='md' fz='sm' fw={700} opacity={1} radius='lg'><h2>{variableOccurance[key].variables[0].type}</h2></Badge>

                                        <Text fw={700} ml='auto' px={10}>{variableOccurance[key].values.length} Settings Found</Text>

                                    </Flex>
                                </Accordion.Control>
                                <Accordion.Panel mah={300} className="max-h-[300px] overflow-y-auto">
                                    {variableOccurance[key].values.join(', ')}
                                </Accordion.Panel>
                            </Accordion.Item>
                        ))
                    }
                </Accordion>
            </Flex>
        </ScrollArea>
    );
}