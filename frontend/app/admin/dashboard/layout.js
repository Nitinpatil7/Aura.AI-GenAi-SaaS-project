"use client";

import { useState, useContext } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  FileText,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { appcontext } from "@/app/context/appcontext";

export default function Layout({ children }) {
  const { api } = useContext(appcontext);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
    { name: "Users", icon: Users, href: "/admin/dashboard/users" },
   
    { name: "Billing", icon: CreditCard, href: "/admin/dashboard/billing" },
    { name: "Content Management", icon: FileText, href: "/admin/dashboard/content" },
  ];

  const getTitle = () => {
    const item = menuItems.find((i) => i.href === pathname);
    return item ? item.name : "Dashboard";
  };

  // LOGOUT FUNCTION
  const handleLogout = async () => {
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
      {/* SIDEBAR */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200
          flex flex-col justify-between transition-transform duration-300 z-40
          ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
        `}
      >
        <div>
          {/* LOGO */}
          <div className="flex items-center justify-between p-5 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Image src="/Aura.AI logo.png" alt="logo" width={36} height={36} />
              <span className="font-bold text-lg">Aura.AI</span>
            </div>

            <button onClick={() => setOpen(false)} className="lg:hidden">
              <X size={20} />
            </button>
          </div>

          {/* MENU */}
          <nav className="p-3 space-y-1">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={index}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition
                    ${active
                      ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                    }
                  `}
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t flex flex-col gap-3">
          <span className="text-xs text-gray-400">Aura.AI Admin</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3">
            {/* MOBILE MENU BUTTON */}
            <button onClick={() => setOpen(true)} className="lg:hidden">
              <Menu size={22} />
            </button>

            {/* BREADCRUMB */}
            <div className="text-sm text-gray-500">
              Admin <span className="mx-1">/</span>
              <span className="font-semibold text-gray-800">{getTitle()}</span>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>

      {/* MOBILE OVERLAY */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/30 lg:hidden"
        />
      )}
    </div>
  );
}
