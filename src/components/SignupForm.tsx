"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  "w-full rounded-xl border border-border bg-bg-elevated px-5 py-4 text-base text-text placeholder:text-text-muted outline-none transition-all duration-200 focus:border-neon focus:shadow-[0_0_0_3px_rgba(255,20,147,0.15)]";

type Mode = "login" | "signup";
type Step = "phone" | "username";

export function SignupForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signup");
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setStep("phone");
    setError("");
  };

  const handlePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid phone number");
      return;
    }
    setError("");

    if (mode === "login") {
      setLoading(true);
      try {
        const res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone }),
        });
        const data = await res.json();

        if (data.found) {
          localStorage.setItem("nostalgia_user", JSON.stringify(data.user));
          router.push("/menu");
        } else {
          // Phone not found — switch to signup with phone pre-filled
          setMode("signup");
          setStep("username");
          setError("No account found. Please create one below.");
        }
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      setStep("username");
    }
  };

  const handleUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().length < 2) {
      setError("Username must be at least 2 characters");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const userData = { phone, username };

      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!res.ok) throw new Error("Failed to save");

      localStorage.setItem("nostalgia_user", JSON.stringify(userData));
      router.push("/menu");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="flex rounded-xl border border-border overflow-hidden">
        <button
          type="button"
          onClick={() => switchMode("signup")}
          className="flex-1 py-2.5 text-xs font-bold uppercase tracking-[0.15em] transition-all"
          style={{
            background: mode === "signup" ? "rgba(255,20,147,0.15)" : "transparent",
            color: mode === "signup" ? "#ff1493" : "rgba(255,255,255,0.4)",
          }}
        >
          Sign Up
        </button>
        <button
          type="button"
          onClick={() => switchMode("login")}
          className="flex-1 py-2.5 text-xs font-bold uppercase tracking-[0.15em] transition-all"
          style={{
            background: mode === "login" ? "rgba(255,20,147,0.15)" : "transparent",
            color: mode === "login" ? "#ff1493" : "rgba(255,255,255,0.4)",
          }}
        >
          Log In
        </button>
      </div>

      {step === "phone" ? (
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
            disabled={loading}
            className="w-full rounded-xl bg-neon py-4 text-sm font-bold uppercase tracking-[0.15em] text-bg transition-all duration-200 hover:shadow-[0_0_24px_rgba(255,20,147,0.5)] disabled:opacity-60"
            style={{ boxShadow: "0 0 12px rgba(255,20,147,0.3)" }}
          >
            {loading ? "Checking..." : mode === "login" ? "Log In" : "Continue"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleUsername} className="space-y-4">
          {error && <p className="text-xs text-neon">{error}</p>}
          <p className="text-center text-sm text-text-muted">Pick a username</p>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError(""); }}
            className={inputClass}
            autoFocus
          />
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
      )}
    </div>
  );
}
