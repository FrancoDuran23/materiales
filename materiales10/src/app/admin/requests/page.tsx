"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import {
  checkIsAdmin,
  fetchVendorRequests,
  approveVendorRequest,
  rejectVendorRequest,
  deleteVendorRequest,
} from "@/lib/admin";
import { Spinner, Toast } from "@/components";
import type { VendorRequest } from "@/lib/database.types";

export default function AdminRequestsPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [requests, setRequests] = useState<VendorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

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

      const r = await fetchVendorRequests();
      setRequests(r);
      setLoading(false);
    }
    init();
  }, [router]);

  async function handleApprove(req: VendorRequest) {
    if (!confirm(`Aprobar a "${req.business_name}"? Se creara como vendedor activo.`)) return;
    setProcessing(req.id);
    try {
      await approveVendorRequest(req.id);
      const r = await fetchVendorRequests();
      setRequests(r);
      setToast({ msg: `"${req.business_name}" aprobado y creado como vendedor`, type: "success" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al aprobar";
      setToast({ msg: message, type: "error" });
    }
    setProcessing(null);
  }

  async function handleReject(req: VendorRequest) {
    const reason = prompt("Motivo del rechazo (opcional):");
    if (reason === null) return; // cancelled
    setProcessing(req.id);
    try {
      await rejectVendorRequest(req.id, reason || undefined);
      const r = await fetchVendorRequests();
      setRequests(r);
      setToast({ msg: `Solicitud de "${req.business_name}" rechazada`, type: "success" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al rechazar";
      setToast({ msg: message, type: "error" });
    }
    setProcessing(null);
  }

  async function handleDelete(req: VendorRequest) {
    if (!confirm(`Eliminar solicitud de "${req.business_name}"?`)) return;
    try {
      await deleteVendorRequest(req.id);
      setRequests(requests.filter((r) => r.id !== req.id));
      setToast({ msg: "Solicitud eliminada", type: "success" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error";
      setToast({ msg: message, type: "error" });
    }
  }

  if (loading) return <Spinner />;
  if (!isAdmin) return null;

  const pending = requests.filter((r) => r.status === "pending");
  const others = requests.filter((r) => r.status !== "pending");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="section-title">Administracion</p>
          <h1 className="text-xl font-bold text-white">Solicitudes de acceso</h1>
        </div>
        <Link href="/admin" className="btn-ghost text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Dashboard
        </Link>
      </div>

      {/* Pending */}
      {pending.length > 0 && (
        <div className="space-y-3">
          <div className="bg-amber-400/10 border border-amber-400/30 rounded-xl px-4 py-2 text-sm text-amber-400">
            <strong>{pending.length}</strong> solicitud(es) pendiente(s)
          </div>
          {pending.map((req) => (
            <div key={req.id} className="card p-4 border-amber-400/30 bg-amber-400/5">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium text-white">{req.business_name}</p>
                  <p className="text-sm text-gray-400 mt-1">{req.email}</p>
                  {req.phone && <p className="text-xs text-gray-400">Tel: {req.phone}</p>}
                  {req.whatsapp && <p className="text-xs text-gray-400">WA: {req.whatsapp}</p>}
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(req.created_at).toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <span className="badge badge-warning">Pendiente</span>
              </div>
              <div className="flex gap-3 mt-3 pt-3 border-t border-gray-800">
                <button
                  onClick={() => handleApprove(req)}
                  disabled={processing === req.id}
                  className="text-xs text-emerald-400 font-medium hover:underline disabled:opacity-50"
                >
                  {processing === req.id ? "Procesando..." : "Aprobar"}
                </button>
                <button
                  onClick={() => handleReject(req)}
                  disabled={processing === req.id}
                  className="text-xs text-amber-400 font-medium hover:underline disabled:opacity-50"
                >
                  Rechazar
                </button>
                <button
                  onClick={() => handleDelete(req)}
                  className="text-xs text-red-500 font-medium hover:underline"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No pending */}
      {pending.length === 0 && (
        <div className="card p-8 text-center">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-white font-medium">Sin solicitudes pendientes</p>
          <p className="text-sm text-gray-400">Todas las solicitudes fueron procesadas</p>
        </div>
      )}

      {/* History */}
      {others.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-white text-sm">Historial</h2>
          {others.map((req) => (
            <div key={req.id} className="card p-4 opacity-70">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-white">{req.business_name}</p>
                  <p className="text-xs text-gray-400">{req.email}</p>
                  {req.admin_notes && (
                    <p className="text-xs text-gray-500 mt-1">Nota: {req.admin_notes}</p>
                  )}
                </div>
                <span
                  className={
                    req.status === "approved"
                      ? "badge badge-success"
                      : "badge bg-red-500/20 text-red-400"
                  }
                >
                  {req.status === "approved" ? "Aprobado" : "Rechazado"}
                </span>
              </div>
              <div className="flex gap-3 mt-2 pt-2 border-t border-gray-800">
                <button
                  onClick={() => handleDelete(req)}
                  className="text-xs text-red-500 font-medium hover:underline"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
