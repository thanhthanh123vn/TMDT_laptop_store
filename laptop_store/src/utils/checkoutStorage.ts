import type { CreateOrderPayload } from '@/api/orderApi';

export const PENDING_ORDER_KEY = 'pendingOrder';
export const CHECKOUT_SUMMARY_KEY = 'checkoutSummary';

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cod: 'Thanh toán khi nhận hàng',
  vnpay: 'VNPay',
  credit_card: 'Thẻ tín dụng',
};

const SHIPPING_METHOD_LABELS: Record<string, string> = {
  fast: 'Giao nhanh',
  standard: 'Giao thường',
};

export interface CheckoutSummaryItem {
  productId: number | string;
  productName: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface CheckoutSummary {
  orderCode: string;
  orderId?: number | string;
  paymentMethod: string;
  paymentMethodLabel: string;
  shippingMethod: string;
  shippingMethodLabel: string;
  totalAmount: number;
  itemCount: number;
  createdAt: string;
  items: CheckoutSummaryItem[];
}

export interface PendingCheckoutOrder {
  orderPayload: CreateOrderPayload;
  clearCartAfterSuccess: boolean;
  checkoutItems?: CheckoutCartItem[];
}

export type CheckoutCartItem = {
  laptop: {
    id: number | string;
    name: string;
    price: number;
    image?: string;
  };
  quantity?: number;
};

const safeString = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const unwrapResponseData = (response: unknown): Record<string, unknown> => {
  if (isRecord(response) && isRecord(response.data)) {
    return response.data;
  }

  if (isRecord(response)) {
    return response;
  }

  return {};
};

const readValue = (source: Record<string, unknown>, key: string) => source[key];

const readString = (source: Record<string, unknown>, key: string) => {
  const value = readValue(source, key);
  return typeof value === 'string' ? value : '';
};


export const getPaymentMethodLabel = (method?: string) =>
  PAYMENT_METHOD_LABELS[method || ''] || method || 'Không xác định';

export const getShippingMethodLabel = (method?: string) =>
  SHIPPING_METHOD_LABELS[method || ''] || method || 'Không xác định';

export const savePendingOrder = (
  orderPayload: CreateOrderPayload,
  clearCartAfterSuccess: boolean = true,
  checkoutItems: CheckoutCartItem[] = []
) => {
  const pendingOrder: PendingCheckoutOrder = {
    orderPayload,
    clearCartAfterSuccess,
    checkoutItems,
  };

  localStorage.setItem(PENDING_ORDER_KEY, JSON.stringify(pendingOrder));
};

export const loadPendingOrder = (): PendingCheckoutOrder | null => {
  const raw = localStorage.getItem(PENDING_ORDER_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as PendingCheckoutOrder | CreateOrderPayload;

    if (parsed && typeof parsed === 'object' && 'orderPayload' in parsed) {
      return parsed as PendingCheckoutOrder;
    }

    return {
      orderPayload: parsed as CreateOrderPayload,
      clearCartAfterSuccess: true,
      checkoutItems: [],
    };
  } catch {
    return null;
  }
};

export const clearPendingOrder = () => {
  localStorage.removeItem(PENDING_ORDER_KEY);
};

export const saveCheckoutSummary = (summary: CheckoutSummary) => {
  localStorage.setItem(CHECKOUT_SUMMARY_KEY, JSON.stringify(summary));
};

export const loadCheckoutSummary = (): CheckoutSummary | null => {
  const raw = localStorage.getItem(CHECKOUT_SUMMARY_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as CheckoutSummary;
  } catch {
    return null;
  }
};

export const buildCheckoutSummary = ({
  orderPayload,
  checkoutItems,
  orderResponse,
}: {
  orderPayload: CreateOrderPayload;
  checkoutItems: CheckoutCartItem[];
  orderResponse?: unknown;
}): CheckoutSummary => {
  const responseData = unwrapResponseData(orderResponse);
  const responseOrder = isRecord(responseData.data)
    ? responseData.data
    : isRecord(responseData.order)
      ? responseData.order
      : responseData;

  const rawOrderId = readValue(responseOrder, 'id') ?? readValue(responseData, 'orderId') ?? readValue(responseData, 'id');
  const orderId =
    typeof rawOrderId === 'string' || typeof rawOrderId === 'number'
      ? rawOrderId
      : undefined;

  const rawTotalAmount =
    readValue(responseOrder, 'totalAmount') ??
    readValue(responseData, 'totalAmount') ??
    orderPayload.totalAmount;
  const totalAmount =
    typeof rawTotalAmount === 'number'
      ? rawTotalAmount
      : Number(rawTotalAmount) || 0;

  const orderCode =
    readString(responseOrder, 'orderCode') ||
    readString(responseOrder, 'code') ||
    safeString(readValue(responseOrder, 'id')) ||
    readString(responseData, 'orderCode') ||
    readString(responseData, 'code') ||
    safeString(readValue(responseData, 'id')) ||
    `ORDER-${Date.now()}`;

  const items = checkoutItems.map((item) => ({
    productId: item.laptop.id,
    productName: item.laptop.name,
    quantity: item.quantity || 1,
    price: Number(item.laptop.price) || 0,
    image: item.laptop.image,
  }));

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Prefer server-side createdAt when available (VNPay flow: server may return the true order timestamp).
  // Fallback to client time only when server didn't provide one.
  const rawCreatedAt =
    readValue(responseOrder, 'createdAt') ?? readValue(responseData, 'createdAt');

  let createdAt: string;
  if (typeof rawCreatedAt === 'string') {
    // Accept ISO string or other parseable formats
    const parsed = new Date(rawCreatedAt);
    createdAt = isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
  } else if (typeof rawCreatedAt === 'number') {
    createdAt = new Date(rawCreatedAt).toISOString();
  } else {
    createdAt = new Date().toISOString();
  }

  return {
    orderCode,
    orderId,
    paymentMethod: orderPayload.paymentMethod,
    paymentMethodLabel: getPaymentMethodLabel(orderPayload.paymentMethod),
    shippingMethod: orderPayload.shippingMethod,
    shippingMethodLabel: getShippingMethodLabel(orderPayload.shippingMethod),
    totalAmount,
    itemCount,
    createdAt,
    items,
  };
};
