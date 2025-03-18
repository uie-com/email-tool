"use client";

import Image from "next/image";
import { Button } from "antd"
import { ContentHelper } from "./helpers/content/contentHelper";
import { useState } from "react";

export default function Home() {
  return (
    <div className="font-[family-name:var(--font-dm-sans)]">
      <main className="h-screen">
        <ContentHelper></ContentHelper>
      </main>
    </div>
  );
}
