import { useContext, useState } from "react";
import { EditorContext } from "@/domain/schema";
import { EmailCreator } from "./emailCreator";
import { Flex, SegmentedControl } from "@mantine/core";
import { EmailSchedule } from "./emailSchedule";

export function EmailSelector() {
    const [page, setPage] = useState('Schedule');

    return (
        <Flex align="center" justify="center" direction='column' className="relative w-full h-full p-20" gap={20}>
            <Flex align="start" direction='column' justify="center" className="" gap={20}>
                <SegmentedControl data={['Schedule', 'Manual']} value={page} onChange={setPage} />

                {(page === 'Schedule') ? (<EmailSchedule />) : (<EmailCreator />)}
            </Flex>

        </Flex>
    )
}