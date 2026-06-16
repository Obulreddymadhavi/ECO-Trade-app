/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WasteCategory, RewardItem } from "./types";

export const CATEGORIES: WasteCategory[] = [
  {
    id: "plastic",
    name: "Plastic",
    icon: "Trash2",
    pricePerKg: 1.20,
    pointsPerKg: 12,
    description: "PET bottles, HDPE laundry containers, food canisters, and rigid wraps."
  },
  {
    id: "paper",
    name: "Paper",
    icon: "FileText",
    pricePerKg: 0.80,
    pointsPerKg: 8,
    description: "Cardboard boxes, shipping tubes, newspaper, textbooks, and catalogs."
  },
  {
    id: "glass",
    name: "Glass",
    icon: "Info",
    pricePerKg: 1.50,
    pointsPerKg: 15,
    description: "Clear and amber beer bottles, culinary jars, and structural silica glass."
  },
  {
    id: "metal",
    name: "Metal",
    icon: "Leaf",
    pricePerKg: 2.50,
    pointsPerKg: 25,
    description: "Aluminum soda cans, structural copper piping, steel frames, and lead scraps."
  },
  {
    id: "ewaste",
    name: "E-Waste",
    icon: "Sparkles",
    pricePerKg: 4.00,
    pointsPerKg: 40,
    description: "Old motherboards, mobile handsets, computer screens, chargers, and keyboards."
  },
  {
    id: "organic",
    name: "Organic Waste",
    icon: "Clock",
    pricePerKg: 0.50,
    pointsPerKg: 5,
    description: "Culinary fruit scraps, household coffee grounds, and yard trimmings."
  }
];

export const REWARDS_LIST: RewardItem[] = [
  {
    id: "cou-1",
    title: "$5 Amazon Gift Card",
    pointsCost: 200,
    description: "Get a $5 credit towards millions of products on Amazon. Delivered instantly.",
    couponCode: "AMZN-ECO-5",
    imageUrl: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "cou-2",
    title: "$10 Target Eco-Discount",
    pointsCost: 350,
    description: "Unlock $10 off at your local Target store on selective organic cosmetics, home textiles and goods.",
    couponCode: "TGT-GREEN-10",
    imageUrl: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=400&q=80"
  },
  {
    id: "cou-3",
    title: "Free Starbucks Reusable Cup",
    pointsCost: 500,
    description: "Get a sustainable green venti Starbucks cold mug at any location. Help keep throwaway cups out of landfills.",
    couponCode: "SBUX-MUG-GREEN",
    imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80"
  }
];

export const TESTIMONIALS = [
  {
    name: "Marcus Sterling",
    role: "EcoTrade Customer (28 Pickups)",
    quote: "EcoTrade transformed how my coffee shop handles wastes. We turned mountains of paper carton crates and coffee grinds into over $300 a month in wallet withdrawals and hundreds of eco-points!",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80"
  },
  {
    name: "Sophia Lindqvist",
    role: "Verified Recycling Vendor",
    quote: "The recommendation algorithm directs us directly to bulk piles. Instead of wandering for recyclable scraps, we get optimized routes with verified pre-sorted quantities. Highly profitable!",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80"
  }
];

export const FAQ_ITEMS = [
  {
    q: "How does the AI waste classifier work?",
    a: "Our system uses Google's latest Gemini 3.5-Flash model. Simply supply a text summary or upload a physical snapshot of the waste pile. Gemini reads the image details, detects the exact category, calculates estimated densities/weights, and displays prospective payouts."
  },
  {
    q: "Is there a minimum pickup weight?",
    a: "We recommend accumulative batches of at least 5kg overall weight to coordinate logical vendor travel, ensuring low combustion emissions. However, our affiliated vendors can merge pickups based on your community area."
  },
  {
    q: "When and how do I receive payments?",
    a: "Once a vendor collects and signs off on your request, your dashboard wallet is instantly credited. You can then withdraw these earnings immediately via simulated bank routing or spend points to acquire gift cards."
  },
  {
    q: "Are my reward points linked to cash?",
    a: "No, reward points (EcoPoints) are an added milestone bonus. You receive CASH payouts based on the real weight price, AND you receive EcoPoints bonus. You do not have to forfeit cash to get reward points!"
  }
];

// Helper to handle API queries safely with mock fallbacks
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("ecotrade_token");
  
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const res = await fetch(url, { ...options, headers });
    if (!res.ok) {
      const errPayload = await res.json().catch(() => ({}));
      throw new Error(errPayload.error || `HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (err: any) {
    console.warn(`API call failed for ${url}:`, err.message);
    throw err;
  }
}
