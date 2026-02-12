import DOMPurify from "isomorphic-dompurify";

export function sanitizeText(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] }).trim();
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  // Argentine phone format: optional + and digits
  const cleanPhone = phone.replace(/[\s\-()]/g, "");
  const phoneRegex = /^\+?[0-9]{8,15}$/;
  return phoneRegex.test(cleanPhone);
}

export function validateWhatsApp(whatsapp: string): boolean {
  // WhatsApp should be in format: 549XXXXXXXXXX (Argentina)
  const cleanWA = whatsapp.replace(/[\s\-()]/g, "");
  const waRegex = /^549[0-9]{10}$/;
  return waRegex.test(cleanWA) || validatePhone(cleanWA);
}

export interface ImageValidation {
  valid: boolean;
  error?: string;
}

export function validateImageFile(file: File): ImageValidation {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  const maxSizeMB = 5;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Formato no permitido. Solo JPG, PNG y WebP",
    };
  }

  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `El archivo es muy grande. Máximo ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
}

export function sanitizeVendorInput(data: {
  name?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
}) {
  return {
    name: data.name ? sanitizeText(data.name) : undefined,
    phone: data.phone ? sanitizeText(data.phone) : undefined,
    whatsapp: data.whatsapp ? sanitizeText(data.whatsapp) : undefined,
    email: data.email ? sanitizeText(data.email) : undefined,
  };
}

export function sanitizeBranchInput(data: {
  name?: string;
  address?: string;
  city?: string;
  province?: string;
  phone?: string;
  whatsapp?: string;
}) {
  return {
    name: data.name ? sanitizeText(data.name) : undefined,
    address: data.address ? sanitizeText(data.address) : undefined,
    city: data.city ? sanitizeText(data.city) : undefined,
    province: data.province ? sanitizeText(data.province) : undefined,
    phone: data.phone ? sanitizeText(data.phone) : undefined,
    whatsapp: data.whatsapp ? sanitizeText(data.whatsapp) : undefined,
  };
}
