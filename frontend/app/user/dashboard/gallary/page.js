"use client";

import { useContext, useEffect, useState } from "react";
import { appcontext } from "@/app/context/appcontext";
import { Download, Copy, ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";

const Skeleton = () => (
  <div className="relative rounded-2xl overflow-hidden bg-gray-200 h-48 sm:h-64 animate-pulse">
    <div className="absolute inset-0 flex items-center justify-center">
      <ImageIcon className="text-gray-300" size={32} />
    </div>
  </div>
);

const ImagesPage = () => {
  const { api } = useContext(appcontext);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch(`${api}/ai/gallery`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (res.status === 401) {
          alert("Session expired. Please login again.");
          router.push("/auth/signin");
          return;
        }

        if (!res.ok) {
          const text = await res.text();
          console.error("Error fetching images:", text);
          setLoading(false);
          return;
        }

        const data = await res.json();
        setImages(data.images || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching images:", error);
        alert("Something went wrong. Please try again.");
        setLoading(false);
      }
    };

    fetchImages();
  }, [api, router]);

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    alert("Image URL copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Generated Images</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center text-gray-400 py-20 flex flex-col items-center justify-center">
        <ImageIcon size={48} className="mb-4 text-gray-300" />
        <p className="text-lg">No images generated yet.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
        Generated Images
      </h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {images.map((img, index) => {
          const imageUrl = img.images?.[0]; // use first URL from images array
          if (!imageUrl) return null;
          
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={img._id}
              className="relative group rounded-xl overflow-hidden shadow-sm bg-gray-100 h-48 sm:h-64 border border-gray-200"
            >
              <Image
                src={imageUrl}
                alt={img.prompt || "Generated AI Image"}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Hover Overlay - Transparent Blur */}
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity duration-300">
                <div className="flex gap-4 mb-3">
                  <button
                    onClick={() => copyToClipboard(imageUrl)}
                    className="bg-white/90 p-2 rounded-full hover:bg-white text-gray-800 transition shadow-lg transform hover:scale-110"
                    title="Copy Image URL"
                  >
                    <Copy size={18} />
                  </button>
                  <a
                    href={imageUrl}
                    download
                    target="_blank"
                    className="bg-white/90 p-2 rounded-full hover:bg-white text-gray-800 transition shadow-lg transform hover:scale-110"
                    title="Download Image"
                  >
                    <Download size={18} />
                  </a>
                </div>
                <p className="text-white text-xs px-4 text-center line-clamp-2 w-full font-medium">
                  {img.prompt}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default ImagesPage;
