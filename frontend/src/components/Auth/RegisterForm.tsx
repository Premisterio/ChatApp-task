import React, { useState } from "react";
import { register as registerApi } from "../../api/auth";
import { useNavigate } from "react-router-dom";

const RegisterForm = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerApi(username, email, password);
      setSuccess("Account created! You can log in now.");
      setError("");
      setTimeout(() => {
        navigate("/login"); // Redirect to login after registration
      }, 1000);
    } catch (err: any) {
      setError("Registration failed. Try again.");
      setSuccess("");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-xl p-6 w-full max-w-sm"
      >
        <h2 className="text-xl font-semibold mb-4">Register</h2>
        {success && <p className="text-green-500 text-sm">{success}</p>}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        <input
          type="text"
          placeholder="Username"
          className="w-full border p-2 rounded mb-3"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 rounded mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded"
        >
          Register
        </button>
        <div className="text-center mt-1.5">
          <p className="inline">Already have an account? </p>
          <a href="/login" className="text-blue-500 hover:underline">
            Log In
          </a>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;
