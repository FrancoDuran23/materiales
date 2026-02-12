"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import {
  checkIsAdmin,
  fetchAllVendors,
  createVendorByAdmin,
  updateVendor,
  deleteVendor,
  checkEmailExists,
  updateVendorBranchesStatus,
  fetchVendorBranches,
  updateBranch,
  deleteBranch,
} from "@/lib/admin";
import { Spinner, Toast } from "@/components";
import type { Vendor, Branch } from "@/lib/database.types";

export default function AdminVendorsPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Form
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  // Branches expandidas por vendor
  const [expandedVendor, setExpandedVendor] = useState<string | null>(null);
  const [vendorBranches, setVendorBranches] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);

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

      const v = await fetchAllVendors();
      setVendors(v);
      setLoading(false);
    }
    init();
  }, [router]);

  function resetForm() {
    setShowForm(false);
    setEditingId(null);
    setName("");
    setEmail("");
    setPhone("");
    setWhatsapp("");
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      // Validar email único si se proporciona
      if (email.trim()) {
        const emailExists = await checkEmailExists(email.trim(), editingId ?? undefined);
        if (emailExists) {
          setToast({ msg: "Este email ya está registrado para otro vendedor", type: "error" });
          setSaving(false);
          return;
        }
      }

      if (editingId) {
        await updateVendor(editingId, {
          name: name.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          whatsapp: whatsapp.trim() || undefined,
        });
        setToast({ msg: "Vendedor actualizado", type: "success" });
      } else {
        await createVendorByAdmin({
          name: name.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          whatsapp: whatsapp.trim() || undefined,
        });
        setToast({ msg: "Vendedor creado", type: "success" });
      }

      const v = await fetchAllVendors();
      setVendors(v);
      resetForm();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error";
      setToast({ msg: message, type: "error" });
    }
    setSaving(false);
  }

  function handleEdit(vendor: Vendor) {
    setEditingId(vendor.id);
    setName(vendor.name);
    setEmail(vendor.email ?? "");
    setPhone(vendor.phone ?? "");
    setWhatsapp(vendor.whatsapp ?? "");
    setShowForm(true);
  }

  async function handleToggleActive(vendor: Vendor) {
    try {
      const newStatus = !vendor.is_active;
      await updateVendor(vendor.id, { is_active: newStatus });

      // Si se desactiva el vendedor, desactivar todas sus sucursales
      if (!newStatus) {
        await updateVendorBranchesStatus(vendor.id, false);
      }

      const v = await fetchAllVendors();
      setVendors(v);
      setToast({
        msg: newStatus
          ? "Vendedor aprobado y activado"
          : "Vendedor y todas sus sucursales desactivados",
        type: "success"
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error";
      setToast({ msg: message, type: "error" });
    }
  }

  async function handleDelete(vendorId: string) {
    if (!confirm("¿Eliminar este vendedor y todas sus sucursales y ofertas?")) return;
    try {
      await deleteVendor(vendorId);
      setVendors(vendors.filter((v) => v.id !== vendorId));
      setToast({ msg: "Vendedor eliminado", type: "success" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error";
      setToast({ msg: message, type: "error" });
    }
  }

  // ─── Branches ───

  async function handleExpandVendor(vendorId: string) {
    if (expandedVendor === vendorId) {
      setExpandedVendor(null);
      setVendorBranches([]);
      return;
    }

    setExpandedVendor(vendorId);
    setLoadingBranches(true);
    const branches = await fetchVendorBranches(vendorId);
    setVendorBranches(branches);
    setLoadingBranches(false);
  }

  async function handleToggleBranchActive(branch: Branch) {
    try {
      await updateBranch(branch.id, { is_active: !branch.is_active });
      const branches = await fetchVendorBranches(branch.vendor_id);
      setVendorBranches(branches);
      setToast({
        msg: branch.is_active ? "Sucursal desactivada" : "Sucursal activada",
        type: "success"
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error";
      setToast({ msg: message, type: "error" });
    }
  }

  async function handleDeleteBranch(branch: Branch) {
    if (!confirm("¿Eliminar esta sucursal y todas sus ofertas?")) return;
    try {
      await deleteBranch(branch.id);
      const branches = await fetchVendorBranches(branch.vendor_id);
      setVendorBranches(branches);
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="section-title">Administración</p>
          <h1 className="text-xl font-bold text-white">Vendedores</h1>
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
            {showForm ? "Cancelar" : "+ Nuevo vendedor"}
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSave} className="card p-5 space-y-4">
          <h2 className="font-semibold text-white">
            {editingId ? "Editar vendedor" : "Nuevo vendedor"}
          </h2>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Nombre del negocio *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Corralón El Norte"
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Email (para login)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vendedor@email.com"
              className="input"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              El vendedor usará este email para acceder a su panel
            </p>
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
            {saving ? "Guardando..." : editingId ? "Actualizar" : "Crear vendedor"}
          </button>
        </form>
      )}

      {/* List */}
      <div className="space-y-3">
        {/* Contador de pendientes */}
        {vendors.filter(v => !v.is_active).length > 0 && (
          <div className="bg-amber-400/10 border border-amber-400/30 rounded-xl px-4 py-2 text-sm text-amber-400">
            <strong>{vendors.filter(v => !v.is_active).length}</strong> vendedor(es) pendiente(s) de aprobación
          </div>
        )}
        {vendors.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="w-12 h-12 bg-amber-400/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-white font-medium">Sin vendedores</p>
            <p className="text-sm text-gray-400">Agregá el primer vendedor</p>
          </div>
        ) : (
          vendors.map((v) => (
            <div key={v.id} className="space-y-0">
              <div
                className={`card p-4 ${!v.is_active && "bg-amber-400/10 border-amber-400/30"} ${expandedVendor === v.id && "rounded-b-none border-b-0"}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white">{v.name}</p>
                      <button
                        onClick={() => handleExpandVendor(v.id)}
                        className="text-xs text-amber-400 hover:text-amber-400 flex items-center gap-1"
                      >
                        <svg className={`w-4 h-4 transition-transform ${expandedVendor === v.id ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        Sucursales
                      </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{v.email ?? "Sin email asignado"}</p>
                    {v.phone && <p className="text-xs text-gray-400">Tel: {v.phone}</p>}
                    {v.owner_id && <p className="text-xs text-emerald-600">Vinculado a usuario</p>}
                  </div>
                  <span className={v.is_active ? "badge badge-success" : "badge badge-warning"}>
                    {v.is_active ? "Activo" : "Pendiente"}
                  </span>
                </div>
                <div className="flex gap-3 mt-3 pt-3 border-t border-gray-800">
                  <button onClick={() => handleEdit(v)} className="text-xs text-amber-400 font-medium hover:underline">
                    Editar
                  </button>
                  <button
                    onClick={() => handleToggleActive(v)}
                    className={`text-xs font-medium hover:underline ${v.is_active ? "text-amber-600" : "text-emerald-600"}`}
                  >
                    {v.is_active ? "Desactivar" : "Aprobar"}
                  </button>
                  <button
                    onClick={() => handleDelete(v.id)}
                    className="text-xs text-red-500 font-medium hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              </div>

              {/* Sucursales expandidas */}
              {expandedVendor === v.id && (
                <div className="bg-gray-800/50 border-2 border-t-0 border-gray-800 rounded-b-3xl p-4 space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-white">Sucursales de {v.name}</p>
                    <Link
                      href={`/admin/branches?vendor=${v.id}`}
                      className="text-xs text-amber-400 hover:text-amber-400"
                    >
                      + Agregar
                    </Link>
                  </div>

                  {loadingBranches ? (
                    <div className="py-4 text-center text-sm text-gray-400">Cargando...</div>
                  ) : vendorBranches.length === 0 ? (
                    <div className="py-4 text-center text-sm text-gray-400">
                      Sin sucursales
                    </div>
                  ) : (
                    vendorBranches.map((b) => (
                      <div
                        key={b.id}
                        className={`bg-gray-900 rounded-xl p-3 border ${b.is_active ? "border-gray-800" : "border-amber-400/30 bg-amber-400/10/50"}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-white">{b.name}</p>
                            <p className="text-xs text-gray-400">{b.address}, {b.city}</p>
                            {b.phone && <p className="text-xs text-gray-400">Tel: {b.phone}</p>}
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${b.is_active ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
                            {b.is_active ? "Activa" : "Inactiva"}
                          </span>
                        </div>
                        <div className="flex gap-3 mt-2 pt-2 border-t border-gray-800/50">
                          <button
                            onClick={() => handleToggleBranchActive(b)}
                            className={`text-xs font-medium hover:underline ${b.is_active ? "text-amber-600" : "text-emerald-600"}`}
                          >
                            {b.is_active ? "Desactivar" : "Activar"}
                          </button>
                          <button
                            onClick={() => handleDeleteBranch(b)}
                            className="text-xs text-red-500 font-medium hover:underline"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))
                  )}

                  {/* Info sobre límite de sucursales */}
                  {vendorBranches.length > 0 && (
                    <div className="text-xs text-gray-400 pt-2 border-t border-gray-800/50">
                      {vendorBranches.filter(b => b.is_active).length} sucursal(es) activa(s).
                      {vendorBranches.filter(b => b.is_active).length > 1 && (
                        <span className="text-amber-600 ml-1">Plan premium requerido.</span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
