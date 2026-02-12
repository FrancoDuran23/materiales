"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Redirige a /vendor donde está el login integrado
export default function VendorLoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/vendor");
  }, [router]);

  return null;
}
