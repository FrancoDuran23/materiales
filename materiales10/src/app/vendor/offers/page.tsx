"use client";

import { useEffect, useState, FormEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getSession } from "@/lib/auth";
import {
  fetchMyVendor,
  fetchMyBranches,
  fetchProducts,
  fetchMyOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  uploadOfferImage,
  type OfferWithProduct,
} from "@/lib/vendor";
import { STOCK_LABELS } from "@/lib/constants";
import { Spinner, Toast } from "@/components";
import type { Branch, Product, StockStatus } from "@/lib/database.types";
import type { User } from "@supabase/supabase-js";

export default function VendorOffersPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<OfferWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Form
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [price, setPrice] = useState("");
  const [stockStatus, setStockStatus] = useState<StockStatus>("disponible");

  // Image
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function init() {
      const { user: u } = await getSession();
      if (!u) {
        router.push("/vendor/login");
        return;
      }
      setUser(u);

      const v = await fetchMyVendor(u.id);
      if (!v) {
        router.push("/vendor");
        return;
      }

      const [b, p] = await Promise.all([fetchMyBranches(v.id), fetchProducts()]);
      setBranches(b);
      setProducts(p);

      if (b.length > 0) {
        setSelectedBranch(b[0].id);
        const o = await fetchMyOffers(b.map((br) => br.id));
        setOffers(o);
      }

      setLoading(false);
    }
    init();
  }, [router]);

  // Search products from DB when typing
  useEffect(() => {
    if (!productSearch.trim() || selectedProduct) return;
    const timeout = setTimeout(async () => {
      const results = await fetchProducts(productSearch);
      setProducts(results);
    }, 300);
    return () => clearTimeout(timeout);
  }, [productSearch, selectedProduct]);

  const filteredProducts = products;

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  function clearImage() {
    setImageFile(null);
    setImagePreview(null);
    setExistingImageUrl(null);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!selectedBranch || !selectedProduct || !price) {
      setToast({ msg: "Completá todos los campos", type: "error" });
      return;
    }

    setSaving(true);
    try {
      let imageUrl: string | null = existingImageUrl;

      if (imageFile) {
        setUploadingImage(true);
        imageUrl = await uploadOfferImage(imageFile);
        setUploadingImage(false);
      }

      if (editingId) {
        await updateOffer(editingId, {
          price: parseFloat(price),
          stock_status: stockStatus,
          image_url: imageUrl,
        });
      } else {
        await createOffer(selectedBranch, selectedProduct, parseFloat(price), stockStatus, imageUrl);
      }

      // Reload offers
      const o = await fetchMyOffers(branches.map((b) => b.id));
      setOffers(o);
      resetForm();
      setToast({ msg: editingId ? "Oferta actualizada" : "Oferta creada", type: "success" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al guardar";
      setToast({ msg: message, type: "error" });
    }
    setSaving(false);
    setUploadingImage(false);
  }

  function resetForm() {
    setShowForm(false);
    setEditingId(null);
    setSelectedProduct("");
    setProductSearch("");
    setPrice("");
    setStockStatus("disponible");
    setImageFile(null);
    setImagePreview(null);
    setExistingImageUrl(null);
  }

  function handleEdit(offer: OfferWithProduct) {
    setEditingId(offer.id);
    setSelectedBranch(offer.branch_id);
    setSelectedProduct(offer.product_id);
    setProductSearch(offer.product.name);
    setPrice(offer.price.toString());
    setStockStatus(offer.stock_status);
    setExistingImageUrl(offer.image_url ?? null);
    setImageFile(null);
    setImagePreview(null);
    setShowForm(true);
  }

  async function handleDelete(offerId: string) {
    if (!confirm("¿Eliminar esta oferta?")) return;
    try {
      await deleteOffer(offerId);
      setOffers(offers.filter((o) => o.id !== offerId));
      setToast({ msg: "Oferta eliminada", type: "success" });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al eliminar";
      setToast({ msg: message, type: "error" });
    }
  }

  if (loading) return <Spinner />;

  const currentImage = imagePreview || existingImageUrl;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="section-title">Panel vendedor</p>
          <h1 className="text-xl font-bold text-white">Mis ofertas</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/vendor" className="btn-ghost text-sm">
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
            {showForm ? "Cancelar" : "+ Nueva oferta"}
          </button>
        </div>
      </div>

      {branches.length === 0 && (
        <div className="bg-amber-400/10 border border-amber-400/30 rounded-2xl p-4 flex gap-3">
          <div className="text-amber-400 mt-0.5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-sm text-amber-400">
            Necesitás crear al menos una sucursal antes de publicar ofertas.{" "}
            <Link href="/vendor" className="underline font-medium">
              Ir al dashboard
            </Link>
          </div>
        </div>
      )}

      {/* Offer form */}
      {showForm && branches.length > 0 && (
        <form onSubmit={handleSave} className="card p-5">
          <h2 className="font-semibold text-white mb-4">{editingId ? "Editar oferta" : "Nueva oferta"}</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Columna izquierda - Imagen */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-white mb-2">Foto</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square bg-gray-800 rounded-2xl border-2 border-dashed border-gray-700 flex flex-col items-center justify-center cursor-pointer hover:border-amber-400 hover:bg-amber-400/10 transition-all overflow-hidden"
              >
                {currentImage ? (
                  <Image src={currentImage} alt="Preview" width={200} height={200} className="w-full h-full object-cover" />
                ) : (
                  <>
                    <svg className="w-10 h-10 text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-500">Click para subir</span>
                    <span className="text-xs text-gray-600 mt-1">JPG, PNG, WebP</span>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              {currentImage && (
                <button
                  type="button"
                  onClick={clearImage}
                  className="text-xs text-red-400 mt-2 hover:underline w-full text-center"
                >
                  Quitar imagen
                </button>
              )}
            </div>

            {/* Columna derecha - Datos */}
            <div className="md:col-span-2 space-y-4">
              {/* Sucursal */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">Sucursal</label>
                <select
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  disabled={!!editingId}
                  className="input disabled:bg-gray-800 disabled:opacity-60"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} - {b.city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Producto */}
              <div>
                <label className="block text-sm font-medium text-white mb-1">Producto</label>
                <input
                  type="text"
                  placeholder="Buscar en el catálogo..."
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    if (selectedProduct) setSelectedProduct("");
                  }}
                  disabled={!!editingId}
                  className="input disabled:bg-gray-800 disabled:opacity-60"
                />
                {productSearch && !selectedProduct && filteredProducts.length > 0 && (
                  <div className="border border-gray-800 rounded-xl mt-2 max-h-32 overflow-y-auto bg-gray-900 shadow-lg">
                    {filteredProducts.slice(0, 10).map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => {
                          setSelectedProduct(p.id);
                          setProductSearch(p.name);
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-800 transition border-b border-gray-800 last:border-0 text-white"
                      >
                        {p.name} <span className="text-gray-400">({p.unit})</span>
                      </button>
                    ))}
                  </div>
                )}
                {selectedProduct && !editingId && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="badge badge-success">
                      {products.find((p) => p.id === selectedProduct)?.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProduct("");
                        setProductSearch("");
                      }}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Cambiar
                    </button>
                  </div>
                )}
              </div>

              {/* Precio y Stock */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Precio ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="input text-lg font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Disponibilidad</label>
                  <select
                    value={stockStatus}
                    onChange={(e) => setStockStatus(e.target.value as StockStatus)}
                    className="input"
                  >
                    <option value="disponible">Disponible</option>
                    <option value="consultar">Consultar</option>
                    <option value="sin_stock">Sin stock</option>
                  </select>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-ghost flex-1"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || (!editingId && !selectedProduct)}
                  className="btn-primary flex-1"
                >
                  {uploadingImage ? "Subiendo..." : saving ? "Guardando..." : editingId ? "Actualizar" : "Publicar"}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Offers list */}
      {offers.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-white font-medium">Sin ofertas</p>
          <p className="text-sm text-gray-400">Publicá tu primera oferta para empezar a vender</p>
        </div>
      ) : (
        <div className="space-y-3">
          {offers.map((offer) => {
            const stockLabel = STOCK_LABELS[offer.stock_status] ?? offer.stock_status;
            const badgeClass =
              offer.stock_status === "disponible" ? "badge-success" :
              offer.stock_status === "consultar" ? "badge-warning" : "badge-error";
            return (
              <div key={offer.id} className="card p-4">
                <div className="flex gap-3">
                  {/* Image thumbnail */}
                  <div className="w-14 h-14 bg-gray-800 rounded-xl overflow-hidden flex-shrink-0">
                    {offer.image_url ? (
                      <Image src={offer.image_url} alt={offer.product.name} width={56} height={56} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm text-white">{offer.product.name}</p>
                        <p className="text-xs text-gray-400">
                          {offer.branch.name} — {offer.branch.city}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-amber-400">${offer.price.toLocaleString("es-AR")}</p>
                        <span className={`badge ${badgeClass} mt-1`}>
                          {stockLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-3 pt-3 border-t border-gray-800">
                  <button
                    onClick={() => handleEdit(offer)}
                    className="text-xs text-amber-400 font-medium hover:underline"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(offer.id)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
