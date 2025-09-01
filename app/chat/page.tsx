"use client";

import { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useRouter } from "next/navigation";
import { verifyToken } from "../auth";

export type UserMessage = {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
};

export type User = {
  id: string;
  nickname: string;
  color: string;
};

export default function Chat() {
  const router = useRouter();

  const socketRef = useRef<WebSocket | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<UserMessage[]>([]);

  const [visible, setVisible] = useState<boolean>(false);

  const [users, setUsers] = useState<User[]>([]);

  const runChangeReq = (field: string, value: string) => {
    const token = localStorage.getItem("access_token");

    if (!token) return false;

    const payload = {
      field: field,
      value: value,
    };

    const options: RequestInit = {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    };

    fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/update-user`, options);
  };

  const checkCommands = (input: string): boolean => {
    if (input.startsWith("/")) {
      const words = input.slice(1, input.length).trim().split(" ");
      if (words.length != 2) return false;

      const command = words[0];
      const value = words[1];

      if (command.length == 0 || value.length == 0) return false;

      if (command == "nickname") {
        if (value.length > 20) return false;
        runChangeReq("nickname", value);
        return true;
      }

      if (command == "color") {
        // check if hex
        if (!/^#[0-9A-Fa-f]{6}$/.test(value)) return false;
        runChangeReq("color", value);
        return true;
      }
    }

    return false;
  };

  const handleSubmit = () => {
    if (!socketRef.current) return;
    if (!inputRef.current) return;

    const inputText = inputRef.current.value;
    if (inputText.length == 0) return;

    inputRef.current.value = "";

    // check for slash commands
    if (checkCommands(inputText)) return;

    socketRef.current.send(JSON.stringify({ message: inputText }));
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key == "Enter") {
      handleSubmit();
    }
  };

  const handleReceiveSocketMessage = (e: MessageEvent) => {
    if (!e.data || e.data == null) return;
    const req = JSON.parse(e.data);

    if (!req || req == null) return;

    const { event, data } = req;

    if (!event || !data) return;

    // console.log(event, data, "EVENT DATA");

    if (event == "history") {
      const { messages, serverUsers } = data;

      setUsers(serverUsers);
      setMessages(messages);
    }

    if (event == "message") {
      const newMessage: UserMessage = data;
      console.log(newMessage, "nemwss");
      setMessages((prev) => [...prev, newMessage]);
    }

    if (event == "update_user") {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === data.id
            ? { ...u, nickname: data.nickname, color: data.color }
            : u
        )
      );
    }

    if (event == "user_joined") {
      console.log("User Joined");

      const user: User = data;

      setUsers((prev) => {
        const exists = prev.some((u) => u.id === user.id);
        if (exists) return prev;
        return [...prev, user];
      });
    }

    if (event == "user_left") {
      console.log("User Left");
    }
  };

  const getUserByUserId = (userId: string) => {
    if (!users || users.length == 0) return null;

    const found = users.find((user: User) => user.id == userId);

    return found;
  };

  const formatTime = (dateString: string): string => {
    const now = new Date();
    const d = new Date(dateString);

    const dif = now.getTime() - d.getTime();

    const minute = 60000;
    const hour = minute * 60;

    if (dif >= hour * 24) {
      return d.toLocaleDateString([], { dateStyle: "medium" });
    }

    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatColor = (userId: string): string => {
    const color = getUserByUserId(userId)?.color;
    return color ?? "#FFFFFF";
  };

  useEffect(() => {
    const checkAuth = async () => {
      const result = await verifyToken();

      if (!result.ok) {
        router.push("/");
        return;
      }

      const token = localStorage.getItem("access_token");

      const socketURL = `${process.env.NEXT_PUBLIC_SOCKET_URL}?token=${token}`;

      socketRef.current = new WebSocket(socketURL);

      setVisible(true);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (outputRef && outputRef.current)
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!socketRef.current) return;

    socketRef.current.addEventListener("open", (e) => {
      console.log("Connected to server!", e);
    });

    socketRef.current.addEventListener("message", handleReceiveSocketMessage);

    socketRef.current.addEventListener("close", (e) => {
      console.log("Disconnected from the server!", e);
    });

    return () => {
      socketRef.current?.removeEventListener("open", () => {});
      socketRef.current?.removeEventListener("close", () => {});
      socketRef.current?.removeEventListener(
        "message",
        handleReceiveSocketMessage
      );
    };
  }, [socketRef.current]);

  return (
    <>
      {visible && (
        <div className="flex flex-row h-screen bg-stone-800">
          {/* Sidebar */}
          <Sidebar users={users} />

          <div className="flex flex-col w-full h-full gap-2 pb-12 pt-12 pl-8 pr-8">
            {/* Output section */}
            <div
              ref={outputRef}
              className="border-black mt-4 p-4 h-full overflow-y-scroll bg-stone-900 rounded-lg border-1
           "
            >
              {messages.map((message, index) => (
                <p className="text-md text-gray-100 font-thin p-2" key={index}>
                  <span
                    className={`font-bold`}
                    style={{ color: formatColor(message.userId) }}
                  >
                    {getUserByUserId(message.userId)?.nickname ??
                      message.userId}
                    :
                  </span>{" "}
                  {message.content}{" "}
                  <span className="text-xs ml-1 text-gray-500">
                    {formatTime(message.createdAt)}
                  </span>
                </p>
              ))}
            </div>
            {/* Input section */}
            <div className="flex flex-row mt-auto">
              <input
                ref={inputRef}
                type="text"
                className=" border-1 rounded-lg bg-stone-900 p-2 w-full text-white border-black"
                placeholder="Type a message..."
              />
              {/* <button
            onClick={handleSubmit}
            type="submit"
            className="p-2 bg-gray-900 text-white font-bold border-2 "
          >
            Send
          </button> */}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
