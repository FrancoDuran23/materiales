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
    <div className="flex gap-0 lg:gap-6 min-h-[calc(100vh-8rem)]">
      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 bg-[#0D1117] rounded-2xl border border-gray-800 p-4">
        <div className="mb-6">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Admin Panel</p>
          <p className="text-sm font-bold text-white mt-1">ConstructNOA</p>
        </div>
        <nav className="space-y-1 flex-1">
          {/* Dashboard - active */}
          <Link href="/admin" className="sidebar-active flex items-center gap-3 px-3 py-2 text-sm rounded-lg">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Dashboard
          </Link>
          {/* Corralones */}
          <Link href="/admin/vendors" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Corralones
          </Link>
          {/* Sucursales */}
          <Link href="/admin/branches" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Sucursales
          </Link>
          {/* Productos */}
          <Link href="/admin/products" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Productos
          </Link>
          {/* Solicitudes */}
          <Link href="/admin/requests" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Solicitudes
            {pendingRequests > 0 && (
              <span className="ml-auto bg-amber-400 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {pendingRequests}
              </span>
            )}
          </Link>
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-red-400 transition-colors w-full rounded-lg">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Cerrar sesión
        </button>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Mobile header with logout */}
        <div className="lg:hidden flex items-center justify-between">
          <div>
            <p className="section-title">Administración</p>
            <h1 className="text-xl font-bold text-white">Dashboard</h1>
          </div>
          <button onClick={handleLogout} className="btn-ghost text-sm">Salir</button>
        </div>

        {/* Desktop header */}
        <div className="hidden lg:block">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-gray-400">Resumen general de la plataforma</p>
        </div>

        {/* Pending requests alert */}
        {pendingRequests > 0 && (
          <Link
            href="/admin/requests"
            className="bg-amber-400/10 border border-amber-400/30 rounded-xl px-4 py-3 flex items-center gap-3 hover:bg-amber-400/20 transition-colors"
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

        {/* Stats row - 4 cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Corralones */}
          <div className="bg-[#0D1117] rounded-xl border border-gray-800 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-emerald-400/10 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{activeVendors.length}</p>
            <p className="text-xs text-gray-400 mt-1">Corralones activos</p>
            <div className="flex items-end gap-1 mt-2 h-6">
              {[40, 60, 30, 80, 50, 70, 90].map((h, i) => (
                <span key={i} className="sparkline-bar" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>

          {/* Total Inactivos */}
          <div className="bg-[#0D1117] rounded-xl border border-gray-800 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gray-400/10 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{inactiveVendors.length}</p>
            <p className="text-xs text-gray-400 mt-1">Inactivos</p>
            <div className="flex items-end gap-1 mt-2 h-6">
              {[20, 35, 15, 40, 25, 30, 20].map((h, i) => (
                <span key={i} className="sparkline-bar" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>

          {/* Solicitudes */}
          <div className={`bg-[#0D1117] rounded-xl border p-4 ${pendingRequests > 0 ? "border-amber-400/30" : "border-gray-800"}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${pendingRequests > 0 ? "bg-amber-400/10" : "bg-gray-400/10"}`}>
                <svg className={`w-4 h-4 ${pendingRequests > 0 ? "text-amber-400" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              {pendingRequests > 0 && (
                <span className="relative flex h-2 w-2 ml-auto">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                </span>
              )}
            </div>
            <p className={`text-2xl font-bold ${pendingRequests > 0 ? "text-amber-400" : "text-white"}`}>{pendingRequests}</p>
            <p className="text-xs text-gray-400 mt-1">Solicitudes</p>
            <div className="flex items-end gap-1 mt-2 h-6">
              {[50, 30, 60, 40, 70, 45, 55].map((h, i) => (
                <span key={i} className="sparkline-bar" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>

          {/* Total Vendedores */}
          <div className="bg-[#0D1117] rounded-xl border border-gray-800 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-400/10 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{vendors.length}</p>
            <p className="text-xs text-gray-400 mt-1">Total vendedores</p>
            <div className="flex items-end gap-1 mt-2 h-6">
              {[60, 45, 75, 55, 85, 65, 70].map((h, i) => (
                <span key={i} className="sparkline-bar" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left column (3/5) - Recent vendors list */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-white">Vendedores recientes</h2>
              <Link href="/admin/vendors" className="text-sm text-amber-400 font-medium hover:text-amber-300">
                Ver todos
              </Link>
            </div>
            <div className="bg-[#0D1117] rounded-xl border border-gray-800 divide-y divide-gray-800">
              {vendors.slice(0, 5).map((v) => (
                <div key={v.id} className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-400 font-bold text-sm flex-shrink-0">
                    {v.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm truncate">{v.name}</p>
                    <p className="text-xs text-gray-400 truncate">{v.email || "Sin email"}</p>
                  </div>
                  <span className={v.is_active ? "badge badge-success" : "badge badge-warning"}>
                    {v.is_active ? "Activo" : "Pendiente"}
                  </span>
                </div>
              ))}
              {vendors.length === 0 && (
                <div className="p-8 text-center text-gray-400 text-sm">
                  No hay vendedores registrados
                </div>
              )}
            </div>
          </div>

          {/* Right column (2/5) - Quick actions */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-semibold text-white">Acciones rápidas</h2>
            {[
              {
                href: "/admin/requests",
                label: "Solicitudes",
                desc: "Revisar solicitudes pendientes",
                badge: pendingRequests,
                icon: (
                  <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                ),
              },
              {
                href: "/admin/vendors",
                label: "Corralones",
                desc: "Gestionar vendedores",
                icon: (
                  <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
              },
              {
                href: "/admin/branches",
                label: "Sucursales",
                desc: "Gestionar ubicaciones",
                icon: (
                  <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
              },
              {
                href: "/admin/products",
                label: "Productos",
                desc: "Catálogo de productos",
                icon: (
                  <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                ),
              },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="card p-4 flex items-center gap-3 group hover:border-amber-400/50 transition-colors"
              >
                <div className="w-10 h-10 bg-amber-400/10 rounded-xl flex items-center justify-center group-hover:bg-amber-400/20 transition-colors flex-shrink-0">
                  {action.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm">{action.label}</p>
                  <p className="text-xs text-gray-400">{action.desc}</p>
                </div>
                {action.badge !== undefined && action.badge > 0 && (
                  <span className="bg-amber-400 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                    {action.badge}
                  </span>
                )}
                <svg className="w-4 h-4 text-gray-600 group-hover:text-amber-400 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
