"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
const testimonials = [
  {
    id: 1,
    name: "John Carter",
    role: "YouTube Creator",
    image: "/users/user1.jpg",
    rating: 5,
    content:
      "This platform completely transformed how I manage my content. Highly recommended!",
  },
  {
    id: 2,
    name: "Sarah Williams",
    role: "Instagram Influencer",
    image: "/users/user2.jpg",
    rating: 5,
    content:
      "Super clean UI and very easy to use. My workflow has improved drastically.",
  },
  {
    id: 3,
    name: "David Lee",
    role: "Digital Marketer",
    image: "/users/user3.jpg",
    rating: 4,
    content:
      "Amazing experience! The responsiveness and performance are top-notch.",
  },
];

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Loved by Creators Worldwide
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied users transforming their workflow
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((testimonial) => (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6}}
              viewport={{ once: true }}
              key={testimonial.id}
              className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition duration-300"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              <p className="text-gray-600 mb-6 leading-relaxed">
                {testimonial.content}
              </p>

              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>

                <div>
                  <p className="font-semibold text-gray-900">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
