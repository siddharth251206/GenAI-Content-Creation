"use client";

import { useAuth } from "@/context/AuthContext";
import { LogOut, User } from "lucide-react";

export default function LoginButton() {
  const { user, googleSignIn, logout } = useAuth();

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-sm font-semibold text-slate-900">{user.displayName}</span>
          <span className="text-xs text-slate-500">{user.email}</span>
        </div>
        <button 
          onClick={logout}
          className="p-2 rounded-full bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 transition"
          title="Sign Out"
        >
          <LogOut size={18} />
        </button>
      </div>
    );
  }

  return (
    <button 
      onClick={googleSignIn}
      className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition shadow-sm"
    >
      <User size={16} />
      Sign In
    </button>
  );
}