"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { verifyToken } from "./auth";

type LoginData = {
  email: string;
  password: string;
};

type Error = {
  message: string;
};

export default function Home() {
  const router = useRouter();

  const [error, setError] = useState<Error | null>(null);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const result = await verifyToken();

      if (result.ok) {
        router.push("/chat");
      }
    };

    checkAuth();
  }, []);

  const handleLogin = async () => {
    if (!emailRef.current || !passwordRef.current) return;
    if (
      emailRef.current.value.length == 0 ||
      passwordRef.current.value.length == 0
    )
      return;

    setError(null);

    const data: LoginData = {
      email: emailRef.current.value,
      password: passwordRef.current.value,
    };

    const options: RequestInit = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };

    await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/login`, options).then(
      async (res) => {
        const data = await res.json();

        if (data.error) {
          setError({ message: data.error } as Error);
          return;
        }

        console.log(data, "DATA");

        if (data.accessToken) {
          localStorage.setItem("access_token", data.accessToken);
        }

        if (data.refreshToken) {
          localStorage.setItem("refresh_token", data.refreshToken);
        }

        if (res.ok) router.push("/chat");
      }
    );
  };

  return (
    <div className="flex flex-col h-screen bg-stone-800 items-center justify-center text-white">
      <div className="flex flex-col gap-2">
        <p className="font-bold text-2xl">Welcome to Chatapp</p>
        <div className="flex flex-col">
          <input
            ref={emailRef}
            className="p-2 border-2 mt-2"
            type="text"
            placeholder="Email"
          />
          <input
            ref={passwordRef}
            className="p-2 border-2 mt-2"
            type="password"
            placeholder="Password"
          />

          <button
            onClick={handleLogin}
            className="p-2 border-2 mt-6 hover:bg-white hover:text-stone-800"
          >
            Log in
          </button>

          {error && (
            <p className="font-bold text-red-500 mt-2">{error.message}</p>
          )}

          <div className="mt-4 text-sm flex flex-row gap-1">
            <p>Don&apos;t have an account?</p>
            <Link
              href="/register"
              className="text-blue-300 hover:text-blue-400"
            >
              Register now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
