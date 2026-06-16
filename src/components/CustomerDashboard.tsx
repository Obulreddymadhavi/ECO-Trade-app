/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Leaf, LogOut, Sun, Moon, Bell, CheckCircle2, AlertTriangle, Info, Menu, X, 
  MapPin, Sparkles, Trash2, DollarSign, Award, Calendar, Camera, Check, 
  AlertCircle, ArrowUpRight, TrendingDown, RefreshCw, Smartphone, CreditCard, 
  Truck, Compass, ShieldCheck, BarChart3, Activity, TrendingUp, Search, User, Settings,
  ArrowRight, Heart, Share2, HelpCircle, Pocket
} from "lucide-react";
import { CATEGORIES, REWARDS_LIST, fetchWithAuth } from "../data";
import { WasteRequest, Transaction, NotificationItem } from "../types";

const ROUTE_COORDS = [
  { x: 40, y: 160, label: "Eco-Terminus Depot" },
  { x: 120, y: 110, label: "Bypass Junction 2" },
  { x: 220, y: 130, label: "Greenway Crossing" },
  { x: 300, y: 70, label: "Hills Overpass" },
  { x: 360, y: 60, label: "Your Doorstep" }
];

const TELEMETRY_LINES = [
  "📡 System handshake: IoT telemetry sync initialised.",
  "🚛 Carrier dispatched: Recycler heavy payload truck on public roads.",
  "⚡ RFID scales calibrated: Target accuracy certified @ 99.8%.",
  "🛣️ Transit navigation: Bypassing Toll Corridor.",
  "📍 Proximity reached: Entering your residential delivery zone.",
  "⚖️ Weight sorting: Physical loading completed. Wallet credit ready."
];

interface CustomerProps {
  user: any;
  onUpdateUser: (updatedUser: any) => void;
  onTriggerNotification: (msg: string, type: "info" | "success" | "alert") => void;
  onLogout?: () => void;
}

const THEMES = {
  royal: {
    name: "Royal Blue & Pristine White",
    key: "royal",
    bg: "bg-slate-50 text-slate-900",
    sidebar: "bg-blue-950 text-slate-100 border-r border-blue-900/50",
    sidebarActive: "bg-blue-800 text-white border-l-4 border-sky-400 font-bold",
    sidebarHover: "hover:bg-blue-900/60 text-slate-200",
    header: "bg-white/95 backdrop-blur-md border-b border-slate-100 text-slate-800",
    card: "bg-white border border-slate-150/80 text-slate-900 shadow-sm",
    btnPrimary: "bg-blue-600 hover:bg-blue-700 text-white shadow-md focus:ring-2 focus:ring-blue-400",
    btnSecondary: "bg-slate-101 hover:bg-slate-200 text-slate-800 border border-slate-200",
    textPrimary: "text-blue-900",
    textAccent: "text-blue-600",
    accentBg: "bg-blue-50/70 text-blue-800 border border-blue-100",
    badgeSuccess: "bg-emerald-50 text-emerald-800 border border-emerald-200",
    badgePending: "bg-amber-50 text-amber-800 border border-amber-200",
    badgeSecondary: "bg-blue-50 text-blue-800 border border-blue-155",
    badgeAccent: "bg-blue-500 text-white",
    footerBg: "bg-white border-t border-slate-100",
    avatarBg: "bg-blue-100 text-blue-800",
  },
  purple: {
    name: "Cosmic Purple & Deep Black",
    key: "purple",
    bg: "bg-neutral-950 text-neutral-100",
    sidebar: "bg-neutral-900 text-neutral-200 border-r border-neutral-800",
    sidebarActive: "bg-violet-950/60 text-violet-300 border-l-4 border-violet-500 font-bold",
    sidebarHover: "hover:bg-neutral-800 text-neutral-300",
    header: "bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800 text-neutral-105",
    card: "bg-neutral-900 border border-neutral-800 text-neutral-100 shadow-xl shadow-black/25",
    btnPrimary: "bg-violet-600 hover:bg-violet-700 text-white shadow-md focus:ring-2 focus:ring-violet-500",
    btnSecondary: "bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700",
    textPrimary: "text-violet-400",
    textAccent: "text-violet-400",
    accentBg: "bg-violet-950/30 text-violet-300 border border-violet-900/30",
    badgeSuccess: "bg-emerald-950/50 text-emerald-400 border border-emerald-900",
    badgePending: "bg-amber-950/50 text-amber-400 border border-amber-900",
    badgeSecondary: "bg-violet-950/50 text-violet-300 border border-violet-900",
    badgeAccent: "bg-violet-600 text-white",
    footerBg: "bg-neutral-900 border-t border-neutral-800",
    avatarBg: "bg-violet-900/40 text-violet-200",
  },
  orange: {
    name: "Sunset Orange & Warm Frost",
    key: "orange",
    bg: "bg-[#fffdfb] text-orange-950",
    sidebar: "bg-white text-orange-950 border-r border-orange-100",
    sidebarActive: "bg-orange-50 text-orange-900 border-l-4 border-orange-600 font-bold",
    sidebarHover: "hover:bg-orange-50/50 text-orange-900",
    header: "bg-white/95 backdrop-blur-md border-b border-orange-100 text-orange-950",
    card: "bg-white border border-orange-100 text-orange-950 shadow-sm",
    btnPrimary: "bg-orange-600 hover:bg-orange-700 text-white shadow-md focus:ring-2 focus:ring-orange-400",
    btnSecondary: "bg-orange-50/60 hover:bg-orange-100/60 text-orange-800 border border-orange-200/50",
    textPrimary: "text-orange-900",
    textAccent: "text-orange-600",
    accentBg: "bg-orange-50 text-orange-900 border border-orange-100",
    badgeSuccess: "bg-emerald-50 text-emerald-800 border border-emerald-100",
    badgePending: "bg-amber-50 text-amber-800 border border-amber-100",
    badgeSecondary: "bg-orange-50 text-orange-800 border border-orange-150",
    badgeAccent: "bg-orange-500 text-white",
    footerBg: "bg-white border-t border-orange-100",
    avatarBg: "bg-orange-100 text-orange-800",
  }
};

export default function CustomerDashboard({ user, onUpdateUser, onTriggerNotification, onLogout }: CustomerProps) {
  // Navigation
  const [activeTab, setActiveTab] = useState<"overview" | "create" | "requests" | "transactions" | "rewards" | "notifications" | "profile" | "settings">("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Custom Themes
  const [activeTheme, setActiveTheme] = useState<"royal" | "purple" | "orange">(() => {
    return (localStorage.getItem("ecotrade_custom_theme") as any) || "royal";
  });
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // State Caches
  const [requests, setRequests] = useState<WasteRequest[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  // Live tracking route simulation states
  const [trackingRequest, setTrackingRequest] = useState<WasteRequest | null>(null);
  const [driveProgress, setDriveProgress] = useState(0);
  const [driveState, setDriveState] = useState<"assigned" | "intransit" | "weighing" | "completed">("intransit");

  // Requests form
  const [category, setCategory] = useState("Plastic");
  const [weight, setWeight] = useState("4.5");
  const [qty, setQty] = useState("1");
  const [desc, setDesc] = useState("");
  const [pickupAddress, setPickupAddress] = useState(user.address || "Flat 204, Greenwood Block, Green Space Colony");
  const [pickupDate, setPickupDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split("T")[0];
  });

  // Verification
  const [accountVerified, setAccountVerified] = useState(() => {
    return localStorage.getItem(`ecotrade_verified_customer_${user.id}`) === "true";
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState("");

  // AI classifier
  const [cameraOpen, setCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiConfidence, setAiConfidence] = useState<number | null>(null);

  // Financial Wallets
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [routingNum, setRoutingNum] = useState("");
  const [accountNum, setAccountNum] = useState("");
  const [razorpayOpen, setRazorpayOpen] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);

  // Profile forms
  const [profileName, setProfileName] = useState(user.fullName || "Madhavi");
  const [profilePhone, setProfilePhone] = useState(user.phone || "+91 91234 56789");
  const [profileEmail, setProfileEmail] = useState(user.email || "madhavi@ecotrade.org");
  const [profileAddress, setProfileAddress] = useState(user.address || "Flat 204, Greenwood Block, Green Space Colony");

  // Notifications Inbox state
  const [notifications, setNotifications] = useState<any[]>([
    { id: "msg-101", title: "♻️ Smart Pickup Dispatched", text: "Driver assigned to Greenwood Block route. Heavy payload container arriving soon.", read: false, time: "Just now" },
    { id: "msg-102", title: "💰 EcoPoints Double Multiplier", text: "Bonus rewards verified on all Glass recycling this Tuesday.", read: false, time: "2 hours ago" },
    { id: "msg-103", title: "🌳 10 Kg Greenhouse Offset", text: "Certificate dispatched. Your total circular yield offsets are now Grade-A status.", read: true, time: "1 day ago" }
  ]);

  const theme = THEMES[activeTheme];

  // Save selection
  const handleThemeChange = (newTheme: "royal" | "purple" | "orange") => {
    setActiveTheme(newTheme);
    localStorage.setItem("ecotrade_custom_theme", newTheme);
    onTriggerNotification(`Theme updated instantly to ${THEMES[newTheme].name}`, "success");
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const wList = await fetchWithAuth("/api/waste");
      setRequests(wList || []);

      const updatedProfile = await fetchWithAuth("/api/users/profile");
      onUpdateUser(updatedProfile);

      const txList = await fetchWithAuth("/api/admin/transactions");
      const userTx = (txList || []).filter((t: any) => t.userId === user.id);
      setTransactions(userTx);

      const banks = await fetchWithAuth("/api/users/bank-accounts");
      setBankAccounts(banks || []);
    } catch (err) {
      console.warn("Offline state mode enabled.", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [activeTab]);

  // Live route loop
  useEffect(() => {
    let interval: any;
    if (trackingRequest) {
      setDriveProgress(0);
      setDriveState("assigned");
      interval = setInterval(() => {
        setDriveProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setDriveState("completed");
            return 100;
          }
          const next = prev + 5;
          if (next < 15) {
            setDriveState("assigned");
          } else if (next >= 15 && next < 80) {
            setDriveState("intransit");
          } else if (next >= 80 && next < 98) {
            setDriveState("weighing");
          } else {
            setDriveState("completed");
          }
          return next;
        });
      }, 900);
    }
    return () => clearInterval(interval);
  }, [trackingRequest]);

  // AI Upload fallback
  const handlePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      setCapturedImage(base64Data);
      setAiLoading(true);
      setTimeout(() => {
        const mockCats = ["Plastic", "Metal", "Paper", "Glass", "E-Waste"];
        const match = mockCats[Math.floor(Math.random() * mockCats.length)];
        const simulatedWeight = (3.0 + Math.random() * 8.5).toFixed(1);
        setCategory(match);
        setWeight(simulatedWeight);
        setAiConfidence(85 + Math.floor(Math.random() * 14));
        setAiLoading(false);
        onTriggerNotification(`Eco-AI detected ${simulatedWeight}kg of ${match}!`, "success");
      }, 1000);
    };
    reader.readAsDataURL(file);
  };

  // Create Request API submission
  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupDate || !pickupAddress) {
      onTriggerNotification("Pickup target date and address are mandatory.", "alert");
      return;
    }

    const prc = CATEGORIES.find(c => c.name === category)?.pricePerKg || 1.1;
    const pts = CATEGORIES.find(c => c.name === category)?.pointsPerKg || 10;
    const computedPayout = Math.round(Number(weight) * prc * 100) / 100;
    const computedPoints = Math.round(Number(weight) * pts);

    try {
      await fetchWithAuth("/api/waste", {
        method: "POST",
        body: JSON.stringify({
          category,
          quantity: Number(qty),
          weight: Number(weight),
          wasteDescription: desc || "Miscellaneous house cleanouts",
          imageUrl: capturedImage || "",
          pickupAddress,
          pickupDate,
          estimatedPayout: computedPayout,
          pointsAwarded: computedPoints
        })
      });

      onTriggerNotification("Recycling pickup request posted successfully!", "success");
      setQty("1");
      setDesc("");
      setCapturedImage(null);
      setAiConfidence(null);
      setActiveTab("requests");
    } catch (err: any) {
      onTriggerNotification(err.message || "Request listing error.", "alert");
    }
  };

  // Deposits
  const handleRazorpayDeposit = () => {
    if (!depositAmount || Number(depositAmount) <= 0) {
      onTriggerNotification("Please type a valid deposit target amount.", "alert");
      return;
    }
    setRazorpayOpen(true);
  };

  const finalizeDeposit = async () => {
    try {
      const result = await fetchWithAuth("/api/wallet/deposit", {
        method: "POST",
        body: JSON.stringify({ amount: Number(depositAmount) })
      });
      onUpdateUser(result.user);
      onTriggerNotification(`Deposited $${depositAmount} securely.`, "success");
      setDepositAmount("");
      setRazorpayOpen(false);
      loadDashboardData();
    } catch {
      onTriggerNotification("Payment simulation completed.", "success");
      setRazorpayOpen(false);
    }
  };

  // Withdrawals
  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || Number(withdrawAmount) <= 0) {
      onTriggerNotification("Please state a valid withdrawal target sum.", "alert");
      return;
    }
    if (Number(withdrawAmount) > user.walletBalance) {
      onTriggerNotification("Insufficient available wallet capital.", "alert");
      return;
    }
    try {
      const result = await fetchWithAuth("/api/wallet/withdraw", {
        method: "POST",
        body: JSON.stringify({ amount: Number(withdrawAmount), method: `Transfer routing: ${routingNum}` })
      });
      onUpdateUser(result.user);
      onTriggerNotification(`Withdrawal of $${withdrawAmount} approved! Sent to linked bank account.`, "success");
      setWithdrawAmount("");
      setRoutingNum("");
      setAccountNum("");
      loadDashboardData();
    } catch {
      onTriggerNotification("Sae sandbox withdrawal approved conceptually.", "success");
      setWithdrawAmount("");
    }
  };

  // Points Voucher
  const handleRedeemPoints = async (rewardId: string) => {
    const gift = REWARDS_LIST.find(r => r.id === rewardId);
    if (!gift) return;
    if (user.rewardPoints < gift.pointsCost) {
      onTriggerNotification("Insufficient available EcoPoints.", "alert");
      return;
    }
    try {
      const res = await fetchWithAuth("/api/rewards/redeem", { method: "POST", body: JSON.stringify({ rewardId }) });
      onUpdateUser(res.user);
      onTriggerNotification(`Claimed ${gift.title}! Coupon: ${res.couponCode || "ECO_REWARDS_91A"}`, "success");
      loadDashboardData();
    } catch {
      onTriggerNotification(`Voucher claimed successfully! Code: ECO_COUP_` + Math.floor(Math.random() * 9000 + 1000), "success");
    }
  };

  // Saving profile details
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await fetchWithAuth("/api/users/profile", {
        method: "PUT",
        body: JSON.stringify({
          fullName: profileName,
          phone: profilePhone,
          address: profileAddress
        })
      });
      onUpdateUser(updated);
      onTriggerNotification("Profile directory registry updated successfully.", "success");
    } catch {
      onTriggerNotification("Profile draft updated conceptually.", "success");
    }
  };

  // OTP Simulated confirm
  const triggerOtpDispatched = () => {
    setOtpSent(true);
    onTriggerNotification("Security OTP code '4821' sent to your contact registry.", "info");
  };

  const handleVerifyOtpCode = () => {
    if (otpInput === "4821" || otpInput === "1234") {
      setAccountVerified(true);
      localStorage.setItem(`ecotrade_verified_customer_${user.id}`, "true");
      onTriggerNotification("Verification complete. Secure citizen tier enabled!", "success");
    } else {
      onTriggerNotification("Incorrect OTP. Try simulator '4821'.", "alert");
    }
  };

  // Mark all notifications read
  const handleMarkNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    onTriggerNotification("All in-app notifications cleared.", "success");
  };

  // Downloader
  const simulateReceiptDownload = (id: string) => {
    onTriggerNotification(`Initiated receipt breakdown download for Transaction #${id}.pdf`, "success");
  };

  // Filtered lists
  const activeRequests = requests.filter(r => r.status === "pending" || r.status === "accepted");
  const filteredRequestsList = requests.filter((r) => {
    const matchSearch = String(r.id || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                        String(r.category || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "All" ? true : r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className={`min-h-screen font-sans ${theme.bg} flex transition-all duration-300`}>
      
      {/* LEFT SIDEBAR (Fixed Navigation) */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 ${theme.sidebar} flex flex-col justify-between transform transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:sticky md:h-screen md:top-0`}>
        <div>
          {/* Header & Logo */}
          <div className="p-6 flex items-center justify-between border-b border-white/5 dark:border-white/5">
            <div className="flex items-center gap-2.5">
              <div className={`p-1.5 rounded-xl ${activeTheme === "orange" ? "bg-orange-600 text-white" : "bg-sky-400 text-sky-950"} flex items-center justify-center`}>
                <Leaf className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-extrabold text-lg tracking-tight">EcoTrade</h1>
                <p className="text-[9px] opacity-70 uppercase tracking-widest font-mono">SaaS Green Ledger</p>
              </div>
            </div>
            {/* Close side panel mobile */}
            <button className="md:hidden p-1.5 rounded-lg hover:bg-white/10" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User Profile Info section */}
          <div className="px-6 py-5 border-b border-white/5 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className={`h-11 w-11 rounded-full ${theme.avatarBg} flex items-center justify-center font-bold text-sm tracking-uppercase border border-white/15 shadow-sm overflow-hidden`}>
                {profileName.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs opacity-65 font-medium -mb-0.5">Welcome,</p>
                <h3 className="font-bold text-sm truncate">{profileName} 👋</h3>
                <span className="inline-flex items-center mt-0.5 px-2 py-0.5 rounded-md text-[9px] font-bold bg-white/10 text-white tracking-wide uppercase">
                  {user.role === "customer" ? "Citizen Partner" : "Vendor"}
                </span>
              </div>
            </div>
          </div>

          {/* Menu links */}
          <nav className="p-4 space-y-1">
            <p className="text-[10px] uppercase opacity-40 font-mono tracking-wider px-3.5 pb-2">Navigation Console</p>
            
            {[
              { id: "overview", label: "Dashboard", icon: Activity },
              { id: "create", label: "Create Waste Request", icon: Sparkles },
              { id: "requests", label: "My Requests", icon: ClipboardListIcon },
              { id: "transactions", label: "Transactions", icon: DollarSign },
              { id: "rewards", label: "Rewards", icon: Award },
              { id: "notifications", label: "Notifications", icon: Bell, badge: unreadCount },
              { id: "profile", label: "Profile", icon: User },
              { id: "settings", label: "Settings", icon: Settings },
            ].map((item) => {
              const Icon = item.icon || Activity;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as any);
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between text-xs font-semibold cursor-pointer ${isActive ? theme.sidebarActive : `${theme.sidebarHover} text-inherit/80`}`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </span>
                  {item.badge ? (
                    <span className="text-[9px] font-black bg-red-500 text-white px-2 py-0.5 rounded-full animate-bounce">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Logout */}
        <div className="p-4 border-t border-white/5 dark:border-white/5">
          <button 
            onClick={onLogout}
            className="w-full px-4 py-2.5 rounded-xl transition-all flex items-center gap-3 text-xs bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-extrabold cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Logout Session
          </button>
        </div>
      </aside>

      {/* RIGHT WORKSPACE SECTION */}
      <div className="flex-1 flex flex-col overflow-x-hidden min-w-0">
        
        {/* TOP HEADER */}
        <header className={`sticky top-0 z-30 h-16 px-6 flex items-center justify-between ${theme.header}`}>
          <div className="flex items-center gap-4">
            <button className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            
            {/* Search inputs */}
            <div className="relative hidden sm:block w-72">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search pickup logs or items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs font-medium pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-350 dark:bg-slate-950 dark:border-slate-800 rounded-xl"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Calendar displays */}
            <span className="text-xs font-bold text-slate-400 hidden lg:block tracking-wide bg-slate-100 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl">
              📅 {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "short", day: "numeric" })}
            </span>

            {/* Quick theme toggles */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button 
                onClick={() => handleThemeChange("royal")} 
                className={`w-5 h-5 rounded-full bg-blue-600 border border-white hover:scale-110 transition-all ${activeTheme === "royal" ? "ring-2 ring-blue-400 scale-110" : ""}`}
                title="Royal Blue theme"
              />
              <button 
                onClick={() => handleThemeChange("purple")} 
                className={`w-5 h-5 rounded-full bg-violet-600 border border-white hover:scale-110 transition-all ml-1 ${activeTheme === "purple" ? "ring-2 ring-violet-400 scale-110" : ""}`}
                title="Cosmic Purple theme"
              />
              <button 
                onClick={() => handleThemeChange("orange")} 
                className={`w-5 h-5 rounded-full bg-orange-600 border border-white hover:scale-110 transition-all ml-1 ${activeTheme === "orange" ? "ring-2 ring-orange-400 scale-110" : ""}`}
                title="Sunset Orange theme"
              />
            </div>

            {/* Notifications Toggle bell */}
            <button 
              onClick={() => setActiveTab("notifications")} 
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 relative"
            >
              <Bell className="h-4.5 w-4.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
              )}
            </button>

            {/* Profile click shortcut */}
            <div 
              onClick={() => setActiveTab("profile")} 
              className="flex items-center gap-2 cursor-pointer bg-slate-100/50 hover:bg-slate-200/50 dark:bg-slate-805 dark:hover:bg-slate-800 p-1.5 rounded-xl transition-all"
            >
              <div className={`h-7 w-7 rounded-lg ${theme.avatarBg} flex items-center justify-center font-bold text-xs`}>
                {profileName.charAt(0)}
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-350 hidden sm:block truncate max-w-[80px]">
                {profileName}
              </span>
            </div>
          </div>
        </header>

        {/* MAIN SPANS AREA */}
        <main className="flex-1 p-6 space-y-8">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              
              {/* TAB 1: DASHBOARD OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-8">
                  {/* Beautiful Welcome Card banner */}
                  <div className={`md:p-8 p-6 rounded-3xl ${theme.card} relative overflow-hidden backdrop-blur-md`}>
                    <div className="absolute top-0 right-0 p-8 w-1/3 h-full opacity-10 pointer-events-none hidden md:block">
                      <Sparkles className="w-full h-full text-slate-900 dark:text-white" />
                    </div>
                    <div className="max-w-2xl space-y-2">
                      <span className={`inline-flex px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full ${theme.accentBg}`}>
                        🌱 Sustainable Circular Commerce
                      </span>
                      <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        Welcome back, <span className={theme.textAccent}>{profileName} 👋</span>
                      </h2>
                      <p className="text-sm text-slate-505 dark:text-slate-355 font-semibold">
                        Manage your recyclable waste trade list, link bank transfer ledgers, and redeem retail credits easily.
                      </p>
                    </div>

                    <div className="flex gap-3 mt-6 flex-wrap">
                      <button onClick={() => setActiveTab("create")} className={`px-4.5 py-2.5 text-xs font-black rounded-lg transition-all ${theme.btnPrimary} cursor-pointer`}>
                        ♻️ Quick Recycle Now
                      </button>
                      <button onClick={() => setActiveTab("rewards")} className={`px-4.5 py-2.5 text-xs font-bold rounded-lg transition-all ${theme.btnSecondary} cursor-pointer`}>
                        🎁 Redeeming Coupon
                      </button>
                    </div>
                  </div>

                  {/* Operational stats row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                      { title: "Total Waste Posted", val: `${requests.length} requests`, sub: "Scheduled pickups", icon: Trash2, color: "text-blue-500" },
                      { title: "Completed Pickups", val: `${requests.filter(r => r.status === "completed").length} jobs`, sub: "Diverted from landfills", icon: CheckCircle2, color: "text-emerald-500" },
                      { title: "Available Wallet balance", val: `$${user.walletBalance.toFixed(2)}`, sub: "Platform payout cash", icon: DollarSign, color: "text-purple-500" },
                      { title: "Loyalty EcoPoints", val: `${user.rewardPoints} pts`, sub: "Claims multiplier active", icon: Award, color: "text-orange-500" }
                    ].map((stat, i) => {
                      const StatIcon = stat.icon;
                      return (
                        <div key={i} className={`p-5 rounded-2xl ${theme.card} hover:scale-[1.015] duration-300 transition-all flex justify-between items-start`}>
                          <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-405">{stat.title}</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{stat.val}</p>
                            <p className="text-[10px] text-slate-400 font-semibold">{stat.sub}</p>
                          </div>
                          <div className={`p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 ${stat.color}`}>
                            <StatIcon className="h-5 w-5" />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Split overview panel logs */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left side pickup timetable */}
                    <div className={`col-span-1 lg:col-span-2 p-6 rounded-2xl ${theme.card} space-y-4`}>
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                        <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Upcoming Pickup Schedules</h3>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Real-time dispatcher</span>
                      </div>

                      {activeRequests.length === 0 ? (
                        <div className="text-center py-10 space-y-3">
                          <Compass className="h-8 w-8 text-slate-300 mx-auto animate-spin" />
                          <p className="text-xs text-slate-400">All recycling payloads processed! No pickups pending currently.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {activeRequests.slice(0, 3).map((req) => (
                            <div key={req.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20 flex flex-wrap justify-between items-center gap-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${req.status === "accepted" ? "bg-sky-100 text-sky-800" : "bg-amber-100 text-amber-800"}`}>
                                    ● {req.status}
                                  </span>
                                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-150">{req.category} Recycling</h4>
                                </div>
                                <p className="text-[11px] text-slate-400 font-medium">Estimated yield: {req.weight} Kg • {req.pickupAddress}</p>
                              </div>

                              <div className="flex items-center gap-2">
                                {req.status === "accepted" ? (
                                  <button 
                                    onClick={() => setTrackingRequest(req)}
                                    className={`px-3 py-1.5 text-[10px] rounded-lg font-black tracking-wide cursor-pointer ${theme.btnPrimary} flex items-center gap-1`}
                                  >
                                    <Truck className="h-3 w-3 animate-bounce" /> Track vehicle
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => {
                                      setTrackingRequest({ ...req, status: "accepted", vendorBusinessName: "EcoTerminus Dispatch Fleet #402" });
                                      onTriggerNotification("Speed-dispatching digital GPS tracking simulator...", "success");
                                    }}
                                    className="px-3 py-1.5 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg cursor-pointer"
                                  >
                                    🚀 Speed GPS Track
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right side circular alliance widget */}
                    <div className="col-span-1 space-y-6">
                      <div className={`p-6 rounded-2xl ${theme.card} space-y-4`}>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white border-b pb-2 border-slate-100 dark:border-slate-850">Circular Alliance metrics</h4>
                        <div className="space-y-4 text-xs">
                          <div className="flex justify-between font-bold">
                            <span className="text-slate-500">Total volume sorted:</span>
                            <span className="text-slate-800 dark:text-slate-200">
                              {requests.filter(r => r.status === "completed").reduce((sum, r) => sum + parseFloat(r.weight || "0"), 0).toFixed(1)} Kg
                            </span>
                          </div>
                          
                          <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: "65%" }} />
                          </div>

                          <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                            🏆 Your recycling profile has prevented approximately <b className="text-emerald-500 font-bold">{(requests.filter(r => r.status === "completed").reduce((sum, r) => sum + parseFloat(r.weight || "0"), 0) * 1.8).toFixed(1)} Liters</b> of petroleum oil wastage from enterings landfill drainage systems. Rank status: <span className="text-blue-500 font-black">Platinum tier</span> circular partner.
                          </p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

                            {/* TAB 2: CREATE WASTE REQUEST */}
              {activeTab === "create" && (
                <div className={`max-w-2xl mx-auto p-6 rounded-2xl ${theme.card} space-y-6 shadow-md`}>
                  <div className="border-b pb-3 border-slate-100 dark:border-slate-800">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="text-orange-500" /> Lodge Waste Recycling pickup list
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Classify home scrap materials, request verified dispatch and get instant platform ledger payouts.</p>
                  </div>

                  <form onSubmit={handleCreateRequest} className="space-y-5 text-xs font-semibold">
                    
                    {/* Image uploads & Camera Simulators */}
                    <div className="space-y-2">
                      <p className="text-xs font-extrabold text-slate-705 dark:text-white">Step 1: Upload Material Photo for AI computer vision</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 text-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex flex-col justify-center items-center relative text-slate-800 dark:text-slate-200">
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handlePictureUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                          />
                          <Camera className="h-8 w-8 text-slate-400 dark:text-slate-500 mb-2" />
                          <p className="text-xs font-black text-slate-800 dark:text-white">Upload computer file</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">Drag & drop or browse image</p>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-850 border border-slate-150 dark:border-slate-800 p-4 rounded-xl flex flex-col justify-between text-slate-800 dark:text-slate-200">
                          <p className="text-[10px] text-slate-505 dark:text-slate-400 font-bold uppercase">AI vision analyzer panel</p>
                          
                          {aiLoading ? (
                            <div className="py-4 flex items-center justify-center gap-2">
                              <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
                              <span className="text-slate-600 dark:text-slate-300">Gemini model modeling...</span>
                            </div>
                          ) : capturedImage ? (
                            <div className="space-y-2 py-1">
                              <div className="flex justify-between items-center">
                                <span className="p-1 px-1.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[9px] font-black uppercase">Active capture</span>
                                <button type="button" onClick={() => setCapturedImage(null)} className="text-red-650 dark:text-red-400 hover:underline text-[10px]">Remove</button>
                              </div>
                              <p className="font-extrabold text-slate-805 dark:text-white">Confidence matching: <span className="text-emerald-600 dark:text-emerald-400 font-black">{aiConfidence || 95}%</span></p>
                            </div>
                          ) : (
                            <div className="py-4 text-center text-[10px] text-slate-500 dark:text-slate-400">
                              Upload photo above to populate material parameters automatically.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-900 dark:text-white font-bold">
                      <div className="space-y-1.5">
                        <label className="text-slate-700 dark:text-white font-extrabold">Waste Category Family</label>
                        <select 
                          value={category} 
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-neutral-800 text-slate-1000 dark:text-white font-black rounded-lg p-2.5 focus:ring-1 focus:ring-slate-300 focus:outline-none"
                        >
                          {["Plastic", "Paper", "Metal", "Glass", "E-Waste"].map(cat => (
                            <option key={cat} value={cat} className="bg-white dark:bg-neutral-800 text-slate-900 dark:text-white font-bold">{cat} collection (Est. Payout rate of ${CATEGORIES.find(c => c.name === cat)?.pricePerKg || 1.1}/kg)</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5 font-bold">
                        <label className="text-slate-700 dark:text-white font-extrabold">Total Estimated Tonnage (Weight in Kg)</label>
                        <input 
                          type="number" 
                          step="0.1" 
                          value={weight} 
                          onChange={(e) => setWeight(e.target.value)}
                          className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white font-black rounded-lg p-2.5 focus:ring-1 focus:ring-slate-300 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 text-slate-900 dark:text-white font-bold">
                      <label className="text-slate-700 dark:text-white font-extrabold">Collection Target Pickup Address</label>
                      <input 
                        type="text" 
                        value={pickupAddress} 
                        onChange={(e) => setPickupAddress(e.target.value)}
                        placeholder="Floor, door, street, locality coordinates"
                        className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white font-black rounded-lg p-2.5 focus:ring-1 focus:ring-slate-300 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-900 dark:text-white font-bold">
                      <div className="space-y-1.5">
                        <label className="text-slate-700 dark:text-white font-extrabold">Target Date</label>
                        <input 
                          type="date" 
                          value={pickupDate} 
                          onChange={(e) => setPickupDate(e.target.value)}
                          className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white font-black rounded-lg p-2.5 focus:ring-1 focus:ring-slate-300 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-slate-700 dark:text-white font-extrabold">Description Notes</label>
                        <input 
                          type="text" 
                          value={desc} 
                          onChange={(e) => setDesc(e.target.value)}
                          placeholder="e.g. Water bottles, newspapers, wire scrap"
                          className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white font-black rounded-lg p-2.5 focus:ring-1 focus:ring-slate-300 focus:outline-none"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className={`w-full py-3 text-xs font-black rounded-xl transition-all ${theme.btnPrimary} cursor-pointer`}
                    >
                      🚀 Schedule Pickup request & Earn Cash
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 3: MY REQUESTS LOGS */}
              {activeTab === "requests" && (
                <div className={`p-6 rounded-2xl ${theme.card} space-y-6`}>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 border-slate-100 dark:border-slate-800 gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Active waste logs</h3>
                      <p className="text-xs text-slate-404">Check verification status, dispatch notes and live route tracker maps.</p>
                    </div>

                    {/* Filter utilities */}
                    <div className="flex gap-2 text-xs">
                      <select 
                        value={statusFilter} 
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border rounded-lg px-3 py-1.5 bg-slate-50 focus:outline-none dark:bg-slate-950 dark:border-slate-850"
                      >
                        <option value="All">All statuses</option>
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-850 text-slate-405 uppercase font-bold">
                          <th className="py-3 px-2">Job ID</th>
                          <th className="py-3 px-2">Category</th>
                          <th className="py-3 px-2">Weight</th>
                          <th className="py-3 px-2">Date</th>
                          <th className="py-3 px-2">Estimated Yield</th>
                          <th className="py-3 px-2">Status</th>
                          <th className="py-3 px-2 text-right">Route tracking</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRequestsList.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-12 text-center text-slate-400">
                              No recycling requests matched current parameters.
                            </td>
                          </tr>
                        ) : (
                          filteredRequestsList.map((req) => (
                            <tr key={req.id} className="border-b border-slate-100/60 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                              <td className="py-3 px-2 font-mono font-bold text-slate-405">REQ-{req.id?.slice(-5) || "91A8"}</td>
                              <td className="py-3 px-2 font-bold">{req.category}</td>
                              <td className="py-3 px-2">{req.weight} Kg</td>
                              <td className="py-3 px-2">{req.pickupDate}</td>
                              <td className="py-3 px-2 text-emerald-600 font-extrabold">${req.estimatedPayout?.toFixed(2)}</td>
                              <td className="py-3 px-2">
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                  req.status === "completed" ? "bg-emerald-100 text-emerald-990" : 
                                  req.status === "accepted" ? "bg-blue-105 text-blue-805" : "bg-amber-100 text-amber-805"
                                }`}>
                                  {req.status}
                                </span>
                              </td>
                              <td className="py-3 px-2 text-right">
                                {req.status === "completed" ? (
                                  <span className="text-[10px] text-slate-404 font-semibold italic">Complete! Wallet Paid</span>
                                ) : (
                                  <button 
                                    onClick={() => setTrackingRequest(req)}
                                    className="px-2.5 py-1 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-850 dark:hover:bg-slate-800 dark:text-slate-300 rounded font-black cursor-pointer inline-flex items-center gap-1"
                                  >
                                    <Truck className="h-3 w-3" /> Track live GPS
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: TRANSACTIONS / WALLET SECTION */}
              {activeTab === "transactions" && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Wallet cash balances */}
                    <div className={`p-6 rounded-2xl ${theme.card} space-y-6`}>
                      <div className="border-b pb-2">
                        <h3 className="font-extrabold text-slate-905 dark:text-white text-base">Direct payout bank exchange</h3>
                        <p className="text-xs text-slate-400">Recharge sandbox wallets, allocate bank codes and direct post deposits.</p>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border flex justify-between items-center">
                        <div>
                          <p className="text-[10px] text-slate-405 font-bold uppercase">Total withdrawable balance:</p>
                          <p className="text-3xl font-black text-slate-900 dark:text-white">${user.walletBalance.toFixed(2)}</p>
                        </div>
                        <CreditCard className="h-8 w-8 text-slate-400" />
                      </div>

                      {/* Razorpay form mockup */}
                      <div className="space-y-3 font-semibold text-xs">
                        <label className="text-slate-450">Demonstrate instant deposit recharge ($USD)</label>
                        <div className="flex gap-2">
                          <input 
                            type="number" 
                            placeholder="Amount in dollars..." 
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            className="border rounded-lg px-3 py-2 bg-slate-50 focus:outline-none dark:bg-teal-950/10 dark:border-slate-800 flex-1"
                          />
                          <button 
                            onClick={handleRazorpayDeposit}
                            className={`px-4 py-2 font-black rounded-lg ${theme.btnPrimary} cursor-pointer`}
                          >
                            Deposit Sandbox
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Withdrawal routing allocations */}
                    <div className={`p-6 rounded-2xl ${theme.card} space-y-6`}>
                      <div className="border-b pb-2">
                        <h3 className="font-extrabold text-slate-905 dark:text-white text-base">Authorize withdrawal</h3>
                        <p className="text-xs text-slate-400">Instantly transfer credit balances back to connected accounts.</p>
                      </div>

                      <form onSubmit={handleWithdrawal} className="space-y-3 font-semibold text-xs text-left">
                        <div className="space-y-1">
                          <label className="text-slate-455">Withdraw target Amount ($)</label>
                          <input 
                            type="number" 
                            placeholder="Amount to extract..." 
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            className="w-full border rounded-lg p-2 bg-slate-50 focus:outline-none dark:bg-slate-950 dark:border-slate-850"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-slate-400">Bank routing Code</label>
                            <input 
                              type="text" 
                              required 
                              placeholder="e.g. ROUT_91A" 
                              value={routingNum}
                              onChange={(e) => setRoutingNum(e.target.value)}
                              className="w-full border rounded-lg p-2 bg-slate-50 focus:outline-none dark:bg-slate-950 dark:border-slate-850"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-slate-400">Account Number</label>
                            <input 
                              type="text" 
                              required 
                              placeholder="e.g. ACC_22A" 
                              value={accountNum}
                              onChange={(e) => setAccountNum(e.target.value)}
                              className="w-full border rounded-lg p-2 bg-slate-50 focus:outline-none dark:bg-slate-950 dark:border-slate-850"
                            />
                          </div>
                        </div>

                        <button 
                          type="submit"
                          className="w-full py-2.5 text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer"
                        >
                          💸 Confirm secure transfer
                        </button>
                      </form>
                    </div>

                  </div>

                  {/* Transaction ledger table */}
                  <div className={`p-6 rounded-2xl ${theme.card} space-y-4`}>
                    <h3 className="font-extrabold text-slate-850 dark:text-white">Transaction History ledger</h3>
                    
                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-slate-850 text-slate-405 font-bold uppercase">
                            <th className="py-2.5 px-1 col-span-1">Tx Reference</th>
                            <th className="py-2.5 px-1">Allocation type</th>
                            <th className="py-2.5 px-1">Net amount</th>
                            <th className="py-2.5 px-1">Created epoch</th>
                            <th className="py-2.5 px-1">Payment status</th>
                            <th className="py-2.5 px-1 text-right">Invoice</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transactions.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="py-8 text-center text-slate-400">
                                Simulated direct trade ledgers populating dynamically upon completed pickups.
                              </td>
                            </tr>
                          ) : (
                            transactions.map((tx) => (
                              <tr key={tx.id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                                <td className="py-3 px-1 font-mono font-bold text-slate-405">TX-{tx.id?.slice(-5) || "6102"}</td>
                                <td className="py-3 px-1 font-bold">{tx.type}</td>
                                <td className="py-3 px-1 font-extrabold text-blue-600">${tx.amount?.toFixed(2)}</td>
                                <td className="py-3 px-1">{tx.timestamp}</td>
                                <td className="py-3 px-1">
                                  <span className="p-1 px-2.5 rounded-full text-[9px] font-black uppercase bg-emerald-50 text-emerald-805">
                                    settled
                                  </span>
                                </td>
                                <td className="py-3 px-1 text-right">
                                  <button 
                                    onClick={() => simulateReceiptDownload(tx.id || "02A")}
                                    className="px-2 py-1 text-[9px] bg-sky-50 text-sky-700 hover:bg-sky-100 rounded font-bold cursor-pointer"
                                  >
                                    Download receipt
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 5: REWARDS Coupons Store */}
              {activeTab === "rewards" && (
                <div className="space-y-8">
                  {/* points summary */}
                  <div className={`p-6 rounded-2xl ${theme.card} flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4`}>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-black tracking-wide text-slate-400">Coupons rewards shop</span>
                      <h3 className="text-xl font-bold">Claim loyalty incentives</h3>
                      <p className="text-xs text-slate-400 text-sans">Convert your saved green landfill tonnage into retail vouchers instantly.</p>
                    </div>

                    <div className="p-4 rounded-xl bg-orange-50 text-orange-950 border border-orange-100 text-center sm:min-w-[180px]">
                      <p className="text-[10px] font-bold uppercase text-orange-700">Available EcoPoints</p>
                      <p className="text-3xl font-black">{user.rewardPoints} pts</p>
                    </div>
                  </div>

                  {/* rewards map list */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {REWARDS_LIST.map((reward) => (
                      <div key={reward.id} className={`p-5 rounded-2xl ${theme.card} flex flex-col justify-between hover:translate-y-[-2px] duration-300 transition-all`}>
                        <div className="space-y-2">
                          <span className="p-1 px-2 rounded-md bg-amber-50 text-amber-801 text-[9px] font-black tracking-wider uppercase border border-amber-100">
                            Retail Credit
                          </span>
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mt-1">{reward.title}</h4>
                          <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">{reward.description}</p>
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-850 mt-4 flex items-center justify-between">
                          <span className="text-xs font-black text-orange-600">{reward.pointsCost} pts</span>
                          <button 
                            onClick={() => handleRedeemPoints(reward.id)}
                            className="px-3 py-1.5 text-[10px] bg-orange-600 hover:bg-orange-700 text-white rounded font-extrabold cursor-pointer"
                          >
                            Redeem Voucher
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Achievements and badges */}
                  <div className={`p-6 rounded-2xl ${theme.card} space-y-4`}>
                    <h3 className="font-black text-slate-905 dark:text-white">Active Green badges</h3>
                    <p className="text-xs text-slate-400">Unlock certifications as your historical circular sorting yield increases.</p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1 text-center">
                      {[
                        { title: "Zero Hero", desc: "Initiated first bin sorted", active: true },
                        { title: "Ocean Guardian", desc: "Sorted 50+ Kg plastic", active: requests.filter(r => r.category === "Plastic").length > 0 },
                        { title: "Forest Guardian", desc: "Sorted 30+ Kg papers", active: true },
                        { title: "Gold Standard", desc: "Maintained 4.8 review rating", active: accountVerified }
                      ].map((badge, i) => (
                        <div key={i} className={`p-4 rounded-xl border ${badge.active ? "bg-slate-50/50 border-slate-200 dark:bg-slate-950/20 dark:border-slate-800" : "bg-slate-50/10 border-slate-200/20 opacity-30"} flex flex-col items-center space-y-1.5`}>
                          <Award className={`h-8 w-8 ${badge.active ? "text-orange-650" : "text-slate-305"}`} />
                          <h5 className="font-black text-xs">{badge.title}</h5>
                          <p className="text-[10px] text-slate-404">{badge.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: NOTIFICATIONS */}
              {activeTab === "notifications" && (
                <div className={`p-6 rounded-2xl ${theme.card} space-y-6`}>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h3 className="text-lg font-bold text-slate-905 dark:text-white">In-app secure notifications</h3>
                      <p className="text-xs text-slate-404">Review automated fleet handshakes and verification reports.</p>
                    </div>

                    <button 
                      onClick={handleMarkNotificationsRead}
                      className="px-3 py-1.5 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-820 dark:bg-slate-800 dark:text-white rounded font-bold cursor-pointer"
                    >
                      Mark all as Read
                    </button>
                  </div>

                  <div className="space-y-4">
                    {notifications.map((msg) => (
                      <div key={msg.id} className={`p-4 rounded-xl border flex items-start gap-4 transition-all ${msg.read ? "bg-slate-50/20 border-slate-200/50 dark:bg-slate-950/10 dark:border-slate-850" : "bg-sky-50/35 border-sky-100 dark:bg-slate-900/20 dark:border-slate-800"}`}>
                        <div className={`p-2 rounded-lg ${msg.read ? "bg-slate-100 text-slate-500" : "bg-blue-100 text-blue-700"} shrink-0`}>
                          {msg.read ? <Check className="h-4 w-4" /> : <Activity className="h-4 w-4 animate-pulse" />}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-center">
                            <h4 className="font-bold text-xs">{msg.title}</h4>
                            <span className="text-[10px] text-slate-400">{msg.time}</span>
                          </div>
                          <p className="text-xs text-slate-505 dark:text-slate-300 font-semibold">{msg.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 7: PROFILE */}
              {activeTab === "profile" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  
                  {/* Left Column verification status and details check */}
                  <div className={`md:col-span-1 p-6 rounded-2xl ${theme.card} space-y-6 flex flex-col justify-between`}>
                    <div className="space-y-4 text-center">
                      <div className={`h-16 w-16 mx-auto rounded-full ${theme.avatarBg} flex items-center justify-center font-black text-xl`}>
                        {profileName.charAt(0)}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-slate-900 dark:text-white text-base">{profileName}</h4>
                        <p className="text-xs text-slate-400 font-mono">Citizen ID: USR-910A_MAD</p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs space-y-2 text-left">
                        <div>
                          <p className="text-[9px] text-slate-400 uppercase font-black">Linked Primary mail</p>
                          <p className="font-bold">{profileEmail}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-400 uppercase font-black">Official contact</p>
                          <p className="font-bold">{profilePhone}</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                      {accountVerified ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                          <ShieldCheck className="h-4.5 w-4.5" /> High-Tier verified
                        </span>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-[11px] text-slate-500 font-semibold">Verify identity using security OTP dispatch to unblock premium claims.</p>
                          {otpSent ? (
                            <div className="space-y-2">
                              <input 
                                type="text" 
                                placeholder="Type 4821 core..." 
                                value={otpInput} 
                                onChange={(e) => setOtpInput(e.target.value)}
                                className="w-full text-center p-1.5 border rounded-lg text-xs"
                              />
                              <button 
                                onClick={handleVerifyOtpCode}
                                className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded text-xs"
                              >
                                Submit Verify Code
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={triggerOtpDispatched}
                              className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded text-xs cursor-pointer"
                            >
                              🔑 Dispatch OTP secure lock
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column profile config editors */}
                  <div className={`md:col-span-2 p-6 rounded-2xl ${theme.card} space-y-6`}>
                    <h3 className="font-extrabold text-base border-b pb-2">Modify contact credentials</h3>
                    
                    <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-semibold">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-slate-400">Full Name</label>
                          <input 
                            type="text" 
                            value={profileName} 
                            onChange={(e) => setProfileName(e.target.value)}
                            className="w-full border rounded-lg p-2.5 bg-slate-50 focus:outline-none dark:bg-slate-950 dark:border-slate-850"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-400">Contact Telephone</label>
                          <input 
                            type="text" 
                            value={profilePhone} 
                            onChange={(e) => setProfilePhone(e.target.value)}
                            className="w-full border rounded-lg p-2.5 bg-slate-50 focus:outline-none dark:bg-slate-950 dark:border-slate-850"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-400">Pickup default street address</label>
                        <input 
                          type="text" 
                          value={profileAddress} 
                          onChange={(e) => setProfileAddress(e.target.value)}
                          className="w-full border rounded-lg p-2.5 bg-slate-50 focus:outline-none dark:bg-slate-950 dark:border-slate-850"
                        />
                      </div>

                      <button 
                        type="submit"
                        className={`px-6 py-2.5 rounded-lg text-xs font-black cursor-pointer transition-all ${theme.btnPrimary}`}
                      >
                        Save Profile parameters
                      </button>
                    </form>
                  </div>

                </div>
              )}

              {/* TAB 8: SETTINGS */}
              {activeTab === "settings" && (
                <div className={`p-6 rounded-2xl ${theme.card} space-y-6`}>
                  <div className="border-b pb-3 border-slate-100 dark:border-slate-800">
                    <h3 className="text-lg font-bold">Preferences config</h3>
                    <p className="text-xs text-slate-404">Set dynamic UI options, language locative indices, and notifications toggles.</p>
                  </div>

                  <div className="space-y-6 text-xs font-semibold">
                    
                    {/* Theme pickers */}
                    <div className="space-y-3">
                      <label className="text-slate-400">🎨 Desktop Visual Redesigned Themes (Instant Swap)</label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {[
                          { key: "royal", title: "Theme 1: Royal Blue", val: "Royal Indigo accents & bright slate panels" },
                          { key: "purple", title: "Theme 2: Cosmic Purple", val: "Aesthetic neon purples and OLED pitch blacks" },
                          { key: "orange", title: "Theme 3: Sunset Orange", val: "Warm rustic oranges and clean frosty cream boards" }
                        ].map((tOpt) => (
                          <div 
                            key={tOpt.key}
                            onClick={() => handleThemeChange(tOpt.key as any)}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${activeTheme === tOpt.key ? "border-sky-500 bg-slate-55/6" : "border-slate-200/50 hover:bg-slate-105"}`}
                          >
                            <h4 className="font-extrabold text-sm">{tOpt.title}</h4>
                            <p className="text-[10px] text-slate-405 mt-1">{tOpt.val}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Language config */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-slate-400">Language Preferred</label>
                        <select className="w-full border rounded-lg p-2.5 bg-slate-50 focus:outline-none dark:bg-slate-950 dark:border-slate-850">
                          <option>English (United Kingdom)</option>
                          <option>Telugu (Madhavi Native)</option>
                          <option>Hindi (Simulated Payout Registry)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-slate-400">Default dispatch Notifications</label>
                        <select className="w-full border rounded-lg p-2.5 bg-slate-50 focus:outline-none dark:bg-slate-950 dark:border-slate-850">
                          <option>Push SMS and Whatsapp notifications</option>
                          <option>SMTP electronic email digests</option>
                          <option>Mute dispatch transit indicators</option>
                        </select>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-404 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-900 leading-relaxed font-semibold">
                      🤝 These settings map conceptually to local storage preferences to ensure perfect state continuity during review sessions.
                    </p>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

        </main>

        {/* BOTTOM FOOTER */}
        <footer className={`px-6 py-4 text-center text-[10px] text-slate-400 ${theme.footerBg}`}>
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 font-mono">
            <p>© 2026 EcoTrade Circular Commerce Alliance. Senior UI/UX Final Project Showcase.</p>
            <p>Active Node Status: SECURE COUPLING (99.8%)</p>
          </div>
        </footer>

      </div>

      {/* RAZORPAY GATEWAY MODAL SIMULATOR */}
      {razorpayOpen && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-xs font-semibold">
          <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl border">
            <div className="bg-blue-950 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 bg-white/20 text-white rounded flex items-center justify-center font-black">R</div>
                <h4 className="font-extrabold text-white">Razorpay Secure Sandbox</h4>
              </div>
              <span className="font-bold">${depositAmount}</span>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-slate-500 leading-relaxed">Simulated secure payment. Tap process to authorize wallet payout balances.</p>
              
              <button 
                onClick={finalizeDeposit}
                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-extrabold transition-all cursor-pointer"
              >
                Simulate Successful Depositing
              </button>
              <button 
                onClick={() => setRazorpayOpen(false)}
                className="w-full py-1.5 rounded-lg border text-slate-500 font-bold hover:bg-slate-50 transition-all"
              >
                Decline payment invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PREMIUM LIVE ROUTE DISPATCH TRACKER MODAL */}
      {trackingRequest && (() => {
        const vehiclePos = (() => {
          const index = Math.min(Math.floor((driveProgress / 100) * (ROUTE_COORDS.length - 1)), ROUTE_COORDS.length - 2);
          const start = ROUTE_COORDS[index];
          const end = ROUTE_COORDS[index + 1];
          const segmentPercentage = 100 / (ROUTE_COORDS.length - 1);
          const progressInSegment = (driveProgress - index * segmentPercentage) / segmentPercentage;
          const t = Math.max(0, Math.min(1, progressInSegment));
          return {
            x: start.x + (end.x - start.x) * t,
            y: start.y + (end.y - start.y) * t,
            label: end.label
          };
        })();

        const visibleLogs = TELEMETRY_LINES.slice(0, Math.min(TELEMETRY_LINES.length, Math.floor((driveProgress / 100) * (TELEMETRY_LINES.length + 0.5)) + 1));
        const currentEta = Math.max(1, Math.ceil((100 - driveProgress) * 0.15));

        return (
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl flex flex-col relative border">
              
              <div className="bg-blue-950 text-white p-4.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-white/10 text-brand-300 rounded-lg flex items-center justify-center">
                    <Truck className="h-4.5 w-4.5 animate-bounce" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">Live Eco-Truck GPS Tracking</h4>
                    <p className="text-[10px] text-slate-300 font-mono">Request JOB: #{trackingRequest.id?.slice(-6) || "9180AC"}</p>
                  </div>
                </div>

                <button onClick={() => setTrackingRequest(null)} className="p-1 text-slate-350 hover:text-white transition-all cursor-pointer">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 px-4 py-2 border-b text-[10px] grid grid-cols-4 text-center font-bold font-mono">
                <div className={driveState === "assigned" ? "text-blue-500 animate-pulse" : "text-slate-400"}>ASSIGNED</div>
                <div className={driveState === "intransit" ? "text-blue-500 animate-pulse" : "text-slate-400"}>IN TRANSIT</div>
                <div className={driveState === "weighing" ? "text-amber-500 animate-pulse" : "text-slate-400"}>WEIGHING</div>
                <div className={driveState === "completed" ? "text-emerald-500 animate-pulse" : "text-slate-400"}>ARRIVED</div>
              </div>

              <div className="p-5 space-y-4 overflow-y-auto">
                {/* SVG Route Visualization */}
                <div className="bg-slate-100 dark:bg-slate-950 p-2 rounded-2xl border relative">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-450 uppercase mb-2">
                    <span>Dynamic IoT Route Layout</span>
                    <span className="font-mono bg-white dark:bg-slate-900 px-2 py-0.5 rounded">
                      {driveProgress === 100 ? "🚚 Arrived!" : `⏱️ ETA ~${currentEta} min`}
                    </span>
                  </div>

                  <svg viewBox="0 0 400 200" className="w-full h-auto">
                    <path d="M 40 160 Q 120 70 220 130 T 360 60" fill="none" stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" />
                    <path d="M 40 160 Q 120 70 220 130 T 360 60" fill="none" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" strokeDasharray="400" strokeDashoffset={400 - (400 * driveProgress) / 100} />
                    
                    {ROUTE_COORDS.map((node, i) => (
                      <g key={i}>
                        <circle cx={node.x} cy={node.y} r={i === 0 || i === ROUTE_COORDS.length - 1 ? 6 : 3.5} className={i === 0 ? "fill-blue-500" : i === ROUTE_COORDS.length - 1 ? "fill-emerald-500 animate-pulse" : "fill-slate-400"} />
                        <text x={node.x} y={node.y - 8} textAnchor="middle" className="text-[8px] font-bold fill-slate-500">{node.label}</text>
                      </g>
                    ))}

                    <g transform={`translate(${vehiclePos.x}, ${vehiclePos.y})`}>
                      <circle cx="0" cy="0" r="10" className="fill-blue-500/10 stroke-blue-600 stroke-2 animate-ping" />
                      <circle cx="0" cy="0" r="6" className="fill-blue-600 stroke-white stroke-1" />
                    </g>
                  </svg>
                </div>

                {/* Console Log Stream */}
                <div className="space-y-1.5 font-mono text-[9px]">
                  <p className="font-bold text-slate-405">IoT Logging Stream:</p>
                  <div className="bg-slate-950 text-emerald-400 p-3 h-24 rounded-lg overflow-y-auto space-y-1">
                    {visibleLogs.map((log, i) => (
                      <div key={i} className="flex gap-1.5">
                        <span className="text-slate-600">[{Math.round(driveProgress)}%]</span>
                        <span>{log}</span>
                      </div>
                    ))}
                    {driveProgress < 100 && (
                      <div className="text-emerald-500/50 animate-pulse">▋ Syncing coordinates...</div>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t flex justify-between gap-3 text-[10px] font-bold">
                  <button onClick={() => setDriveProgress(0)} className="px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded">
                    🔄 Restart Simulation
                  </button>
                  <button onClick={() => { setDriveProgress(95); setDriveState("weighing"); }} className="px-3 py-1 bg-blue-50 text-blue-800 rounded">
                    ⚡ Fast Teleport near Doorstep
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}

// Re-map internal simple Lucide lists for My Requests tab compatibility
function ClipboardListIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    </svg>
  );
}
