"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IoMdClose } from "react-icons/io";

type ProfileProps = {
  onClose: () => void;
};

type UserInfo = {
  id: string;
  email: string;
  nickname: string;
  color: string;
  createdAt: string;
};

const getUserInfo = async (): Promise<UserInfo | null> => {
  const token = localStorage.getItem("access_token");

  console.log("WE IN DOING THINGS", token);
  if (!token || token.length == 0) return null;

  const options: RequestInit = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await fetch("http://localhost:8080/user-info", options);
  const data = await response.json();

  return data;
};

export default function ProfileSection({ onClose }: ProfileProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const colorRef = useRef<HTMLInputElement>(null);

  const [userInfo, setUserInfo] = useState<UserInfo>();

  useEffect(() => {
    getUserInfo().then((e) => {
      if (e) setUserInfo(e);
    });
  }, []);

  useEffect(() => {
    if (inputRef.current != undefined) {
      inputRef.current.value = userInfo?.nickname as string;
    }

    if (colorRef.current != undefined) {
      colorRef.current.value = userInfo?.color as string;
    }
  }, [userInfo]);

  const handleChangeNickname = () => {
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

    fetch("http://localhost:8080/change-nickname", options);
  };

  const handleChangeColor = async () => {
    if (!colorRef.current || colorRef.current.value.length == 0) return;

    const token = localStorage.getItem("access_token");
    if (!token) return;

    if (colorRef.current.value.trim().length == 0) return;

    if (colorRef.current.value.trim().length > 100) return;

    const payload = {
      field: "color",
      value: colorRef.current.value.trim(),
    };

    const options: RequestInit = {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    };

    await fetch("http://localhost:8080/update-user", options);
  };

  const handleLogout = async () => {
    const accessToken = localStorage.getItem("access_token");
    const refreshToken = localStorage.getItem("refresh_token");

    if (!accessToken || !refreshToken) {
      return router.push("/");
    }

    const options: RequestInit = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ refreshToken: refreshToken }),
    };

    await fetch("http://localhost:8080/logout", options);

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    router.push("/");
  };

  return (
    <>
      <div className="flex flex-row mb-4 w-full">
        <p className="font-extrabold text-xl">Settings</p>
        <button className="mx-auto mr-1" onClick={onClose}>
          <IoMdClose className="w-[24px] h-[24px] hover:text-gray-400 hover:shadow-xl" />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <div>Name: {userInfo?.nickname}</div>
        <div>Email: {userInfo?.email}</div>
        <div>Created: {userInfo?.createdAt}</div>
        <div>Color: {userInfo?.color}</div>

        <div className="mb-8 flex flex-col gap-1">
          <p>Change username</p>
          <input ref={inputRef} className="border-1 border-white mb-4"></input>
          <button
            onClick={handleChangeNickname}
            className="p-1 bg-blue-500 text-white hover:bg-blue-700"
          >
            Save
          </button>
        </div>

        <div className="mb-8 flex flex-col gap-1">
          <p>Change Color</p>
          <input ref={colorRef} className="border-1 border-white mb-4"></input>
          <button
            onClick={handleChangeColor}
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
  );
}
