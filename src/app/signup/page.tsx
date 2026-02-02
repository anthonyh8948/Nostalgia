"use client";

import { SignupForm } from "@/components/SignupForm";

export default function SignupPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6">
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        <h2 className="text-center text-3xl font-bold tracking-tight text-text">
          Create Your Account
        </h2>
        <p className="mt-2 text-center text-sm text-text-muted">
          Sign up to play and unlock exclusive rewards
        </p>

        <SignupForm />
      </div>
    </div>
  );
}
