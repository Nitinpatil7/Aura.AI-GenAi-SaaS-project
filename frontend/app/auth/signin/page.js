"use client";
import Image from "next/image";
import Link from "next/link";
import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { appcontext } from "@/app/context/appcontext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const signinSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const Page = () => {
  const {api, setprofile} = useContext(appcontext);
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [msg, setmsg] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(signinSchema)
  });

  const onSubmit = async (formdata) => {
    setmsg("");
    try {
      const res = await fetch(`${api}/auth/login`,{
        method:"POST",
        headers:{
          "Content-Type":"application/json",
        },
        credentials:"include",
        body: JSON.stringify(formdata),
      })
      const data = await res.json();
      if(res.ok){
        setprofile(data.user);
      }else{
        throw new Error(data.message);
      }
      
      if(data.role == "user"){  
        router.replace("/user/dashboard");
      }else{
        router.replace("/admin/dashboard");
      }
    } catch (error) {
      setmsg(error.message)
    }
  };
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Image
            src="/Aura.AI logo.png"
            alt="Aura.AI Logo"
            height={60}
            width={60}
            className="object-contain"
          />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Aura.AI
          </h1>
        </div>

        <div className="bg-white shadow-xl rounded-2xl border border-gray-200 p-8">
          <div className="text-center mb-6">
            <h1 className="font-bold text-2xl">Welcome Back</h1>
            <p className="text-gray-500 text-sm mt-1">
              Enter your credentials to access your account
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {msg && (
              <p className="text-red-500 font-medium items-center text-sm mb-3 text-center">{msg}</p>
            )}

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

            <div className="flex flex-col gap-1">
              <div className="flex justify-between">
                <label className="font-medium text-sm">Password</label>
                <span className="text-sm text-gradient">Forgot password?</span>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password")}
                className={`w-full px-4 py-2 rounded-lg border ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-purple-500 transition`}
              />
              {errors.password && <span className="text-red-500 text-xs">{errors.password.message}</span>}
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="showPassword"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                  className="cursor-pointer"
                />
                <label
                  htmlFor="showPassword"
                  className="text-sm text-gray-600 cursor-pointer"
                >
                  Show Password
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-gray-400">
                Or continue with
              </span>
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
            {"Don't have an account? "}
            <Link
              href="/auth/signup"
              className="text-purple-600 hover:underline font-semibold"
            >
              Sign up
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
