"use client"; // 👈 Essential for buttons with onClick

import { useAuth } from "@/context/AuthContext"; // Import your hook

export default function LoginButton() {
  const { user, googleSignIn, logout } = useAuth();

  const handleLogin = async () => {
    try {
      await googleSignIn();
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="p-4 border rounded shadow-sm">
      {user ? (
        <div>
          <p className="text-green-600 font-bold">Welcome, {user.displayName}!</p>
          <button 
            onClick={logout}
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
      ) : (
        <button 
          onClick={handleLogin}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Sign in with Google
        </button>
      )}
    </div>
  );
}