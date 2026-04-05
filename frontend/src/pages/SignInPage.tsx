import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

export default function SignInPage() {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [localError, setLocalError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setLocalError(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLocalError(null);

    // Validation
    if (!formData.email.trim()) {
      setLocalError("Email is required");
      return;
    }
    if (!formData.password) {
      setLocalError("Password is required");
      return;
    }

    try {
      await login(formData.email, formData.password);
      // Redirect to where they came from or to home
      const from = location.state?.from?.pathname ?? "/";
      navigate(from, { replace: true });
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Login failed");
    }
  };

  const displayError = localError || error;

  return (
    <section className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
      <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
      
      {displayError && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
          {displayError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-100"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-100"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:bg-gray-400"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
      
      <p className="text-center text-sm text-gray-500">
        No account yet?{" "}
        <Link to="/signup" className="text-indigo-600 hover:underline">
          Sign up
        </Link>
      </p>
    </section>
  );
}
