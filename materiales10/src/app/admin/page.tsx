"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSession, signOut } from "@/lib/auth";
import { checkIsAdmin, fetchAllVendors, fetchVendorRequests } from "@/lib/admin";
import { Spinner } from "@/components";
import type { Vendor } from "@/lib/database.types";
import type { User } from "@supabase/supabase-js";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const { user: u } = await getSession();
      if (!u) {
        router.push("/admin/login");
        return;
      }
      setUser(u);

      const admin = await checkIsAdmin();
      if (!admin) {
        router.push("/admin/login?error=not_admin");
        return;
      }
      setIsAdmin(true);

      const v = await fetchAllVendors();
      setVendors(v);
      const reqs = await fetchVendorRequests();
      setPendingRequests(reqs.filter(r => r.status === "pending").length);
      setLoading(false);
    }
    init();
  }, [router]);

  async function handleLogout() {
    await signOut();
    router.push("/admin/login");
  }

  if (loading) return <Spinner />;
  if (!isAdmin) return null;

  const activeVendors = vendors.filter((v) => v.is_active);
  const inactiveVendors = vendors.filter((v) => !v.is_active);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="section-title">Administración</p>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
        </div>
        <button onClick={handleLogout} className="btn-ghost text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Salir
        </button>
      </div>

      {/* Pending requests alert */}
      {pendingRequests > 0 && (
        <Link
          href="/admin/requests"
          className="bg-amber-400/10 border-2 border-amber-400/30 rounded-xl px-4 py-3 flex items-center gap-3 hover:bg-amber-400/20 transition-colors"
        >
          <div className="w-10 h-10 bg-amber-400/20 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-amber-400">{pendingRequests} solicitud(es) pendiente(s)</p>
            <p className="text-xs text-gray-400">Click para revisar y aprobar</p>
          </div>
          <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">{activeVendors.length}</p>
          <p className="text-xs text-gray-400">Vendedores activos</p>
        </div>
        <Link
          href="/admin/requests"
          className="card p-4 text-center hover:shadow-lg transition group"
        >
          <div className="w-10 h-10 bg-amber-400/10 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:bg-amber-400/20 transition relative">
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {pendingRequests > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 text-black text-xs font-bold rounded-full flex items-center justify-center">
                {pendingRequests}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400">Solicitudes</p>
        </Link>
        <Link
          href="/admin/vendors"
          className="card p-4 text-center hover:shadow-lg transition group"
        >
          <div className="w-10 h-10 bg-amber-400/10 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:bg-amber-400/20 transition">
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-xs text-gray-400">Vendedores</p>
        </Link>
        <Link
          href="/admin/branches"
          className="card p-4 text-center hover:shadow-lg transition group"
        >
          <div className="w-10 h-10 bg-amber-400/10 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:bg-amber-400/20 transition">
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </div>
          <p className="text-xs text-gray-400">Sucursales</p>
        </Link>
        <Link
          href="/admin/products"
          className="card p-4 text-center hover:shadow-lg transition group"
        >
          <div className="w-10 h-10 bg-amber-400/10 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:bg-amber-400/20 transition">
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-xs text-gray-400">Productos</p>
        </Link>
      </div>

      {/* Quick list */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-white">Vendedores recientes</h2>
          <Link href="/admin/vendors" className="text-sm text-amber-400 font-medium hover:text-amber-300">
            Ver todos
          </Link>
        </div>
        {vendors.slice(0, 5).map((v) => (
          <div
            key={v.id}
            className={`card p-4 ${!v.is_active && "border-amber-400/30 bg-amber-400/10"}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-white">{v.name}</p>
                <p className="text-xs text-gray-400">{v.email ?? "Sin email"}</p>
              </div>
              <span className={v.is_active ? "badge badge-success" : "badge badge-warning"}>
                {v.is_active ? "Activo" : "Pendiente"}
              </span>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
