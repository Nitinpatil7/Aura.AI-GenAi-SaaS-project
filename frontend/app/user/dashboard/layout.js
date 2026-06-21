"use client";

import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Image as ImageIcon,
  ImagePlus,
  Code,
  Wand2,
  Video,
  Music,
  ChevronDown,
  PanelLeft,
  X,
  IndianRupee,
  Settings,
  User,
  LogOut,
  Bot,
} from "lucide-react";
import { appcontext } from "@/app/context/appcontext";

export default function Layout({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState("tools");
  const pathname = usePathname();
  const [open, setopen] = useState(false);
  const { profile, api } = useContext(appcontext);
  const [formdata, setformdata] = useState({
    name: profile?.name || "",
    email: profile?.email || "",  
  });

  useEffect(() => {
    setformdata({
      name: profile?.name || "",
      email: profile?.email || "",
    });
  }, [profile]);

  const closeSidebar = () => setIsOpen(false);

  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  const linkStyle = (path) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
      pathname === path
        ? "bg-black text-white shadow-sm"
        : "text-gray-600 hover:bg-gray-100 hover:text-black"
    }`;


  const handlelogout = async () => {
    try {
      const res = await fetch(`${api}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        window.location.href = "/auth/signin";
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 shadow-lg z-50
        transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0`}
      >
        <div className="pl-4 pt-4 flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between pr-4">
            <div className="flex items-center gap-2">
              <Image
                src="/Aura.AI logo.png"
                alt="Aura.AI Logo"
                height={42}
                width={42}
              />
              <h1 className="text-lg font-bold text-gray-800">Aura.AI</h1>
            </div>

            <button
              className="md:hidden text-gray-600 hover:text-black"
              onClick={closeSidebar}
            >
              <X size={22} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="mt-5 flex flex-col space-y-1">
            <p className="text-xs uppercase text-gray-400 px-3">Main</p>

            <Link
              href="/user/dashboard"
              className={linkStyle("/user/dashboard")}
              onClick={closeSidebar}
            >
              <LayoutDashboard size={16} />
              Dashboard
            </Link>

            <Link
              href="/user/dashboard/gallary"
              className={linkStyle("/user/dashboard/gallary")}
              onClick={closeSidebar}
            >
              <ImageIcon size={16} />
              Gallery
            </Link>

            {/* Tools */}
            <p className="text-xs uppercase text-gray-400 px-3 mt-3">Tools</p>

            <button
              onClick={() => toggleDropdown("tools")}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              <span className="flex items-center gap-2">
                <Wand2 size={18} />
                AI Tools
              </span>

              <ChevronDown
                size={16}
                className={`transition-transform ${
                  openDropdown === "tools" ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown */}
            <div
              className={`overflow-hidden transition-all duration-300 ${
                openDropdown === "tools"
                  ? "max-h-96 opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <div className="ml-6 flex flex-col space-y-1 ">
                <Link
                  href="/user/dashboard/tools/aiassistance"
                  className={linkStyle("/assistant")}
                  onClick={closeSidebar}
                >
                  <Bot size={16} />
                  AI Assistant
                </Link>

                <Link
                  href="/user/dashboard/tools/Imagegenerator"
                  className={linkStyle("/text-to-image")}
                  onClick={closeSidebar}
                >
                  <ImagePlus size={16} />
                  Text to Image
                </Link>

                <Link
                  href="/user/dashboard/tools/codewriter"
                  className={linkStyle("/code")}
                  onClick={closeSidebar}
                >
                  <Code size={16} />
                  Code Generator
                </Link>

                <Link
                  href="/user/dashboard/tools/websitegenerator"
                  className={linkStyle("/website")}
                  onClick={closeSidebar}
                >
                  <Wand2 size={16} />
                  Website Generator
                </Link>

                <Link
                  href="/user/dashboard/tools/resumeanalyzer"
                  className={linkStyle("/resume")}
                  onClick={closeSidebar}
                >
                  <Video size={16} />
                  Resume Analyzer
                </Link>

                <Link
                  href="/user/dashboard/tools/ytsummarizer"
                  className={linkStyle("/youtube")}
                  onClick={closeSidebar}
                >
                  <Video size={16} />
                  Youtube Summarizer
                </Link>

                <Link
                  href="/user/dashboard/tools/mockai"
                  className={linkStyle("/mock-interview")}
                  onClick={closeSidebar}
                >
                  <Music size={16} />
                  Mock Interview
                </Link>
              </div>
            </div>

            {/* Account */}
            <p className="text-xs uppercase text-gray-400 px-3 mt-3">Account</p>

            <Link
              href="/user/dashboard/pricing"
              className={linkStyle("/pricing")}
              onClick={closeSidebar}
            >
              <IndianRupee size={18} />
              Pricing
            </Link>

            <Link
              href="/user/dashboard/profile"
              className={linkStyle("/profile")}
              onClick={closeSidebar}
            >
              <Settings size={18} />
              Settings
            </Link>
          </nav>

          {/* User Profile */}
          <div
            onClick={() => setopen(!open)}
            className="absolute bottom-5 left-0 w-full px-4"
          >
            <div className="flex items-center justify-between border border-gray-200 shadow-sm px-3 py-2 rounded-xl hover:shadow-md cursor-pointer bg-white">
              <div className="flex items-center gap-3">
                <User
                  size={38}
                  className="bg-gray-100 text-gray-500 p-2 rounded-xl"
                />

                <div className="flex flex-col leading-tight">
                  <h1 className="font-semibold text-sm text-gray-800">
                    {formdata.name || "username"}
                  </h1>
                  <p className="text-xs text-gray-500">{formdata.email || "mail@gmail.com"}</p>
                </div>
              </div>

              <ChevronDown
                size={18}
                className={`text-gray-500 transition-transform ${
                  open ? "rotate-180" : ""
                }`}
              />
            </div>
          </div>

          {/* Profile Dropdown */}
          {open && (
            <div className="absolute bottom-20 left-4 right-4 bg-white border border-gray-200 rounded-2xl shadow-xl p-3 space-y-3">
              <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
                <User
                  size={34}
                  className="bg-gray-100 text-gray-500 p-2 rounded-xl"
                />
                <div>
                  <h1 className="font-semibold text-sm text-gray-800">
                    {formdata.name || "username"}
                  </h1>
                  <p className="text-xs text-gray-500">{formdata.email || "mail@gmail.com" }</p>
                </div>
              </div>

              <Link
                href={"/user/dashboard/profile"}
                className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-100"
              >
                <Settings size={18} />
                <span className="text-sm font-medium">Settings</span>
              </Link>

              <Link
                href={"/user/dashboard/pricing"}
                className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-100"
              >
                <IndianRupee size={18} />
                <span className="text-sm font-medium">Pricing</span>
              </Link>

              <div className="pt-2 border-t border-gray-200">
                <div onClick={handlelogout} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-red-50 cursor-pointer text-red-600">
                  <LogOut size={18} />
                  <span className="text-sm font-medium">Sign Out</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Right Section */}
      <div className="flex-1 flex flex-col md:ml-64 bg-white">
        {/* Header */}
        <header className="px-5 flex items-center pt-5 pb-4 border-b border-gray-200">
          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsOpen(true)}
          >
            <PanelLeft size={20} />
          </button>

          <h2 className="pl-5 text-lg font-medium text-gray-800">
            <span className="text-gray-400">main &gt;</span> Dashboard
          </h2>
        </header>

        {/* Page Content */}
        <main className="flex-1 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
