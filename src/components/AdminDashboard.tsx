/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Users, TrendingUp, DollarSign, Award, Grid, RefreshCw, 
  Search, ShieldAlert, FileText, CheckCircle, Smartphone, ShieldCheck
} from "lucide-react";
import { fetchWithAuth } from "../data";
import { User, WasteRequest, Transaction } from "../types";

interface AdminDashboardProps {
  user: any;
  onTriggerNotification: (msg: string, type: "info" | "success" | "alert") => void;
}

export default function AdminDashboard({ user, onTriggerNotification }: AdminDashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState<"analytics" | "users" | "vendors" | "transactions" | "requests" | "profile">("analytics");

  // Systems telemetry states
  const [metrics, setMetrics] = useState({ totalUsers: 3, totalVendors: 3, totalTransactions: 1, totalWasteCollected: 15.0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [vendorsList, setVendorsList] = useState<any[]>([]);
  const [transactionsList, setTransactionsList] = useState<Transaction[]>([]);
  const [allRequests, setAllRequests] = useState<WasteRequest[]>([]);

  // Profile forms
  const [profileName, setProfileName] = useState(user?.fullName || "Regional Commander");
  const [profilePhone, setProfilePhone] = useState(user?.phone || "+1 (555) 019-2831");
  const [profileAddress, setProfileAddress] = useState(user?.address || "EcoTrade Headquarters");

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchWithAuth("/api/users/profile", {
        method: "PUT",
        body: JSON.stringify({
          fullName: profileName,
          phone: profilePhone,
          address: profileAddress
        })
      });
      onTriggerNotification("Administrative liaison information synchronized.", "success");
    } catch (err: any) {
      onTriggerNotification(err.message, "alert");
    }
  };

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchAdminTelemetry = async () => {
    setLoading(true);
    try {
      const stats = await fetchWithAuth("/api/admin/dashboard");
      setMetrics(stats.metrics);
      setChartData(stats.chartData);

      const uList = await fetchWithAuth("/api/admin/users");
      setUsersList(uList);

      const vList = await fetchWithAuth("/api/admin/vendors");
      setVendorsList(vList);

      const txList = await fetchWithAuth("/api/admin/transactions");
      setTransactionsList(txList);

      const rList = await fetchWithAuth("/api/waste");
      setAllRequests(rList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminTelemetry();
  }, [activeSubTab]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* HEADER WIDGET ADMIN */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <span className="text-xs bg-red-150 text-red-900 border border-red-200 px-2.5 py-1 rounded-full font-bold">
            🛡️ ECOTRADE CENTRAL ADMIN CONTROL
          </span>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mt-1 flex items-center gap-2 flex-wrap">
            Core Command: <span className="text-brand-600 dark:text-brand-400">{profileName}</span>
            <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-400 text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-sm border border-red-300 dark:border-red-900 animate-pulse">
              <ShieldCheck className="h-4 w-4" /> Core Administration Verified
            </span>
          </h1>
          <p className="text-xs text-slate-400">Observe global circular supply lanes, audit ledger movements, and manage recycling users.</p>
        </div>

        <button 
          onClick={fetchAdminTelemetry} 
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          Compile Telemetry Logs
        </button>
      </div>

      {/* ADMIN METRICS SUMMARY */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-sm border border-slate-100 dark:border-slate-850">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Registered Users</span>
          <p className="text-3xl font-black text-slate-905 dark:text-white mt-2">{metrics.totalUsers}</p>
          <span className="text-xs text-slate-450 block mt-1">Customers & Administrators</span>
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-sm border border-slate-100 dark:border-slate-850">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Affiliated Vendors</span>
          <p className="text-3xl font-black text-slate-905 dark:text-white mt-2">{metrics.totalVendors}</p>
          <span className="text-xs text-slate-450 block mt-1">Verified recycling operators</span>
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-sm border border-slate-100 dark:border-slate-850">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Transactions Audited</span>
          <p className="text-3xl font-black text-slate-905 dark:text-white mt-2">{metrics.totalTransactions}</p>
          <span className="text-xs text-slate-450 block mt-1">Razorpay & Bank withdrawal links</span>
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-sm border border-slate-100 dark:border-slate-850">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Net Weight Diverted</span>
          <p className="text-3xl font-black text-brand-655 dark:text-brand-400 mt-2">{metrics.totalWasteCollected} Kg</p>
          <span className="text-xs text-slate-455 block mt-1">Trash structural bypass offset</span>
        </div>
      </div>

      {/* TAB NAVIGATION COCKPIT */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 overflow-x-auto whitespace-nowrap gap-6 text-sm font-semibold">
        <button 
          onClick={() => setActiveSubTab("analytics")} 
          className={`pb-3 border-b-2 transition-all ${activeSubTab === "analytics" ? "border-brand-600 text-brand-600 dark:text-brand-400" : "border-transparent text-slate-400 hover:text-slate-600"}`}
        >
          Visual Analytics Cockpit
        </button>
        <button 
          onClick={() => setActiveSubTab("users")} 
          className={`pb-3 border-b-2 transition-all ${activeSubTab === "users" ? "border-brand-600 text-brand-600 dark:text-brand-400" : "border-transparent text-slate-405 hover:text-slate-600"}`}
        >
          Customer Directory
        </button>
        <button 
          onClick={() => setActiveSubTab("vendors")} 
          className={`pb-3 border-b-2 transition-all ${activeSubTab === "vendors" ? "border-brand-600 text-brand-600 dark:text-brand-400" : "border-transparent text-slate-405 hover:text-slate-600"}`}
        >
          Recycling Vendor Registers
        </button>
        <button 
          onClick={() => setActiveSubTab("transactions")} 
          className={`pb-3 border-b-2 transition-all ${activeSubTab === "transactions" ? "border-brand-600 text-brand-600 dark:text-brand-400" : "border-transparent text-slate-405 hover:text-slate-600"}`}
        >
          Monetary Ledger Audit
        </button>
        <button 
          onClick={() => setActiveSubTab("requests")} 
          className={`pb-3 border-b-2 transition-all ${activeSubTab === "requests" ? "border-brand-600 text-brand-600 dark:text-brand-400" : "border-transparent text-slate-405 hover:text-slate-600"}`}
        >
          Global Requests Matrix
        </button>
        <button 
          onClick={() => setActiveSubTab("profile")} 
          className={`pb-3 border-b-2 transition-all ${activeSubTab === "profile" ? "border-brand-600 text-brand-600 dark:text-brand-400" : "border-transparent text-slate-405 hover:text-slate-600"}`}
          id="subtab-admin-profile"
        >
          Admin Profile
        </button>
      </div>

      {/* RENDER SHEETS */}
      {activeSubTab === "analytics" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* CATEGORIES HARVEST GRAPH - CUSTOM SVG */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-6 rounded-2xl">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-4">Circular Category Distribution (Tons collected)</h3>
            
            <div className="space-y-4">
              {chartData.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                    <span className="text-slate-900 dark:text-white font-mono">{item.weight} Kg</span>
                  </div>
                  {/* Sized vector gauge */}
                  <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-600 rounded-full" 
                      style={{ width: `${Math.min(100, Math.max(10, (item.weight / 60) * 100))}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PLATFORM AUDITING POLICY PANEL */}
          <div className="bg-slate-100 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-850 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="h-10 w-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Administrative Ledger Compliance Guidelines</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Ledger auditing rules prevent illegal chemical or post-hospital hazard submissions. Ensure matching vendor profiles carry certified Environmental Commission agency ID tokens before approval.
              </p>
            </div>

            <div className="mt-8 border-t border-slate-200 dark:border-slate-850 pt-4 text-xs space-y-1 text-slate-400">
              <p>📍 Server environment: <b>Node.js + Express + GoogleGenAI</b></p>
              <p>🛡️ Active API key: <b>GEMINI_API_KEY (Server Persistent)</b></p>
            </div>
          </div>

        </div>
      )}

      {/* USER DIRECTORY TAB */}
      {activeSubTab === "users" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-6 rounded-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">System Users Directory</h3>
            <div className="relative w-full sm:w-64">
              <span className="absolute left-3.5 top-2 text-slate-400"><Search className="h-4 w-4" /></span>
              <input 
                type="text" 
                placeholder="Search by profile email..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-10 pr-4 py-1.5 text-xs focus:outline-none dark:bg-slate-950 dark:border-slate-800"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                  <th className="pb-3 text-xs uppercase">User Account ID</th>
                  <th className="pb-3 text-xs uppercase">Email Coordinate</th>
                  <th className="pb-3 text-xs uppercase">Full Profile Name</th>
                  <th className="pb-3 text-xs uppercase">System Role</th>
                  <th className="pb-3 text-xs uppercase">Wallet balance</th>
                  <th className="pb-3 text-xs uppercase text-right">Loyalty points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                {usersList.filter(u => u.email.toLowerCase().includes(searchQuery.toLowerCase())).map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/10">
                    <td className="py-4 font-mono text-xs">{u.id}</td>
                    <td className="py-4 font-semibold">{u.email}</td>
                    <td className="py-4 text-slate-600 dark:text-slate-350">{u.fullName}</td>
                    <td className="py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${u.role === "admin" ? "bg-red-150 text-red-900 dark:bg-red-950 dark:text-red-300" : u.role === "vendor" ? "bg-emerald-150 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300" : "bg-blue-150 text-blue-900 dark:bg-blue-950 dark:text-blue-300"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 font-bold">${u.walletBalance.toFixed(2)}</td>
                    <td className="py-4 text-right">{u.rewardPoints} points</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VENDOR LICENSING SHEET TAB */}
      {activeSubTab === "vendors" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-6 rounded-2xl animate-fade-in">
          <h3 className="font-extrabold text-slate-903 dark:text-white text-lg mb-6">Recycle Vendor Affiliation Log</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                  <th className="pb-3 text-xs">Vendor Code</th>
                  <th className="pb-3 text-xs">Franchise Firm Name</th>
                  <th className="pb-3 text-xs">Authorized Categories specialties</th>
                  <th className="pb-3 text-xs">Active Rating Index</th>
                  <th className="pb-3 text-xs text-right">Coordinates Latitude / Longitude</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                {vendorsList.map((v) => (
                  <tr key={v.id}>
                    <td className="py-4 font-mono text-xs">{v.id}</td>
                    <td className="py-4 font-bold text-slate-900 dark:text-white">{v.businessName}</td>
                    <td className="py-4">
                      <div className="flex flex-wrap gap-1">
                        {v.categories?.map((cat: string, idx: number) => (
                          <span key={idx} className="bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded text-[10px] text-slate-500 font-semibold">{cat}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 text-brand-605 font-bold">{v.rating} ★</td>
                    <td className="py-4 text-right font-mono text-xs text-slate-400">{v.lat?.toFixed(4)}, {v.lng?.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FINANCIAL AUDITING TAB */}
      {activeSubTab === "transactions" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-6 rounded-2xl">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-lg mb-6">Financial Ledger Payout Trails</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-405 font-bold">
                  <th className="pb-3 text-xs uppercase">Ledger ID</th>
                  <th className="pb-3 text-xs uppercase">Payout Description</th>
                  <th className="pb-3 text-xs uppercase">Transfer Type</th>
                  <th className="pb-3 text-xs uppercase">Status</th>
                  <th className="pb-3 text-xs uppercase">Razorpay Order Reference</th>
                  <th className="pb-3 text-xs uppercase text-right">Settled Cash Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                {transactionsList.map((tx) => (
                  <tr key={tx.id}>
                    <td className="py-4 font-mono text-xs">{tx.id}</td>
                    <td className="py-4 font-semibold">{tx.description}</td>
                    <td className="py-4">
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold ${tx.type === "withdrawal" ? "bg-red-50 text-red-650" : "bg-brand-50 text-brand-700"}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className="text-emerald-500 font-bold">● {tx.status}</span>
                    </td>
                    <td className="py-4 font-mono text-xs text-slate-450">{tx.reference}</td>
                    <td className="py-4 text-right font-bold text-slate-800 dark:text-slate-200">${tx.amount?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GLOBAL DISPATCH MATRIX TAB */}
      {activeSubTab === "requests" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-6 rounded-2xl">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-lg mb-6">Global circular supply lanes</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                  <th className="pb-3 text-xs">Request ID</th>
                  <th className="pb-3 text-xs">Recycler Name</th>
                  <th className="pb-3 text-xs">Category</th>
                  <th className="pb-3 text-xs">Weight</th>
                  <th className="pb-3 text-xs">Scheduled Target Date</th>
                  <th className="pb-3 text-xs">Active Dispatch Agency</th>
                  <th className="pb-3 text-xs text-right">Tracking Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                {allRequests.map((req) => (
                  <tr key={req.id}>
                    <td className="py-4 font-mono text-xs">{req.id}</td>
                    <td className="py-4 font-bold">{req.userFullName}</td>
                    <td className="py-4 font-medium text-slate-700 dark:text-slate-350">{req.category}</td>
                    <td className="py-4 font-mono text-xs">{req.weight} Kg</td>
                    <td className="py-4">{req.pickupDate}</td>
                    <td className="py-4 italic text-slate-500">{req.vendorBusinessName || "Lanes finding Match..."}</td>
                    <td className="py-4 text-right">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${req.status === "completed" ? "bg-emerald-100 text-emerald-850" : req.status === "accepted" ? "bg-blue-100 text-blue-800" : "bg-yellow-150 text-yellow-800"}`}>
                        {req.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CORE ADMINISTRATIVE TRUST PROFILE */}
      {activeSubTab === "profile" && (
        <div className="max-w-2xl mx-auto space-y-6 w-full">
          {/* VERIFIED ADMINISTRATIVE BADGE BLOCK */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-5 w-5 text-red-600" />
              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">Administrative Cryptographic Seal</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-6 font-medium">
              You are authorized with the supreme administrative clearance. Your circular transactions verification are instantly locked and signed with the core agency certificate keys.
            </p>

            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-4.5 flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/40 text-red-650 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="font-extrabold text-slate-900 dark:text-white text-xs">Administrative Authority Verified</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Liaison Coordinator: <b className="font-semibold text-slate-805 dark:text-slate-200">{profileName}</b> | phone registry: <b className="font-semibold text-slate-805 dark:text-slate-205">{profilePhone}</b>
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-[10px] text-red-700 font-extrabold uppercase bg-red-150/50 dark:bg-red-950/50 w-max px-2.5 py-1 rounded-md">
                  <span>● SECURE CONTROL TERMINAL</span>
                </div>
              </div>
            </div>
          </div>

          {/* ADMIN DETAILS FORM */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-6 rounded-2xl">
            <h3 className="font-extrabold text-slate-900 dark:text-white mb-6">Modify Administrative Coordinates</h3>
            
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400">Chief Coordinator Full Name</label>
                <input 
                  required
                  type="text" 
                  value={profileName} 
                  onChange={e => setProfileName(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2 text-sm focus:border-red-500 focus:outline-none dark:bg-slate-950 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-medium" 
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-405">Secure Liaison Contact Hot-Line (Phone)</label>
                <input 
                  required
                  type="text" 
                  value={profilePhone} 
                  onChange={e => setProfilePhone(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2 text-sm focus:border-red-500 focus:outline-none dark:bg-slate-950 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-medium" 
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-405">Central HQ Operating Location</label>
                <input 
                  required
                  type="text" 
                  value={profileAddress} 
                  onChange={e => setProfileAddress(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2 text-sm focus:border-red-500 focus:outline-none dark:bg-slate-950 dark:border-slate-800 text-slate-800 dark:text-slate-100 font-medium" 
                />
              </div>

              <button 
                type="submit"
                className="w-full rounded-xl bg-red-650 py-3.5 text-xs font-bold text-white hover:bg-red-700 tracking-wide transition-all cursor-pointer"
              >
                Sync Command Liaison Coordinates
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
