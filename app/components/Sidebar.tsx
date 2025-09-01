"use client";

import { useState } from "react";
import { IoMdSettings } from "react-icons/io";
import ProfileSection from "./ProfileSection";
import { User } from "../chat/page";

function SidebarButton({ text }: { text: string }) {
  return (
    <button className="text-left bg-stone-800 rounded-lg p-2 border-1">
      {text}
    </button>
  );
}

function UserDisplay({ user }: { user: User }) {
  return (
    <div className="text-md bg-white/5 hover:bg-white/10 p-2">
      <div className="flex flex-row justify-between items-center">
        <p style={{ color: user.color ?? "#FFFFFF" }}>{user.nickname}</p>
        {/* <p className="text-xs">Offline</p> */}
      </div>
    </div>
  );
}

type SidebarProps = {
  users: User[];
};

export default function Sidebar({ users }: SidebarProps) {
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);

  return (
    <div className="w-1/5 bg-stone-900 text-white p-4 rounded-lg m-4">
      {!settingsOpen && (
        <div className="text-white">
          <div className="flex flex-row mb-4 w-full">
            <p className="font-extrabold text-xl">Chatapp</p>
            <button
              className="mx-auto mr-1"
              onClick={() => setSettingsOpen(true)}
            >
              <IoMdSettings className="w-[24px] h-[24px] hover:text-gray-400 hover:shadow-xl" />
            </button>
          </div>

          {/* Uses Display */}
          <div className="flex flex-col gap-1">
            <p className="text-xl font-bod">Users</p>
            {users.map((user, index) => (
              <UserDisplay user={user} key={index} />
            ))}
          </div>
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
