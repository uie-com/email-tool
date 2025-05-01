import { EditorContext, Email } from "@/domain/schema";
import { Accordion, Popover, ThemeIcon } from "@mantine/core";
import { IconCodeCircle, IconCodeCircle2, IconHelpCircle } from "@tabler/icons-react";
import { useContext, useMemo } from "react";


export function EditorHelpIcon() {
    const [editorState, setEditorState] = useContext(EditorContext);

    const names = useMemo(() => {
        return editorState.email?.values?.names.sort((aVal, bVal) => {
            if (typeof aVal === 'string' && (aVal as string).includes('Week ')) return 1;
            if (typeof bVal === 'string' && (bVal as string).includes('Week ')) return -1;
            if (aVal === bVal) return 0;
            if (aVal < bVal) return -1;
            return 1;
        });
    }, [editorState.email?.values?.names]);

    if (!editorState.email) return null;

    return (
        <PopoverIcon
            icon={<ThemeIcon variant="light" bg="none" color="gray" opacity={0.6} size={36}><IconCodeCircle2 size={36} strokeWidth={1.5} /></ThemeIcon>}
            body={
                <div className="p-1 w-[28rem]">
                    <p className="text-lg mb-1.5 font-medium">{editorState.email?.values?.resolveValue('Email Name')}</p>
                    <Accordion variant="separated">
                        <Accordion.Item value="information">
                            <Accordion.Control>Email Metadata</Accordion.Control>
                            <Accordion.Panel>
                                {Object.keys(editorState.email ?? {}).map((key) => {
                                    if (!editorState.email) return null;
                                    const val = editorState.email[key as keyof Email]
                                    if (typeof val !== 'string' || key.includes('HTML')) return null;
                                    return (
                                        <p className="text-sm" key={'help' + key}><b>{key}:</b> {val}</p>
                                    );
                                })}
                            </Accordion.Panel>
                        </Accordion.Item>
                        <Accordion.Item value="variables">
                            <Accordion.Control>All Variables</Accordion.Control>
                            <Accordion.Panel>
                                {names ? names.map((name) => {
                                    if (!editorState.email) return null;
                                    const val = editorState.email?.values?.resolveValue(name, true);
                                    if (typeof val !== 'string' || !(val as string) || val.includes('</')) return null;
                                    return (
                                        <p className="text-sm break-words" key={'help' + name}><b>{name}:</b> {val}</p>
                                    );
                                }) : null}
                            </Accordion.Panel>
                        </Accordion.Item>
                    </Accordion>

                </div>
            }
            className="absolute top-6 right-6 z-20"
        />
    )
}

function PopoverIcon({ icon, body, className }: { icon: React.ReactNode, body: React.ReactNode, className?: string }) {
    return (
        <Popover>
            <Popover.Target>
                <div className={`cursor-pointer ${className}`}>
                    {icon}
                </div>
            </Popover.Target>
            <Popover.Dropdown>
                {body}
            </Popover.Dropdown>
        </Popover>
    )
}