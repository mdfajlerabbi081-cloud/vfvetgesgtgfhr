// types/admin.ts
export interface ProductAnalytics {
  id: string;
  title: string;
  sku: string;
  costPrice: number;     // কেনা দাম (হিসাবের জন্য)
  sellingPrice: number;  // বিক্রয় মূল্য
  stockQuantity: number;
  soldQuantity: number;
  category: string;
  profitMargin: number;  // অটো ক্যালকুলেটেড লাভ
}

export interface SecuritySession {
  adminId: string;
  role: 'SUPER_ADMIN' | 'MANAGER' | 'INVENTORY_ADMIN';
  ipAddress: string;
  lastActive: string;
}
