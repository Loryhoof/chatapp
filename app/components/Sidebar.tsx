"use client";

import { useState } from "react";
import { IoMdSettings } from "react-icons/io";
import ProfileSection from "./ProfileSection";

function SidebarButton({ text }: { text: string }) {
  return (
    <button className="text-left bg-stone-800 rounded-lg p-2 border-1">
      {text}
    </button>
  );
}

export default function Sidebar() {
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);

  return (
    <div className="w-1/5 bg-stone-900 text-white p-4 rounded-lg m-4">
      {!settingsOpen && (
        <div className="flex flex-row mb-4 w-full">
          <p className="font-extrabold text-xl">Chatapp</p>
          <button
            className="mx-auto mr-1"
            onClick={() => setSettingsOpen(true)}
          >
            <IoMdSettings className="w-[24px] h-[24px] hover:text-gray-400 hover:shadow-xl" />
          </button>
        </div>
      )}

      {settingsOpen && (
        <ProfileSection onClose={() => setSettingsOpen(false)} />
      )}

      {/* <div className="flex flex-col gap-2">
        <SidebarButton text="Settings" />
        <SidebarButton text="Settings" />
        <SidebarButton text="Settings" />
      </div> */}
    </div>
  );
}
