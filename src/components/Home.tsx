/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Leaf, Trash2, Award, Sparkles, Clock, ArrowRight, Shield, 
  MapPin, Mail, Phone, CheckCircle, HelpCircle, FileText
} from "lucide-react";
import { CATEGORIES, TESTIMONIALS, FAQ_ITEMS } from "../data";

interface HomeProps {
  onNavigate: (page: string) => void;
  onOpenAuth: (mode: "login" | "register") => void;
}

export default function Home({ onNavigate, onOpenAuth }: HomeProps) {
  const [currentPage, setCurrentPage] = useState<"index" | "about" | "contact" | "faq" | "privacy" | "terms">("index");
  const [contactState, setContactState] = useState({ name: "", email: "", msg: "", ok: false });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactState.name || !contactState.email) return;
    setContactState(s => ({ ...s, ok: true }));
    setTimeout(() => {
      setContactState({ name: "", email: "", msg: "", ok: false });
    }, 4000);
  };

  // Base landing view
  if (currentPage === "index") {
    return (
      <div className="w-full">
        {/* --- HERO SECTION --- */}
        <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-white pt-24 pb-16 dark:from-slate-950 dark:to-slate-900">
          <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
            <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#86efac] to-[#22c55e] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72rem]"></div>
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="sm:text-center md:mx-auto md:max-w-2xl lg:col-span-6 lg:text-left">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-sm font-semibold text-brand-900 dark:bg-brand-950/50 dark:text-brand-200">
                  <Sparkles className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                  Eco-Friendly Smart AI Recycling
                </span>
                <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl md:text-6xl dark:text-white">
                  Turn Waste Into <span className="text-brand-600 dark:text-brand-500">Real Wealth</span>
                </h1>
                <p className="mt-6 text-lg text-slate-600 dark:text-slate-350 leading-relaxed">
                  EcoTrade connects household/business recyclers with specialized commercial vendors. Instant AI category classification, smart routes, cash payouts, and exclusive EcoRewards.
                </p>
                <div className="mt-10 sm:flex sm:justify-center lg:justify-start gap-4">
                  <button
                    onClick={() => onOpenAuth("register")}
                    id="hero-get-started"
                    className="flex w-full items-center justify-center rounded-xl bg-brand-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-brand-500/20 hover:bg-brand-700 hover:shadow-brand-500/30 transition-all sm:w-auto"
                  >
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setCurrentPage("faq")}
                    id="hero-see-how"
                    className="mt-3 flex w-full items-center justify-center rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 px-8 py-4 text-base font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 transition-all sm:mt-0 sm:w-auto"
                  >
                    How it Works
                  </button>
                </div>

                {/* Micro Statistics Row */}
                <div className="mt-12 grid grid-cols-3 gap-6 border-t border-slate-200 dark:border-slate-800 pt-8 text-left">
                  <div>
                    <p className="text-3xl font-extrabold text-slate-900 dark:text-white">124 Ton</p>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-450">Waste Diverted</p>
                  </div>
                  <div>
                    <p className="text-3xl font-extrabold text-slate-900 dark:text-white">$8.4K+</p>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-450">Paid to Recyclers</p>
                  </div>
                  <div>
                    <p className="text-3xl font-extrabold text-slate-900 dark:text-white">4.9★</p>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-450">Vendor Rating</p>
                  </div>
                </div>
              </div>

              {/* Graphical App Illustration */}
              <div className="relative mt-12 sm:mx-auto sm:max-w-lg lg:col-span-6 lg:mx-0 lg:mt-0 lg:flex lg:items-center">
                <div className="relative mx-auto w-full max-w-md rounded-3xl bg-white dark:bg-slate-950 p-6 shadow-2xl ring-1 ring-slate-100 dark:ring-slate-900">
                  <div className="absolute -top-4 -right-4 rounded-2xl bg-brand-500 p-4 shadow-lg text-white">
                    <Leaf className="h-6 w-6 animate-pulse" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-900 pb-3">
                      <div className="h-10 w-10 rounded-full bg-brand-100 dark:bg-brand-950 flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">Smart Waste Classifier</h3>
                        <p className="text-xs text-slate-400">Gemini 3.5-Flash Live Vision</p>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 p-4 text-center border border-dashed border-slate-200 dark:border-slate-850">
                      <div className="mx-auto h-24 w-24 rounded-full bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center text-brand-600 dark:text-brand-400 border border-brand-100 dark:border-brand-900">
                        <Trash2 className="h-12 w-12" />
                      </div>
                      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 font-medium">Snapshot uploaded: HDPE plastic detergent pile</p>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between font-semibold p-2 bg-brand-50/50 dark:bg-brand-950/20 rounded-lg">
                        <span className="text-brand-800 dark:text-brand-300">Category Detected</span>
                        <span className="text-brand-600 dark:text-brand-400">Plastic (PET / HDPE)</span>
                      </div>
                      <div className="flex justify-between p-2 text-xs">
                        <span className="text-slate-400">Estimated Weight</span>
                        <span className="text-slate-700 dark:text-slate-300 font-bold">14.5 Kg</span>
                      </div>
                      <div className="flex justify-between p-2 text-xs border-b border-slate-100 dark:border-slate-950">
                        <span className="text-slate-400">Reward EcoPoints</span>
                        <span className="text-emerald-500 font-bold">+174 EcoPoints</span>
                      </div>
                      <div className="flex justify-between p-2 text-sm font-extrabold text-slate-950 dark:text-white">
                        <span>Guaranteed Payout</span>
                        <span className="text-brand-600 dark:text-brand-400">$17.40 USD</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- HOW IT WORKS SECTION --- */}
        <section id="features" className="py-16 bg-white dark:bg-slate-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
                Simple 3-Step Lifecycle
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-450">
                Turn household junk back into resources in seconds.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-8 border border-slate-100 dark:border-slate-900 relative">
                <div className="h-12 w-12 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-lg shadow-md mb-6">
                  1
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Snap & Classify with AI</h3>
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Type a quick note or upload a picture. Our Gemini AI automatically sorts categorized recyclables and estimates real pricing value.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-8 border border-slate-100 dark:border-slate-900 relative">
                <div className="h-12 w-12 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-lg shadow-md mb-6">
                  2
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Schedule Pickup Routing</h3>
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Arrange a flexible date slot. Verified matching vendors in your neighborhood accept the task request, load the details, and drive straight to you.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-8 border border-slate-100 dark:border-slate-900 relative">
                <div className="h-12 w-12 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-lg shadow-md mb-6">
                  3
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Collect Cash & Points</h3>
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  The pickup vendor validates weight specifications and completes the order. Cash instantly deposits in your wallet and EcoPoints reward counts scale up.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- PRICING & WASTE CATEGORIES --- */}
        <section id="categories" className="py-16 bg-slate-50 dark:bg-slate-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-900 dark:bg-brand-950/60 dark:text-brand-300">
                Accepted Scrap Categories
              </span>
              <h2 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
                Current Recycling Payout Estimates
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                Live trading points. Prices are calculated dynamically per kilogram based on vendor demand.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {CATEGORIES.map((cat) => (
                <div key={cat.id} className="rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm ring-1 ring-slate-100 dark:ring-slate-850 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-brand-100 dark:bg-brand-950 rounded-xl text-brand-600 dark:text-brand-400 font-bold">
                      <Leaf className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{cat.name}</h3>
                      <p className="text-xs text-slate-400">Point multiplier: {cat.pointsPerKg} pts/kg</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{cat.description}</p>
                  <p className="mt-4 text-2xl font-black text-brand-600 dark:text-brand-500">
                    ${cat.pricePerKg.toFixed(2)}{" "}
                    <span className="text-xs font-semibold text-slate-400">/ Kg USD</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- TESTIMONIALS --- */}
        <section className="py-16 bg-white dark:bg-slate-900">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                Success Stories
              </h2>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
              {TESTIMONIALS.map((t, idx) => (
                <div key={idx} className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-8 border border-slate-100 dark:border-slate-850">
                  <p className="text-sm italic text-slate-600 dark:text-slate-300">"{t.quote}"</p>
                  <div className="mt-6 flex items-center gap-3">
                    <img className="h-10 w-10 rounded-full object-cover" src={t.avatar} alt={t.name} />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{t.name}</h4>
                      <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- TRUST FOOTER CTA --- */}
        <section className="py-16 bg-brand-900 text-white text-center rounded-3xl mx-4 my-8 relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-950 to-emerald-850 opacity-90 -z-10"></div>
          <Leaf className="mx-auto h-12 w-12 text-brand-300 mb-6" />
          <h2 className="text-3xl font-black sm:text-4xl">Ready to Monetize Your Scrap?</h2>
          <p className="mx-auto mt-4 max-w-xl text-brand-100 text-sm">
            Join thousands of smart recyclers and sustainable local vendors cleaning our cities today. Connect your first request and collect cash.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => onOpenAuth("register")}
              className="rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-brand-950 hover:bg-slate-100 transition-all shadow-md"
            >
              Sign Up For Free
            </button>
            <button
              onClick={() => setCurrentPage("contact")}
              className="rounded-xl border border-brand-200/40 bg-brand-950/40 px-6 py-3.5 text-sm font-bold text-brand-100 hover:bg-brand-950/60 transition-all"
            >
              Contact Advisory Partner
            </button>
          </div>
        </section>

        {/* --- SIMPLE FOOTER BAR --- */}
        <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200/50 dark:border-slate-900 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2">
                <Leaf className="h-6 w-6 text-brand-600" />
                <span className="text-lg font-black text-slate-900 dark:text-white">EcoTrade</span>
              </div>
              <p className="mt-4 text-xs text-slate-400 leading-relaxed">
                Empowering green circular economies. Classifying waste to value with modern deep-learning pipelines.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Organization</h4>
              <ul className="mt-4 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                <li><button onClick={() => setCurrentPage("about")} className="hover:text-brand-600">Company About Us</button></li>
                <li><button onClick={() => setCurrentPage("contact")} className="hover:text-brand-600">Contact Support</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Resources</h4>
              <ul className="mt-4 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                <li><button onClick={() => setCurrentPage("faq")} className="hover:text-brand-600">FAQ Guidelines</button></li>
                <li><button onClick={() => setCurrentPage("privacy")} className="hover:text-brand-600">Privacy Policy</button></li>
                <li><button onClick={() => setCurrentPage("terms")} className="hover:text-brand-600">Terms & Conditions</button></li>
              </ul>
            </div>
          </div>
          <p className="mt-8 text-center text-xs text-slate-400">
            &copy; 2026 EcoTrade Marketplace Inc. Registered Circular Business. Powered by Antigravity AI, Inc.
          </p>
        </footer>
      </div>
    );
  }

  // SECONDARY PAGES (About, Contact, FAQ, Privacy, Terms)
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      <button 
        onClick={() => setCurrentPage("index")} 
        className="text-brand-600 dark:text-brand-400 text-sm font-bold flex items-center gap-1 hover:underline mb-6"
      >
        &larr; Back to Home Page
      </button>

      {currentPage === "about" && (
        <article className="prose dark:prose-invert max-w-none">
          <div className="flex items-center gap-2 text-brand-600 mb-2">
            <Leaf className="h-6 w-6" />
            <span className="font-bold">EcoTrade Alliance</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">About EcoTrade</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-4 leading-relaxed">
            EcoTrade was set up in June 2026 at the intersection of deep neural-networks and physical recycling logistics with a single objective: <strong>maximizing structural trash bypass from standard municipal landfills.</strong>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
            <div className="p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl">
              <h3 className="font-extrabold text-slate-900 dark:text-white">Our Sustainability Vision</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Accelerating structural waste-to-wealth transitions globally, helping households monetize scraps while reducing extraction footprints of precious metal ores, plastics, and paper pulps.
              </p>
            </div>
            <div className="p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl">
              <h3 className="font-extrabold text-slate-900 dark:text-white">Verified Local Vendors</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                We partner with authorized eco-recyclers. All vendors undergo environmental compliance verification, logistics optimization audits, and support transparent, calibrated weight calculations.
              </p>
            </div>
          </div>
        </article>
      )}

      {currentPage === "contact" && (
        <section>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Contact EcoTrade Support</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">We are available 24/7 to resolve pick-up inquiries or verify vendor profiles.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-sm">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center gap-3">
              <Mail className="text-brand-600" />
              <div>
                <p className="font-bold">Email Support</p>
                <p className="text-xs text-slate-400">help@ecotrade.com</p>
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center gap-3">
              <Phone className="text-brand-600" />
              <div>
                <p className="font-bold">Contact Hotline</p>
                <p className="text-xs text-slate-400">+1 (800) 555-RECYCLE</p>
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center gap-3">
              <MapPin className="text-brand-600" />
              <div>
                <p className="font-bold">Corporate Headquarters</p>
                <p className="text-xs text-slate-400">Suite 400, Circular Plaza, SF</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleContactSubmit} className="space-y-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-850">
            {contactState.ok ? (
              <div className="rounded-xl bg-brand-50 dark:bg-brand-950 p-4 text-center text-brand-900 dark:text-brand-200">
                <CheckCircle className="mx-auto h-8 w-8 mb-2 text-brand-600" />
                <p className="font-bold">Message Submitted!</p>
                <p className="text-xs mt-1">Our customer advisory team will follow up at your provided email shortly.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400">Full Name</label>
                    <input 
                      required
                      type="text" 
                      value={contactState.name} 
                      onChange={e => setContactState(s => ({ ...s, name: e.target.value }))}
                      className="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none dark:bg-slate-950 dark:border-slate-800" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400">Email Address</label>
                    <input 
                      required
                      type="email" 
                      value={contactState.email} 
                      onChange={e => setContactState(s => ({ ...s, email: e.target.value }))}
                      className="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none dark:bg-slate-950 dark:border-slate-800" 
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400">Message / Pick-up Inquiry</label>
                  <textarea 
                    rows={4}
                    value={contactState.msg} 
                    onChange={e => setContactState(s => ({ ...s, msg: e.target.value }))}
                    className="mt-1 w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none dark:bg-slate-950 dark:border-slate-800"
                  />
                </div>
                <button type="submit" className="w-full rounded-xl bg-brand-600 py-3 text-sm font-bold text-white hover:bg-brand-700">
                  Deliver Message to Team
                </button>
              </>
            )}
          </form>
        </section>
      )}

      {currentPage === "faq" && (
        <section>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">FAQ & Knowledge Center</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Quickly resolve how to organize scraps, process cash deposits, or claim reward miles.</p>
          <div className="space-y-4">
            {FAQ_ITEMS.map((faq, idx) => (
              <div key={idx} className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-brand-600 shrink-0" />
                  {faq.q}
                </h3>
                <p className="text-sm mt-3 text-slate-500 dark:text-slate-400 leading-relaxed pl-7">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {currentPage === "privacy" && (
        <article className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Privacy Policy</h1>
          <p className="text-xs text-slate-400 mt-1">Last revised: June 15, 2026</p>
          <p className="mt-4">
            At EcoTrade, available from AI Studio Build, one of our main priorities is the absolute security of our recycling users' coordinates. This Privacy Policy document details types of data that is recorded and handled by the server.
          </p>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white mt-6">1. Image Data Harvesting</h3>
          <p>
            When utilizing our Smart Waste Image Classifier powered by Google Gemini, uploaded photos are parsed server-side to detect physical density, category, and estimate weight. No personal catalog of these photos is sold to external advertisement affiliates.
          </p>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white mt-6">2. Address & Geolocation coordinates</h3>
          <p>
            Your exact pickup address is shared purely with the verified vendor who explicitly accepts your pickup request. Administrators retain access logs of geographic coordinates to verify smart vendor recommendation distances.
          </p>
        </article>
      )}

      {currentPage === "terms" && (
        <article className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Terms & Conditions</h1>
          <p className="text-xs text-slate-400 mt-1">Effective date: June 15, 2026</p>
          <p className="mt-4">
            Welcome to EcoTrade. By accessing this platform and submitting recyclable requested orders, you agree to comply fully with these provisions.
          </p>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white mt-6">1. Waste Safety Regulations</h3>
          <p>
            Users are strictly prohibited from submitting hazardous material items, standard house medical wastes, biological substances, dynamic battery cells unless pre-packaged, or explosive chemicals. Doing so will result in instant account termination and loss of outstanding wallet balance.
          </p>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white mt-6">2. Calibrated Scale Weighing</h3>
          <p>
            While Gemini AI generates visual speculations, final weights are measured live in person by the pickup vendor using calibrated scaling machines. In the event of minor physical variance, the vendor's scale value serves as the authority to credit cash.
          </p>
        </article>
      )}
    </div>
  );
}
