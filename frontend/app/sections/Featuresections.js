"use client";
import { motion } from "framer-motion";
const Featuresections = () => {
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
            fill="#7E22CE"
            d="M5 3h13a3 3 0 0 1 3 3v13a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3m0 1a2 2 0 0 0-2 2v11.59l4.29-4.3l2.5 2.5l5-5L20 16V6a2 2 0 0 0-2-2zm4.79 13.21l-2.5-2.5L3 19a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-1.59l-5.21-5.2zM7.5 6A2.5 2.5 0 0 1 10 8.5A2.5 2.5 0 0 1 7.5 11A2.5 2.5 0 0 1 5 8.5A2.5 2.5 0 0 1 7.5 6m0 1A1.5 1.5 0 0 0 6 8.5A1.5 1.5 0 0 0 7.5 10A1.5 1.5 0 0 0 9 8.5A1.5 1.5 0 0 0 7.5 7"
          />
        </svg>
      ),
      title: "Ai Image Generator",
      desc: "Create stunning , uniq images from text descriptions in seconds",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path
            fill="#7E22CE"
            d="M4.825 12.025L8.7 15.9q.275.275.275.7t-.275.7t-.7.275t-.7-.275l-4.6-4.6q-.15-.15-.213-.325T2.426 12t.063-.375t.212-.325l4.6-4.6q.3-.3.713-.3t.712.3t.3.713t-.3.712zm14.35-.05L15.3 8.1q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l4.6 4.6q.15.15.213.325t.062.375t-.062.375t-.213.325l-4.6 4.6q-.3.3-.7.288t-.7-.313t-.3-.712t.3-.713z"
          />
        </svg>
      ),
      title: "Code Writer",
      desc: "Generate clean, effecient code in multiple programming languages.",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 20 20"
        >
          <path
            fill="#7E22CE"
            d="M10 20a10 10 0 1 1 0-20a10 10 0 0 1 0 20m7.75-8a8 8 0 0 0 0-4h-3.82a29 29 0 0 1 0 4zm-.82 2h-3.22a14.4 14.4 0 0 1-.95 3.51A8.03 8.03 0 0 0 16.93 14m-8.85-2h3.84a24.6 24.6 0 0 0 0-4H8.08a24.6 24.6 0 0 0 0 4m.25 2c.41 2.4 1.13 4 1.67 4s1.26-1.6 1.67-4zm-6.08-2h3.82a29 29 0 0 1 0-4H2.25a8 8 0 0 0 0 4m.82 2a8.03 8.03 0 0 0 4.17 3.51c-.42-.96-.74-2.16-.95-3.51zm13.86-8a8.03 8.03 0 0 0-4.17-3.51c.42.96.74 2.16.95 3.51zm-8.6 0h3.34c-.41-2.4-1.13-4-1.67-4S8.74 3.6 8.33 6M3.07 6h3.22c.2-1.35.53-2.55.95-3.51A8.03 8.03 0 0 0 3.07 6"
          />
        </svg>
      ),
      title: "Website Generator",
      desc: "Build Complete,  Responsive With AI Assistance",
    },
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
            stroke="#7E22CE"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m5.6 19.92l1.524-1.219l.01-.008c.318-.255.479-.383.658-.474q.241-.123.508-.178C8.499 18 8.706 18 9.122 18h8.681c1.118 0 1.678 0 2.105-.218a2 2 0 0 0 .874-.874C21 16.48 21 15.92 21 14.804V7.197c0-1.118 0-1.678-.218-2.105a2 2 0 0 0-.875-.874C19.48 4 18.92 4 17.8 4H6.2c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C3 5.52 3 6.08 3 7.2v11.471c0 1.066 0 1.599.218 1.872a1 1 0 0 0 .783.377c.35 0 .766-.334 1.599-1"
          />
        </svg>
      ),
      title: "Smart Chatbot",
      desc: "Engage in intelligent conversations with our advnaced AI.",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path
            fill="#7E22CE"
            fillRule="evenodd"
            d="M8.7 6.5v6a3.3 3.3 0 1 0 6.6 0v-6a3.3 3.3 0 0 0-6.6 0m3.9 13.476V23h-1.2v-3.024A7.5 7.5 0 0 1 4.5 12.5V11h1.2v1.5a6.3 6.3 0 0 0 12.6 0V11h1.2v1.5a7.5 7.5 0 0 1-6.9 7.476M7.5 6.5a4.5 4.5 0 0 1 9 0v6a4.5 4.5 0 1 1-9 0z"
          />
        </svg>
      ),
      title: "Voice Assistance",
      desc: "Control and interact using natural Voice COmmand",
    },
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
            stroke="#7E22CE"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 14L14 3v7h6L10 21v-7z"
          />
        </svg>
      ),
      title: "Lightening Fast",
      desc: "Get Result Instantly With Our Optomized AI Processing.",
    },
  ];
  return (
    <section id="features" className="flex flex-col h-fit pb-20 w-full  items-center">
      <h1
        className="mt-5 font-bold text-3xl mx-5 ,x1
      "
      >
        Powerful AI Features
      </h1>
      <h2 className="text-xl text-gray-500 pt-5 mx-5">
        Everything you need to bring your creative vision to life
      </h2>

      <div className=" grid grid-cols-1 gap-5 mx-5 mt-20 md:grid-cols-3">
        {card.map((item, i) => (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            viewport={{ once: true }}
            key={i}
            className="border-[2px] border-gray-300 rounded-xl py-5 px-5  hover:border-purple-300 transform transition-all duration-500 ease-out hover:-translate-y-3
            hover:shadow-2xl
            hover:shadow-black/40
          
          
          "
          >
            <div
              className="w-12 h-12 flex items-center justify-center 
                      bg-purple-200 rounded-xl mb-5"
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

export default Featuresections;
