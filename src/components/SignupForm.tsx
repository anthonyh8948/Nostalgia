"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SignupForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [error, setError] = useState("");

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("Please enter your full name");
      return;
    }
    if (!form.email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }
    if (form.phone.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid phone number");
      return;
    }

    localStorage.setItem("nostalgia_user", JSON.stringify(form));
    router.push("/play");
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="First name"
          value={form.firstName}
          onChange={(e) => update("firstName", e.target.value)}
          className="rounded-lg border border-border bg-bg-surface px-4 py-3 text-sm text-text placeholder:text-text-muted focus:border-neon focus:outline-none"
        />
        <input
          type="text"
          placeholder="Last name"
          value={form.lastName}
          onChange={(e) => update("lastName", e.target.value)}
          className="rounded-lg border border-border bg-bg-surface px-4 py-3 text-sm text-text placeholder:text-text-muted focus:border-neon focus:outline-none"
        />
      </div>

      <input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => update("email", e.target.value)}
        className="w-full rounded-lg border border-border bg-bg-surface px-4 py-3 text-sm text-text placeholder:text-text-muted focus:border-neon focus:outline-none"
      />

      <input
        type="tel"
        placeholder="Phone number"
        value={form.phone}
        onChange={(e) => update("phone", e.target.value)}
        className="w-full rounded-lg border border-border bg-bg-surface px-4 py-3 text-sm text-text placeholder:text-text-muted focus:border-neon focus:outline-none"
      />

      {error && (
        <p className="text-sm text-danger">{error}</p>
      )}

      <button
        type="submit"
        className="w-full rounded-lg bg-neon py-3 text-sm font-semibold uppercase tracking-[0.15em] text-bg transition-all hover:shadow-[0_0_20px_rgba(0,229,255,0.3)]"
      >
        Start Playing
      </button>
    </form>
  );
}
