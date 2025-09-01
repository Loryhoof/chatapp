"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

type RegisterData = {
  email: string;
  password: string;
};

type Error = {
  message: string;
};

export default function Register() {
  const router = useRouter();

  const [error, setError] = useState<Error | null>(null);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  const handleRegister = async () => {
    if (
      !emailRef.current ||
      !passwordRef.current ||
      !confirmPasswordRef.current
    )
      return;
    if (
      emailRef.current.value.length == 0 ||
      passwordRef.current.value.length == 0 ||
      confirmPasswordRef.current.value.length == 0
    )
      return;

    if (passwordRef.current.value != confirmPasswordRef.current.value) {
      return setError({ message: "Passwords do not match" });
    }

    setError(null);

    const data: RegisterData = {
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

    await fetch("http://localhost:8080/register", options).then(async (res) => {
      const data = await res.json();

      if (data.error) {
        setError({ message: data.error } as Error);
        return;
      }

      if (res.ok) router.push("/");
    });
  };

  return (
    <div className="flex flex-col h-screen bg-stone-800 items-center justify-center text-white">
      <div className="flex flex-col gap-2">
        <p className="font-bold text-2xl">Welcome to Chatapp</p>
        {/* <div className="flex flex-row items-center gap-1 text-xl bg-orange-600 border-1 rounded-xl p-2">
          <p className="font-bold text-sm">Built in Golang</p>
          <FaGolang className="text-sky-500" />
        </div> */}

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
          <input
            ref={confirmPasswordRef}
            className="p-2 border-2 mt-2"
            type="password"
            placeholder="Confirm password"
          />

          <button
            onClick={handleRegister}
            className="p-2 border-2 mt-6 hover:bg-white hover:text-stone-800"
          >
            Log in
          </button>

          {error && (
            <p className="font-bold text-red-500 mt-2">{error.message}</p>
          )}

          <div className="mt-4 text-sm flex flex-row gap-1">
            <p>Already have an account?</p>
            <Link href="/" className="text-blue-300 hover:text-blue-400">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
