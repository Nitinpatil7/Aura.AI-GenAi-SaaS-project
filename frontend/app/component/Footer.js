"use client";
import Link from "next/link";
import { Twitter, Linkedin, Github, Mail } from "lucide-react";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-4 text-center sm:text-left">
            <Link
              href="/"
              className="flex flex-col sm:flex-row items-center sm:items-center gap-2"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20">
                <Image
                  src="/Aura.AI logo.png"
                  alt="Aura.AI Logo"
                  width={150}
                  height={150}
                  className="object-contain"
                />
              </div>
              <span className="text-lg sm:text-xl md:text-2xl font-semibold text-white">
                aura.ai
              </span>
            </Link>
            <p className="text-xs sm:text-sm md:text-base text-gray-400">
              Empowering creativity with AI-powered tools for the modern
              creator.
            </p>
            <div className="flex justify-center sm:justify-start gap-4">
              <Link href="/" className="hover:text-white transition-colors">
                <Twitter className="w-5 h-5 sm:w-6 sm:h-6" />
              </Link>
              <Link href="/" className="hover:text-white transition-colors">
                <Linkedin className="w-5 h-5 sm:w-6 sm:h-6" />
              </Link>
              <Link href="/" className="hover:text-white transition-colors">
                <Github className="w-5 h-5 sm:w-6 sm:h-6" />
              </Link>
              <Link href="/" className="hover:text-white transition-colors">
                <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
              </Link>
            </div>
          </div>

          <div className="text-center sm:text-left">
            <h3 className="text-white font-semibold mb-4 text-base sm:text-lg md:text-xl">
              Product
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="hover:text-white text-sm sm:text-base md:text-lg transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="hover:text-white text-sm sm:text-base md:text-lg transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="hover:text-white text-sm sm:text-base md:text-lg transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="hover:text-white text-sm sm:text-base md:text-lg transition-colors"
                >
                  API
                </Link>
              </li>
            </ul>
          </div>

          <div className="text-center sm:text-left">
            <h3 className="text-white font-semibold mb-4 text-base sm:text-lg md:text-xl">
              Company
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="hover:text-white text-sm sm:text-base md:text-lg transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="hover:text-white text-sm sm:text-base md:text-lg transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="hover:text-white text-sm sm:text-base md:text-lg transition-colors"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="hover:text-white text-sm sm:text-base md:text-lg transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div className="text-center sm:text-left">
            <h3 className="text-white font-semibold mb-4 text-base sm:text-lg md:text-xl">
              Legal
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="hover:text-white text-sm sm:text-base md:text-lg transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="hover:text-white text-sm sm:text-base md:text-lg transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="hover:text-white text-sm sm:text-base md:text-lg transition-colors"
                >
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="hover:text-white text-sm sm:text-base md:text-lg transition-colors"
                >
                  GDPR
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm sm:text-base md:text-lg text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} aura.ai. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
