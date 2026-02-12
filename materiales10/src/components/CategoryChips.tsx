"use client";

import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";
import CategoryIcon from "./CategoryIcon";

export default function CategoryChips() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {CATEGORIES.map((cat) => (
        <Link
          key={cat.slug}
          href={`/search?category=${cat.slug}`}
          className="card p-4 hover:border-amber-400/50 transition-all active:scale-[0.98] group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-800 group-hover:bg-amber-400/20 transition-colors">
              <CategoryIcon slug={cat.slug} className="w-5 h-5 text-gray-400 group-hover:text-amber-400 transition-colors" />
            </div>
            <span className="font-medium text-sm text-white group-hover:text-amber-400 transition-colors">{cat.name}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
