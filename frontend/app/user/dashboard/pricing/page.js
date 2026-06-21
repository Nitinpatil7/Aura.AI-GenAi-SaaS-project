"use client";

import { useContext, useMemo, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { appcontext } from "@/app/context/appcontext";

const plans = [
  {
    name: "Free",
    key: "free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "For trying Aura AI with essential monthly limits.",
    features: [
      "3 image generations",
      "5 code generations",
      "1 website generation",
      "1 resume analysis",
      "5 YouTube summaries",
      "1 mock interview",
      "Unlimited AI chat",
    ],
  },
  {
    name: "Pro",
    key: "pro",
    monthlyPrice: 499,
    yearlyPrice: 4999,
    popular: true,
    description: "For creators and developers who use AI tools every week.",
    features: [
      "50 image generations",
      "50 code generations",
      "15 website generations",
      "Unlimited resume analysis",
      "Unlimited YouTube summaries",
      "5 mock interviews",
      "Unlimited AI chat",
    ],
  },
  {
    name: "Premium",
    key: "premium",
    monthlyPrice: 899,
    yearlyPrice: 9999,
    description: "For professionals who need unlimited generation capacity.",
    features: [
      "Unlimited image generations",
      "Unlimited code generations",
      "Unlimited website generations",
      "Unlimited resume analysis",
      "Unlimited YouTube summaries",
      "Unlimited mock interviews",
      "Unlimited AI chat",
    ],
  },
];

export default function PricingPage() {
  const { api } = useContext(appcontext);

  const [billingCycle, setBillingCycle] = useState("monthly");
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [message, setMessage] = useState("");

  const savingsLabel = useMemo(() => {
    const proMonthlyTotal = plans[1].monthlyPrice * 12;
    const proSaving = proMonthlyTotal - plans[1].yearlyPrice;
    return `Save Rs ${proSaving} on Pro yearly`;
  }, []);

  const handlePayment = async (plan) => {
    try {
      setLoadingPlan(plan);
      setMessage("");

      const res = await fetch(`${api}/payment/createorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          plan,
          billingcycle: billingCycle,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Order creation failed");
      }

      if (!window.Razorpay) {
        throw new Error("Payment gateway failed to load. Refresh the page.");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: data.order.amount,
        currency: "INR",
        name: "Aura AI",
        description: `${plan} ${billingCycle} subscription`,
        order_id: data.order.id,
        handler: async function (response) {
          const verify = await fetch(`${api}/payment/verifypayment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan,
              billingcycle: billingCycle,
            }),
          });

          const verifyData = await verify.json().catch(() => ({}));

          if (verify.ok && verifyData.success) {
            setMessage("Payment successful. Updating your account...");
            setTimeout(() => {
              window.location.href = "/user/dashboard";
            }, 1200);
          } else {
            setMessage(verifyData.message || "Payment verification failed");
          }
        },
        modal: {
          ondismiss: function () {
            setMessage("Payment cancelled");
          },
        },
        theme: { color: "#7c3aed" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      setMessage(error.message || "Payment failed");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {message && (
        <div className="fixed top-6 right-6 z-50 bg-gray-950 text-white px-4 py-2 rounded-lg shadow">
          {message}
        </div>
      )}

      <section className="pt-16 pb-12 px-4 text-center bg-white border-b border-gray-100">
        <h1 className="text-4xl font-bold mb-4 text-gray-900">Simple, Transparent Pricing</h1>
        <p className="text-gray-600 mb-8">
          Choose the plan that matches your actual usage. Limits match backend enforcement.
        </p>

        <div className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 p-1">
          {["monthly", "yearly"].map((cycle) => (
            <button
              key={cycle}
              onClick={() => setBillingCycle(cycle)}
              className={`px-5 py-2 rounded-full text-sm font-semibold capitalize transition ${
                billingCycle === cycle ? "bg-purple-600 text-white shadow" : "text-gray-600"
              }`}
            >
              {cycle}
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm text-green-700">{savingsLabel}</p>
      </section>

      <section className="py-14 px-4">
        <div className="max-w-6xl mx-auto grid gap-6 md:grid-cols-3 items-stretch">
          {plans.map((plan) => {
            const price = billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
            const isLoading = loadingPlan === plan.key;

            return (
              <article
                key={plan.key}
                className={`relative rounded-2xl border bg-white p-8 flex flex-col shadow-sm ${
                  plan.popular ? "border-purple-600 shadow-xl" : "border-gray-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-purple-600 px-4 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </div>
                )}

                <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                <p className="text-gray-500 mt-2 min-h-12">{plan.description}</p>

                <div className="text-4xl font-bold mt-6 text-gray-900">
                  Rs {price}
                  <span className="text-base text-gray-500 font-medium">
                    /{billingCycle === "monthly" ? "month" : "year"}
                  </span>
                </div>

                {plan.key === "free" ? (
                  <button disabled className="mt-6 py-3 rounded-xl bg-gray-100 text-gray-500 font-semibold">
                    Current Starter Plan
                  </button>
                ) : (
                  <button
                    disabled={isLoading}
                    onClick={() => handlePayment(plan.key)}
                    className="mt-6 inline-flex items-center justify-center gap-2 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 font-semibold"
                  >
                    {isLoading && <Loader2 size={18} className="animate-spin" />}
                    {isLoading ? "Processing..." : `Upgrade to ${plan.name}`}
                  </button>
                )}

                <ul className="mt-6 space-y-3 text-sm text-gray-700">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check size={16} className="text-green-500 mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
