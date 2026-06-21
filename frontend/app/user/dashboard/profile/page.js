"use client";
import { useContext, useState, useEffect } from "react";
import {
  User,
  Shield,
  CreditCard,
  Camera,
  Lock,
  Phone,
  CalendarDays,
  Clock,
  ReceiptText,
  WalletCards,
} from "lucide-react";
import { appcontext } from "@/app/context/appcontext";

const Page = () => {
  const { profile, api, setprofile } = useContext(appcontext);
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setmsg] = useState("");
  const [password, setpassword] = useState({
    currentpassword: "",
    newpassword: "",
    confirmpassword: "",
  });

  // Local state for user info
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    image:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200",
    joined: "",
    subscription: "",
    subscriptionStart: "",
    subscriptionEnd: "",
    usage: {},
    billingDetails: null,
  });

  const planNames = {
    free: "Free",
    pro: "Pro",
    premium: "Premium",
  };

  const planLimits = {
    free: "Starter access with monthly trial limits",
    pro: "Higher monthly limits for regular AI work",
    premium: "Unlimited access across all Aura AI tools",
  };

  const formatDate = (value) => {
    if (!value) return "Not available";
    return new Date(value).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatMoney = (amount, currency = "INR") => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);
  };

  // Update user state whenever profile changes
  useEffect(() => {
    if (profile) {
      setUser({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        image: user.image,
        joined: profile.createdAt
          ? formatDate(profile.createdAt)
          : "",
        subscription: profile.subscription || "free",
        subscriptionStart: profile.subscriptionStart || "",
        subscriptionEnd: profile.subscriptionEnd || "",
        usage: profile.usage || {},
        billingDetails: profile.billingDetails || null,
      });
    }
  }, [profile]);

  // Billing info derived from user state
  const billing = user.billingDetails || {
    plan: user.subscription || "free",
    status:
      user.subscription === "free"
        ? "free"
        : user.subscriptionEnd && new Date(user.subscriptionEnd) > new Date()
          ? "active"
          : "expired",
    billingcycle: "monthly",
    amount: user.subscription === "premium" ? 899 : user.subscription === "pro" ? 499 : 0,
    currency: "INR",
    startDate: user.subscriptionStart || profile?.createdAt,
    endDate: user.subscriptionEnd || null,
    nextBillingDate: user.subscriptionEnd || null,
    daysRemaining: user.subscriptionEnd
      ? Math.max(
          0,
          Math.ceil((new Date(user.subscriptionEnd) - new Date()) / (1000 * 60 * 60 * 24)),
        )
      : 0,
    usageResetDate: profile?.usageResetDate || null,
    latestPayment: null,
  };

  const isPaidPlan = billing.plan !== "free";
  const billingStatusLabel =
    billing.status === "active" ? "Active" : billing.status === "expired" ? "Expired" : "Free";
  const billingStatusClass =
    billing.status === "active"
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : billing.status === "expired"
        ? "bg-red-100 text-red-700 border-red-200"
        : "bg-gray-100 text-gray-700 border-gray-200";
  const billingCycleLabel = billing.billingcycle === "yearly" ? "Yearly" : "Monthly";
  const renewalLabel =
    billing.status === "active"
      ? `Renews on ${formatDate(billing.nextBillingDate)}`
      : isPaidPlan
        ? `Expired on ${formatDate(billing.endDate)}`
        : "Upgrade anytime from Pricing";

  const billingCards = [
    {
      label: "Subscription started",
      value: formatDate(billing.startDate),
      icon: CalendarDays,
    },
    {
      label: isPaidPlan ? "Subscription ends" : "Current plan",
      value: isPaidPlan ? formatDate(billing.endDate) : "Free forever",
      icon: Clock,
    },
    {
      label: "Billing cycle",
      value: isPaidPlan ? billingCycleLabel : "No billing",
      icon: WalletCards,
    },
    {
      label: "Usage resets",
      value: formatDate(billing.usageResetDate),
      icon: ReceiptText,
    },
  ];

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "security", label: "Security", icon: Shield },
  ];

  // Profile update
  const updateprofile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${api}/auth/profile`, {
        method: "PUT",
        headers: { "Content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: user.name, phone: user.phone }),
      });
      const data = await res.json();
      if (res.ok) {
        setprofile((prev) => ({ ...prev, ...data.user }));
        setmsg("Profile updated successfully");
      } else {
        setmsg(data.message);
      }
    } catch {
      setmsg("Something went wrong");
    }
    setTimeout(() => setmsg(""), 3000);
  };

  // Change password
  const changepassword = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${api}/auth/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(password),
      });
      const data = await res.json();
      if (res.ok) {
        setmsg("Password changed successfully");
        setpassword({ currentpassword: "", newpassword: "", confirmpassword: "" });
      } else {
        setmsg(data.message);
      }
    } catch {
      setmsg("Error changing password");
    }
    setTimeout(() => setmsg(""), 3000);
  };

  return (
    <div className="min-h-screen bg-app py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* MESSAGE */}
        {msg && (
          <div className="mb-6 text-center text-sm bg-green-100 text-green-700 border border-green-200 p-3 rounded-lg">
            {msg}
          </div>
        )}

        {/* HEADER */}
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center sm:justify-start gap-2">
            <User size={28} /> Settings
          </h1>
          <p className="text-gray-500 mt-2">Manage your account settings</p>
        </div>

        {/* TABS */}
        <div className="mb-8 flex justify-center">
          <div className="bg-white border border-gray-200 p-2 rounded-xl shadow-sm flex gap-2 overflow-x-auto whitespace-nowrap">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-black text-white shadow"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* CONTENT */}
        <div className="max-w-3xl mx-auto space-y-8">
          {/* PROFILE */}
          {activeTab === "profile" && (
            <div className="bg-white border border-gray-200 p-6 sm:p-8 rounded-2xl shadow-sm transition hover:shadow-md">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
                <div className="relative group">
                  <img
                    src={user.image}
                    alt="profile"
                    className="w-28 h-28 rounded-full object-cover border border-gray-200"
                  />
                  <button className="absolute bottom-1 right-1 bg-black text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition">
                    <Camera size={14} />
                  </button>
                </div>

                <div className="text-center sm:text-left">
                  <h2 className="text-xl font-semibold">{user.name}</h2>
                  <p className="text-gray-500 text-sm">{user.email}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Member since {user.joined}
                  </p>
                </div>
              </div>

              <form onSubmit={updateprofile} className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Name
                  </label>
                  <input
                    type="text"
                    value={user.name}
                    onChange={(e) =>
                      setUser({ ...user, name: e.target.value })
                    }
                    className="w-full mt-2 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none transition"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full mt-2 px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-500"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-black text-white px-6 py-2 rounded-lg hover:opacity-90 transition"
                >
                  Save Changes
                </button>
              </form>
            </div>
          )}

          {/* BILLING */}
          {activeTab === "billing" && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 p-6 sm:p-8 rounded-2xl shadow-sm hover:shadow-md transition">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5 mb-6">
                  <div>
                    <h2 className="text-lg font-semibold">Billing & Subscription</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Your current Aura AI plan, renewal dates, and latest payment.
                    </p>
                  </div>
                  <span className={`w-fit text-xs font-semibold px-3 py-1 rounded-full border ${billingStatusClass}`}>
                    {billingStatusLabel}
                  </span>
                </div>

                <div className="rounded-xl border border-gray-200 p-5 sm:p-6 bg-gray-50">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Current plan</p>
                      <h3 className="text-2xl font-bold text-gray-950">
                        {planNames[billing.plan] || "Free"} Plan
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {planLimits[billing.plan] || planLimits.free}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-2xl font-bold text-gray-950">
                        {formatMoney(billing.amount, billing.currency)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {isPaidPlan ? `per ${billing.billingcycle === "yearly" ? "year" : "month"}` : "no charge"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-gray-200 pt-5">
                    <p className="text-sm font-medium text-gray-700">{renewalLabel}</p>
                    {isPaidPlan && billing.status === "active" && (
                      <p className="text-sm text-gray-500">
                        {billing.daysRemaining} day{billing.daysRemaining === 1 ? "" : "s"} remaining
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mt-5">
                  {billingCards.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <Icon size={16} />
                          {item.label}
                        </div>
                        <p className="mt-2 font-semibold text-gray-900">{item.value}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Latest payment</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {billing.latestPayment
                          ? `${formatMoney(billing.latestPayment.amount, billing.currency)} paid for ${billing.latestPayment.billingcycle}`
                          : "No paid invoice yet"}
                      </p>
                    </div>
                    <span className="text-xs font-semibold rounded-full bg-gray-100 text-gray-700 px-3 py-1">
                      {billing.latestPayment?.status || "free"}
                    </span>
                  </div>
                  {billing.latestPayment?.razorpayPaymentId && (
                    <p className="mt-3 text-xs text-gray-500 break-all">
                      Razorpay ID: {billing.latestPayment.razorpayPaymentId}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SECURITY */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 p-6 sm:p-8 rounded-2xl shadow-sm hover:shadow-md transition">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Phone size={18} /> Mobile Number
                </h2>
                <form
                  onSubmit={updateprofile}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <input
                    type="text"
                    value={user.phone}
                    onChange={(e) =>
                      setUser({ ...user, phone: e.target.value })
                    }
                    placeholder="Add mobile number"
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-black text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
                  >
                    Add Number
                  </button>
                </form>
              </div>

              <form
                onSubmit={changepassword}
                className="bg-white border border-gray-200 p-6 sm:p-8 rounded-2xl shadow-sm hover:shadow-md transition"
              >
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Lock size={18} /> Change Password
                </h2>
                <div className="space-y-4">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Current Password"
                    value={password.currentpassword}
                    onChange={(e) =>
                      setpassword({ ...password, currentpassword: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="New Password"
                    value={password.newpassword}
                    onChange={(e) =>
                      setpassword({ ...password, newpassword: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={password.confirmpassword}
                    onChange={(e) =>
                      setpassword({ ...password, confirmpassword: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none"
                  />
                  <div>
                    <label>
                      <input
                        type="checkbox"
                        checked={showPassword}
                        onChange={() => setShowPassword(!showPassword)}
                      />
                      Show Password
                    </label>
                  </div>
                  <button
                    type="submit"
                    className="bg-black text-white px-6 py-2 rounded-lg hover:opacity-90 transition"
                  >
                    Change Password
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
