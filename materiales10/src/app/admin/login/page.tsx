"use client";

import { useState, FormEvent, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, getSession } from "@/lib/auth";
import { checkIsAdmin } from "@/lib/admin";
import { Toast, Spinner } from "@/components";

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    async function check() {
      const { user } = await getSession();
      if (user) {
        const isAdmin = await checkIsAdmin();
        if (isAdmin) {
          router.push("/admin");
          return;
        }
      }
      setChecking(false);

      // Mostrar error si viene de redirect
      const error = searchParams.get("error");
      if (error === "not_admin") {
        setToast({ msg: "No tenés permisos de administrador", type: "error" });
      }
    }
    check();
  }, [router, searchParams]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      const isAdmin = await checkIsAdmin();
      if (!isAdmin) {
        setToast({ msg: "No tenés permisos de administrador", type: "error" });
        setLoading(false);
        return;
      }
      router.push("/admin");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error de autenticación";
      setToast({ msg: message, type: "error" });
      setLoading(false);
    }
  }

  if (checking) return <Spinner />;

  return (
    <div className="max-w-sm mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-xl font-bold text-white">Admin - ConstructNOA</h1>
        <p className="text-sm text-gray-400">Panel de administración</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-white mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-1">Contraseña</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? "Verificando..." : "Ingresar"}
        </button>
      </form>

      <p className="text-center text-xs text-gray-500">
        Acceso restringido a administradores
      </p>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <AdminLoginContent />
    </Suspense>
  );
}
