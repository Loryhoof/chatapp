"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
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

  const inputRef = useRef<HTMLInputElement>(null);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    router.push("/");
  };

  const handleChangeNickname = async () => {
    if (!inputRef.current || inputRef.current.value.length == 0) return;

    const token = localStorage.getItem("access_token");
    if (!token) return;

    if (inputRef.current.value.trim().length == 0) return;

    if (inputRef.current.value.trim().length > 100) return;

    const payload = {
      nickname: inputRef.current.value.trim(),
    };

    const options: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    };

    const req = await fetch("http://localhost:8080/change-nickname", options);
    const data = await req.json();

    if (!data.error) {
      inputRef.current.value = "";
      setSettingsOpen(false);
    }
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

            <div className="mb-8 flex flex-col gap-1">
              <p>Change username</p>
              <input
                ref={inputRef}
                className="border-1 border-white mb-4"
              ></input>
              <button
                onClick={handleChangeNickname}
                className="p-1 bg-blue-500 text-white hover:bg-blue-700"
              >
                Save
              </button>
            </div>
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
