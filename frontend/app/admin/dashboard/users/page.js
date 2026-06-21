"use client";

import { useMemo, useState, useEffect } from "react";
import { Search, Eye, UserX, Trash2 } from "lucide-react";
import { appcontext } from "@/app/context/appcontext";
import { useContext } from "react";

export default function Page() {
  const [searchQuery, setSearchQuery] = useState("");
  const [userstate, setuserstate] = useState(null);
  const [userlist, setuserlist] = useState([]);
  const [error, setError] = useState("");
  const { api } = useContext(appcontext);

  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        const [statsRes, listRes] = await Promise.all([
          fetch(`${api}/admin/userstate`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }),
          fetch(`${api}/admin/userslist`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }),
        ]);

        if (!statsRes.ok || !listRes.ok) {
          throw new Error("Failed to fetch user data");
        }

        const [statsData, listData] = await Promise.all([statsRes.json(), listRes.json()]);
        setuserstate(statsData);
        setuserlist(Array.isArray(listData) ? listData : []);
      } catch (error) {
        setError(error.message || "Failed to fetch user data");
      }
    };

    fetchUsersData();
  }, [api]);

  const visibleUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return userlist
      .filter((user) => user.role !== "admin")
      .filter((user) => {
        if (!query) return true;
        return [user.name, user.email, user.subscription]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));
      })
      .sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
  }, [searchQuery, userlist]);


  const stats = [
    {
      label: "Total Users",
      value: userstate?.totalUsers || 0,
    },
    {
      label: "Active Users",
      value: userstate?.activeUsers || 0,
    },
    {
      label: "New This Month",
      value: userstate?.newUsersThisMonth || 0,
    },
    {
      label: "Suspended",
      value: userstate?.suspendedUsers || 0,
    },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-10 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          User Management
        </h1>
        <p className="text-gray-500 text-sm md:text-base">
          Manage and monitor all platform users
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-xl p-4 md:p-6 shadow-sm"
          >
            <p className="text-xs md:text-sm text-gray-500">{stat.label}</p>

            <div className="flex items-end gap-2">
              <p className="text-xl md:text-3xl font-bold text-gray-900">
                {stat.value}
              </p>

              <span className="text-xs md:text-sm font-medium text-gray-500">Live</span>
            </div>
          </div>
        ))}
      </div>

      {/* TABLE CARD */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* HEADER */}
        <div className="p-4 md:p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Users</h2>

          {/* SEARCH */}
          <div className="relative mt-4">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="search"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* MOBILE VIEW */}
        <div className="md:hidden divide-y">
          {visibleUsers.map((user) => {
              // Determine status based on isblocked field
              const statusClasses = user.isblocked
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700";
              const statusText = user.isblocked ? "Blocked" : "Active";

              // Format joined date
              const joinedDate = new Date(user.createdAt).toLocaleDateString(
                "en-US",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  timeZone: "UTC",
                },
              );

              // Format subscription start & end only if user has a paid subscription
              const subscriptionStart =
                user.subscription && user.subscription.toLowerCase() !== "free"
                  ? new Date(user.subscriptionStart).toLocaleDateString(
                      "en-US",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        timeZone: "UTC",
                      },
                    )
                  : "N/A";

              const subscriptionEnd =
                user.subscription && user.subscription.toLowerCase() !== "free"
                  ? new Date(user.subscriptionEnd).toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      timeZone: "UTC",
                    })
                  : "N/A";

              return (
                <div key={user._id} className="p-4 space-y-3 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email || user.name || user._id)}`}
                      alt={`${user.name || "User"} avatar`}
                      className="w-10 h-10 rounded-full border border-gray-200"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Plan</span>
                    <span>{user.subscription || "Free"}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Joined</span>
                    <span>{joinedDate}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Starts Subscription</span>
                    <span>{subscriptionStart}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Ends Subscription</span>
                    <span>{subscriptionEnd}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Status</span>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${statusClasses}`}
                    >
                      {statusText}
                    </span>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button className="p-2 hover:bg-gray-100 rounded-md">
                      <Eye size={16} />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-md">
                      <UserX size={16} />
                    </button>
                    <button className="p-2 hover:bg-red-50 text-red-600 rounded-md">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
  <thead className="bg-gray-50 border-b border-gray-200">
    <tr className="text-left text-sm text-gray-500">
      <th className="p-4">User</th>
      <th>Email</th>
      <th>Plan</th>
      <th>Joined</th>
      <th>Subscription Start</th>
      <th>Subscription End</th>
      <th>Status</th>
    </tr>
  </thead>

  <tbody>
    {visibleUsers.map((user) => {
        // Status
        const statusClasses = user.isblocked
          ? "bg-red-100 text-red-700"
          : "bg-green-100 text-green-700";
        const statusText = user.isblocked ? "Blocked" : "Active";

        // Format dates
        const joined = new Date(user.createdAt).toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          timeZone: "UTC",
        });

        const subscriptionStart =
          user.subscription && user.subscription.toLowerCase() !== "free"
            ? new Date(user.subscriptionStart).toLocaleDateString("en-US", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                timeZone: "UTC",
              })
            : "N/A";

        const subscriptionEnd =
          user.subscription && user.subscription.toLowerCase() !== "free"
            ? new Date(user.subscriptionEnd).toLocaleDateString("en-US", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                timeZone: "UTC",
              })
            : "N/A";

        return (
          <tr key={user._id} className="border-b border-gray-200 hover:bg-gray-50">
            <td className="p-4 flex items-center gap-3">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email || user.name || user._id)}`}
                alt={`${user.name || "User"} avatar`}
                className="w-10 h-10 rounded-full border border-gray-200"
              />
              <p className="font-medium">{user.name}</p>
            </td>

            <td>{user.email}</td>

            <td>{user.subscription || "Free"}</td>

            <td className="text-sm">{joined}</td>

            <td className="text-sm">{subscriptionStart}</td>

            <td className="text-sm">{subscriptionEnd}</td>

            <td>
              <span className={`px-2 py-1 text-xs rounded-full ${statusClasses}`}>
                {statusText}
              </span>
            </td>

          
          </tr>
        );
      })}
      {!visibleUsers.length && (
        <tr>
          <td colSpan={7} className="p-6 text-center text-sm text-gray-500">
            No users found.
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
