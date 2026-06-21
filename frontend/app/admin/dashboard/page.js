"use client";

import {
  Users,
  Activity,
  DollarSign,
  Brain,
  TrendingUp,
  ArrowUpRight
} from "lucide-react";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { useState, useEffect, useMemo } from "react";
import { appcontext } from "@/app/context/appcontext";
import { useContext } from "react";
export default function AdminDashboardPage() {

  const { api } = useContext(appcontext);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchdata = async () => {
      try {
        const res = await fetch(`${api}/admin/dashboard`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        if (!res.ok) {
          const text = await res.text();
          setError(text || "Failed to fetch dashboard data");
          return;
        }

        const data = await res.json();
        setDashboardData(data);
      } catch (error) {
        setError(error.message || "Failed to fetch dashboard data");

      }
    }

    fetchdata();

  }, [])

  const kpiData = useMemo(() => [
    {
      title: "Total Users",
      value: dashboardData?.totalUsers || 0,
      icon: Users,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Active Users",
      value: dashboardData?.activeUsers || 0,
      icon: Activity,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Monthly Revenue",
      value: dashboardData?.monthlyRevenue || 0,
      icon: DollarSign,
      color: "from-purple-500 to-indigo-500",
    },
    {
      title: "AI Requests",
      value: dashboardData?.totalAIRequests || 0,
      icon: Brain,
      color: "from-orange-500 to-amber-500",
    },
  ], [dashboardData]);

  const userGrowthData = dashboardData?.userGrowthData || [];
  const revenueData = dashboardData?.revenueData || [];
  const aiRequestData = dashboardData?.aiRequestData || [];
  const planDistributionData = dashboardData?.planDistributionData || [];
  const recentActivities = dashboardData?.recentActivities || [];

  const formatDate = (value) => value ? new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }) : "";

  return (

    <div className="bg-surface-2">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
          Dashboard Overview
        </h1>
        <p className="text-gray-500">
          Monitor your platform performance from live backend data
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* KPI CARDS */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">

        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition">
              <div className="flex justify-between items-center mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${kpi.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="text-white w-6 h-6" />
                </div>
                <span className="flex items-center text-gray-500 text-sm font-medium">
                  <ArrowUpRight size={16} />
                  Live
                </span>
              </div>
              <p className="text-gray-500 text-sm">{kpi.title}</p>
              <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
            </div>
          );
        })}

      </div>

      {/* CHARTS */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-green-500" />
            User Growth
          </h2>
          {userGrowthData.length ? <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer> : <EmptyState />}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="font-semibold mb-4">
            Revenue Growth
          </h2>
          {revenueData.length ? <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer> : <EmptyState />}
        </div>

      </div>

      {/* AI + PIE */}
      <div className="grid gap-6 lg:grid-cols-3 mb-6">

        <div className="bg-white p-6 rounded-xl shadow-sm lg:col-span-2">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Brain size={18} className="text-orange-500" />
            AI Requests
          </h2>
          {aiRequestData.length ? <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={aiRequestData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="requests" stroke="#f59e0b" fill="#fde68a" />
            </AreaChart>
          </ResponsiveContainer> : <EmptyState />}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="font-semibold mb-4">
            Plan Distribution
          </h2>
          {planDistributionData.length ? <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={planDistributionData} dataKey="value" innerRadius={50} outerRadius={80}>
                {planDistributionData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer> : <EmptyState />}
        </div>

      </div>

      {/* ACTIVITY + SYSTEM */}
      <div className="grid grid-cols-1 gap-6">

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivities.length ? recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
                <div className={`w-2 h-2 rounded-full mt-2
                  ${activity.type === 'upgrade' ? 'bg-green-500' :
                    activity.type === 'usage' ? 'bg-blue-500' :
                      activity.type === 'signup' ? 'bg-purple-500' :
                        activity.type === 'api' ? 'bg-orange-500' : 'bg-red-500'
                  }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                  <p className="text-sm text-gray-600">{activity.action}</p>
                </div>
                <span className="text-xs text-gray-500">{formatDate(activity.time)}</span>
              </div>
            )) : <p className="text-sm text-gray-500">No recent activity yet.</p>}
          </div>
        </div>

      </div>

    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-[250px] flex items-center justify-center rounded-lg border border-dashed border-gray-200 text-sm text-gray-500">
      No data available yet.
    </div>
  );
}
