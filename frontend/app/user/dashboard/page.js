"use client"
import {
  Zap,
  Globe,
  Crown,
  TrendingUp,
  ImagePlus,
  Code,
  LayoutTemplate,
  FileSearch,
  Youtube,
  Mic,
  ArrowUpRight,
} from "lucide-react";
import { useState, useContext , useEffect } from "react";
import {appcontext} from "@/app/context/appcontext";

const Page = () => {
  const {api} = useContext(appcontext);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const getdashboardstate = async () =>{
      try {
        const res = await fetch(`${api}/dashboard/user`,{
          method:"GET",
          headers:{
            "Content-Type":"application/json"
          },
          credentials:"include" 
        })
        if(!res.ok){
          const text = await res.text();
          console.error("Error fetching dashboard data:", text);
        }
        const data = await res.json();
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    }
   getdashboardstate();
  }, [api])
  
  // Quick Access Tools with links
  const tools = [
    {
      name: "Text to Image",
      icon: ImagePlus,
      color: "text-purple-600",
      url: "/user/dashboard/tools/Imagegenerator",
    },
    {
      name: "Code Generator",
      icon: Code,
      color: "text-blue-600",
      url: "/user/dashboard/tools/codewriter",
    },
    {
      name: "Website Generator",
      icon: LayoutTemplate,
      color: "text-green-600",
      url: "/user/dashboard/tools/websitegenerator",
    },
    {
      name: "Resume Analyzer",
      icon: FileSearch,
      color: "text-orange-600",
      url: "/user/dashboard/tools/resumeanalyzer",
    },
    {
      name: "YouTube Summarizer",
      icon: Youtube,
      color: "text-red-600",
      url: "/user/dashboard/tools/ytsummarizer",
    },
    {
      name: "Mock Interview",
      icon: Mic,
      color: "text-pink-600",
      url: "/user/dashboard/tools/mockai",
    },
  ];

  return (
    <div className="p-6 md:p-10 min-h-screen bg-gray-50">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Dashboard
        </h1>
        <p className="text-gray-500 mt-1">
          Your creative workspace at a glance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition">
          <p className="text-sm text-gray-500 flex gap-2 items-center">
            <Zap size={18} className="text-purple-500" />
            Total Generation
          </p>
          <h2 className="text-2xl font-bold mt-2">{dashboardData?.totalAIGeneration || 0}</h2>
          <p className="text-green-500 text-sm mt-1">↗ +12%</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition">
          <p className="text-sm text-gray-500 flex gap-2 items-center">
            <Globe size={18} className="text-blue-500" />
            Active Projects
          </p>
          <h2 className="text-2xl font-bold mt-2">{dashboardData?.totalWebsites
 || 0}</h2>
          <p className="text-green-500 text-sm mt-1">↗ +3</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition">
          <p className="text-sm text-gray-500 flex gap-2 items-center">
            <Crown size={18} className="text-orange-500" />
            Total Credits
          </p>
          <h2 className="text-2xl font-bold mt-2">{dashboardData?.totalUsage || 0}</h2>
         
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition">
          <p className="text-sm text-gray-500 flex gap-2 items-center">
            <TrendingUp size={18} className="text-green-500" />
            This Week
          </p>
          <h2 className="text-2xl font-bold mt-2">{dashboardData?.thisWeekUsage || 0}</h2>
          <p className="text-green-500 text-sm mt-1">↗ +8%</p>
        </div>
      </div>

      {/* Quick Access */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Quick Access
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
          {tools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <a key={index} href={tool.url}>
                <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer flex flex-col items-center text-center">
                  <div className={`w-12 h-12 flex items-center justify-center rounded-xl bg-gray-100 ${tool.color}`}>
                    <Icon size={22} />
                  </div>
                  <p className="mt-3 text-sm font-medium text-gray-700">
                    {tool.name}
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
     {/* Recent Activity */}
<div className="mt-10 bg-white rounded-2xl shadow-sm p-6">
  <div className="flex justify-between items-center mb-6">
    <h2 className="text-lg font-semibold text-gray-800">
      Recent Activity
    </h2>
    {/* <button className="text-sm text-gray-500 hover:text-black">
      View all
    </button> */}
  </div>

  {dashboardData?.recentActivity?.length > 0 ? (
    <ul className="space-y-4">
      {dashboardData.recentActivity.map((activity, index) => (
        <li
          key={index}
          className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
        >
          <span className="text-gray-700 font-medium">{activity.tool}</span>
          {activity.date && (
            <span className="text-gray-500 text-sm">
              {new Date(activity.date).toLocaleString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
          {activity.count && (
            <span className="text-gray-600 text-sm">Count: {activity.count}</span>
          )}
        </li>
      ))}
    </ul>
  ) : (
    <div className="text-center text-gray-400 py-10">
      <ArrowUpRight size={40} className="mx-auto mb-4 opacity-40" />
      <p>No recent activity yet. Try a tool to get started!</p>
    </div>
  )}
</div>

{/* Most Used Tools */}
<div className="mt-8 bg-white rounded-2xl shadow-sm p-6">
  <h2 className="text-lg font-semibold text-gray-800 mb-6">
    Most Used Tools
  </h2>

  {dashboardData?.aiUsageBarData?.length > 0 ? (
    <div className="space-y-3">
      {dashboardData.aiUsageBarData
        .sort((a, b) => b.count - a.count) // sort descending
        .map((tool, index) => (
          <div key={index} className="flex items-center gap-4">
            <span className="w-24 text-gray-700 text-sm">{tool.tool}</span>
            <div className="flex-1 bg-gray-200 h-3 rounded-full">
              <div
                className="h-3 rounded-full bg-green-500"
                style={{
                  width: `${(tool.count / (Math.max(...dashboardData.aiUsageBarData.map(t => t.count)) || 1)) * 100}%`,
                }}
              ></div>
            </div>
            <span className="text-gray-700 text-sm w-10 text-right">{tool.count}</span>
          </div>
        ))}
    </div>
  ) : (
    <div className="text-center text-gray-400 py-10">
      <TrendingUp size={40} className="mx-auto mb-4 opacity-40" />
      <p>Usage stats will appear here</p>
    </div>
  )}
</div>

    </div>
  );
};

export default Page;
