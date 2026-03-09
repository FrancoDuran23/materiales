"use client";

import { useEffect, useState, useRef, FormEvent } from "react";
import { getSession, signIn, signOut } from "@/lib/auth";
import { fetchMyVendor, createVendor, fetchMyBranches, createBranch, updateBranch, claimVendorByEmail, submitVendorRequest } from "@/lib/vendor";
import { PROVINCES } from "@/lib/constants";
import { Spinner, Toast, AddressAutocomplete } from "@/components";
import type { AddressResult } from "@/components/AddressAutocomplete";
import type { Vendor, Branch } from "@/lib/database.types";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";

export default function VendorPage() {
  const [user, setUser] = useState<User | null>(null);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Mode: "request" (solicitar acceso) or "login" (ya tengo cuenta)
  const [mode, setMode] = useState<"request" | "login">("request");

  // Login form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Request form
  const [reqContactName, setReqContactName] = useState("");
  const [reqName, setReqName] = useState("");
  const [reqEmail, setReqEmail] = useState("");
  const [reqPassword, setReqPassword] = useState("");
  const [reqPhone, setReqPhone] = useState("");
  const [reqWhatsapp, setReqWhatsapp] = useState("");
  const [reqSent, setReqSent] = useState(false);
  const [reqLoading, setReqLoading] = useState(false);

  // Branch form
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [branchName, setBranchName] = useState("");
  const [branchAddress, setBranchAddress] = useState("");
  const [branchCity, setBranchCity] = useState("");
  const [branchProvince, setBranchProvince] = useState(PROVINCES[0]);
  const [branchLat, setBranchLat] = useState("");
  const [branchLng, setBranchLng] = useState("");
  const [branchFreeShipping, setBranchFreeShipping] = useState(false);
  const [branchFreeShippingRadius, setBranchFreeShippingRadius] = useState("");
  const [branchPhone, setBranchPhone] = useState("");
  const [branchWhatsapp, setBranchWhatsapp] = useState("");
  const [savingBranch, setSavingBranch] = useState(false);

  // Sidebar active tab
  const [activeTab, setActiveTab] = useState<"dashboard" | "profile" | "branches" | "offers">("dashboard");

  useEffect(() => {
    async function init() {
      const { user: u } = await getSession();
      if (u) {
        setUser(u);
        let v = await fetchMyVendor(u.id);
        if (!v && u.email) {
          v = await claimVendorByEmail(u.id, u.email);
        }
        if (v) {
          setVendor(v);
          const b = await fetchMyBranches(v.id);
          setBranches(b);
        }
      }
      setLoading(false);
    }
    init();
  }, []);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const { user: u } = await signIn(email, password);
      if (u) {
        setUser(u);
        let v = await fetchMyVendor(u.id);
        if (!v && u.email) {
          v = await claimVendorByEmail(u.id, u.email);
        }
        if (v) {
          setVendor(v);
          const b = await fetchMyBranches(v.id);
          setBranches(b);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error de autenticacion";
      setToast({ msg: message, type: "error" });
    }
    setAuthLoading(false);
  }

  async function handleRequest(e: FormEvent) {
    e.preventDefault();
    setReqLoading(true);
    try {
      await submitVendorRequest({
        contact_name: reqContactName,
        business_name: reqName,
        email: reqEmail,
        password: reqPassword,
        phone: reqPhone || undefined,
        whatsapp: reqWhatsapp || undefined,
      });
      setReqSent(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al enviar solicitud";
      setToast({ msg: message, type: "error" });
    }
    setReqLoading(false);
  }

  function resetBranchForm() {
    setShowBranchForm(false);
    setEditingBranchId(null);
    setBranchName("");
    setBranchAddress("");
    setBranchCity("");
    setBranchProvince(PROVINCES[0]);
    setBranchLat("");
    setBranchLng("");
    setBranchFreeShipping(false);
    setBranchFreeShippingRadius("");
    setBranchPhone("");
    setBranchWhatsapp("");
  }

  function handleEditBranch(branch: Branch) {
    setEditingBranchId(branch.id);
    setBranchName(branch.name);
    setBranchAddress(branch.address);
    setBranchCity(branch.city);
    setBranchProvince(branch.province);
    setBranchLat(branch.lat?.toString() ?? "");
    setBranchLng(branch.lng?.toString() ?? "");
    setBranchFreeShipping(branch.free_shipping ?? false);
    setBranchFreeShippingRadius(branch.free_shipping_radius_km?.toString() ?? "");
    setBranchPhone(branch.phone ?? "");
    setBranchWhatsapp(branch.whatsapp ?? "");
    setShowBranchForm(true);
  }

  const justSelectedRef = useRef(false);

  function handleAddressSelect(result: AddressResult) {
    justSelectedRef.current = true;
    setBranchAddress(result.address);
    if (result.city) setBranchCity(result.city);
    if (result.province) setBranchProvince(result.province);
    setBranchLat(result.lat.toString());
    setBranchLng(result.lng.toString());
  }

  async function handleSaveBranch(e: FormEvent) {
    e.preventDefault();
    if (!vendor) return;
    if (!branchLat || !branchLng) {
      setToast({ msg: "Selecciona la direccion desde Google Maps para fijar la ubicacion", type: "error" });
      return;
    }
    setSavingBranch(true);
    try {
      if (editingBranchId) {
        await updateBranch(editingBranchId, {
          name: branchName.trim(),
          address: branchAddress.trim(),
          city: branchCity.trim(),
          province: branchProvince,
          lat: branchLat ? parseFloat(branchLat) : null,
          lng: branchLng ? parseFloat(branchLng) : null,
          phone: branchPhone.trim() || null,
          whatsapp: branchWhatsapp.trim() || null,
          free_shipping: branchFreeShipping,
          free_shipping_radius_km: branchFreeShipping && branchFreeShippingRadius ? parseFloat(branchFreeShippingRadius) : null,
        });
        setToast({ msg: "Sucursal actualizada", type: "success" });
      } else {
        const b = await createBranch(vendor.id, {
          name: branchName.trim(),
          address: branchAddress.trim(),
          city: branchCity.trim(),
          province: branchProvince,
          lat: branchLat ? parseFloat(branchLat) : undefined,
          lng: branchLng ? parseFloat(branchLng) : undefined,
          phone: branchPhone.trim() || undefined,
          whatsapp: branchWhatsapp.trim() || undefined,
          free_shipping: branchFreeShipping,
          free_shipping_radius_km: branchFreeShipping && branchFreeShippingRadius ? parseFloat(branchFreeShippingRadius) : undefined,
        });
        setBranches([b, ...branches]);
        const isActive = branches.filter(br => br.is_active).length === 0;
        setToast({
          msg: isActive ? "Sucursal creada" : "Sucursal creada (inactiva)",
          type: "success"
        });
      }
      const updatedBranches = await fetchMyBranches(vendor.id);
      setBranches(updatedBranches);
      resetBranchForm();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al guardar sucursal";
      setToast({ msg: message, type: "error" });
    }
    setSavingBranch(false);
  }

  async function handleLogout() {
    await signOut();
    setUser(null);
    setVendor(null);
    setBranches([]);
  }

  if (loading) return <Spinner />;

  // ─── NO LOGUEADO: Solicitar acceso o Login ───
  if (!user) {
    // Solicitud enviada exitosamente
    if (reqSent) {
      return (
        <div className="max-w-md mx-auto space-y-6">
          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Solicitud enviada</h1>
            <p className="text-gray-400 mb-6">
              Recibimos tu solicitud. Nuestro equipo la revisara y te contactaremos por email o WhatsApp para darte acceso.
            </p>
            <button
              onClick={() => { setReqSent(false); setMode("login"); }}
              className="text-sm text-amber-400 font-medium hover:text-amber-300 transition-colors"
            >
              Ya tengo cuenta, iniciar sesion
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        <div className="bg-[#0D1117] rounded-2xl border border-gray-800 p-6 flex flex-col">
          {mode === "request" ? (
            <>
              <h1 className="text-xl font-bold text-white mb-1">Solicitar acceso</h1>
              <p className="text-sm text-gray-400 mb-6">
                Completa tus datos y te daremos acceso para publicar
              </p>

              <form onSubmit={handleRequest} className="space-y-4 flex-1">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Nombre y apellido *</label>
                  <input
                    type="text"
                    required
                    value={reqContactName}
                    onChange={(e) => setReqContactName(e.target.value)}
                    placeholder="Ej: Juan Perez"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Nombre del negocio *</label>
                  <input
                    type="text"
                    required
                    value={reqName}
                    onChange={(e) => setReqName(e.target.value)}
                    placeholder="Ej: Corralon El Norte"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    value={reqEmail}
                    onChange={(e) => setReqEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Contrasena *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={reqPassword}
                    onChange={(e) => setReqPassword(e.target.value)}
                    placeholder="Minimo 6 caracteres"
                    className="input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Telefono</label>
                    <input
                      type="tel"
                      value={reqPhone}
                      onChange={(e) => setReqPhone(e.target.value)}
                      placeholder="0387-4234567"
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">WhatsApp</label>
                    <input
                      type="text"
                      value={reqWhatsapp}
                      onChange={(e) => setReqWhatsapp(e.target.value)}
                      placeholder="5493874234567"
                      className="input"
                    />
                  </div>
                </div>
                <button type="submit" disabled={reqLoading} className="btn-primary w-full">
                  {reqLoading ? "Enviando..." : "Enviar solicitud"}
                </button>
              </form>

              <div className="mt-auto pt-4">
                <button
                  onClick={() => setMode("login")}
                  className="text-sm text-amber-400 font-medium w-full text-center hover:text-amber-300 transition-colors"
                >
                  Ya tengo cuenta, iniciar sesion
                </button>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold text-white mb-1">Iniciar sesion</h1>
              <p className="text-sm text-gray-400 mb-6">
                Accede a tu panel de vendedor
              </p>

              <form onSubmit={handleLogin} className="space-y-4 flex-1">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Contrasena</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tu contrasena"
                    className="input"
                  />
                </div>
                <button type="submit" disabled={authLoading} className="btn-primary w-full">
                  {authLoading ? "Cargando..." : "Ingresar"}
                </button>
              </form>

              <div className="mt-auto pt-4">
                <button
                  onClick={() => setMode("request")}
                  className="text-sm text-amber-400 font-medium w-full text-center hover:text-amber-300 transition-colors"
                >
                  No tengo cuenta, solicitar acceso
                </button>
              </div>
            </>
          )}
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-black flex flex-col">
          <h2 className="text-xl font-bold mb-6">Por que vender con nosotros?</h2>
          <div className="space-y-4 flex-1">
            {[
              { icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6", title: "Mas ventas", desc: "Miles de clientes buscan materiales" },
              { icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z", title: "Por zona", desc: "Clientes cerca de tu local" },
              { icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", title: "WhatsApp directo", desc: "Contacto inmediato" },
              { icon: "M13 10V3L4 14h7v7l9-11h-7z", title: "Simple y gratis", desc: "Publica en minutos" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-black/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-black/70">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-black/20">
            <p className="text-sm text-black/80 text-center">Empeza hoy, es 100% gratis</p>
          </div>
        </div>

        {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    );
  }

  // ─── LOGUEADO PERO SIN VENDOR (no deberia pasar con el nuevo flujo, pero por seguridad) ───
  if (!vendor) {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <div className="card p-8 text-center">
          <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Cuenta pendiente</h1>
          <p className="text-gray-400 mb-6">
            Tu cuenta aun no tiene un negocio vinculado. Si ya enviaste la solicitud, nuestro equipo la esta revisando.
          </p>
          <button onClick={handleLogout} className="btn-ghost">
            Cerrar sesion
          </button>
        </div>
      </div>
    );
  }

  // ─── DASHBOARD VENDEDOR (sidebar layout) ───

  const sidebarNavItems = [
    {
      key: "dashboard" as const,
      label: "Dashboard",
      icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    },
    {
      key: "profile" as const,
      label: "Mi Perfil",
      icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    },
    {
      key: "branches" as const,
      label: "Sucursales",
      icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z",
    },
    {
      key: "offers" as const,
      label: "Ofertas",
      icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-0 lg:gap-6 min-h-[calc(100vh-8rem)]">
      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 bg-[#0D1117] rounded-2xl border border-gray-800 p-4">
        <div className="mb-6">
          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Panel Vendedor</p>
          <p className="text-sm font-bold text-white mt-1 truncate">{vendor.name}</p>
        </div>
        <nav className="space-y-1 flex-1">
          {sidebarNavItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeTab === item.key
                  ? "sidebar-active text-amber-400"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50"
              }`}
            >
              <svg className="w-4.5 h-4.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {item.label}
            </button>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors mt-4 w-full"
        >
          <svg className="w-4.5 h-4.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Cerrar sesion
        </button>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden flex gap-1 overflow-x-auto pb-3 mb-3 border-b border-gray-800 scrollbar-hide">
        {sidebarNavItems.map((item) => (
          <button
            key={item.key}
            onClick={() => setActiveTab(item.key)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
              activeTab === item.key
                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                : "text-gray-400 hover:text-white bg-gray-800/50 border border-transparent"
            }`}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
            </svg>
            {item.label}
          </button>
        ))}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap text-gray-400 hover:text-red-400 bg-gray-800/50 border border-transparent flex-shrink-0"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Salir
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-6">

        {/* ── DASHBOARD TAB ── */}
        {activeTab === "dashboard" && (
          <>
            {/* Welcome */}
            <div>
              <h1 className="text-xl font-bold text-white">Bienvenido, {vendor.name}</h1>
              <p className="text-sm text-gray-400 mt-1">Resumen de tu cuenta</p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-400/20 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{branches.length}</p>
                    <p className="text-xs text-gray-400">Sucursales</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setActiveTab("offers")} className="card p-4 text-left hover:border-amber-400/50 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Ofertas</p>
                    <p className="text-xs text-gray-400">Ver ofertas</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-500 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
              <div className="card p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${vendor.is_active ? "bg-emerald-500/20" : "bg-amber-500/20"}`}>
                    {vendor.is_active ? (
                      <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Estado</p>
                    <span className={vendor.is_active ? "badge badge-success" : "badge badge-warning"}>
                      {vendor.is_active ? "Activo" : "Pendiente"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            {vendor.is_active && (
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => { resetBranchForm(); setShowBranchForm(true); setActiveTab("branches"); }}
                  className="btn-primary flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Nueva sucursal
                </button>
                <Link href="/vendor/offers" className="btn-secondary flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Gestionar ofertas
                </Link>
              </div>
            )}

            {/* Branch overview */}
            {branches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-white text-sm">Sucursales</h2>
                  <button onClick={() => setActiveTab("branches")} className="text-xs text-amber-400 font-medium hover:text-amber-300 transition-colors">
                    Ver todas
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {branches.map((b) => (
                    <div key={b.id} className={`card p-3 ${!b.is_active ? "border-amber-500/30 bg-amber-500/5" : ""}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-400/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-white truncate">{b.name}</p>
                            {!b.is_active && <span className="badge badge-warning text-xs">Inactiva</span>}
                          </div>
                          <p className="text-xs text-gray-400 truncate">{b.address}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── PROFILE TAB ── */}
        {activeTab === "profile" && (
          <>
            <div>
              <h1 className="text-xl font-bold text-white">Mi Perfil</h1>
              <p className="text-sm text-gray-400 mt-1">Informacion de tu negocio</p>
            </div>

            <div className="card p-5 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-amber-400/20 rounded-2xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-white">{vendor.name}</h2>
                  <span className={vendor.is_active ? "badge badge-success" : "badge badge-warning"}>
                    {vendor.is_active ? "Activo" : "Pendiente"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-800">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Email</p>
                  <p className="text-sm font-medium text-white">{vendor.email ?? user?.email ?? "Sin email"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Telefono</p>
                  <p className="text-sm font-medium text-white">{vendor.phone || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">WhatsApp</p>
                  <p className="text-sm font-medium text-white">{vendor.whatsapp || "—"}</p>
                </div>
              </div>
            </div>

            {/* Status card */}
            <div className={`card p-4 flex items-center gap-3 ${!vendor.is_active && "border-amber-500/30 bg-amber-500/10"}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${vendor.is_active ? "bg-emerald-500/20" : "bg-amber-500/20"}`}>
                {vendor.is_active ? (
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-white text-sm">{vendor.is_active ? "Cuenta activa" : "Pendiente de aprobacion"}</p>
                <p className="text-xs text-gray-400">{vendor.is_active ? "Podes publicar ofertas" : "Te avisaremos cuando este activa"}</p>
              </div>
              <span className={vendor.is_active ? "badge badge-success" : "badge badge-warning"}>
                {vendor.is_active ? "Activo" : "Pendiente"}
              </span>
            </div>
          </>
        )}

        {/* ── BRANCHES TAB ── */}
        {activeTab === "branches" && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-white">Mis sucursales</h1>
                <p className="text-sm text-gray-400 mt-1">{branches.length} sucursal{branches.length !== 1 ? "es" : ""} registrada{branches.length !== 1 ? "s" : ""}</p>
              </div>
              {vendor.is_active && (
                <button
                  onClick={() => { resetBranchForm(); setShowBranchForm(true); }}
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Agregar
                </button>
              )}
            </div>

            {vendor.is_active && showBranchForm && (
              <div className="card p-5">
                <h3 className="font-semibold text-white mb-2">
                  {editingBranchId ? "Editar sucursal" : "Nueva sucursal"}
                </h3>
                {!editingBranchId && branches.filter(b => b.is_active).length >= 1 && (
                  <div className="bg-amber-500/20 border border-amber-500/30 rounded-xl px-3 py-2 text-xs text-amber-400 mb-4">
                    Esta sucursal se creara <strong>inactiva</strong>. El plan gratuito incluye 1 sucursal activa. Contacta al administrador para activar mas.
                  </div>
                )}
                <form onSubmit={handleSaveBranch} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-white mb-1">Nombre *</label>
                      <input type="text" required placeholder="Ej: Casa central" value={branchName} onChange={(e) => setBranchName(e.target.value)} className="input" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-white mb-1">Direccion *</label>
                      <AddressAutocomplete
                        value={branchAddress}
                        onChange={(val) => {
                          setBranchAddress(val);
                          if (justSelectedRef.current) {
                            justSelectedRef.current = false;
                          } else {
                            setBranchLat("");
                            setBranchLng("");
                          }
                        }}
                        onSelect={handleAddressSelect}
                        placeholder="Busca la direccion en Google Maps..."
                        required
                      />
                      {branchLat && branchLng ? (
                        <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Ubicacion detectada ({branchLat}, {branchLng})
                        </p>
                      ) : branchAddress ? (
                        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          Selecciona una direccion de la lista de Google Maps para fijar la ubicacion
                        </p>
                      ) : null}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">Ciudad *</label>
                      <input type="text" required placeholder="Ej: Salta, Jujuy, Oran..." value={branchCity} onChange={(e) => setBranchCity(e.target.value)} className="input" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">Provincia</label>
                      <select value={branchProvince} onChange={(e) => setBranchProvince(e.target.value)} className="input">
                        {PROVINCES.map((p) => (<option key={p} value={p}>{p}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">Telefono</label>
                      <input type="tel" placeholder="011-4234-5678" value={branchPhone} onChange={(e) => setBranchPhone(e.target.value)} className="input" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">WhatsApp</label>
                      <input type="text" placeholder="5491112345678" value={branchWhatsapp} onChange={(e) => setBranchWhatsapp(e.target.value)} className="input" />
                    </div>
                    <div className="md:col-span-2 rounded-xl border border-gray-800 bg-gray-900/50 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🚚</span>
                          <div>
                            <p className="text-sm font-medium text-white">Envio gratis</p>
                            <p className="text-xs text-gray-400">Ofrece envio sin cargo a tus clientes</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setBranchFreeShipping(!branchFreeShipping)}
                          className={`relative w-11 h-6 rounded-full transition-colors ${branchFreeShipping ? "bg-green-500" : "bg-gray-700"}`}
                        >
                          <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${branchFreeShipping ? "translate-x-5" : ""}`} />
                        </button>
                      </div>
                      {branchFreeShipping && (
                        <div className="pt-3 border-t border-gray-800">
                          <label className="block text-sm font-medium text-white mb-2">Hasta cuantos km haces envio gratis?</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={1}
                              placeholder="Ej: 20"
                              value={branchFreeShippingRadius}
                              onChange={(e) => setBranchFreeShippingRadius(e.target.value)}
                              className="input w-28 !py-2"
                            />
                            <span className="text-sm text-gray-400">km</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={resetBranchForm} className="btn-secondary flex-1">Cancelar</button>
                    <button type="submit" disabled={savingBranch} className="btn-primary flex-1">
                      {savingBranch ? "Guardando..." : editingBranchId ? "Actualizar" : "Crear sucursal"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {branches.length === 0 && !showBranchForm ? (
              <div className="card p-6 text-center">
                <div className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </div>
                <p className="text-white font-medium">Sin sucursales</p>
                <p className="text-sm text-gray-400 mb-4">Agrega tu primera sucursal para publicar ofertas</p>
                <button onClick={() => setShowBranchForm(true)} className="btn-primary">Agregar sucursal</button>
              </div>
            ) : (
              <div className="space-y-2">
                {branches.map((b) => (
                  <div key={b.id} className={`card p-4 ${!b.is_active && "border-amber-500/30 bg-amber-500/5"}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-amber-400/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-white">{b.name}</p>
                          {!b.is_active && <span className="badge badge-warning text-xs">Inactiva</span>}
                        </div>
                        <p className="text-sm text-gray-400">{b.address}</p>
                        <p className="text-xs text-gray-400">{b.city}, {b.province}</p>
                        {b.lat && b.lng ? (
                          <p className="text-xs text-emerald-400 mt-0.5 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            Ubicacion OK
                          </p>
                        ) : (
                          <p className="text-xs text-red-400 mt-0.5 flex items-center gap-1 font-medium">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            Sin ubicacion - edita para agregar
                          </p>
                        )}
                        {b.free_shipping && (
                          <p className="text-xs text-green-400 font-medium mt-0.5">
                            Envio gratis{b.free_shipping_radius_km ? ` hasta ${b.free_shipping_radius_km} km` : ""}
                          </p>
                        )}
                      </div>
                      <button onClick={() => handleEditBranch(b)} className="text-xs text-amber-400 font-medium hover:text-amber-300 transition-colors">
                        Editar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── OFFERS TAB ── */}
        {activeTab === "offers" && (
          <>
            <div>
              <h1 className="text-xl font-bold text-white">Ofertas</h1>
              <p className="text-sm text-gray-400 mt-1">Gestiona tus productos y precios</p>
            </div>

            {branches.length > 0 ? (
              <Link href="/vendor/offers" className="card p-6 flex items-center gap-4 group hover:border-amber-400/50 transition-all">
                <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                  <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-lg font-semibold text-white">Mis ofertas</p>
                  <p className="text-sm text-gray-400">Publica y gestiona tus productos</p>
                </div>
                <svg className="w-5 h-5 text-gray-400 group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ) : (
              <div className="card p-6 text-center">
                <div className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </div>
                <p className="text-white font-medium">Primero agrega una sucursal</p>
                <p className="text-sm text-gray-400 mb-4">Necesitas al menos una sucursal para publicar ofertas</p>
                <button onClick={() => { setActiveTab("branches"); setShowBranchForm(true); }} className="btn-primary">
                  Agregar sucursal
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
