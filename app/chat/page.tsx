"use client";

import { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useRouter } from "next/navigation";
import { verifyToken } from "../auth";

type UserMessage = {
  id: string;
  content: string;
  userId: string;
};

type User = {
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

  const handleSubmit = () => {
    console.log("Handling submit", socketRef.current);
    if (!socketRef.current) return;

    console.log("YES SOCKET");

    if (!inputRef.current) return;

    console.log("WE IN");
    const inputText = inputRef.current.value;

    if (inputText.length == 0) return;

    socketRef.current.send(JSON.stringify({ message: inputText }));

    inputRef.current.value = "";
  };

  const handleKeyDown = (e: any) => {
    if (e.key == "Enter") {
      handleSubmit();
    }
  };

  const handleReceiveSocketMessage = (e: any) => {
    if (!e.data || e.data == null) return;
    const req = JSON.parse(e.data);

    if (!req || req == null) return;

    const { event, data } = req;

    if (!event || !data) return;

    console.log(event, data, "EVENT DATA");

    if (event == "history") {
      const { users, messages } = data;
      setUsers(users);
      setMessages(messages);
    }

    if (event == "message") {
      const newMessage: UserMessage = {
        id: data.id,
        content: data.content,
        userId: data.userId,
      };
      setMessages((prev) => [...prev, newMessage]);
    }
  };

  const getUserByUserId = (userId: string) => {
    if (!users || users.length == 0) return null;

    const found = users.find((user: User) => user.id == userId);

    return found;
  };

  useEffect(() => {
    const checkAuth = async () => {
      const result = await verifyToken();

      if (!result.ok) {
        router.push("/");
        return;
      }

      const token = localStorage.getItem("access_token");

      const socketURL = `ws://localhost:8080/ws?token=${token}`;

      console.log(socketURL);

      //setSocket(new WebSocket(socketURL));

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
          <Sidebar />
          {users &&
            users.map((user, index) => <div key={index}>{user.nickname}</div>)}
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
                    className={`font-bold text-[${
                      getUserByUserId(message.userId)?.color ?? "#FFFFFF"
                    }]`}
                  >
                    {getUserByUserId(message.userId)?.nickname ??
                      message.userId}
                    :
                  </span>{" "}
                  {message.content}
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
