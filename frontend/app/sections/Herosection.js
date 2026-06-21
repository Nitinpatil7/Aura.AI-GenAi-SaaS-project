"use client"
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion"
const Herosection = () => {
  return (
    <section id="home" className="w-full bg-gradient-to-r from-white to-purple-100 pb-10">
      <div className="pt-30 sm:pt-30 sm:pb-20 lg:pt-30 lg:pb-20 px-4 sm:px-10">

        <h2 className="text-purple-800 text-xs sm:text-sm font-bold bg-purple-200/60 w-fit rounded-xl backdrop-blur-3xl border border-purple-300/40 px-3 py-1 mb-5 sm:mb-10">
          Powered By Advanced AI
        </h2>

        <div className="flex flex-col-reverse lg:flex-row items-center gap-10">
         <motion.div 
         className="flex-1 flex flex-col gap-5"
         initial={{opacity: 0 , y: 100}}
         animate={{opacity : 1, y:0}}
         transition={{duration: 0.8}}
         >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl font-semibold leading-tight">
              Transform Your Ideas Into Reality With{" "}
              <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
                AI Power
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-700 mt-2 sm:mt-4">
              Unlock limitless creativity with our suite of AI-powered tools. Generate images, write code, build websites, and more — all from one powerful platform.
            </p>


            <div className="flex sm:flex-row  sm:items-center flex-col  gap-5 mt-4">
             <Link href={"/auth/signup"}>
              <button className="text-lg sm:text-xl font-semibold button-gradient rounded-lg py-3 px-6 flex flex-row items-center justify-center gap-2 lg:text-xl ">
                Start Creating Free
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  className="ml-1"
                >
                  <path
                    fill="none"
                    stroke="white"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M.75 12h22.5m-10.5 10.5L23.25 12L12.75 1.5"
                  />
                </svg>
              </button>
             </Link>

              <button className="hover:bg-gray-200 rounded-lg py-3 px-6 font-semibold text-lg sm:text-2xl border border-gray-400 lg:text-xl">
                View Pricing
              </button>
            </div>

            {/* Check items */}
            <div className="flex  flex-row items-center gap-2 sm:gap-5 mt-4">
              <h3 className="flex items-center gap-1 text-gray-700 text-sm sm:text-base">
                <Image src="/check.svg" alt="check" width={17} height={15} /> No Credit Card Required
              </h3>
              <h3 className="flex items-center gap-1 text-gray-700 text-sm sm:text-base">
                <Image src="/check.svg" alt="check" width={17} height={15} /> Free Trial Included
              </h3>
            </div>
          </motion.div>

          {/* Image section */}
          <motion.div 
            initial={{opacity: 0 , y: 100}}
         animate={{opacity : 1, y:0}}
         transition={{duration: 0.8}}
          className="flex-1 w-full">
            <Image
              className="rounded-2xl w-full h-auto object-cover"
              src="/side-image.jpeg"
              alt="Aura.Ai"
              width={1200}
              height={700}
              priority
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Herosection;
