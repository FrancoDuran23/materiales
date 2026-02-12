"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import {
  checkIsAdmin,
  fetchAllVendors,
  fetchAllBranches,
  createBranchByAdmin,
  updateBranch,
  deleteBranch,
} from "@/lib/admin";
import { PROVINCES } from "@/lib/constants";
import { Spinner, Toast } from "@/components";
import type { Vendor, Branch } from "@/lib/database.types";

export default function AdminBranchesPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [branches, setBranches] = useState<(Branch & { vendor_name: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Form
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [vendorId, setVendorId] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState(PROVINCES[0]);
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  useEffect(() => {
    async function init() {
      const { user } = await getSession();
      if (!user) {
        router.push("/admin/login");
        return;
      }
      const admin = await checkIsAdmin();
      if (!admin) {
        router.push("/admin/login?error=not_admin");
        return;
      }
      setIsAdmin(true);

      const [v, b] = await Promise.all([fetchAllVendors(), fetchAllBranches()]);
      setVendors(v);
      setBranches(b);
      if (v.length > 0) setVendorId(v[0].id);
      setLoading(false);
    }
    init();
  }, [router]);

  function resetForm() {
    setShowForm(false);
    setEditingId(null);
    setName("");
    setAddress("");
    setCity("");
    setProvince(PROVINCES[0]);
    setLat("");
    setLng("");
    setPhone("");
    setWhatsapp("");
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!vendorId || !name.trim() || !address.trim() || !city.trim()) return;

    setSaving(true);
    try {
      if (editingId) {
        await updateBranch(editingId, {
          name: name.trim(),
          address: address.trim(),
          city: city.trim(),
          province,
          lat: lat ? parseFloat(lat) : null,
          lng: lng ? parseFloat(lng) : null,
          phone: phone.trim() || null,
          whatsapp: whatsapp.trim() || null,
        });
        setToast({ msg: "Sucursal actualizada", type: "success" });
      } else {
        await createBranchByAdmin({
          vendor_id: vendorId,
          name: name.trim(),
          address: address.trim(),
          city: city.trim(),
          province,
          lat: lat ? parseFloat(lat) : undefined,
          lng: lng ? parseFloat(lng) : undefined,
          phone: phone.trim() || undefined,
          whatsapp: whatsapp.trim() || undefined,
        });
        setToast({ msg: "Sucursal creada", type: "success" });
      }

      const b = await fetchAllBranches();
      setBranches(b);
      resetForm();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error";
      setToast({ msg: message, type: "error" });
    }
    setSaving(false);
  }

  function handleEdit(branch: Branch & { vendor_name: string }) {
    setEditingId(branch.id);
    setVendorId(branch.vendor_id);
    setName(branch.name);
    setAddress(branch.address);
    setCity(branch.city);
    setProvince(branch.province);
    setLat(branch.lat?.toString() ?? "");
    setLng(branch.lng?.toString() ?? "");
    setPhone(branch.phone ?? "");
    setWhatsapp(branch.whatsapp ?? "");
    setShowForm(true);
  }

  async function handleToggleActive(branch: Branch) {
    try {
      await updateBranch(branch.id, { is_active: !branch.is_active });
      const b = await fetchAllBranches();
      setBranches(b);
      setToast({ msg: branch.is_active ? "Sucursal desactivada" : "Sucursal activada", type: "success" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error";
      setToast({ msg: message, type: "error" });
    }
  }

  async function handleDelete(branchId: string) {
    if (!confirm("¿Eliminar esta sucursal y todas sus ofertas?")) return;
    try {
      await deleteBranch(branchId);
      setBranches(branches.filter((b) => b.id !== branchId));
      setToast({ msg: "Sucursal eliminada", type: "success" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error";
      setToast({ msg: message, type: "error" });
    }
  }

  if (loading) return <Spinner />;
  if (!isAdmin) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="section-title">Administración</p>
          <h1 className="text-xl font-bold text-white">Sucursales</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin" className="btn-ghost text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Dashboard
          </Link>
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="btn-primary text-sm !px-4 !py-2"
          >
            {showForm ? "Cancelar" : "+ Nueva sucursal"}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="card p-5 space-y-4">
          <h2 className="font-semibold text-white">
            {editingId ? "Editar sucursal" : "Nueva sucursal"}
          </h2>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Vendedor *</label>
            <select
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              disabled={!!editingId}
              className="input disabled:bg-gray-800 disabled:opacity-60"
            >
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Nombre *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Casa Central"
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Dirección *</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Av. Entre Ríos 1500"
              className="input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Ciudad *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ej: Buenos Aires, Córdoba..."
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Provincia</label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="input"
              >
                {PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Latitud</label>
              <input
                type="text"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="-24.7821"
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">Longitud</label>
              <input
                type="text"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="-65.4232"
                className="input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-white mb-2">Teléfono</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0387-4234567"
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">WhatsApp</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="5493874234567"
                className="input"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full"
          >
            {saving ? "Guardando..." : editingId ? "Actualizar" : "Crear sucursal"}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {branches.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="w-12 h-12 bg-amber-400/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
            </div>
            <p className="text-white font-medium">Sin sucursales</p>
            <p className="text-sm text-gray-400">Agregá la primera sucursal</p>
          </div>
        ) : (
          branches.map((b) => (
            <div
              key={b.id}
              className={`card p-4 ${!b.is_active && "bg-amber-400/10 border-amber-400/30"}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-white">{b.name}</p>
                  <p className="text-xs text-amber-400 font-medium">{b.vendor_name}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {b.address}, {b.city}, {b.province}
                  </p>
                  {b.phone && <p className="text-xs text-gray-400">Tel: {b.phone}</p>}
                </div>
                <span className={b.is_active ? "badge badge-success" : "badge badge-warning"}>
                  {b.is_active ? "Activa" : "Inactiva"}
                </span>
              </div>
              <div className="flex gap-3 mt-3 pt-3 border-t border-gray-800">
                <button onClick={() => handleEdit(b)} className="text-xs text-amber-400 font-medium hover:underline">
                  Editar
                </button>
                <button
                  onClick={() => handleToggleActive(b)}
                  className={`text-xs font-medium hover:underline ${b.is_active ? "text-amber-600" : "text-emerald-600"}`}
                >
                  {b.is_active ? "Desactivar" : "Activar"}
                </button>
                <button
                  onClick={() => handleDelete(b.id)}
                  className="text-xs text-red-500 font-medium hover:underline"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
