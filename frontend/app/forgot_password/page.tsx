"use client";

import Image from "next/image";

import Logo from "../Logo.png";
import Link from "next/link";

export default function Forgot_password() {

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-8 text-black">
      <div className="w-full max-w-151">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
            <Link href="/">
                <Image
                    src={Logo}
                    alt="PawMatch Logo"
                    width={120}
                    height={120}
                    className="cursor-pointer object-contain"
                />
            </Link>

            <h1 className="text-2xl font-bold">
                Forgot Password?
            </h1>

            <p className="text-center text-sm font-semibold">
                Enter your Email and we will send a verification code.
            </p>
        </div>

        {/* Form */}
        <form className="flex flex-col gap-5">

          {/* Email */}
          <div className="relative group">
            <label
                htmlFor="email"
                className="absolute -top-2.5 left-4 bg-white px-2 text-sm font-bold text-purple-600
                opacity-0 transition-transform duration-200 group-focus-within:opacity-100"
            >
                Email
            </label>
            <input
              type="text"
              id="email"
              placeholder="Enter Your Email/Phone"
              className="w-full h-14 rounded-lg border border-gray-400 px-4 text-base outline-none 
              transition focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
            />
          </div>

          {/* Login */}
          <button
            type="submit"
            className=" h-14 w-full rounded-lg bg-purple-600 text-xl font-semibold text-white transition hover:bg-purple-700 active:scale-[0.99 "
          >
            Send Code
          </button>
        </form>
      </div>
    </div>
  );
}