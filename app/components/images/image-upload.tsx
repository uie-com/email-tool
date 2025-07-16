import { copyToClipboard } from "@/domain/browser/clipboard";
import { saveFileAction } from "@/domain/integrations/ftp/fileActions";
import { ActionIcon, Flex, Group, Image, Modal, Text } from "@mantine/core";
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { useDisclosure } from "@mantine/hooks";
import { IconPhoto, IconPhotoPlus, IconUpload, IconX } from "@tabler/icons-react";
import { useState } from "react";


export function ImageUploader() {

    const [opened, { open, close }] = useDisclosure(false);

    const [urlList, setUrlList] = useState<string[]>([]);

    const handleDrop = async (files: File[]) => {
        console.log('accepted files', files);
        for (const file of files) {
            const url = await saveFileAction(file);
            setUrlList((prev) => [...prev, url]);
            console.log('File uploaded:', url);
        }
    };

    return (
        <>
            <Modal opened={opened} onClose={close} title="Upload Image" size="lg">
                <Dropzone
                    onDrop={handleDrop}
                    onReject={(files) => console.log('rejected files', files)}
                    accept={IMAGE_MIME_TYPE}
                >
                    <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
                        <Dropzone.Accept>
                            <IconUpload size={52} color="var(--mantine-color-blue-6)" stroke={1.5} />
                        </Dropzone.Accept>
                        <Dropzone.Reject>
                            <IconX size={52} color="var(--mantine-color-red-6)" stroke={1.5} />
                        </Dropzone.Reject>
                        <Dropzone.Idle>
                            <IconPhoto size={52} color="var(--mantine-color-dimmed)" stroke={1.5} />
                        </Dropzone.Idle>

                        <div>
                            <Text size="xl" inline>
                                Drag images here or click to select files
                            </Text>
                            <Text size="sm" c="dimmed" inline mt={7}>
                                Attach as many files as you like.
                            </Text>
                        </div>
                    </Group>
                </Dropzone>
                <Flex direction="column" gap="lg" mt="md" p={25}>
                    {urlList.map((url, index) => (
                        <Flex key={index + 'imagelist'} align="center" gap="lg" wrap="nowrap" maw="100%" >
                            <Image
                                src={url}
                                alt={`Uploaded image ${index + 1}`}
                                w={100}
                                mah={200}
                                fit="contain"
                                style={{ marginRight: '10px' }} >

                            </Image>
                            <Text key={index} size="sm" c="blue" onClick={() => copyToClipboard(url)} style={{ cursor: 'pointer' }} w={400} className=" break-words">
                                {url}
                            </Text>
                        </Flex>
                    ))}

                </Flex>
            </Modal>

            <div className="absolute top-6 right-6 z-20">
                <ActionIcon onClick={open}
                    variant="light" bg="none" color="gray" opacity={0.6} size={36}
                >
                    <IconPhotoPlus size={28} strokeWidth={2} />
                </ActionIcon>
            </div>
        </>
    );
}