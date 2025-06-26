
import { copyToClipboard } from "@/domain/browser/clipboard";
import { EditorContext } from "@/domain/context";
import { Values } from "@/domain/values/valueCollection";
import { Badge, Box, Flex } from "@mantine/core";
import { IconCopy, IconCopyCheckFilled } from "@tabler/icons-react";
import { useContext, useState } from "react";

/**
 * CopyOverlay component displays a badge over the parent component that allows users to copy a value to the clipboard.
 * It appears when the user hovers over the component and disappears after copying or moving away.
 * 
 * @param {string} name - The name of the value to be copied.
 * @param {string} [value] - The value to be copied. If not provided, it will resolve from the editor context.
 */
export function CopyOverlay({ name, value }: { name: string, value?: string }) {
    const [hidden, setHidden] = useState(true);
    const [copied, setCopied] = useState(false);

    const [editorState, setEditorState] = useContext(EditorContext);
    const emailValues = editorState.email?.values ?? new Values();

    if (!value)
        value = emailValues?.resolveValue(name, true);

    if (!value)
        return null;

    const handleCopy = () => {
        copyToClipboard(value);
        setCopied(true);
    }

    const handleMouseEnter = () => {
        setHidden(false);
    }

    const handleMouseLeave = () => {
        setHidden(true);
        setCopied(false);
    }

    return (
        <Flex align="center" justify="center" direction='row' className={" absolute -top-2 -left-2 -bottom-2 -right-2  rounded-3xl cursor-pointer z-20 transition-opacity " + (hidden ? ' opacity-0' : ' opacity-100')} gap={20} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onClick={handleCopy}>
            <Box className="absolute top-0 left-0 right-0 bottom-0 bg-gray-300/40 blur-lg scale-75"></Box>
            <Badge fw={800} size="lg" tt='none' bg={copied ? "gray.7" : "gray.5"} className=" pointer-events-none opacity-99 transition-all" pr={6} pl={7} rightSection={(copied ? (<IconCopyCheckFilled size={18} strokeWidth={2} />) : (<IconCopy size={18} strokeWidth={2} />))}>
                {copied ? "Copied " : "Copy "}
                {name}
            </Badge>
        </Flex>
    );
}