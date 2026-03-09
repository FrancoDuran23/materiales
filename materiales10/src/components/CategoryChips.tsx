"use client";

import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";
import CategoryIcon from "./CategoryIcon";

const EXTRA_DATA: Record<string, string> = {
  albanileria: "761",
  plomeria: "273",
  electricidad: "236",
  ferreteria: "218",
  pinturas: "80",
  herrajes: "63",
  gas: "22",
};

export default function CategoryChips() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {CATEGORIES.map((cat, i) => (
        <Link
          key={cat.slug}
          href={`/search?category=${cat.slug}`}
          className="group relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/[0.06] p-5 hover:border-amber-400/40 transition-all duration-300 active:scale-[0.97]"
        >
          {/* Number watermark */}
          <span className="absolute -top-2 -right-1 text-5xl font-black text-white/[0.04] leading-none select-none pointer-events-none group-hover:text-amber-400/10 transition-colors">
            {String(i + 1).padStart(2, "0")}
          </span>

          {/* Icon */}
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/[0.05] group-hover:bg-amber-400/15 transition-colors mb-3">
            <CategoryIcon slug={cat.slug} className="w-5 h-5 text-gray-400 group-hover:text-amber-400 transition-colors" />
          </div>

          {/* Category name */}
          <h3 className="text-sm sm:text-base font-semibold text-white group-hover:text-amber-400 transition-colors leading-tight">
            {cat.name}
          </h3>

          {/* Product count */}
          <p className="text-xs text-gray-500 mt-1">
            {EXTRA_DATA[cat.slug] || ""} productos
          </p>

          {/* Hover arrow */}
          <svg
            className="absolute bottom-4 right-4 w-4 h-4 text-gray-600 opacity-0 group-hover:opacity-100 group-hover:text-amber-400 transition-all translate-x-1 group-hover:translate-x-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      ))}

      {/* "Buscar todo" card */}
      <Link
        href="/search"
        className="group relative overflow-hidden rounded-2xl border border-dashed border-white/10 p-5 hover:border-amber-400/40 transition-all duration-300 active:scale-[0.97] flex flex-col justify-center"
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/[0.05] group-hover:bg-amber-400/15 transition-colors mb-3">
          <svg className="w-5 h-5 text-gray-400 group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-gray-400 group-hover:text-amber-400 transition-colors">
          Buscar todo
        </span>
        <p className="text-xs text-gray-600 mt-1">
          +1.600 productos
        </p>
      </Link>
    </div>
  );
}
