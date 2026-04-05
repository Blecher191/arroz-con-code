import { useState } from "react";
import { Link } from "react-router";

export default function SignUpPage() {
  const [accountType, setAccountType] = useState<"community" | "professional">(
  "community"
);
  return (
    
    <section className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
      <h1 className="text-3xl font-bold text-gray-900">Create an account</h1>
      <form className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="flex flex-col gap-1">
  <p className="text-sm font-medium text-gray-700">I am a...</p>

  <div className="grid grid-cols-2 gap-3">
    {/* Community Member Card */}
    <div
      onClick={() => setAccountType("community")}
      className={`cursor-pointer rounded-md border p-4 text-center text-sm font-medium transition
        ${
          accountType === "community"
            ? "border-indigo-600"
            : "border-gray-300"
        }`}
    >
      Community Member
    </div>

    {/* Professional Card */}
    <div
      onClick={() => setAccountType("professional")}
      className={`cursor-pointer rounded-md border p-4 text-center text-sm font-medium transition
        ${
          accountType === "professional"
            ? "border-indigo-600"
            : "border-gray-300"
        }`}
    >
      Professional
    </div>
  </div>
</div>
        <button
          type="submit"
          className="rounded-md bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Sign Up
        </button>
      </form>
      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link to="/signin" className="text-indigo-600 hover:underline">
          Sign in
        </Link>
      </p>
    </section>
  );
}
