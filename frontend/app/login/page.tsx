"use client";

import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

import Logo from "../Logo.png";
import Link from "next/link";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

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
                Login to your account
            </h1>
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

          {/* Password */}
          <div className="relative group">
            <label
              htmlFor="password"
              className=" absolute -top-2.5 left-4 bg-white px-2 text-sm font-bold text-purple-600
              opacity-0 transition-transform duration-200 group-focus-within:opacity-100"
            >
              Password
            </label>

            <input
              type={showPassword ? "text" : "password"}
              id="password"
              className=" w-full h-14 rounded-lg border border-gray-400 px-4 pr-12 text-base 
              outline-none transition focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-black hover:text-purple-600 transition "
            >
              {showPassword ? (
                <EyeOff size={25} />
              ) : (
                <Eye size={25} />
              )}
            </button>
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="remember"
              className="h-5 w-5 accent-purple-600"
            />

            <label
              htmlFor="remember"
              className="text-base cursor-pointer"
            >
              Remember Me
            </label>
          </div>

          {/* Login */}
          <button
            type="submit"
            className=" h-14 w-full rounded-lg bg-purple-600 text-xl font-semibold text-white transition hover:bg-purple-700 active:scale-[0.99 "
          >
            Login
          </button>

          {/* Register / Forgot Password */}
          <div className="flex items-center justify-between text-sm">
            <p>
              Don&apos;t have an account?{" "}
              <a
                href="/register"
                className="font-medium text-blue-700 underline"
              >
                Register
              </a>
            </p>

            <a
              href="/forgot-password"
              className="font-medium text-blue-700 underline"
            >
              Forgot Password?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}