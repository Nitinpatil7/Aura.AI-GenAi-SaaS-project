"use client"
import {useState} from "react";
import Image from "next/image";
import Link from "next/link";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full backdrop-blur-lg bg-white/20 border-b border-white/10 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 flex justify-between items-center h-20">
        
        <div className="flex items-center gap-2">
          <Image
            src="/Aura.AI logo.png"
            alt="Aura.AI Logo"
            height={50}
            width={50}
            className="object-contain"
          />
          <h1 className="text-2xl font-bold text-gradient">Aura.AI</h1>
        </div>

        
        <div className="hidden md:flex items-center gap-6">
          <Link href="#features">
            <span className="text-gray-500 hover:text-black cursor-pointer">Features</span>
          </Link>
          <Link href="#plans">
            <span className="text-gray-500 hover:text-black cursor-pointer">Pricing</span>
          </Link>
          <Link href="#testimonials">
            <span className="text-gray-500 hover:text-black cursor-pointer">Testimonials</span>
          </Link>

          <div className="flex items-center gap-3 ml-4">
            <Link href="/auth/signin">
              <button className="hover:bg-gray-200 rounded-xl px-4 py-1 font-semibold">
                Login
              </button>
            </Link>
            <Link href="/auth/signup">
              <button className="button-gradient rounded-xl px-4 py-1 font-semibold text-white">
                Get Started
              </button>
            </Link>
          </div>
        </div>

        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="focus:outline-none"
          >
            {isOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>


      {isOpen && (
        <div className="md:hidden bg-white/20 backdrop-blur-lg  border-white/10 px-4 py-4 flex flex-col gap-4">
          <Link href="#features" onClick={()=> setIsOpen(false)}>
            <span className="text-gray-700 hover:text-black cursor-pointer">Features</span>
          </Link>
          <Link href="#plans" onClick={()=> setIsOpen(false)}>
            <span className="text-gray-700 hover:text-black cursor-pointer">Pricing</span>
          </Link>
          <Link href="#testimonials" onClick={()=> setIsOpen(false)}>
            <span className="text-gray-700 hover:text-black cursor-pointer">Testimonials</span>
          </Link>

          <div className="flex flex-col gap-3 mt-2">
            <Link href="/auth/signin" >
              <button className="hover:bg-gray-200 rounded-xl px-4 py-2 font-semibold w-full">
                Login
              </button>
            </Link>
            <Link href="/auth/signup">
              <button className="button-gradient rounded-xl px-4 py-2 font-semibold text-white w-full">
                Get Started
              </button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
