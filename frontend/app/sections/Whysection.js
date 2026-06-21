"use client"
import { motion } from "framer-motion"
const Whysection = () => {
  const card = [
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path
            fill="none"
            stroke="white"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 14L14 3v7h6L10 21v-7z"
          />
        </svg>
      ),
      title: "Boost Productivity",
      desc: "Automate repetitive task and focus on what matters most.",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 48 48"
        >
          <path
            fill="none"
            stroke="white"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M24 43.5c9.043-3.117 15.488-10.363 16.5-19.589c.28-4.005.256-8.025-.072-12.027a2.54 2.54 0 0 0-2.467-2.366c-4.091-.126-8.846-.808-12.52-4.427a2.05 2.05 0 0 0-2.881 0c-3.675 3.619-8.43 4.301-12.52 4.427a2.54 2.54 0 0 0-2.468 2.366A79.4 79.4 0 0 0 7.5 23.911C8.51 33.137 14.957 40.383 24 43.5"
            strokeWidth="1"
          />
          <circle
            cx="24"
            cy="20.206"
            r="4.299"
            fill="none"
            stroke="white"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1"
          />
          <path
            fill="none"
            stroke="white"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M31.589 32.093a7.589 7.589 0 1 0-15.178 0"
            strokeWidth="1"
          />
        </svg>
      ),
      title: "Secure and Private",
      desc: "Your data is encrypted and never shered with third parties.",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 16 16"
        >
          <path
            fill="white"
            d="M8 15c-3.86 0-7-3.14-7-7s3.14-7 7-7s7 3.14 7 7s-3.14 7-7 7M8 2C4.69 2 2 4.69 2 8s2.69 6 6 6s6-2.69 6-6s-2.69-6-6-6"
          />
          <path
            fill="white"
            d="M10 10.5c-.09 0-.18-.02-.26-.07l-2.5-1.5A.5.5 0 0 1 7 8.5v-4c0-.28.22-.5.5-.5s.5.22.5.5v3.72l2.26 1.35a.502.502 0 0 1-.26.93"
          />
        </svg>
      ),
      title: "Save Time",
      desc: "Complete task in minutes that used to take hours.",
    },
  ];
  return (
    <section className="flex flex-col  h-fit pb-20 w-full items-center">
      <h1 className="mt-40 font-bold text-3xl mx-5">Why Choose Aura.Ai?</h1>
      <h2 className="text-xl text-gray-500 pt-5 mx-5">
        Experience the next generation of Ai-powered creativity tools
      </h2>

      <div className="grid grid-cols-1  gap-5 mx-5 mt-20 md:grid md:grid-cols-3 md:gap-2">
        {card.map((item, i) => (
          <motion.div
            initial={{opacity: 0 , y: 100}}
         whileInView={{opacity : 1, y:0}}
         transition={{duration: 1.2}}
         viewport={{once:true}}
            key={i}
            className="border-[2px] border-gray-300 rounded-xl py-5 px-5 hover:border-purple-300 transform transition-all duration-500 ease-out hover:-translate-y-3
            hover:shadow-2xl
            hover:shadow-black/40
          
          
          "
          >
            <div
              className="w-14 h-14 flex items-center justify-center 
                      button-gradient rounded-xl mb-5"
            >
              {item.icon}
            </div>

            <div className="font font-semibold  text-xl mb-3">{item.title}</div>

            <div className="text-lg text-gray-600 mb-5">{item.desc}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Whysection;
