"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  "w-full rounded-xl border border-border bg-bg-elevated px-5 py-4 text-base text-text placeholder:text-text-muted outline-none transition-all duration-200 focus:border-neon focus:shadow-[0_0_0_3px_rgba(255,20,147,0.15)]";

export function SignupForm() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "username">("phone");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid phone number");
      return;
    }
    setError("");
    setStep("username");
  };

  const handleUsername = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().length < 2) {
      setError("Username must be at least 2 characters");
      return;
    }
    setLoading(true);

    const userData = { phone, username };
    localStorage.setItem("nostalgia_user", JSON.stringify(userData));

    fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    }).catch(() => {});

    router.push("/menu");
  };

  if (step === "phone") {
    return (
      <form onSubmit={handlePhone} className="space-y-4">
        <input
          type="tel"
          placeholder="Phone number"
          value={phone}
          onChange={(e) => { setPhone(e.target.value); setError(""); }}
          className={inputClass}
          autoFocus
        />
        {error && <p className="text-xs text-danger">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-xl bg-neon py-4 text-sm font-bold uppercase tracking-[0.15em] text-bg transition-all duration-200 hover:shadow-[0_0_24px_rgba(255,20,147,0.5)]"
          style={{ boxShadow: "0 0 12px rgba(255,20,147,0.3)" }}
        >
          Continue
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleUsername} className="space-y-4">
      <p className="text-center text-sm text-text-muted">
        Now pick a username
      </p>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => { setUsername(e.target.value); setError(""); }}
        className={inputClass}
        autoFocus
      />
      {error && <p className="text-xs text-danger">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-neon py-4 text-sm font-bold uppercase tracking-[0.15em] text-bg transition-all duration-200 hover:shadow-[0_0_24px_rgba(255,20,147,0.5)] disabled:opacity-60"
        style={{ boxShadow: "0 0 12px rgba(255,20,147,0.3)" }}
      >
        {loading ? "Loading..." : "Start Playing"}
      </button>
      <button
        type="button"
        onClick={() => { setStep("phone"); setError(""); }}
        className="w-full text-xs text-text-muted underline underline-offset-4 hover:text-text"
      >
        Back
      </button>
    </form>
  );
}
