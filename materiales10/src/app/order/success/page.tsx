"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function SuccessContent() {
  const params = useSearchParams();
  const orderId = params.get("order_id");

  return (
    <div className="text-center py-12 space-y-4">
      <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
        <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-white">Reserva enviada</h1>
      <p className="text-gray-400">
        Tu reserva fue registrada. El vendedor se contactará con vos para coordinar.
      </p>
      {orderId && (
        <p className="text-xs text-gray-500">
          ID de reserva: <span className="font-mono text-gray-400">{orderId.slice(0, 8)}</span>
        </p>
      )}
      <div className="flex gap-3 justify-center mt-6">
        <Link href="/" className="btn-primary">
          Volver al inicio
        </Link>
        <Link href="/search" className="btn-secondary">
          Seguir buscando
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-gray-400">Cargando...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
