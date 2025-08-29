"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { IoMdClose, IoMdSettings } from "react-icons/io";

function SidebarButton({ text }: { text: string }) {
  return (
    <button className="text-left bg-stone-800 rounded-lg p-2 border-1">
      {text}
    </button>
  );
}

export default function Sidebar() {
  const router = useRouter();
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

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
        <>
          <div className="flex flex-row mb-4 w-full">
            <p className="font-extrabold text-xl">Settings</p>
            <button
              className="mx-auto mr-1"
              onClick={() => setSettingsOpen(false)}
            >
              <IoMdClose className="w-[24px] h-[24px] hover:text-gray-400 hover:shadow-xl" />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <div>Name: Kevin</div>
            <div>
              <button
                onClick={handleLogout}
                className="text-red-400 hover:text-red-500"
              >
                Log out
              </button>
            </div>
          </div>
        </>
      )}

      {/* <div className="flex flex-col gap-2">
        <SidebarButton text="Settings" />
        <SidebarButton text="Settings" />
        <SidebarButton text="Settings" />
      </div> */}
    </div>
  );
}
