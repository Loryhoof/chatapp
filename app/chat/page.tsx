"use client";

import { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useRouter } from "next/navigation";

type UserMessage = {
  id: string;
  message: string;
};

export default function Chat() {
  const router = useRouter();
  const socket = new WebSocket("ws://localhost:8080/ws");

  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<UserMessage[]>([]);

  const [visible, setVisible] = useState<boolean>(false);

  const handleSubmit = () => {
    if (!inputRef.current) return;

    const inputText = inputRef.current.value;

    if (inputText.length == 0) return;

    socket.send(JSON.stringify({ message: inputText }));

    inputRef.current.value = "";
  };

  const handleKeyDown = (e: any) => {
    if (e.key == "Enter") {
      handleSubmit();
    }
  };

  const handleReceiveSocketMessage = (e: any) => {
    if (!e.data || e.data == null) return;
    const data = JSON.parse(e.data);

    console.log(data, "DATA");

    if (!data || data == null) return;

    // Array means it's the existing server messages
    if (Array.isArray(data)) {
      setMessages([...data]);
    } else {
      setMessages((prev) => [...prev, data]);
    }
  };

  const verifyToken = async () => {
    const token = localStorage.getItem("token");

    if (!token) return router.push("/");

    const options: RequestInit = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    await fetch("http://localhost:8080/verify-token", options).then(
      async (res) => {
        const data = await res.json();

        if (data.error) {
          return router.push("/");
        }

        setVisible(true);
      }
    );
  };

  useEffect(() => {
    verifyToken();
  }, []);

  useEffect(() => {
    if (outputRef && outputRef.current)
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    socket.addEventListener("open", (e) => {
      console.log("Connected to server!", e);
    });

    socket.addEventListener("message", handleReceiveSocketMessage);

    socket.addEventListener("close", (e) => {
      console.log("Disconnected from the server!", e);
    });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      socket.removeEventListener("open", () => {});
      socket.removeEventListener("close", () => {});
      socket.removeEventListener("message", handleReceiveSocketMessage);
    };
  }, []);

  return (
    <>
      {visible && (
        <div className="flex flex-row h-screen bg-stone-800">
          {/* Sidebar */}
          <Sidebar />
          <div className="flex flex-col w-full h-full gap-2 pb-12 pt-12 pl-8 pr-8">
            {/* Output section */}
            <div
              ref={outputRef}
              className="border-black mt-4 p-4 h-full overflow-y-scroll bg-stone-900 rounded-lg border-1
           "
            >
              {messages.map((message, index) => (
                <p className="text-md text-gray-100 font-thin p-2" key={index}>
                  <span className="font-bold">
                    {String(message.id).slice(0, 4)}:
                  </span>{" "}
                  {message.message}
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
