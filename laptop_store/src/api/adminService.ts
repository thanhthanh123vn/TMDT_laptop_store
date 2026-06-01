import api from "./api";

export type PageResult<T> = {
    items: T[];
    page: number;
    size: number;
    totalItems: number;
    totalPages: number;
};

export type DashboardSummary = {
    totalRevenue: number;
    totalOrders: number;
    newUsers: number;
    revenueGrowth: number;
    ordersGrowth: number;
    usersGrowth: number;
    pendingOrders: number;
    shippingOrders: number;
    completedToday: number;
    todayRevenue: number;
};

export type RevenueTrendPoint = {
    label: string;
    value: number;
};

export type ProductDistributionItem = {
    name: string;
    value: number;
};

export type AdminRecentOrder = {
    id: string;
    customer: string;
    amount: string;
    status: string;
    date: string;
    badge?: string;
};

export type AdminProduct = {
    id: number;
    name: string;
    sku: string;
    category: string;
    price: number;
    stock: number;
    freshness?: string;
    imageUrl?: string;
};

export type ProductPayload = {
    name: string;
    price: number;
    category: string;
};

export type StockPayload = {
    stock: number;
    freshness: string;
};

export type AdminOrder = {
    id: number;
    code: string;
    customerName: string;
    customerEmail: string;
    createdAt: string;
    amount: number;
    paymentMethod: string;
    status: string;
};

export type AdminUser = {
    id: number;
    fullName: string;
    email: string;
    role: string;
    status: string;
    createdAt: string;
};

export type InvitePayload = {
    email: string;
    fullName: string;
    role: string;
};

export type AdminAiRecipe = {
    id: number;
    title: string;
    category: string;
    coverage: number;
    prepTime?: number;
    difficulty?: number;
};

export type AiRecipePayload = {
    title: string;
    category: string;
    coverage: number;
};

const toRecord = (value: unknown): Record<string, unknown> => {
    if (typeof value === "object" && value !== null) {
        return value as Record<string, unknown>;
    }

    return {};
};

const toNumber = (value: unknown, fallback = 0) => {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === "string") {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }

    return fallback;
};

const toString = (value: unknown, fallback = "") => (typeof value === "string" ? value : fallback);

const normalizeStatus = (value: string) => value.trim().toUpperCase();

const cleanParams = <T extends Record<string, unknown>>(params: T) => {
    const cleaned: Record<string, unknown> = {};
    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (typeof value === "string" && value.trim() === "") return;
        cleaned[key] = value;
    });
    return cleaned;
};

const toPageResult = <T>(raw: unknown, mapper: (item: unknown, index: number) => T): PageResult<T> => {
    const root = toRecord(raw);
    const listCandidate = root.items ?? root.content ?? root.data;
    const list = Array.isArray(listCandidate) ? listCandidate : Array.isArray(raw) ? raw : [];

    const page = toNumber(root.page ?? root.number, 1);
    const size = toNumber(root.size, list.length || 20);
    const totalItems = toNumber(root.totalItems ?? root.totalElements, list.length);
    const totalPages = toNumber(root.totalPages ?? root.totalPage, totalItems > 0 ? Math.ceil(totalItems / Math.max(1, size)) : 1);

    return {
        items: list.map(mapper),
        page,
        size,
        totalItems,
        totalPages,
    };
};

const statusToColor = (status: string) => {
    const upper = status.toUpperCase();
    if (upper.includes("COMPLETE") || upper.includes("DELIVER")) return "bg-green-100 text-green-700";
    if (upper.includes("SHIP") || upper.includes("PROCESS") || upper.includes("PACK")) return "bg-orange-100 text-orange-700";
    if (upper.includes("CANCEL") || upper.includes("BLOCK")) return "bg-red-100 text-red-700";
    return "bg-blue-100 text-blue-700";
};

export const dashboardService = {
    async getSummary(): Promise<DashboardSummary> {
        const res = await api.get("/api/admin/dashboard/summary");
        const data = toRecord(res.data);
        return {
            totalRevenue: toNumber(data.totalRevenue),
            totalOrders: toNumber(data.totalOrders),
            newUsers: toNumber(data.newUsers),
            revenueGrowth: toNumber(data.revenueGrowth),
            ordersGrowth: toNumber(data.ordersGrowth),
            usersGrowth: toNumber(data.usersGrowth),
            pendingOrders: toNumber(data.pendingOrders),
            shippingOrders: toNumber(data.shippingOrders),
            completedToday: toNumber(data.completedToday),
            todayRevenue: toNumber(data.todayRevenue),
        };
    },

    async getRevenueTrend(from: string, to: string, groupBy = "day"): Promise<RevenueTrendPoint[]> {
        const res = await api.get("/api/admin/dashboard/revenue-trend", { params: { from, to, groupBy } });
        const list = Array.isArray(res.data) ? res.data : Array.isArray(toRecord(res.data).items) ? (toRecord(res.data).items as unknown[]) : [];
        return list.map((item, index) => {
            const record = toRecord(item);
            return {
                label: toString(record.label ?? record.day ?? record.date, `#${index + 1}`),
                value: toNumber(record.value ?? record.revenue),
            };
        });
    },

    async getProductDistribution(): Promise<ProductDistributionItem[]> {
        const res = await api.get("/api/admin/dashboard/product-distribution");
        const list = Array.isArray(res.data) ? res.data : Array.isArray(toRecord(res.data).items) ? (toRecord(res.data).items as unknown[]) : [];
        return list.map((item, index) => {
            const record = toRecord(item);
            return {
                name: toString(record.name ?? record.category, `Nhóm ${index + 1}`),
                value: toNumber(record.value ?? record.percent),
            };
        });
    },

    async getRecentOrders(page = 1, size = 10): Promise<PageResult<AdminRecentOrder>> {
        const res = await api.get("/api/admin/dashboard/recent-orders", { params: { page, size } });
        return toPageResult(res.data, (item) => {
            const record = toRecord(item);
            return {
                id: toString(record.id ?? record.code, ""),
                customer: toString(record.customer ?? record.customerName, "Khách hàng"),
                amount: toString(record.amount, "0"),
                status: normalizeStatus(toString(record.status, "UNKNOWN")),
                date: toString(record.date ?? record.createdAt, ""),
                badge: toString(record.badge),
            };
        });
    },
};

export const productAdminService = {
    async list(params: { page?: number; size?: number; keyword?: string; category?: string; sort?: string }): Promise<PageResult<AdminProduct>> {
        const res = await api.get("/api/admin/products", { params: cleanParams(params) });
        return toPageResult(res.data, (item, index) => {
            const record = toRecord(item);
            return {
                id: toNumber(record.id, index + 1),
                name: toString(record.name, "Sản phẩm"),
                sku: toString(record.sku, `SKU-${index + 1}`),
                category: toString(record.category, "Khác"),
                price: toNumber(record.price),
                stock: toNumber(record.stock),
                freshness: toString(record.freshness, ""),
                imageUrl: toString(record.imageUrl),
            };
        });
    },

    async detail(id: number) {
        const res = await api.get(`/api/admin/products/${id}`);
        return res.data;
    },

    async create(payload: ProductPayload) {
        const res = await api.post("/api/admin/products", payload);
        return res.data;
    },

    async update(id: number, payload: ProductPayload) {
        const res = await api.put(`/api/admin/products/${id}`, payload);
        return res.data;
    },

    async remove(id: number) {
        const res = await api.delete(`/api/admin/products/${id}`);
        return res.data;
    },

    async updateStock(id: number, payload: StockPayload) {
        const res = await api.patch(`/api/admin/products/${id}/stock`, payload);
        return res.data;
    },

    async uploadImage(id: number, file: File) {
        const formData = new FormData();
        formData.append("image", file);
        const res = await api.post(`/api/admin/products/${id}/images`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data;
    },
};

export const orderAdminService = {
    async list(params: { page?: number; size?: number; status?: string; keyword?: string; from?: string; to?: string }): Promise<PageResult<AdminOrder>> {
        const res = await api.get("/api/admin/orders", { params: cleanParams(params) });
        return toPageResult(res.data, (item, index) => {
            const record = toRecord(item);
            return {
                id: toNumber(record.id, index + 1),
                code: toString(record.code ?? record.id, `#${index + 1}`),
                customerName: toString(record.customerName ?? record.customer, "Khách hàng"),
                customerEmail: toString(record.customerEmail ?? record.email, ""),
                createdAt: toString(record.createdAt ?? record.date, ""),
                amount: toNumber(record.amount),
                paymentMethod: toString(record.paymentMethod ?? record.method, "N/A"),
                status: normalizeStatus(toString(record.status, "PENDING")),
            };
        });
    },

    async detail(id: number) {
        const res = await api.get(`/api/admin/orders/${id}`);
        return res.data;
    },

    async updateStatus(id: number, status: string) {
        const res = await api.patch(`/api/admin/orders/${id}/status`, { status: normalizeStatus(status) });
        return res.data;
    },

    async addNote(id: number, note: string) {
        const res = await api.post(`/api/admin/orders/${id}/manual-note`, { note });
        return res.data;
    },

    async exportCsv(from: string, to: string) {
        const res = await api.get("/api/admin/orders/export", {
            params: cleanParams({ format: "csv", from, to }),
            responseType: "blob",
        });
        return res.data as Blob;
    },

    statusToColor,
};

export const userAdminService = {
    async list(params: { page?: number; size?: number; role?: string; status?: string; keyword?: string }): Promise<PageResult<AdminUser>> {
        const res = await api.get("/api/admin/users", { params: cleanParams(params) });
        return toPageResult(res.data, (item, index) => {
            const record = toRecord(item);
            return {
                id: toNumber(record.id, index + 1),
                fullName: toString(record.fullName ?? record.name, "Người dùng"),
                email: toString(record.email),
                role: normalizeStatus(toString(record.role, "CUSTOMER")),
                status: normalizeStatus(toString(record.status, "ACTIVE")),
                createdAt: toString(record.createdAt ?? record.registrationDate, ""),
            };
        });
    },

    async detail(id: number) {
        const res = await api.get(`/api/admin/users/${id}`);
        return res.data;
    },

    async updateRole(id: number, role: string) {
        const res = await api.patch(`/api/admin/users/${id}/role`, { role: normalizeStatus(role) });
        return res.data;
    },

    async updateStatus(id: number, status: string) {
        const res = await api.patch(`/api/admin/users/${id}/status`, { status: normalizeStatus(status) });
        return res.data;
    },

    async invite(payload: InvitePayload) {
        const res = await api.post("/api/admin/users/invite", payload);
        return res.data;
    },
};

export const aiRecipeAdminService = {
    async list(params: { page?: number; size?: number; category?: string; coverageMin?: string; sort?: string }): Promise<PageResult<AdminAiRecipe>> {
        const res = await api.get("/api/admin/ai-recipes", { params: cleanParams(params) });
        return toPageResult(res.data, (item, index) => {
            const record = toRecord(item);
            return {
                id: toNumber(record.id, index + 1),
                title: toString(record.title ?? record.name, `Recipe ${index + 1}`),
                category: toString(record.category, "General"),
                coverage: toNumber(record.coverage ?? record.ingredientCoverage),
                prepTime: toNumber(record.prepTime),
                difficulty: toNumber(record.difficulty),
            };
        });
    },

    async detail(id: number) {
        const res = await api.get(`/api/admin/ai-recipes/${id}`);
        return res.data;
    },

    async create(payload: AiRecipePayload) {
        const res = await api.post("/api/admin/ai-recipes", payload);
        return res.data;
    },

    async update(id: number, payload: AiRecipePayload) {
        const res = await api.put(`/api/admin/ai-recipes/${id}`, payload);
        return res.data;
    },

    async remove(id: number) {
        const res = await api.delete(`/api/admin/ai-recipes/${id}`);
        return res.data;
    },

    async updateMapping(id: number, ingredientIds: number[]) {
        const res = await api.patch(`/api/admin/ai-recipes/${id}/ingredient-mapping`, { ingredientIds });
        return res.data;
    },
};

export type AdminNotification = {
    id: string | number;
    title: string;
    type: string; // order | offer | system | ai
    body?: string;
    content?: string;
    userId?: string | number | null;
    tags?: string | Array<{ label: string; variant: string }>;
    actionUrl?: string;
    channel?: string; // all, users, admins, specific
    target?: string; // optional target id or segment
    status: string; // DRAFT | SCHEDULED | SENT
    createdAt?: string;
    sentAt?: string | null;
    meta?: Record<string, unknown>;
};

export type AdminNotificationPayload = {
    title: string;
    content: string;
    type: string;
    userId?: number | null;
    tags?: string | Array<{ label: string; variant: string }>;
    actionUrl?: string;
};

export const notificationAdminService = {
    async list(params: { page?: number; size?: number; type?: string; status?: string; keyword?: string }) {
        const res = await api.get('/api/admin/notifications', { params: cleanParams(params) });
        return toPageResult(res.data, (item) => {
            const r = toRecord(item);
            return {
                id: toString(r.id ?? r._id ?? r.code ?? ''),
                title: toString(r.title ?? r.subject ?? 'No title'),
                type: toString(r.type ?? 'system'),
                body: toString(r.body ?? r.message ?? r.content ?? ''),
                content: toString(r.content ?? r.body ?? r.message ?? ''),
                userId: r.userId ?? r.user_id ?? null,
                tags: r.tags as AdminNotification['tags'],
                actionUrl: toString(r.actionUrl ?? r.action_url ?? ''),
                channel: toString(r.channel ?? 'all'),
                target: toString(r.target ?? ''),
                status: normalizeStatus(toString(r.status ?? 'DRAFT')),
                createdAt: toString(r.createdAt ?? r.created_at ?? ''),
                sentAt: toString(r.sentAt ?? r.sent_at ?? r.sent ?? null),
                meta: toRecord(r.meta ?? r.data ?? {}),
            } as AdminNotification;
        });
    },

    async detail(id: string | number) {
        const res = await api.get(`/api/admin/notifications/${id}`);
        return res.data;
    },

    async create(payload: AdminNotificationPayload) {
        const res = await api.post('/api/admin/notifications', payload);
        return res.data;
    },

    async update(id: string | number, payload: Partial<AdminNotificationPayload>) {
        const res = await api.put(`/api/admin/notifications/${id}`, payload);
        return res.data;
    },

    async remove(id: string | number) {
        const res = await api.delete(`/api/admin/notifications/${id}`);
        return res.data;
    },

    async send(id: string | number) {
        const res = await api.post(`/api/admin/notifications/${id}/send`);
        return res.data;
    },

    async markRead(id: string | number) {
        const res = await api.patch(`/api/admin/notifications/${id}/read`);
        return res.data;
    },

    async markAllRead() {
        const res = await api.patch('/api/admin/notifications/mark-all-read');
        return res.data;
    },

    // Optional: SSE endpoint URL clients can subscribe to for real-time updates
    streamUrl() {
        return '/api/admin/notifications/stream';
    }
};

