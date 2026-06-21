"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { appcontext } from "@/app/context/appcontext";
import { useContext, useState } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmpassword: z.string().min(6, "Password must be at least 6 characters")
}).refine((data) => data.password === data.confirmpassword, {
  message: "Passwords do not match",
  path: ["confirmpassword"]
});

const Page = () => {
  const { api , setprofile } = useContext(appcontext);
  const router = useRouter();
  
  const [msg, setmsg] = useState({ text: "", type: "" }); // type: error | success
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(signupSchema)
  });

  const onSubmit = async (formdata) => {
    setmsg({ text: "", type: "" });
    const { name, email, password } = formdata;

    try {
      const res = await fetch(`${api}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      setprofile(data.user);
      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setmsg({ text: "Registered successfully! Redirecting...", type: "success" });
      setTimeout(() => router.replace("/auth/signin"), 1500);
    } catch (error) {
      setmsg({ text: error.message, type: "error" });
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Image src="/Aura.AI logo.png" alt="Aura.AI Logo" height={60} width={60} className="object-contain" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Aura.AI
          </h1>
        </div>

        <div className="bg-white shadow-2xl rounded-2xl border border-gray-200 p-8 relative">
          {/* Alert */}
          {msg.text && (
            <div
              className={`flex items-center gap-2 mb-5 p-3 rounded-lg ${
                msg.type === "error" ? "bg-red-50 border border-red-200 text-red-700" : "bg-green-50 border border-green-200 text-green-700"
              }`}
            >
              {msg.type === "error" ? <AlertCircle /> : <CheckCircle />}
              <span className="text-sm">{msg.text}</span>
            </div>
          )}

          <div className="text-center mb-6">
            <h1 className="font-bold text-2xl">Create an Account</h1>
            <p className="text-gray-500 text-sm mt-1">Get started with your free trial today</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name */}
            <div className="flex flex-col gap-1">
              <label className="font-medium text-sm">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                {...register("name")}
                className={`w-full px-4 py-2 rounded-lg border ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-purple-500 transition`}
              />
              {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="font-medium text-sm">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                {...register("email")}
                className={`w-full px-4 py-2 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-purple-500 transition`}
              />
              {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="font-medium text-sm">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password")}
                className={`w-full px-4 py-2 rounded-lg border ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-purple-500 transition`}
              />
              {errors.password && <span className="text-red-500 text-xs">{errors.password.message}</span>}
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1">
              <label className="font-medium text-sm">Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("confirmpassword")}
                className={`w-full px-4 py-2 rounded-lg border ${errors.confirmpassword ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-purple-500 transition`}
              />
              {errors.confirmpassword && <span className="text-red-500 text-xs">{errors.confirmpassword.message}</span>}

              {/* Show Password */}
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="showPassword"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                  className="cursor-pointer"
                />
                <label htmlFor="showPassword" className="text-sm text-gray-600 cursor-pointer">
                  Show Password
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:opacity-90 transition flex justify-center items-center disabled:opacity-50`}
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Or Continue With */}
          {/* <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-gray-400">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
              Google
            </button>
            <button className="flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
              GitHub
            </button>
          </div> */}

          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-purple-600 hover:underline font-semibold">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Page;