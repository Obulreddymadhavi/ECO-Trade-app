/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Leaf, LogIn, UserPlus, LogOut, Moon, Sun, 
  Bell, CheckCircle2, AlertTriangle, Info, Menu, X, Globe, MapPin, Sparkles
} from "lucide-react";
import Home from "./components/Home";
import CustomerDashboard from "./components/CustomerDashboard";
import VendorDashboard from "./components/VendorDashboard";
import AdminDashboard from "./components/AdminDashboard";
import { fetchWithAuth } from "./data";
import AIChatbot from "./components/AIChatbot";

interface NotificationAlert {
  id: string;
  msg: string;
  type: "info" | "success" | "alert";
}

export default function App() {
  const [activePage, setActivePage] = useState<"public" | "dashboard">("public");
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Auth flow overlays
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register" | "forgot" | "reset" | "login-otp" | "register-otp">("login");
  const [authError, setAuthError] = useState("");
  const [successInfo, setSuccessInfo] = useState("");

  // OTP Verification States
  const [pendingAuthData, setPendingAuthData] = useState<any>(null);
  const [pendingRegisterData, setPendingRegisterData] = useState<any>(null);
  const [otpInput, setOtpInput] = useState("");

  // Auth input states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [userRole, setUserRole] = useState<"customer" | "vendor">("customer");

  // Notifications
  const [localNotifs, setLocalNotifs] = useState<NotificationAlert[]>([]);
  const [inAppNotifs, setInAppNotifs] = useState<any[]>([]);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");

  // Theme support
  useEffect(() => {
    const savedTheme = localStorage.getItem("ecotrade_theme") || "light";
    setThemeMode(savedTheme as any);
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = themeMode === "light" ? "dark" : "light";
    setThemeMode(nextTheme);
    localStorage.setItem("ecotrade_theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Toast notifier
  const triggerToast = (msg: string, type: "info" | "success" | "alert" = "info") => {
    const newNotif: NotificationAlert = { id: Date.now().toString(), msg, type };
    setLocalNotifs(prev => [...prev, newNotif]);
    setTimeout(() => {
      setLocalNotifs(prev => prev.filter(n => n.id !== newNotif.id));
    }, 4500);
  };

  // Session verification on load
  useEffect(() => {
    const sessionToken = localStorage.getItem("ecotrade_token");
    if (sessionToken) {
      fetchWithAuth("/api/users/profile")
        .then((userProfile) => {
          setCurrentUser(userProfile);
          setActivePage("dashboard");
          triggerToast(`Welcome back, ${userProfile.fullName}!`, "success");
          loadNotifications();
        })
        .catch(() => {
          localStorage.removeItem("ecotrade_token");
          localStorage.removeItem("ecotrade_user");
        });
    }
  }, []);

  // Fetch in-app notification streams
  const loadNotifications = async () => {
    try {
      const list = await fetchWithAuth("/api/notifications");
      setInAppNotifs(list);
    } catch {
      // Offline fallback lists
    }
  };

  // Mark all notifications read
  const handleMarkNotifsRead = async () => {
    try {
      await fetchWithAuth("/api/notifications/read", { method: "PUT" });
      setInAppNotifs(prev => prev.map(n => ({ ...n, read: true })));
      triggerToast("Notifications marked as read.", "info");
    } catch (e) {
      console.warn(e);
    }
  };

  // Handle Login submission
  const handleLogin = async (e?: React.FormEvent, guestDetails?: { em: string; pw: string }) => {
    if (e) e.preventDefault();
    setAuthError("");
    
    const loginEmail = guestDetails?.em || email;
    const loginPassword = guestDetails?.pw || password;

    if (!loginEmail || !loginPassword) {
      setAuthError("Email and password are mandatory.");
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      // Redirect through login OTP verification
      setPendingAuthData(data);
      setOtpInput("");
      setAuthMode("login-otp");
      triggerToast("Security OTP code dispatched! Check your device or use simulation '4821'.", "success");
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  // Handle Verify Login OTP
  const handleVerifyLoginOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (otpInput === "4821") {
      if (!pendingAuthData) {
        setAuthError("No pending authentication session found.");
        setAuthMode("login");
        return;
      }

      localStorage.setItem("ecotrade_token", pendingAuthData.token);
      localStorage.setItem("ecotrade_user", JSON.stringify(pendingAuthData.user));
      setCurrentUser(pendingAuthData.user);
      setAuthOpen(false);
      setActivePage("dashboard");
      
      // Clear forms
      setEmail("");
      setPassword("");
      setPendingAuthData(null);
      setOtpInput("");
      
      triggerToast(`Authenticated successfully as ${pendingAuthData.user.fullName}!`, "success");
      loadNotifications();
    } else {
      setAuthError("Incorrect verification code. Please input '4821' to access.");
    }
  };

  // Handle Register submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (!email || !password || !fullName || !phone) {
      setAuthError("Please fill out all mandatory fields.");
      return;
    }

    // Capture registration inputs state in memory to commit upon verification
    setPendingRegisterData({
      email,
      password,
      fullName,
      role: userRole,
      phone,
      address
    });
    setOtpInput("");
    setAuthMode("register-otp");
    triggerToast("Verification required to seal registration. Enter simulated code '4821'.", "info");
  };

  // Handle Verify Register OTP
  const handleVerifyRegisterOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (otpInput === "4821") {
      if (!pendingRegisterData) {
        setAuthError("Registration details missing. Please register again.");
        setAuthMode("register");
        return;
      }

      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(pendingRegisterData)
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Registration system error.");
        }

        localStorage.setItem("ecotrade_token", data.token);
        localStorage.setItem("ecotrade_user", JSON.stringify(data.user));
        setCurrentUser(data.user);
        setAuthOpen(false);
        setActivePage("dashboard");

        // Reset forms
        setEmail("");
        setPassword("");
        setFullName("");
        setPhone("");
        setAddress("");
        setPendingRegisterData(null);
        setOtpInput("");

        triggerToast("Scrap registration certified successfully via OTP!", "success");
        loadNotifications();
      } catch (err: any) {
        setAuthError(err.message);
      }
    } else {
      setAuthError("Verification code incorrect. Please try '4821'.");
    }
  };

  // Password reset simulation triggers
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setSuccessInfo("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccessInfo(`Simulated code sent! Use OTP: ${data.otp}`);
      setAuthMode("reset");
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, otp: "4821" })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      triggerToast("Password reset accepted! Please login with your new credentials.", "success");
      setAuthMode("login");
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  // Log out session
  const handleLogout = () => {
    localStorage.removeItem("ecotrade_token");
    localStorage.removeItem("ecotrade_user");
    setCurrentUser(null);
    setActivePage("public");
    triggerToast("Your session has safely timed off.", "info");
  };

  const handleOpenAuth = (mode: "login" | "register") => {
    setAuthMode(mode);
    setAuthError("");
    setSuccessInfo("");
    setAuthOpen(true);
  };

  const unreadNotifs = inAppNotifs.filter(n => !n.read).length;

  return (
    <div className={`min-h-screen flex flex-col justify-between ${themeMode === "dark" ? "dark bg-slate-950" : "bg-slate-50 text-slate-900"}`}>
      
      {/* GLOBAL NAVBAR HEADER */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/50 dark:border-slate-850/40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Name link */}
          <div 
            onClick={() => setActivePage("public")} 
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="h-9 w-9 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-all">
              <Leaf className="h-5 w-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-brand-700 to-emerald-600 bg-clip-text text-transparent dark:from-brand-500 dark:to-emerald-400">
              EcoTrade
            </span>
          </div>

          {/* Right Area buttons */}
          <div className="flex items-center gap-4">
            
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-850 transition-all"
              title="Toggle View Mode"
            >
              {themeMode === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            {currentUser ? (
              <>
                {/* Notification Dropdown toggler */}
                <div className="relative">
                  <button 
                    onClick={() => {
                      setNotifsOpen(!notifsOpen);
                      loadNotifications();
                    }}
                    className="p-2 rounded-xl text-slate-505 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 relative transition-all"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadNotifs > 0 && (
                      <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-red-500 text-[10px] font-black text-white rounded-full flex items-center justify-center animate-pulse">
                        {unreadNotifs}
                      </span>
                    )}
                  </button>

                  {/* NOTIFICATION DROP BOX OVERLAY */}
                  {notifsOpen && (
                    <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl shadow-xl p-4 space-y-3 z-50">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-850">
                        <span className="font-extrabold text-xs uppercase tracking-wider text-slate-400">Dispatch alerts</span>
                        {unreadNotifs > 0 && (
                          <button onClick={handleMarkNotifsRead} className="text-[10px] text-brand-600 hover:underline font-bold">
                            Clear Unread
                          </button>
                        )}
                      </div>

                      <div className="max-h-60 overflow-y-auto space-y-2.5">
                        {inAppNotifs.length === 0 ? (
                          <p className="text-xs text-slate-405 text-center py-4">All clear. No notifications logs.</p>
                        ) : (
                          inAppNotifs.map((n) => (
                            <div key={n.id} className={`p-2.5 rounded-xl text-xs ${n.read ? "bg-slate-50/50 dark:bg-slate-950/20 text-slate-400" : "bg-brand-50/20 text-slate-850 border-l-2 border-brand-500"}`}>
                              <p className="font-medium">{n.message}</p>
                              <span className="text-[10px] text-slate-400 block mt-1">{new Date(n.createdDate).toLocaleTimeString()}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Return Dashboard link */}
                <button 
                  onClick={() => setActivePage("dashboard")} 
                  className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-950 px-4 py-2 text-xs font-extrabold text-slate-800 dark:text-slate-300 hover:bg-slate-200"
                >
                  <Globe className="h-4 w-4 text-brand-600" />
                  Live Workspace
                </button>

                {/* Log Out */}
                <button 
                  onClick={handleLogout} 
                  className="rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-950 px-3.5 py-2 text-xs font-bold transition-all inline-flex items-center gap-1.5"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => handleOpenAuth("login")} 
                  id="nav-login"
                  className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-950 hover:underline"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => handleOpenAuth("register")} 
                  id="nav-register"
                  className="rounded-xl bg-brand-655 px-4.5 py-2 text-xs font-black text-white hover:bg-brand-700 shadow-md shadow-brand-500/10 transition-all"
                >
                  Register Free
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* MAIN VIEWPORT BODY */}
      <main className="flex-1 bg-slate-50/50 dark:bg-slate-950/20 w-full">
        {activePage === "public" ? (
          <Home 
            onNavigate={(pg) => triggerToast(`Navigated conceptually to ${pg}`, "info")} 
            onOpenAuth={handleOpenAuth} 
          />
        ) : (
          currentUser && (
            <>
              {currentUser.role === "customer" && (
                <CustomerDashboard 
                  user={currentUser} 
                  onUpdateUser={setCurrentUser} 
                  onTriggerNotification={triggerToast} 
                  onLogout={handleLogout}
                />
              )}
              {currentUser.role === "vendor" && (
                <VendorDashboard 
                  user={currentUser} 
                  onUpdateUser={setCurrentUser} 
                  onTriggerNotification={triggerToast} 
                  onLogout={handleLogout}
                />
              )}
              {currentUser.role === "admin" && (
                <AdminDashboard 
                  user={currentUser} 
                  onTriggerNotification={triggerToast} 
                />
              )}
            </>
          )
        )}
      </main>

      {/* PERSISTENT FLOATING NOTIFICATION TOAST BAR */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
        {localNotifs.map(n => (
          <div 
            key={n.id} 
            className="rounded-2xl p-4 shadow-xl border text-xs bg-white text-slate-850 dark:bg-slate-900 border-slate-100 dark:border-slate-850 flex items-start gap-3 animate-fade-in"
          >
            {n.type === "success" && <div className="h-5 w-5 bg-brand-100 text-brand-650 rounded-full flex items-center justify-center shrink-0"><CheckCircle2 className="h-4 w-4" /></div>}
            {n.type === "alert" && <div className="h-5 w-5 bg-red-100 text-red-650 rounded-full flex items-center justify-center shrink-0"><AlertTriangle className="h-4 w-4" /></div>}
            {n.type === "info" && <div className="h-5 w-5 bg-blue-105 text-blue-650 rounded-full flex items-center justify-center shrink-0"><Info className="h-4 w-4" /></div>}
            
            <div className="flex-1">
              <p className="font-bold text-slate-900 dark:text-white">EcoTrade System Message</p>
              <p className="text-slate-500 dark:text-slate-400 mt-1">{n.msg}</p>
            </div>
          </div>
        ))}
      </div>

      {/* PERSISTENT FLOATING CHATBOT WIDGET */}
      <AIChatbot 
        currentUser={currentUser} 
        onTriggerNotification={triggerToast} 
      />

      {/* AUTHENTICATION PORTAL MODAL OVERLAY */}
      {authOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-850 max-w-md w-full overflow-hidden shadow-2xl relative">
            
            <button 
              onClick={() => setAuthOpen(false)} 
              className="absolute right-4 top-4 p-1.5 rounded-full text-slate-400 hover:bg-slate-105"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-6">
              <div className="text-center pb-4">
                <Leaf className="mx-auto h-8 w-8 text-brand-600 mb-2" />
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  {authMode === "login" && "Welcome Back!"}
                  {authMode === "register" && "Create Scrap Franchise"}
                  {authMode === "forgot" && "Forgot Password"}
                  {authMode === "reset" && "OTP Verification Gate"}
                  {authMode === "login-otp" && "Login Verification"}
                  {authMode === "register-otp" && "Verify Your Account"}
                </h3>
                <p className="text-xs text-slate-400 mt-1">EcoTrade Circular Commerce Alliance</p>
              </div>

              {/* QUICK GUEST ACCOUNT PRESETS SHORTCUTS */}
              {authMode === "login" && (
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 mb-6 text-xs text-center">
                  <p className="font-bold text-slate-400 mb-2 font-mono uppercase tracking-wider">Fast-Login Diagnostics Presets</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      onClick={() => handleLogin(undefined, { em: "customer@ecotrade.com", pw: "password123" })}
                      className="p-1 px-1.5 bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/20 text-brand-900 dark:text-brand-300 font-bold rounded border border-brand-200/50"
                    >
                      Customer
                    </button>
                    <button 
                      onClick={() => handleLogin(undefined, { em: "vendor@ecotrade.com", pw: "password123" })}
                      className="p-1 px-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300 font-bold rounded border border-emerald-250/50"
                    >
                      Vendor
                    </button>
                    <button 
                      onClick={() => handleLogin(undefined, { em: "admin@ecotrade.com", pw: "password123" })}
                      className="p-1 px-1.5 bg-red-50 hover:bg-red-105 dark:bg-red-950/20 text-red-900 dark:text-red-300 font-bold rounded border border-red-200/50"
                    >
                      Admin
                    </button>
                  </div>
                </div>
              )}

              {authError && (
                <div className="mb-4 rounded-xl bg-red-50 p-3 text-red-800 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {successInfo && (
                <div className="mb-4 rounded-xl bg-emerald-55 p-3 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{successInfo}</span>
                </div>
              )}

              {/* AUTH MODAL FORMS CHANGER */}
              {authMode === "login" && (
                <form onSubmit={(e) => handleLogin(e)} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400">Username or Email</label>
                    <input 
                      required
                      type="email" 
                      placeholder="Enter username or email address"
                      value={email} 
                      onChange={e => setEmail(e.target.value)}
                      className="mt-1 w-full rounded-xl bg-slate-50 border border-slate-205 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:bg-slate-950 dark:border-slate-800" 
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-400">Password</label>
                      <button type="button" onClick={() => setAuthMode("forgot")} className="text-[10px] text-brand-600 hover:underline font-bold">Forgot Password?</button>
                    </div>
                    <input 
                      required
                      type="password" 
                      placeholder="••••••••"
                      value={password} 
                      onChange={e => setPassword(e.target.value)}
                      className="mt-1 w-full rounded-xl bg-slate-50 border border-slate-205 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:bg-slate-950 dark:border-slate-800" 
                    />
                  </div>
                  <button type="submit" className="w-full rounded-xl bg-brand-655 text-white font-extrabold text-sm py-3 hover:bg-brand-700">
                    Sign In to Portal
                  </button>
                  <p className="text-center text-xs text-slate-400 mt-4">
                    New recycler? <button type="button" onClick={() => setAuthMode("register")} className="text-brand-645 font-extrabold hover:underline">Register Free Portfolio &rarr;</button>
                  </p>
                </form>
              )}

              {authMode === "register" && (
                <form onSubmit={handleRegister} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-850 mb-3 text-xs font-bold text-center">
                    <button 
                      type="button"
                      onClick={() => setUserRole("customer")}
                      className={`py-1.5 rounded-lg ${userRole === "customer" ? "bg-white text-slate-950 shadow" : "text-slate-400"}`}
                    >
                      Household Custom
                    </button>
                    <button 
                      type="button"
                      onClick={() => setUserRole("vendor")}
                      className={`py-1.5 rounded-lg ${userRole === "vendor" ? "bg-white text-slate-950 shadow" : "text-slate-400"}`}
                    >
                      Recycler Vendor
                    </button>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400">Contact Coordinate Email</label>
                    <input 
                      required
                      type="email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)}
                      className="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-xs focus:border-brand-500 focus:outline-none dark:bg-slate-950 dark:border-slate-800" 
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400">Dispatch Telephone Contact</label>
                    <input 
                      required
                      type="text" 
                      placeholder="+1 (555) 000-0000"
                      value={phone} 
                      onChange={e => setPhone(e.target.value)}
                      className="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-xs focus:border-brand-500 focus:outline-none dark:bg-slate-950 dark:border-slate-800" 
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400">Full Business Or Household Name</label>
                    <input 
                      required
                      type="text" 
                      value={fullName} 
                      onChange={e => setFullName(e.target.value)}
                      className="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-xs focus:border-brand-500 focus:outline-none dark:bg-slate-950 dark:border-slate-800" 
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400">Street Dispatch Address (Pickup default)</label>
                    <input 
                      type="text" 
                      value={address} 
                      onChange={e => setAddress(e.target.value)}
                      className="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-xs focus:border-brand-500 focus:outline-none dark:bg-slate-950 dark:border-slate-800" 
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400">Secure Password</label>
                    <input 
                      required
                      type="password" 
                      placeholder="Minimum 6 characters"
                      value={password} 
                      onChange={e => setPassword(e.target.value)}
                      className="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2 text-xs focus:border-brand-500 focus:outline-none dark:bg-slate-950 dark:border-slate-800" 
                    />
                  </div>

                  <button type="submit" className="w-full rounded-xl bg-brand-655 text-white font-extrabold text-xs py-3.5 hover:bg-brand-700 tracking-wide mt-3 uppercase">
                    Register EcoTrade Account
                  </button>
                  <p className="text-center text-xs text-slate-400 mt-4">
                    Have an account? <button type="button" onClick={() => setAuthMode("login")} className="text-brand-645 font-extrabold hover:underline">Log In Portfolio &rarr;</button>
                  </p>
                </form>
              )}

              {authMode === "forgot" && (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">Input register coordinates below. We will simulate dispatching an OTP verify trace token.</p>
                  <div>
                    <label className="text-xs font-bold text-slate-400">Account Email ID</label>
                    <input 
                      required
                      type="email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)}
                      className="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none dark:bg-slate-950 dark:border-slate-800" 
                    />
                  </div>
                  <button type="submit" className="w-full rounded-xl bg-brand-600 text-white font-bold text-xs py-3.5 hover:bg-brand-700">
                    Query Reset Token SMS / Email
                  </button>
                </form>
              )}

              {authMode === "reset" && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">Input OTP code <b>4821</b> and establish a fresh security password.</p>
                  <div>
                    <label className="text-xs font-bold text-slate-400">Security OTP Code code</label>
                    <input 
                      required
                      type="text" 
                      placeholder="4821"
                      className="mt-1 w-full text-center tracking-widest font-black text-lg rounded-xl bg-slate-50 border border-slate-250 py-2 focus:outline-none dark:bg-slate-950 dark:border-slate-800" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400">New Password</label>
                    <input 
                      required
                      type="password" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)}
                      className="mt-1 w-full rounded-xl bg-slate-50 border border-slate-205 px-4 py-2.5 text-sm focus:outline-none dark:bg-slate-950 dark:border-slate-800" 
                    />
                  </div>
                  <button type="submit" className="w-full rounded-xl bg-brand-655 text-white font-bold text-xs py-3.5 hover:bg-brand-700">
                    Save New Password
                  </button>
                </form>
              )}

              {authMode === "login-otp" && (
                <form onSubmit={handleVerifyLoginOtp} className="space-y-4">
                  <div className="text-center py-2">
                    <p className="text-xs text-slate-500 leading-relaxed">
                      A login security OTP code check dispatches instantly to your profile's mobile: <b className="font-semibold text-slate-800 dark:text-slate-200">{pendingAuthData?.user?.phone || "+1 (555) 000-0000"}</b>.
                    </p>
                    <p className="text-[11px] text-brand-650 font-bold mt-1">
                      (For fast sandbox simulation, use code <span className="font-mono bg-brand-50 dark:bg-brand-950/40 px-1.5 py-0.5 rounded">4821</span>)
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 block text-center mb-1">Enter Verification Code</label>
                    <input 
                      required
                      type="text" 
                      maxLength={4}
                      placeholder="••••"
                      value={otpInput}
                      onChange={e => setOtpInput(e.target.value)}
                      className="w-full text-center tracking-widest font-black text-lg py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-205 focus:border-brand-500 focus:outline-none text-slate-800 dark:text-white" 
                    />
                  </div>
                  <button type="submit" className="w-full rounded-xl bg-brand-655 text-white font-extrabold text-xs py-3.5 hover:bg-brand-700 tracking-wide mt-3 uppercase">
                    Confirm & Sign In &rarr;
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setPendingAuthData(null);
                      setAuthMode("login");
                    }} 
                    className="w-full text-center text-xs text-slate-400 hover:text-slate-600 font-bold transition-all pt-2 block"
                  >
                    &larr; Back to login
                  </button>
                </form>
              )}

              {authMode === "register-otp" && (
                <form onSubmit={handleVerifyRegisterOtp} className="space-y-4">
                  <div className="text-center py-2">
                    <p className="text-xs text-slate-500 leading-relaxed">
                      An activation coupon and OTP dispatches instantly to your registered line: <b className="font-semibold text-slate-800 dark:text-slate-200">{pendingRegisterData?.phone || "+1 (555) 000-0000"}</b>.
                    </p>
                    <p className="text-[11px] text-emerald-650 font-bold mt-1">
                      (For fast sandbox simulation, use code <span className="font-mono bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">4821</span>)
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 block text-center mb-1">Enter Activation Code</label>
                    <input 
                      required
                      type="text" 
                      maxLength={4}
                      placeholder="••••"
                      value={otpInput}
                      onChange={e => setOtpInput(e.target.value)}
                      className="w-full text-center tracking-widest font-black text-lg py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-205 focus:border-brand-500 focus:outline-none text-slate-800 dark:text-white" 
                    />
                  </div>
                  <button type="submit" className="w-full rounded-xl bg-brand-655 text-white font-extrabold text-xs py-3.5 hover:bg-brand-700 tracking-wide mt-3 uppercase">
                    Verify Code & Create Account &rarr;
                  </button>
                  <button 
                    type="button" 
                    onClick={() => {
                      setPendingRegisterData(null);
                      setAuthMode("register");
                    }} 
                    className="w-full text-center text-xs text-slate-400 hover:text-slate-600 font-bold transition-all pt-2 block"
                  >
                    &larr; Back to register
                  </button>
                </form>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
