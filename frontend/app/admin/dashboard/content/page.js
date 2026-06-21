"use client";

import { useMemo, useState } from "react";
import {
  FileText,
  Search,
  Image,
  Code,
  Globe,
} from "lucide-react";
import {  useEffect , useContext } from "react";
import { appcontext } from "@/app/context/appcontext";

export default function ContentManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { api } = useContext(appcontext);
  
  const [contentstate, setcontentstate] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {

    const fetchcontentstate = async() =>{
      try {
        const res = await fetch(`${api}/admin/content`,{
          method:"GET",
          headers:{
            "Content-Type":"application/json"
          },
          credentials:"include"
        });

        if(!res.ok){
          const text = await res.text();
          setError(text || "Failed to fetch content stats");
          return;
        }

        const data = await res.json();
        setcontentstate(data);
      } catch (error) {
        setError(error.message || "Failed to fetch content stats");
      }
    }
    fetchcontentstate();
   
  }, [api])
  

  const stats = [
    { label: "Total Content", value: contentstate?.totalContent || "0", icon: FileText },
    { label: "Images", value: contentstate?.images || "0", icon: Image },
    { label: "Code Snippets", value: contentstate?.codes || "0", icon: Code },
    { label: "Websites", value: contentstate?.websites || "0", icon: Globe },
  ];

  const latestContent = useMemo(() => {
    const items = contentstate?.latestContent || [];
    const query = searchQuery.trim().toLowerCase();
    if (!query) return items;

    return items.filter((item) =>
      [item.title, item.type, item.user]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [contentstate, searchQuery]);

  return (
    <div className="bg-surface-2">

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Content Management
        </h1>
        <p className="text-gray-600">
          Manage user-generated content and assets
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow">
                <stat.icon size={22} />
              </div>
            </div>

            <p className="text-sm text-gray-500">{stat.label}</p>

            <h3 className="text-3xl font-bold text-gray-900">
              {stat.value}
            </h3>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200">

        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              All Content
            </h2>
            <p className="text-sm text-gray-500">
              Browse and manage all user-generated content
            </p>
          </div>

        
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200 relative">

          <Search className="absolute left-9 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

          <input
            type="search"
            placeholder="Search content by title, type, or user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
          />

        </div>

        {/* Table */}
        <div className="overflow-x-auto">

          <div className="overflow-x-auto bg-white rounded-2xl shadow-lg border border-gray-200">
  <table className="w-full min-w-[600px] border-separate border-spacing-0">
    <thead className="bg-gray-100 border-b border-gray-200">
      <tr className="text-sm text-gray-700">
        <th className="px-6 py-3 text-left font-semibold">Creator</th>

        {/* Only show Type column if there's at least one type */}
        {latestContent.some(item => item.type) && (
          <th className="px-6 py-3 text-left font-semibold">Type</th>
        )}

        {/* Only show Date column if any date exists */}
        {latestContent.some(item => item.date) && (
          <th className="px-6 py-3 text-left font-semibold">Date</th>
        )}

        {/* Only show Size column if any size exists */}
        {latestContent.some(item => item.size) && (
          <th className="px-6 py-3 text-left font-semibold">Size</th>
        )}
      </tr>
    </thead>

    <tbody className="divide-y divide-gray-200">
      {latestContent.map((item, index) => (
        <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">

          {/* Creator */}
          <td className="px-6 py-4 text-gray-600 break-words">{item.user}</td>

          {/* Type Badge */}
          {item.type && (
            <td className="px-6 py-4">
              <span
                className={`px-2 py-1 text-xs rounded-md font-medium ${
                  item.type === "Image"
                    ? "bg-pink-100 text-pink-700"
                    : item.type === "Code"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-purple-100 text-purple-700"
                }`}
              >
                {item.type}
              </span>
            </td>
          )}

          {/* Date */}
          {item.date && (
            <td className="px-6 py-4 text-gray-600">
              {new Date(item.date).toLocaleString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </td>
          )}

          {/* Size */}
          {item.size && (
            <td className="px-6 py-4 text-gray-600">{item.size}</td>
          )}
        </tr>
      ))}

      {/* Show message if no content available */}
      {latestContent.length === 0 && (
        <tr>
          <td
            colSpan={4}
            className="px-6 py-4 text-center text-gray-500 italic"
          >
            No recent content available.
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

        </div>

      </div>

    </div>
  );
}
