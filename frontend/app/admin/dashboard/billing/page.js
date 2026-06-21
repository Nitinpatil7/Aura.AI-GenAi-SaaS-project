"use client";

import {
  DollarSign,
  TrendingUp,
  CreditCard,
  AlertCircle,
} from "lucide-react";

import {
  Line,
  ComposedChart,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";
import { useContext } from "react";
import { appcontext } from "@/app/context/appcontext";
export default function BillingPage() {
  const { api } = useContext(appcontext);
  const [billingstate, setbillingstate] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchbillingstate = async () => {
      try {
        const res = await fetch(`${api}/admin/billing`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!res.ok) {
          const text = await res.text();
          setError(text || "Failed to fetch billing data");
          return;
        }

        const data = await res.json();
        setbillingstate(data);
      } catch (error) {
        setError(error.message || "Failed to fetch billing data");
      }
    };

    fetchbillingstate();
  }, [api]);

  const formatCurrency = (value) => `Rs ${Number(value || 0).toLocaleString("en-IN")}`;
  const formatDate = (value) =>
    value
      ? new Date(value).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "N/A";

  const kpiData = [
    {
      title: "Monthly Recurring Revenue",
      value: formatCurrency(billingstate?.totalRevenue || 0),
      icon: DollarSign,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Active Subscriptions",
      value: billingstate?.activesubscription || 0,
      icon: CreditCard,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Failed Payments",
      value: billingstate?.failedPayments || 0,
      icon: AlertCircle,
      color: "from-red-500 to-orange-500",
    },
    {
      title: "Avg Revenue/User",
      value: formatCurrency(billingstate?.averageAmount || 0),
      icon: TrendingUp,
      color: "from-purple-500 to-indigo-500",
    },
  ];

  const revenueData = billingstate?.revenueData || [];
  const planRevenueData = billingstate?.planRevenueData || [];
  const retentionData = billingstate?.retentionData || [];
  const activeSubscriptions = billingstate?.activeSubscriptions || [];

  return (
    <div className="bg-surface-2 px-4 py-6 sm:px-6 lg:px-8">
      {/* HEADER */}
      <div className="mb-6 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Billing & Revenue
        </h1>
        <p className="text-gray-600 mt-1">
          Track subscription revenue and payment analytics from real payments
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-10">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl p-4 sm:p-6 shadow-md hover:shadow-lg transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                  Live
                </span>
              </div>
              <p className="text-sm text-gray-500">{kpi.title}</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                {kpi.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* CHART SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-10">
        {/* Revenue & Subscriptions */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md lg:col-span-2 overflow-x-auto">
          <h3 className="font-semibold text-lg mb-3 sm:mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" /> Revenue &
            Subscriptions Growth
          </h3>
          <div className="min-w-[500px]">
            {revenueData.length ? <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend wrapperStyle={{ flexWrap: "wrap" }} />
                <Bar
                  yAxisId="left"
                  dataKey="revenue"
                  fill="#8b5cf6"
                  radius={[8, 8, 0, 0]}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="subscriptions"
                  stroke="#10b981"
                  strokeWidth={2}
                />
              </ComposedChart>
            </ResponsiveContainer> : <EmptyState />}
          </div>
        </div>

        {/* Plan Pie Chart */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md overflow-x-auto">
          <h3 className="font-semibold text-lg mb-3 sm:mb-4">
            Revenue by Plan
          </h3>
          <div className="min-w-[300px]">
            {planRevenueData.length ? <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={planRevenueData}
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="revenue"
                  paddingAngle={5}
                >
                  {planRevenueData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer> : <EmptyState />}
            <div className="mt-4 space-y-2">
              {planRevenueData.map((plan, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: plan.color }}
                    />
                    {plan.name}
                  </div>
                  <span className="font-semibold">
                    {formatCurrency(plan.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Churn Chart */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md mb-6 sm:mb-10 overflow-x-auto">
        <h3 className="font-semibold text-lg mb-3 sm:mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-600" /> Customer Retention
          & Churn
        </h3>
        <div className="min-w-[500px]">
          {retentionData.length ? <ResponsiveContainer width="100%" height={300}>
            <BarChart data={retentionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend wrapperStyle={{ flexWrap: "wrap" }} />
              <Bar dataKey="retained" fill="#10b981" radius={[8, 8, 0, 0]} />
              <Bar dataKey="churned" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer> : <EmptyState />}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-auto mb-6 sm:mb-10">
        <div className="px-4 sm:px-6 py-4 border-b bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900">
            Active Paid Subscriptions
          </h3>
          <p className="text-sm text-gray-500">
            Current paid users and their subscription periods
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-separate border-spacing-0">
            <thead className="bg-gray-100">
              <tr className="text-sm text-gray-700">
                <th className="px-4 py-3 text-left font-semibold">User</th>
                <th className="px-4 py-3 text-left font-semibold">Email</th>
                <th className="px-4 py-3 text-left font-semibold">Current Plan</th>
                <th className="px-4 py-3 text-left font-semibold">Started</th>
                <th className="px-4 py-3 text-left font-semibold">Renews/Ends</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {activeSubscriptions.map((subscription) => (
                <tr key={subscription._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {subscription.name || "Unknown"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {subscription.email || "N/A"}
                  </td>
                  <td className="px-4 py-3 capitalize text-gray-700">
                    {subscription.subscription}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {formatDate(subscription.subscriptionStart)}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {formatDate(subscription.subscriptionEnd)}
                  </td>
                </tr>
              ))}
              {!activeSubscriptions.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500">
                    No active paid subscriptions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-4 border-b bg-gray-50 gap-3 sm:gap-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Transactions
            </h3>
            <p className="text-sm text-gray-500">
              Latest subscription payments
            </p>
          </div>
          
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-separate border-spacing-0">
            <thead className="bg-gray-100">
              <tr className="text-sm text-gray-700 border-b border-gray-200">
                <th className="px-4 py-3 text-left font-semibold">Customer</th>
                <th className="px-4 py-3 text-left font-semibold">Email</th>
                <th className="px-4 py-3 text-left font-semibold">Plan</th>
                <th className="px-4 py-3 text-left font-semibold">Cycle</th>
                <th className="px-4 py-3 text-right font-semibold">Amount</th>
                <th className="px-4 py-3 text-center font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Payment ID</th>
                <th className="px-4 py-3 text-right font-semibold">Paid On</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {billingstate?.transactions?.map((t, index) => {
                // Format date
                const formattedDate = new Date(t.createdAt).toLocaleString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  },
                );

                // Check if subscription is active
                const now = new Date();
                const subStart = new Date(t.user?.subscriptionStart);
                const subEnd = new Date(t.user?.subscriptionEnd);
                const isActive =
                  t.user?.subscription && now >= subStart && now <= subEnd;

                // Determine status badge
                let statusText = t.status;
                let statusClasses = "";
                if (t.status.toLowerCase() === "paid") {
                  statusText = isActive ? "Active" : "Paid";
                  statusClasses = isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 text-blue-700"; // Paid but not active
                } else if (t.status.toLowerCase() === "failed") {
                  statusClasses = "bg-red-100 text-red-700";
                } else {
                  statusClasses = "bg-yellow-100 text-yellow-700";
                }

                return (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {t.user?.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{t.user?.email}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs rounded-md bg-gray-100 text-gray-700 font-medium">
                        {t.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3 capitalize text-gray-700">
                      {t.billingcycle || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {formatCurrency(t.amount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2.5 py-1 text-xs rounded-full font-medium ${statusClasses}`}
                      >
                        {statusText}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3 text-gray-600 max-w-[180px] truncate"
                      title={t.razorpayPaymentId || t.razorpayOrderId || ""}
                    >
                      {t.razorpayPaymentId || t.razorpayOrderId || "N/A"}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {formattedDate}
                    </td>
                  </tr>
                );
              })}
              {!billingstate?.transactions?.length && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-sm text-gray-500">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-[260px] flex items-center justify-center rounded-lg border border-dashed border-gray-200 text-sm text-gray-500">
      No billing data available yet.
    </div>
  );
}
