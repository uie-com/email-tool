import { useContext, useState } from "react";
import { EditorContext } from "@/domain/schema";
import { EmailCreator } from "./emailCreator";
import { Button, Flex, Modal, SegmentedControl, Title } from "@mantine/core";
import { EmailSchedule } from "./emailSchedule";
import { IconMailPlus } from "@tabler/icons-react";

export function EmailSelector() {
    const [createManual, setCreateManual] = useState(false);

    const handleClose = () => {
        setCreateManual(false);
    }

    return (
        <Flex align="center" justify="center" direction='column' className="relative w-full h-screen p-20" gap={20}>
            <Flex align="start" direction='column' justify="center" className="h-full" gap={20}>
                <Flex align="start" justify="end" className="w-full">
                    {/* <SegmentedControl data={['Schedule', 'Manual']} value={page} onChange={setPage} /> */}
                </Flex>

                <EmailSchedule />

            </Flex>

        </Flex>
    )
}