"use client";

import { useEffect, useState, FormEvent } from "react";
import { getSession, signIn, signUp, signOut } from "@/lib/auth";
import { fetchMyVendor, createVendor, fetchMyBranches, createBranch, updateBranch, claimVendorByEmail } from "@/lib/vendor";
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

  // Login form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Vendor form
  const [vendorName, setVendorName] = useState("");
  const [vendorPhone, setVendorPhone] = useState("");
  const [vendorWhatsapp, setVendorWhatsapp] = useState("");
  const [creatingVendor, setCreatingVendor] = useState(false);

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

  async function handleAuth(e: FormEvent) {
    e.preventDefault();
    setAuthLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
        setToast({ msg: "Cuenta creada. Revisá tu email para confirmar.", type: "success" });
      } else {
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
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error de autenticación";
      setToast({ msg: message, type: "error" });
    }
    setAuthLoading(false);
  }

  async function handleCreateVendor(e: FormEvent) {
    e.preventDefault();
    if (!vendorName.trim() || !user) return;
    setCreatingVendor(true);
    try {
      const v = await createVendor(
        user.id,
        vendorName.trim(),
        user.email,
        vendorPhone.trim(),
        vendorWhatsapp.trim()
      );
      setVendor(v);
      setToast({ msg: "Negocio registrado. Pendiente de aprobación.", type: "success" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al crear negocio";
      setToast({ msg: message, type: "error" });
    }
    setCreatingVendor(false);
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

  function handleAddressSelect(result: AddressResult) {
    setBranchAddress(result.address);
    if (result.city) setBranchCity(result.city);
    if (result.province) setBranchProvince(result.province);
    setBranchLat(result.lat.toString());
    setBranchLng(result.lng.toString());
  }

  async function handleSaveBranch(e: FormEvent) {
    e.preventDefault();
    if (!vendor) return;
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

  // LOGIN / REGISTRO
  if (!user) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        <div className="card p-6 flex flex-col">
          <h1 className="text-xl font-bold text-white mb-1">
            {isSignUp ? "Crear cuenta" : "Iniciar sesión"}
          </h1>
          <p className="text-sm text-gray-400 mb-6">
            {isSignUp ? "Registrate y empezá a vender" : "Accedé a tu panel de vendedor"}
          </p>

          <form onSubmit={handleAuth} className="space-y-4 flex-1">
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
              <label className="block text-sm font-medium text-white mb-2">Contraseña</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignUp ? "Mínimo 6 caracteres" : "••••••••"}
                className="input"
              />
            </div>
            <button type="submit" disabled={authLoading} className="btn-primary w-full">
              {authLoading ? "Cargando..." : isSignUp ? "Crear cuenta" : "Ingresar"}
            </button>
          </form>

          <div className="mt-auto pt-4">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-amber-400 font-medium w-full text-center hover:text-amber-300 transition-colors"
            >
              {isSignUp ? "Ya tengo cuenta" : "Crear cuenta nueva"}
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-black flex flex-col">
          <h2 className="text-xl font-bold mb-6">¿Por qué vender con nosotros?</h2>
          <div className="space-y-4 flex-1">
            {[
              { icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6", title: "Más ventas", desc: "Miles de clientes buscan materiales" },
              { icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z", title: "Por zona", desc: "Clientes cerca de tu local" },
              { icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z", title: "WhatsApp directo", desc: "Contacto inmediato" },
              { icon: "M13 10V3L4 14h7v7l9-11h-7z", title: "Simple y gratis", desc: "Publicá en minutos" },
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
            <p className="text-sm text-black/80 text-center">Empezá hoy, es 100% gratis</p>
          </div>
        </div>

        {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    );
  }

  // CREAR NEGOCIO
  if (!vendor) {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Registrar negocio</h1>
            <p className="text-sm text-gray-400">Último paso para empezar</p>
          </div>
          <button onClick={handleLogout} className="btn-ghost">
            Salir
          </button>
        </div>

        <div className="card p-6">
          <form onSubmit={handleCreateVendor} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Nombre del negocio *</label>
              <input
                type="text"
                required
                placeholder="Ej: Corralón El Norte"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className="input"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Teléfono</label>
                <input
                  type="tel"
                  placeholder="Opcional"
                  value={vendorPhone}
                  onChange={(e) => setVendorPhone(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">WhatsApp</label>
                <input
                  type="text"
                  placeholder="Opcional"
                  value={vendorWhatsapp}
                  onChange={(e) => setVendorWhatsapp(e.target.value)}
                  className="input"
                />
              </div>
            </div>
            <button type="submit" disabled={creatingVendor} className="btn-primary w-full">
              {creatingVendor ? "Registrando..." : "Registrar negocio"}
            </button>
          </form>
        </div>

        <div className="bg-amber-400/20 border border-amber-400/30 rounded-xl p-4 flex gap-3">
          <div className="text-amber-400 mt-0.5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-sm">
            <p className="font-medium text-white">¿Qué sigue?</p>
            <p className="text-gray-400 mt-1">Nuestro equipo revisará tu registro y te habilitará para publicar.</p>
          </div>
        </div>

        {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    );
  }

  // DASHBOARD VENDEDOR
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="section-title">Panel vendedor</p>
          <h1 className="text-xl font-bold text-white">{vendor.name}</h1>
        </div>
        <button onClick={handleLogout} className="btn-ghost">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Salir
        </button>
      </div>

      {/* Perfil */}
      <div className="card p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-400/20 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-white">{vendor.name}</p>
            <p className="text-xs text-gray-400">{vendor.email ?? user?.email ?? "Sin email"}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-800">
          <div>
            <p className="text-xs text-gray-400">Teléfono</p>
            <p className="text-sm font-medium text-white">{vendor.phone || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">WhatsApp</p>
            <p className="text-sm font-medium text-white">{vendor.whatsapp || "—"}</p>
          </div>
        </div>
      </div>

      {/* Status */}
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
          <p className="font-medium text-white text-sm">{vendor.is_active ? "Cuenta activa" : "Pendiente de aprobación"}</p>
          <p className="text-xs text-gray-400">{vendor.is_active ? "Podés publicar ofertas" : "Te avisaremos cuando esté activa"}</p>
        </div>
        <span className={vendor.is_active ? "badge badge-success" : "badge badge-warning"}>
          {vendor.is_active ? "Activo" : "Pendiente"}
        </span>
      </div>

      {vendor.is_active && (
        <>
          {/* Sucursales */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-white">Mis sucursales</h2>
              <button
                onClick={() => { resetBranchForm(); setShowBranchForm(true); }}
                className="text-sm text-amber-400 font-medium hover:text-amber-300 transition-colors"
              >
                + Agregar
              </button>
            </div>

            {showBranchForm && (
              <div className="card p-5 mb-4">
                <h3 className="font-semibold text-white mb-2">
                  {editingBranchId ? "Editar sucursal" : "Nueva sucursal"}
                </h3>
                {!editingBranchId && branches.filter(b => b.is_active).length >= 1 && (
                  <div className="bg-amber-500/20 border border-amber-500/30 rounded-xl px-3 py-2 text-xs text-amber-400 mb-4">
                    Esta sucursal se creará <strong>inactiva</strong>. El plan gratuito incluye 1 sucursal activa. Contactá al administrador para activar más.
                  </div>
                )}
                <form onSubmit={handleSaveBranch} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-white mb-1">Nombre *</label>
                      <input type="text" required placeholder="Ej: Casa central" value={branchName} onChange={(e) => setBranchName(e.target.value)} className="input" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-white mb-1">Dirección *</label>
                      <AddressAutocomplete
                        value={branchAddress}
                        onChange={setBranchAddress}
                        onSelect={handleAddressSelect}
                        placeholder="Buscá la dirección en Google Maps..."
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">Ciudad *</label>
                      <input type="text" required placeholder="Ej: Salta, Jujuy, Orán..." value={branchCity} onChange={(e) => setBranchCity(e.target.value)} className="input" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">Provincia</label>
                      <select value={branchProvince} onChange={(e) => setBranchProvince(e.target.value)} className="input">
                        {PROVINCES.map((p) => (<option key={p} value={p}>{p}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">Teléfono</label>
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
                            <p className="text-sm font-medium text-white">Envío gratis</p>
                            <p className="text-xs text-gray-400">Ofrecé envío sin cargo a tus clientes</p>
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
                          <label className="block text-sm font-medium text-white mb-2">¿Hasta cuántos km hacés envío gratis?</label>
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
                <p className="text-sm text-gray-400 mb-4">Agregá tu primera sucursal para publicar ofertas</p>
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
                        {b.free_shipping && (
                          <p className="text-xs text-green-400 font-medium mt-0.5">
                            Envío gratis{b.free_shipping_radius_km ? ` hasta ${b.free_shipping_radius_km} km` : ""}
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
          </div>

          {branches.length > 0 && (
            <Link href="/vendor/offers" className="card p-5 flex items-center gap-4 group hover:border-amber-400/50 transition-all">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">Mis ofertas</p>
                <p className="text-sm text-gray-400">Publicá y gestioná tus productos</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </>
      )}

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
