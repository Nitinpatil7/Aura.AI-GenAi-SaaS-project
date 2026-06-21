"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const plans = [
  {
    mode: "Free Plan",
    price: "Rs 0",
    desc: "Perfect for individuals getting started",
    features: [
      "3 image generations",
      "5 code generations",
      "1 website generation",
      "1 resume analysis",
      "5 YouTube summaries",
      "1 mock interview",
      "Unlimited AI chat",
    ],
    popular: false,
  },
  {
    mode: "Pro Plan",
    price: "Rs 499",
    desc: "For professionals and small teams",
    features: [
      "50 image generations",
      "50 code generations",
      "15 website generations",
      "Unlimited resume analysis",
      "Unlimited YouTube summaries",
      "5 mock interviews",
      "Unlimited AI chat",
    ],
    popular: true,
  },
  {
    mode: "Premium Plan",
    price: "Rs 899",
    desc: "For advanced professional usage",
    features: [
      "Unlimited image generations",
      "Unlimited code generations",
      "Unlimited website generations",
      "Unlimited resume analysis",
      "Unlimited YouTube summaries",
      "Unlimited mock interviews",
      "Unlimited AI chat",
    ],
    popular: false,
  },
];

const Plansection = () => {
  return (
    <section id="plans" className="flex flex-col h-fit w-full items-center">
      <h1 className="mt-20 font-bold text-3xl mx-5">Choose Your Plan</h1>
      <h2 className="text-xl text-gray-500 pt-5 mx-5">
        Select the plan that matches your monthly AI usage.
      </h2>

      <div className="grid md:grid-cols-3 gap-8 items-stretch pt-15 pb-30 mx-5">
        {plans.map((item) => (
          <motion.div
            key={item.mode}
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            viewport={{ once: true }}
            className={`border-[1px] rounded-xl border-gray-300 px-8 mx-5 pt-6 relative ${
              item.popular ? "scale-105 border-2 border-purple-600 shadow-2xl shadow-purple-500/20" : ""
            }`}
          >
            {item.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 button-gradient text-sm font-semibold rounded-full">
                Most Popular
              </div>
            )}

            <h1 className="text-2xl py-5 font-semibold">{item.mode}</h1>
            <h2 className="text-4xl font-semibold flex items-center pb-5">
              {item.price}
              <span className="text-xs text-gray-500 font-medium pt-5">/month</span>
            </h2>
            <h3 className="text-lg text-gray-600 pb-3">{item.desc}</h3>

            <div className="flex flex-col gap-2">
              {item.features.map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <Image src="/check.svg" alt="" height={15} width={17} />
                  {feature}
                </div>
              ))}
            </div>

            <button
              className={`border-[1px] rounded-lg w-full my-10 py-1 text-lg hover:bg-gray-100 ${
                item.popular ? "button-gradient" : ""
              }`}
            >
              Get Started
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Plansection;
