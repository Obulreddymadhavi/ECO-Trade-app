/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  MapPin, CheckCircle, Clock, Truck, DollarSign, Award, 
  RefreshCw, ChevronRight, Check, AlertTriangle, ShieldCheck,
  Compass, X, Smartphone, BarChart3, Activity, TrendingUp, Info, ListFilter,
  Leaf, Sparkles, Bell, User, Settings, LogOut, Menu, Search, Camera, ClipboardList
} from "lucide-react";
import { fetchWithAuth, CATEGORIES } from "../data";
import { WasteRequest } from "../types";

const ROUTE_COORDS = [
  { x: 50, y: 150, label: "Recycle Terminal" },
  { x: 110, y: 130, label: "EcoWay Avenue Junction" },
  { x: 170, y: 70, label: "Greenwood Flyover" },
  { x: 230, y: 110, label: "Circular Bypass Rd" },
  { x: 290, y: 65, label: "Hills Interchange" },
  { x: 350, y: 55, label: "Customer Doorstep" }
];

const TELEMETRY_LINES = [
  "📡 Driver Console: Dispatch protocol engaged. Vehicle position streaming online.",
  "🚛 Dispatch Alert: Regional recycling dispatch unit departed terminal warehouses.",
  "⚡ Onboard Systems: Active digital scale sensors online & calibrating payload offsets.",
  "🛣️ GPS Telemetry: Transiting Greenwood Overpass. Current Speed: 34 mph.",
  "🌲 Eco-Optima: Driving at peak efficiency coordinates to minimize fuel carbon footprint.",
  "🚗 Navigation: Hills Junction bypass clear. Dynamic route ETA estimated: 6 mins.",
  "💚 Transit System: Traffic priority signaling bypass active.",
  "📍 Proximity Handshake: Entering customer residential area neighborhood.",
  "🚪 Destination: Physical doorstep reached! Engaging hydraulic load deck platforms.",
  "⚖️ Weigh & Resolution: Physical item weights locked. Customer wallet transfers authorization ready!"
];

interface VendorProps {
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
    btnSecondary: "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200",
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
    textPrimary: "text-violet-404",
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
    btnSecondary: "bg-orange-50/60 hover:bg-orange-100/60 text-orange-850 border border-orange-200/50",
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

export default function VendorDashboard({ user, onUpdateUser, onTriggerNotification, onLogout }: VendorProps) {
  // Navigation
  const [activeTab, setActiveTab] = useState<"available" | "create" | "assigned" | "history" | "specialties" | "notifications" | "profile" | "settings">("available");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Theme Sync
  const [activeTheme, setActiveTheme] = useState<"royal" | "purple" | "orange">(() => {
    return (localStorage.getItem("ecotrade_custom_theme") as any) || "royal";
  });
  const theme = THEMES[activeTheme];

  const handleThemeChange = (newTheme: "royal" | "purple" | "orange") => {
    setActiveTheme(newTheme);
    localStorage.setItem("ecotrade_custom_theme", newTheme);
    onTriggerNotification(`Theme updated instantly to ${THEMES[newTheme].name}`, "success");
  };

  // State caches
  const [availableRequests, setAvailableRequests] = useState<WasteRequest[]>([]);
  const [acceptedRequests, setAcceptedRequests] = useState<WasteRequest[]>([]);
  const [historyRequests, setHistoryRequests] = useState<WasteRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Profile forms
  const [profileName, setProfileName] = useState(user.fullName || "");
  const [profilePhone, setProfilePhone] = useState(user.phone || "");
  const [profileAddress, setProfileAddress] = useState(user.address || "");

  // Simulated OTP verification states
  const [accountVerified, setAccountVerified] = useState(() => {
    return localStorage.getItem(`ecotrade_verified_vendor_${user.id}`) === "true";
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState("");

  // Waste request Creation logs (Vendor as a user too!)
  const [category, setCategory] = useState("Plastic");
  const [weight, setWeight] = useState("4.5");
  const [qty, setQty] = useState("1");
  const [desc, setDesc] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiConfidence, setAiConfidence] = useState<number | null>(null);

  // Live tracking states
  const [trackingRequest, setTrackingRequest] = useState<WasteRequest | null>(null);
  const [driveProgress, setDriveProgress] = useState(0);
  const [driveState, setDriveState] = useState<"assigned" | "intransit" | "arrived" | "weighing" | "completed">("intransit");

  // Specialties
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>(["Plastic", "Paper", "Metal", "E-Waste"]);

  // Simulated notifications 
  const [notifications, setNotifications] = useState<any[]>([
    { id: "v-msg-1", title: "🚚 Active Route Dispatch", text: "New high-yield plastic collection pending in Greenwood Block.", read: false, time: "Just now" },
    { id: "v-msg-2", title: "⚖️ Calibration Sensors Online", text: "Onboard scale registers 100% precision accuracy matching standard certificates.", read: false, time: "3 hours ago" },
    { id: "v-msg-3", title: "💎 Certified Partner Bonus", text: "You earned a 15% platform dispatch incentive bonus on your last metal lookup.", read: true, time: "1 day ago" }
  ]);
  const unreadCount = notifications.filter(n => !n.read).length;

  // Save profile coordinates handler
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
      onTriggerNotification("Merchant/recycler profile coordinates saved successfully.", "success");
    } catch (err: any) {
      onTriggerNotification(err.message, "alert");
    }
  };

  // Picture upload simulation
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

  // Submit Waste Collection Request
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
          wasteDescription: desc || "Miscellaneous home cleanouts",
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
      
      // Reload and switch to main available repository
      await loadVendorData();
      setActiveTab("available");
    } catch (err: any) {
      onTriggerNotification(err.message || "Request listing error.", "alert");
    }
  };

  // Live route transit state loop simulator
  useEffect(() => {
    let interval: any;
    if (trackingRequest) {
      setDriveProgress(0);
      setDriveState("intransit");
      interval = setInterval(() => {
        setDriveProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setDriveState("completed");
            return 100;
          }
          const next = prev + 2.5; 
          if (next < 5) {
            setDriveState("assigned");
          } else if (next >= 5 && next < 82) {
            setDriveState("intransit");
          } else if (next >= 82 && next < 98) {
            setDriveState("weighing");
          } else {
            setDriveState("completed");
          }
          return next;
        });
      }, 750);
    }
    return () => clearInterval(interval);
  }, [trackingRequest]);

  // Load Vendor statistics & collections list
  const loadVendorData = async () => {
    setLoading(true);
    try {
      const allRequests: WasteRequest[] = await fetchWithAuth("/api/waste");

      // Categorize based on status/vendor assignments & specialty settings
      const avail = allRequests.filter(r => r.status === "pending" && selectedSpecs.includes(r.category));
      const accepted = allRequests.filter(r => r.status === "accepted" && r.vendorId === user.id);
      const history = allRequests.filter(r => r.status === "completed" && r.vendorId === user.id);

      setAvailableRequests(avail);
      setAcceptedRequests(accepted);
      setHistoryRequests(history);

      const updatedProfile = await fetchWithAuth("/api/users/profile");
      onUpdateUser(updatedProfile);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendorData();
  }, [activeTab, selectedSpecs]);

  // Accept request
  const handleAcceptRequest = async (id: string) => {
    try {
      await fetchWithAuth(`/api/vendor/accept/${id}`, { method: "PUT" });
      onTriggerNotification("Pickup accepted successfully! Check your Assigned Route sheet.", "success");
      await loadVendorData();
      setActiveTab("assigned");
    } catch (e: any) {
      onTriggerNotification(e.message || "Failed to accept pickup.", "alert");
    }
  };

  // Decline/Reject/Release request
  const handleCancelRequest = async (id: string) => {
    try {
      await fetchWithAuth(`/api/vendor/reject/${id}`, { method: "PUT" });
      onTriggerNotification("Pickup assignment released back to area repository.", "info");
      await loadVendorData();
    } catch (e: any) {
      onTriggerNotification("Failed to release pickup.", "alert");
    }
  };

  // Complete request (calibrates scale weights, makes payouts!)
  const handleCompleteRequest = async (id: string) => {
    try {
      await fetchWithAuth(`/api/vendor/complete/${id}`, { method: "PUT" });
      onTriggerNotification("Pickup completed! Customer paid & commission generated.", "success");
      await loadVendorData();
      setActiveTab("history");
    } catch (e: any) {
      onTriggerNotification("Error resolving pickup completion.", "alert");
    }
  };

  const handleToggleSpecialty = (cat: string) => {
    if (selectedSpecs.includes(cat)) {
      if (selectedSpecs.length === 1) {
        onTriggerNotification("You must handle at least one category specialty.", "info");
        return;
      }
      setSelectedSpecs(selectedSpecs.filter(s => s !== cat));
    } else {
      setSelectedSpecs([...selectedSpecs, cat]);
    }
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    onTriggerNotification("Notifications marked read successfully.", "success");
  };

  // Filter available list based on top search bar queries
  const filteredAvailableList = availableRequests.filter((r) => {
    const matchSearch = String(r.id || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                        String(r.category || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                        String(r.pickupAddress || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

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

          {/* User Profile Info section of sidebar */}
          <div className="px-6 py-5 border-b border-white/5 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className={`h-11 w-11 rounded-full ${theme.avatarBg} flex items-center justify-center font-bold text-sm tracking-uppercase border border-white/15 shadow-sm overflow-hidden`}>
                {profileName ? profileName.charAt(0) : user.fullName.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs opacity-65 font-medium -mb-0.5">Welcome,</p>
                <h3 className="font-bold text-sm truncate">Madhavi 👋</h3>
                <span className="inline-flex items-center mt-0.5 px-2 py-0.5 rounded-md text-[9px] font-bold bg-white/10 text-white tracking-wide uppercase">
                  Vendor Partner
                </span>
              </div>
            </div>
          </div>

          {/* Navigation menu */}
          <nav className="p-4 space-y-1">
            <p className="text-[10px] uppercase opacity-40 font-mono tracking-wider px-3.5 pb-2">Console Menu</p>
            
            {[
              { id: "available", label: "Dashboard", icon: Activity },
              { id: "create", label: "Create Waste Request", icon: Sparkles },
              { id: "assigned", label: "My Requests", icon: ClipboardList },
              { id: "history", label: "Transactions", icon: DollarSign },
              { id: "specialties", label: "Rewards", icon: Award },
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

        {/* Logout button */}
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
            
            {/* Search input to match customer layout */}
            <div className="relative hidden sm:block w-72">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search pickup pool or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs font-medium pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-350 dark:bg-slate-950 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Calendar display */}
            <span className="text-xs font-bold text-slate-400 hidden lg:block tracking-wide bg-slate-100 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl">
              📅 {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "short", day: "numeric" })}
            </span>

            {/* Quick theme togglers */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl">
              <button 
                onClick={() => handleThemeChange("royal")} 
                title="Theme: Royal Blue"
                className={`w-5 h-5 rounded-full bg-blue-600 border border-white hover:scale-110 transition-all ${activeTheme === "royal" ? "ring-2 ring-blue-450 scale-110" : ""}`}
              />
              <button 
                onClick={() => handleThemeChange("purple")} 
                title="Theme: Cosmic Purple"
                className={`w-5 h-5 rounded-full bg-violet-600 border border-white hover:scale-110 transition-all ${activeTheme === "purple" ? "ring-2 ring-violet-455 scale-110" : ""}`}
              />
              <button 
                onClick={() => handleThemeChange("orange")} 
                title="Theme: Sunset Orange"
                className={`w-5 h-5 rounded-full bg-orange-600 border border-white hover:scale-110 transition-all ${activeTheme === "orange" ? "ring-2 ring-orange-455 scale-110" : ""}`}
              />
            </div>

            {/* Refresh / Query button */}
            <button 
              onClick={loadVendorData}
              title="Query and sync ledger data"
              className={`p-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-205 text-slate-600 dark:text-slate-300 transition-all ${loading ? "animate-spin" : ""}`}
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* MAIN CONTAINER WINDOW */}
        <div className="p-6 md:p-8 flex-1">
          
          {/* TOP METRIC WIDGET BLOCK */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            <div className={`p-5 rounded-2xl ${theme.card} transition-all hover:translate-y-[-2px] duration-300`}>
              <div className="flex justify-between items-center text-slate-400 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider">Unresolved Assigned Pickups</span>
                <Clock className="h-5 w-5 text-blue-500 animate-pulse" />
              </div>
              <p className="text-3xl font-black">{acceptedRequests.length}</p>
              <button onClick={() => setActiveTab("assigned")} className="text-xs font-bold text-blue-500 hover:underline mt-2.5 inline-flex items-center gap-1">
                Navigate to Route Sheet &rarr;
              </button>
            </div>

            <div className={`p-5 rounded-2xl ${theme.card} transition-all hover:translate-y-[-2px] duration-300`}>
              <div className="flex justify-between items-center text-slate-400 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider">Historical Pickups Completed</span>
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="text-3xl font-black">{historyRequests.length}</p>
              <button onClick={() => setActiveTab("history")} className="text-xs font-bold text-emerald-500 hover:underline mt-2.5 inline-flex items-center gap-1">
                View historic scrap records &rarr;
              </button>
            </div>

            <div className={`p-5 rounded-2xl ${theme.card} transition-all hover:translate-y-[-2px] duration-300`}>
              <div className="flex justify-between items-center text-slate-400 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider">Commissions & Brokerage</span>
                <DollarSign className="h-5 w-5 text-indigo-500" />
              </div>
              <p className="text-3xl font-black text-indigo-650 dark:text-indigo-400">${user.walletBalance.toFixed(2)}</p>
              <span className="text-xs text-slate-400 block mt-2.5 font-medium">Platform bonuses credit instantly.</span>
            </div>
          </div>

          {/* TAB CONTENT TRANSITIONS */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              
              {/* TAB 1: DASHBOARD / UNASSIGNED REPOSITORY */}
              {activeTab === "available" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                  
                  {/* Left list panel */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className={`p-6 rounded-2xl ${theme.card}`}>
                      <div className="flex items-center justify-between mb-6 border-b pb-3 border-slate-100 dark:border-slate-800">
                        <div>
                          <h3 className="font-extrabold text-lg">Area Pickup Repository</h3>
                          <p className="text-xs text-slate-400 mt-1">Pending requests matching your licensed categories within 5 miles radius.</p>
                        </div>
                      </div>

                      {filteredAvailableList.length === 0 ? (
                        <div className="text-center py-16">
                          <Truck className="mx-auto h-12 w-12 text-slate-300 mb-2 animate-bounce" />
                          <p className="text-sm font-bold text-slate-405">All local pickups clear currently.</p>
                          <p className="text-xs text-slate-400 mt-1">Try expanding licensed families specialty settings.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {filteredAvailableList.map((req) => (
                            <div key={req.id} className="rounded-2xl p-5 border border-slate-205 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex flex-col justify-between hover:border-emerald-500/50 transition-all duration-200">
                              <div>
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-300 px-2.5 py-0.5 rounded-full font-black uppercase">
                                    {req.category}
                                  </span>
                                  <span className="text-xs text-slate-400 font-mono">#{req.id}</span>
                                </div>

                                <h4 className="font-bold text-slate-900 dark:text-white text-base mt-3">Estimated Load: {req.weight} Kg</h4>
                                <p className="text-xs text-slate-550 mt-1 line-clamp-2 italic">"{req.wasteDescription || "No condition description provided."}"</p>
                                
                                <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                                  <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                                    <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                                    <span className="truncate">Address: {req.pickupAddress}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-slate-400 pl-5">
                                    <Clock className="h-3.5 w-3.5 shrink-0" />
                                    <span>Target Date: {req.pickupDate}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-6 pt-4 border-t border-slate-200/50 dark:border-slate-800 flex items-center justify-between">
                                <div>
                                  <p className="text-[10px] text-slate-400">Yield Payout Due</p>
                                  <p className="font-black text-slate-900 dark:text-white">${req.estimatedPayout.toFixed(2)} USD</p>
                                </div>

                                <button 
                                  onClick={() => handleAcceptRequest(req.id)}
                                  className="px-4 py-2 bg-emerald-650 text-white font-extrabold rounded-xl text-xs hover:bg-emerald-700 cursor-pointer shadow-sm transition-all"
                                >
                                  Accept Route
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right information column */}
                  <div className="space-y-6">
                    <div className={`p-6 rounded-2xl ${theme.card}`}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                          <ShieldCheck className="h-5 w-5 animate-pulse" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm">Recycler License Clearance</h4>
                          <p className="text-[10px] text-slate-405">Environmental protection identity</p>
                        </div>
                      </div>

                      <div className="space-y-3 px-1 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Liaison Contact:</span>
                          <span className="font-semibold">{profilePhone || user.phone || "+1 (555) 492-4821"}</span>
                        </div>
                        <div className="flex justify-between items-start">
                          <span className="text-slate-400">Warehouse HQ:</span>
                          <span className="font-semibold text-right max-w-[150px] truncate" title={profileAddress || user.address}>
                            {profileAddress || user.address || "Not Configured"}
                          </span>
                        </div>
                        <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                          <span className="text-xs text-slate-400">Permit Status:</span>
                          {accountVerified ? (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-emerald-650 uppercase bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-md">
                              Certified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-amber-600 uppercase bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                              ⚠️ Unverified
                            </span>
                          )}
                        </div>
                      </div>

                      <button 
                        onClick={() => setActiveTab("profile")}
                        className="mt-5 w-full py-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-850 text-[10.5px] font-bold text-slate-700 dark:text-slate-300 rounded-xl transition-all border border-slate-150 dark:border-slate-805 flex items-center justify-center gap-1 cursor-pointer"
                      >
                        Edit Merchant Profile & Verify License &rarr;
                      </button>
                    </div>

                    {/* Fun statistics widget */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-xl space-y-4">
                      <h4 className="font-extrabold text-sm tracking-wider uppercase opacity-80 flex items-center gap-1">
                        <Award className="h-4 w-4 text-emerald-400" />
                        Carbon Credit Registry
                      </h4>
                      <p className="text-2xl font-black">
                        {(historyRequests.reduce((sum, r) => sum + parseFloat(r.weight || "0"), 0) * 1.84).toFixed(1)} Offsets
                      </p>
                      <p className="text-[11px] leading-relaxed opacity-70 font-semibold">
                        Your direct logistics operations have successfully avoided landfill soil degradation across key municipal areas.
                      </p>
                    </div>
                  </div>
                </div>
              )}

                            {/* TAB 2: CREATE WASTE REQUEST (WHITE CANVAS / BLACK TYPOGRAPHY DESIGN) */}
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
                          <Camera className="h-8 w-8 text-slate-404 dark:text-slate-500 mb-2" />
                          <p className="text-xs font-black text-slate-800 dark:text-white">Upload computer file</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">Drag & drop or browse image</p>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-850 border border-slate-150 dark:border-slate-800 p-4 rounded-xl flex flex-col justify-between text-slate-800 dark:text-slate-200">
                          <p className="text-[10px] text-slate-505 dark:text-slate-400 font-bold uppercase">AI vision analyzer panel</p>
                          
                          {aiLoading ? (
                            <div className="py-4 flex items-center justify-center gap-2">
                              <RefreshCw className="h-4.5 w-4.5 animate-spin text-slate-500 dark:text-slate-400" />
                              <span className="text-slate-600 dark:text-slate-300">Gemini model modeling...</span>
                            </div>
                          ) : capturedImage ? (
                            <div className="space-y-2 py-1">
                              <div className="flex justify-between items-center">
                                <span className="p-1 px-1.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[9px] font-black uppercase">Active capture</span>
                                <button type="button" onClick={() => setCapturedImage(null)} className="text-red-655 dark:text-red-400 hover:underline text-[10px]">Remove</button>
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
                          className="w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-neutral-800 text-slate-900 dark:text-white font-black rounded-lg p-2.5 focus:ring-1 focus:ring-slate-300 focus:outline-none"
                        >
                          {["Plastic", "Paper", "Metal", "Glass", "E-Waste"].map(catName => (
                            <option key={catName} value={catName} className="bg-white dark:bg-neutral-800 text-slate-900 dark:text-white font-bold">{catName} collection (Est. Payout rate of ${CATEGORIES.find(c => c.name === catName)?.pricePerKg || 1.1}/kg)</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
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

              {/* TAB 3: MY REQUESTS LOGS / ASSIGNED SHEET */}
              {activeTab === "assigned" && (
                <div className={`p-6 rounded-2xl ${theme.card}`}>
                  <h3 className="font-extrabold text-lg mb-6">Assigned Route Action Sheet</h3>
                  
                  {acceptedRequests.length === 0 ? (
                    <div className="text-center py-16">
                      <MapPin className="mx-auto h-12 w-12 text-slate-300 mb-2" />
                      <p className="text-sm font-bold text-slate-400">Route sheet is currently empty.</p>
                      <button onClick={() => setActiveTab("available")} className={`mt-4 px-4 py-2 ${theme.btnPrimary} text-xs font-bold rounded-xl`}>
                        Browse Available Collections Pool
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {acceptedRequests.map((req) => (
                        <div key={req.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                          <div className="lg:col-span-8">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] bg-blue-105 text-blue-900 dark:bg-blue-950 dark:text-blue-300 px-2.5 py-0.5 rounded-full font-black uppercase">
                                {req.category}
                              </span>
                              <span className="text-xs text-slate-400 font-mono">ID: {req.id}</span>
                            </div>

                            <h4 className="font-bold text-base mt-3 text-slate-900 dark:text-white">Recipient Recycler Name: {req.userFullName}</h4>
                            <p className="text-xs text-slate-500 font-bold mt-1">Conduits 연락처: {req.userPhone}</p>
                            <p className="text-xs text-slate-400 mt-2">Description notes: "{req.wasteDescription || "No condition notes."}"</p>
                            
                            <p className="text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-3 font-semibold p-2 bg-slate-100 dark:bg-slate-900 rounded-lg inline-block">
                              <MapPin className="h-4 w-4 text-emerald-500 shrink-0" /> Route target: {req.pickupAddress}
                            </p>
                          </div>

                          <div className="lg:col-span-4 text-right flex flex-col justify-center items-end gap-3 border-t lg:border-t-0 border-slate-200 dark:border-slate-800 pt-4 lg:pt-0">
                            <div>
                              <p className="text-xs text-slate-405">Estimated load</p>
                              <p className="text-2xl font-black text-slate-950 dark:text-white">{req.weight} Kg</p>
                              <p className="text-xs font-bold text-emerald-600 mt-0.5">Payment weight: ${req.estimatedPayout.toFixed(2)}</p>
                            </div>

                            <div className="flex gap-2 w-full justify-end flex-wrap">
                              <button 
                                onClick={() => setTrackingRequest(req)}
                                className="px-3 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 dark:bg-blue-950 dark:border-blue-900 dark:text-blue-300 font-extrabold rounded-xl text-xs flex items-center gap-1 hover:shadow cursor-pointer transition-all"
                              >
                                <Truck className="h-4 w-4 animate-bounce text-blue-600 dark:text-blue-400" />
                                Maneuver Live Route
                              </button>

                              <button 
                                onClick={() => handleCancelRequest(req.id)}
                                className="px-3 py-2 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs hover:bg-slate-105 cursor-pointer transition-all"
                              >
                                Release
                              </button>
                              
                              <button 
                                onClick={() => handleCompleteRequest(req.id)}
                                className="px-4 py-2 bg-emerald-600 text-white font-extrabold rounded-xl text-xs hover:bg-emerald-700 inline-flex items-center gap-1 shadow-md shadow-emerald-500/10 cursor-pointer"
                              >
                                <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                                Complete & Calibrate Payouts
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: TRANSACTIONS / COMPLETED SCRAPS LOG */}
              {activeTab === "history" && (
                <div className={`p-6 rounded-2xl ${theme.card}`}>
                  <h3 className="font-extrabold text-lg mb-6">Historical Scraps Log</h3>
                  
                  {historyRequests.length === 0 ? (
                    <div className="text-center py-16">
                      <Truck className="mx-auto h-12 w-12 text-slate-300 mb-2" />
                      <p className="text-sm text-slate-400">No completed pickups registered.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className="border-b border-slate-205 dark:border-slate-800 text-slate-405 font-bold text-xs uppercase">
                            <th className="pb-3">Receipt ID</th>
                            <th className="pb-3">Category</th>
                            <th className="pb-3">Final Calibrated Weight</th>
                            <th className="pb-3">Recycler Name</th>
                            <th className="pb-3">Total Payout Paid</th>
                            <th className="pb-3 text-right">Commission (15%)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                          {historyRequests.map(r => (
                            <tr key={r.id} className="hover:bg-slate-50/10 font-medium">
                              <td className="py-4 font-mono text-xs text-slate-450">{r.id}</td>
                              <td className="py-4 font-black text-slate-900 dark:text-white">{r.category}</td>
                              <td className="py-4">{r.weight} Kg</td>
                              <td className="py-4 text-slate-700 dark:text-slate-300">{r.userFullName}</td>
                              <td className="py-4">${r.estimatedPayout.toFixed(2)}</td>
                              <td className="py-4 text-right font-black text-emerald-600">+${(r.estimatedPayout * 0.15).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: REWARDS (SPECIALTIES / LICENSED FAMILIES) */}
              {activeTab === "specialties" && (
                <div className={`p-6 rounded-2xl ${theme.card} max-w-xl mx-auto`}>
                  <h3 className="font-extrabold text-lg">Licensed Recycler Categories</h3>
                  <p className="text-xs text-slate-400 mt-1">Select waste classes you hold active municipal circular licensing to process.</p>
                  
                  <div className="space-y-4 mt-6">
                    {CATEGORIES.map(cat => {
                      const hasSpec = selectedSpecs.includes(cat.name);
                      return (
                        <div 
                          key={cat.id} 
                          onClick={() => handleToggleSpecialty(cat.name)}
                          className={`p-4 rounded-xl border cursor-pointer flex justify-between items-center transition-all ${hasSpec ? "border-emerald-500 bg-emerald-55/6" : "border-slate-200 dark:border-slate-800 hover:bg-slate-100/10"}`}
                        >
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">{cat.name} Scrap class</h4>
                            <p className="text-xs text-slate-405 mt-1">Point yield of {cat.pointsPerKg} pts/kg | price rate: ${cat.pricePerKg.toFixed(2)}/kg</p>
                          </div>

                          <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${hasSpec ? "bg-emerald-600 border-emerald-600 text-white animate-pulse" : "border-slate-350"}`}>
                            {hasSpec && <Check className="h-3 w-3" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 6: NOTIFICATIONS */}
              {activeTab === "notifications" && (
                <div className={`p-6 rounded-2xl ${theme.card} max-w-2xl mx-auto space-y-6`}>
                  <div className="border-b pb-3 border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold">Partner Alerts Inbox</h3>
                      <p className="text-xs text-slate-405">Logistics status pings, and certified weight approvals.</p>
                    </div>
                    <button 
                      onClick={markAllNotificationsAsRead}
                      className="text-xs text-blue-500 hover:underline uppercase font-bold tracking-tight"
                    >
                      Mark all read
                    </button>
                  </div>

                  <div className="space-y-4">
                    {notifications.map((msg) => (
                      <div key={msg.id} className={`p-4 rounded-xl border transition-all ${msg.read ? "bg-slate-50/40 dark:bg-slate-950/20 border-slate-105" : "bg-blue-50/10 dark:bg-blue-950/10 border-blue-101 ring-1 ring-blue-100 dark:ring-blue-900/30"}`}>
                        <div className="flex justify-between items-start">
                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{msg.title}</h4>
                          <span className="text-[9px] font-semibold text-slate-400">{msg.time}</span>
                        </div>
                        <p className="text-xs text-slate-550 dark:text-slate-350 mt-1.5 leading-relaxed font-semibold">{msg.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 7: PROFILE / FRANCHISE DETAILS */}
              {activeTab === "profile" && (
                <div className="max-w-2xl mx-auto space-y-6 w-full">
                  {/* License gating panel */}
                  <div className={`p-6 rounded-2xl ${theme.card}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck className="h-5 w-5 text-emerald-650" />
                      <h3 className="font-extrabold text-lg">Merchant Licensure & Verification</h3>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mb-6 font-medium">
                      Recycling vendors must hold a certified municipal and environmental agency license. Dispatch secure verification OTP tokens to unlock active pool bidding instantly.
                    </p>

                    {accountVerified ? (
                      <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-4.5 flex items-start gap-4">
                        <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-650 flex items-center justify-center shrink-0">
                          <Check className="h-5 w-5 stroke-[3]" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">Regulatory Licensing Certified</h4>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            Your registered recycler liaison mobile <b className="font-semibold text-slate-800 dark:text-slate-200">{profilePhone || user.phone || "+1 (555) 492-4821"}</b> is authenticated as active. You have full system bid clearance and 0% commission holdbacks.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setAccountVerified(false);
                              localStorage.removeItem(`ecotrade_verified_vendor_${user.id}`);
                              onTriggerNotification("Merchant licensing reset successfully.", "info");
                            }}
                            className="mt-3 text-[10.5px] text-red-650 hover:underline uppercase font-bold tracking-tight cursor-pointer"
                          >
                            Reset Licensing Credentials
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-800 rounded-2xl p-4.5">
                        {!otpSent ? (
                          <div>
                            <p className="text-xs text-slate-650 dark:text-slate-300 leading-relaxed font-semibold">
                              Confirm dispatching OTP verification to recycler phone terminal. This verifies official agency registry matches. (Simulated code is <span className="font-mono text-emerald-650 font-bold">4821</span>)
                            </p>
                            <button
                              type="button"
                              onClick={() => {
                                setOtpSent(true);
                                onTriggerNotification("Licensing verify token sent to terminal!", "success");
                              }}
                              className="mt-4 px-4 py-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl transition-all cursor-pointer shadow-sm"
                            >
                              Send Licensing Verification Code
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3.5">
                            <div className="flex items-center gap-2">
                              <Smartphone className="h-4 w-4 text-emerald-650" />
                              <span className="text-xs font-bold text-slate-655 dark:text-slate-300">Enter Vendor Agency Code (4821)</span>
                            </div>
                            <input
                              type="text"
                              maxLength={4}
                              placeholder="••••"
                              value={otpInput}
                              onChange={(e) => setOtpInput(e.target.value)}
                              className="w-32 text-center tracking-widest font-black text-lg py-2 rounded-xl bg-white dark:bg-slate-905 border border-slate-200 focus:border-emerald-550 focus:outline-none text-slate-800 dark:text-white font-mono"
                            />
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  if (otpInput === "4821") {
                                    setAccountVerified(true);
                                    localStorage.setItem(`ecotrade_verified_vendor_${user.id}`, "true");
                                    onTriggerNotification("Merchant credentials certified successfully!", "success");
                                  } else {
                                    onTriggerNotification("Licensing registry error. Code incorrect.", "alert");
                                  }
                                }}
                                className="px-4 py-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl transition-all cursor-pointer shadow-sm"
                              >
                                Verify Recycler Certificate
                              </button>
                              <button
                                type="button"
                                onClick={() => setOtpSent(false)}
                                className="px-4 py-2 text-xs text-slate-550 hover:bg-slate-200 dark:hover:bg-slate-800 font-bold rounded-xl transition-all"
                              >
                                Resend code
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Account detail profiles form */}
                  <div className={`p-6 rounded-2xl ${theme.card}`}>
                    <h3 className="font-extrabold text-base mb-6">Recycler Business Registry Profile</h3>
                    
                    <form onSubmit={handleSaveProfile} className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-slate-400">Business / Corporate Agency Name</label>
                        <input 
                          required
                          type="text" 
                          value={profileName} 
                          onChange={e => setProfileName(e.target.value)}
                          className="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none text-slate-800 dark:text-slate-100 font-medium font-sans" 
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-400">Merchant Dispatch Hotline</label>
                        <input 
                          required
                          type="text" 
                          value={profilePhone} 
                          onChange={e => setProfilePhone(e.target.value)}
                          className="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none text-slate-800 dark:text-slate-100 font-medium font-sans" 
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-400">Recycling Warehouse Operations Center</label>
                        <input 
                          required
                          type="text" 
                          value={profileAddress} 
                          onChange={e => setProfileAddress(e.target.value)}
                          className="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 dark:bg-slate-950 dark:border-slate-800 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none text-slate-800 dark:text-slate-100 font-medium font-sans" 
                        />
                      </div>

                      <button 
                        type="submit"
                        className="w-full rounded-xl bg-emerald-600 py-3.5 text-xs font-extrabold text-white hover:bg-emerald-700 font-sans tracking-wide transition-all cursor-pointer"
                      >
                        Save Franchise Settings
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 8: SETTINGS (THEME SELECTOR) */}
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
                          { key: "orange", title: "Theme 3: Sunset Orange", val: "Warm rustic oranges and frosty cream boards" }
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
                        <select className="w-full border rounded-lg p-2.5 bg-slate-50 dark:bg-slate-950 dark:border-slate-850 focus:outline-none text-slate-800 dark:text-white">
                          <option>English (United Kingdom)</option>
                          <option>Telugu (Madhavi Native)</option>
                          <option>Spanish (Castilian)</option>
                        </select>
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-slate-400">Security Mode</label>
                        <select className="w-full border rounded-lg p-2.5 bg-slate-50 dark:bg-slate-950 dark:border-slate-850 focus:outline-none text-slate-800 dark:text-white">
                          <option>Oauth Standard encryption</option>
                          <option>Simulated OTP token bypass</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {/* VENDOR INTERACTIVE DISPATCH TRANSIT CONSOLE */}
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
            const currentEta = Math.max(1, Math.ceil((100 - driveProgress) * 0.12));

            return (
              <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl border border-slate-250 dark:border-slate-800 max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                  
                  {/* Modal header */}
                  <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-slate-800 text-emerald-405 rounded-xl flex items-center justify-center">
                        <Truck className="h-5 w-5 animate-pulse text-emerald-450" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-white text-base">Active Driver Navigation Route</h4>
                        <p className="text-[11px] text-slate-400 font-medium font-mono">Tracking Task #{trackingRequest.id}</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => setTrackingRequest(null)}
                      className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-all cursor-pointer"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Progress Stepper Indicator */}
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 border-b border-slate-100 dark:border-slate-850 grid grid-cols-4 text-center text-xs font-bold gap-2">
                    <div className={`p-2 rounded-lg transition-all ${driveState === "assigned" ? "bg-blue-105 text-blue-800" : "text-slate-400"}`}>
                      1. Dispatched
                    </div>
                    <div className={`p-2 rounded-lg transition-all ${driveState === "intransit" ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 animate-pulse" : "text-slate-400"}`}>
                      2. Driving
                    </div>
                    <div className={`p-2 rounded-lg transition-all ${driveState === "weighing" ? "bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-300 animate-bounce" : "text-slate-400"}`}>
                      3. Calibrating
                    </div>
                    <div className={`p-2 rounded-lg transition-all ${driveState === "completed" ? "bg-emerald-100 text-emerald-850" : "text-slate-400"}`}>
                      4. Arrived
                    </div>
                  </div>

                  {/* Scrollable contents */}
                  <div className="p-6 overflow-y-auto space-y-6">
                    
                    {/* SVG Map visualizer */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                          <Compass className="h-3.5 w-3.5 text-emerald-650 animate-spin" />
                          Dynamic Driver GPS Compass Path
                        </span>
                        <span className="text-xs bg-slate-100 dark:bg-slate-850 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded font-black font-mono">
                          {driveProgress === 100 ? "🚚 Arrived!" : `⏱️ ETA: ~${currentEta} mins left`}
                        </span>
                      </div>

                      <div className="p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-205 dark:border-slate-800 overflow-hidden relative">
                        <svg viewBox="0 0 400 200" className="w-full h-auto">
                          {/* Grid pattern overlay */}
                          <defs>
                            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(16, 185, 129, 0.05)" strokeWidth="1" />
                            </pattern>
                          </defs>
                          <rect width="100%" height="100%" fill="url(#grid)" />

                          {/* Gray inactive path */}
                          <path 
                            d="M 50 150 Q 110 50 200 120 T 350 55" 
                            fill="none" 
                            stroke="rgba(148, 163, 184, 0.2)" 
                            strokeWidth="8" 
                            strokeLinecap="round" 
                          />

                          {/* Active green path progress */}
                          <path 
                            d="M 50 150 Q 110 50 200 120 T 350 55" 
                            fill="none" 
                            stroke="#059669" 
                            strokeWidth="5" 
                            strokeLinecap="round" 
                            strokeDasharray="400"
                            strokeDashoffset={400 - (400 * driveProgress) / 100}
                          />

                          {/* Milestone points */}
                          {ROUTE_COORDS.map((node, i) => (
                            <g key={i}>
                              <circle 
                                cx={node.x} 
                                cy={node.y} 
                                r={i === 0 || i === ROUTE_COORDS.length - 1 ? 7 : 4} 
                                className={`${i === 0 ? "fill-emerald-500 animate-pulse" : i === ROUTE_COORDS.length - 1 ? "fill-blue-600" : "fill-slate-400 dark:fill-slate-600"}`} 
                              />
                              <text 
                                x={node.x} 
                                y={node.y - 10} 
                                textAnchor="middle" 
                                className="text-[9px] font-black fill-slate-500 dark:fill-slate-400"
                              >
                                {node.label}
                              </text>
                            </g>
                          ))}

                          {/* Moving Vehicle representation */}
                          <g transform={`translate(${vehiclePos.x}, ${vehiclePos.y})`}>
                            <circle cx="0" cy="0" r="13" className="fill-emerald-600/20 stroke-emerald-500 stroke-2 animate-ping" />
                            <circle cx="0" cy="0" r="9" className="fill-emerald-600 stroke-white stroke-1" />
                            <path 
                              d="M-5 -4 L3 -4 L6 0 L6 4 L-5 4 Z" 
                              fill="#ffffff" 
                              transform="scale(0.7) translate(-1, -1)" 
                            />
                          </g>
                        </svg>

                        <div className="absolute bottom-3 left-3 bg-white/95 dark:bg-slate-900/95 px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-sm border border-slate-150">
                          📍 Status: <span className="text-emerald-600 font-extrabold">{vehiclePos.label}</span>
                        </div>
                      </div>
                    </div>

                    {/* Telemetry log console */}
                    <div className="space-y-2">
                      <h5 className="text-xs font-bold text-slate-405 flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                        Live Driver Routing Ticker
                      </h5>

                      <div className="bg-slate-950 text-emerald-400 p-4 rounded-xl border border-slate-800 font-mono text-[10px] space-y-1.5 h-36 overflow-y-auto scroll-smooth">
                        {visibleLogs.map((log, index) => (
                          <div key={index} className="flex gap-2 leading-relaxed animate-fade-in">
                            <span className="text-slate-600">[{Math.floor(driveProgress)}%]</span>
                            <span>{log}</span>
                          </div>
                        ))}
                        {driveProgress < 100 && (
                          <div className="text-emerald-500/50 animate-pulse">▋ Nav GPS satellite link streaming...</div>
                        )}
                      </div>
                    </div>

                    {/* Customer Info underlap */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-105 dark:border-slate-850 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center font-bold text-emerald-750 text-sm">
                          {trackingRequest.userFullName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h6 className="font-extrabold text-sm text-slate-900 dark:text-white">{trackingRequest.userFullName}</h6>
                          <p className="text-xs text-slate-500 font-medium">Contact: {trackingRequest.userPhone}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Payout target</p>
                        <p className="font-black text-emerald-600 text-sm">${trackingRequest.estimatedPayout.toFixed(2)} USD</p>
                      </div>
                    </div>

                    {/* Traversal accelerators */}
                    <div className="pt-2.5 border-t border-slate-100 dark:border-slate-850 flex justify-between gap-3 flex-wrap">
                      <button 
                        onClick={() => {
                          setDriveProgress(0);
                          setDriveState("intransit");
                        }}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-extrabold rounded-xl transition-all cursor-pointer"
                      >
                        🔄 Reset Navigation Journey
                      </button>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Telemetry booster</span>
                        <button 
                          onClick={() => {
                            setDriveProgress(95);
                            setDriveState("weighing");
                            onTriggerNotification("Proximity warning pinged to Customer!", "info");
                          }}
                          className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-900 text-xs font-bold rounded-xl transition-all cursor-pointer"
                        >
                          ⚡ Teleport near Customer Doorstep
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            );
          })()}

        </div>
      </div>
    </div>
  );
}
