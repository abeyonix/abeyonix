// src/api/dashboard.ts

import api from "./api";

export interface DashboardData {
  revenue: {
    today: number;
    this_week: number;
    this_month: number;
    total: number;
  };
  total_orders: number;
  order_status_breakdown: { status: string; count: number }[];
  monthly_revenue: { month: string; revenue: number }[];
  total_users: number;
  new_users_this_month: number;
  total_products: number;
  low_stock_products: {
    product_id: number;
    product_name: string;
    sku: string;
    quantity: number;
    low_quantity_alert_at: number;
  }[];
  top_selling_products: {
    product_name: string;
    sku: string;
    total_quantity: number;
    total_revenue: number;
    primary_image: string | null;
  }[];
  recent_orders: {
    order_id: number;
    order_number: string;
    total_amount: number;
    order_status: string;
    payment_status: string;
    created_at: string;
  }[];
  total_services: number;
  total_inquiries: number;
  new_inquiries: number;
}

export const getDashboard = async (): Promise<DashboardData> => {
  const response = await api.get("/admin/dashboard");
  return response.data;
};