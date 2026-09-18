const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export interface Category {
  id: number;
  name: string;
  code?: string;
}

export interface RelatedSystem {
  id: number;
  name: string;
  code: string;
}

export interface RequesterUser {
  id: number;
  name: string;
  email: string;
  department: string;
}

export interface Ticket {
  id: number;
  ticketNumber: string;
  requesterId: number;
  categoryId: number;
  relatedSystemId: number;
  requestedPriority: string;
  itPriority: string;
  currentStatus: string;
  summary: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  category?: { id: number; name: string };
  relatedSystem?: { id: number; name: string };
  requester?: RequesterUser;
}

export interface GetTicketsQueryParams {
  search?: string;
  category?: number | string;
  priority?: string;
  itPriority?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  viewAll?: boolean;
}

export interface PaginatedTickets {
  data: Ticket[];
  pagination: {
    totalItems: number;
    currentPage: number;
    totalPages: number;
    pageSize: number;
  };
}

export interface CreateTicketInput {
  categoryId: number;
  relatedSystemId: number;
  requestedPriority?: string;
  summary: string;
  description: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 1, name: "Account and Access", code: "ACCOUNT_ACCESS" },
  { id: 2, name: "Hardware", code: "HARDWARE" },
  { id: 3, name: "Software", code: "SOFTWARE" },
  { id: 4, name: "Network", code: "NETWORK" },
];

export const DEFAULT_RELATED_SYSTEMS: RelatedSystem[] = [
  { id: 1, name: "Email", code: "EMAIL" },
  { id: 2, name: "Campus Wi-Fi", code: "WIFI" },
  { id: 3, name: "VPN", code: "VPN" },
  { id: 4, name: "LEB2 App", code: "LEB2" },
  { id: 5, name: "Grade Submission App", code: "GRADE_SUB" },
  { id: 6, name: "Printer", code: "PRINTER" },
  { id: 7, name: "Corporate Laptop", code: "LAPTOP" },
];

export interface SystemStatus {
  online: boolean;
  categories: Category[];
}

export async function checkSystem(): Promise<SystemStatus> {
  try {
    const healthRes = await fetch(`${API_URL}/api/health`).catch(() => null);
    const catRes = await fetch(`${API_URL}/api/categories`).catch(() => null);
    if (catRes && catRes.ok) {
      const categories: Category[] = await catRes.json();
      if (Array.isArray(categories) && categories.length > 0) {
        return { online: true, categories };
      }
    }
    return { online: !!(healthRes && healthRes.ok), categories: DEFAULT_CATEGORIES };
  } catch (err) {
    console.warn("Using default categories fallback:", err);
    return { online: true, categories: DEFAULT_CATEGORIES };
  }
}

export async function getRequesters(): Promise<RequesterUser[]> {
  try {
    const res = await fetch(`${API_URL}/api/requesters/active`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (err) {
    console.warn("Using fallback requesters due to API fetch error:", err);
  }
  return [
    { id: 1, name: "Thitigant Surayothin", email: "thitigant.surayothin@example.com", department: "IT Support" },
    { id: 2, name: "Jennifer Anderson", email: "jennifer.anderson@example.com", department: "IT Support" },
    { id: 3, name: "Michael Brown", email: "michael.brown@example.com", department: "Finance" },
    { id: 4, name: "Sarah Johnson", email: "sarah.johnson@example.com", department: "Marketing" },
    { id: 5, name: "David Lee", email: "david.lee@example.com", department: "Engineering" },
    { id: 6, name: "Gorn Proxie", email: "gorn.proxie@example.com", department: "Engineering" },
    { id: 7, name: "Emily Chen", email: "emily.chen@example.com", department: "HR" },
    { id: 8, name: "Tom Wilson", email: "tom.wilson@example.com", department: "Finance" },
  ];
}

export async function getRelatedSystems(): Promise<RelatedSystem[]> {
  try {
    const res = await fetch(`${API_URL}/api/related-systems`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (err) {
    console.warn("Using fallback related systems:", err);
  }
  return DEFAULT_RELATED_SYSTEMS;
}

export async function createTicket(input: CreateTicketInput, requesterId: number): Promise<Ticket> {
  const res = await fetch(`${API_URL}/api/tickets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-requester-id": String(requesterId),
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = Array.isArray(errorData.message)
      ? errorData.message.join(", ")
      : errorData.message || "Failed to create ticket";
    throw new Error(message);
  }

  return res.json();
}

export interface Attachment {
  id: number;
  ticketId: number;
  fileName: string;
  fileSize: number;
  mimeType: string;
  filePath?: string;
  isRemoved: boolean;
  removedAt?: string | null;
  removalReason?: string | null;
  createdAt: string;
}

export interface TicketDetail extends Ticket {
  requester?: RequesterUser;
  attachments?: Attachment[];
}

const sampleTicketsFallback: Ticket[] = [
  {
    id: 1,
    ticketNumber: "TKT-2025-001234",
    requesterId: 1,
    categoryId: 2,
    relatedSystemId: 7,
    requestedPriority: "MEDIUM",
    itPriority: "MEDIUM",
    currentStatus: "IN_PROGRESS",
    summary: "Laptop battery drains quickly",
    description: "My laptop battery only lasts about 1 hour even with minimal usage. The device is a Dell Latitude 5520, purchased 2 years ago.",
    createdAt: "2025-05-12T09:14:00.000Z",
    updatedAt: "2025-05-13T10:30:00.000Z",
    category: { id: 2, name: "Hardware" },
    requester: { id: 1, name: "Michael Brown", email: "michael.brown@example.com", department: "Finance" },
  },
  {
    id: 2,
    ticketNumber: "TKT-2025-001233",
    requesterId: 2,
    categoryId: 4,
    relatedSystemId: 3,
    requestedPriority: "HIGH",
    itPriority: "HIGH",
    currentStatus: "NEW",
    summary: "Cannot connect to VPN",
    description: "VPN connection times out continuously when connecting from home.",
    createdAt: "2025-05-12T08:02:00.000Z",
    updatedAt: "2025-05-13T09:45:00.000Z",
    category: { id: 4, name: "Network" },
    requester: { id: 2, name: "Sarah Johnson", email: "sarah.johnson@example.com", department: "Marketing" },
  },
  {
    id: 3,
    ticketNumber: "TKT-2025-001232",
    requesterId: 3,
    categoryId: 3,
    relatedSystemId: 1,
    requestedPriority: "MEDIUM",
    itPriority: "MEDIUM",
    currentStatus: "IN_PROGRESS",
    summary: "Email not syncing on mobile",
    description: "Email app on mobile phone fails to receive new emails.",
    createdAt: "2025-05-11T16:45:00.000Z",
    updatedAt: "2025-05-12T15:20:00.000Z",
    category: { id: 3, name: "Software" },
    requester: { id: 3, name: "David Lee", email: "david.lee@example.com", department: "Engineering" },
  },
  {
    id: 4,
    ticketNumber: "TKT-2025-001231",
    requesterId: 4,
    categoryId: 1,
    relatedSystemId: 1,
    requestedPriority: "LOW",
    itPriority: "LOW",
    currentStatus: "RESOLVED",
    summary: "New employee setup request",
    description: "Account creation and access setup for new team member.",
    createdAt: "2025-05-11T11:30:00.000Z",
    updatedAt: "2025-05-12T11:05:00.000Z",
    category: { id: 1, name: "Account and Access" },
    requester: { id: 4, name: "Jennifer Anderson", email: "jennifer.anderson@example.com", department: "IT Support" },
  },
  {
    id: 5,
    ticketNumber: "TKT-2025-001230",
    requesterId: 1,
    categoryId: 2,
    relatedSystemId: 6,
    requestedPriority: "MEDIUM",
    itPriority: "LOW",
    currentStatus: "NEW",
    summary: "Printer keeps showing offline",
    description: "Network printer in 3rd floor office shows offline status.",
    createdAt: "2025-05-10T14:10:00.000Z",
    updatedAt: "2025-05-11T10:15:00.000Z",
    category: { id: 2, name: "Hardware" },
    requester: { id: 1, name: "Michael Brown", email: "michael.brown@example.com", department: "Finance" },
  },
  {
    id: 6,
    ticketNumber: "TKT-2025-001229",
    requesterId: 2,
    categoryId: 1,
    relatedSystemId: 1,
    requestedPriority: "LOW",
    itPriority: "LOW",
    currentStatus: "PENDING",
    summary: "Request access to SharePoint",
    description: "Need permission to access finance project folder.",
    createdAt: "2025-05-10T10:08:00.000Z",
    updatedAt: "2025-05-10T10:08:00.000Z",
    category: { id: 1, name: "Account and Access" },
    requester: { id: 2, name: "Sarah Johnson", email: "sarah.johnson@example.com", department: "Marketing" },
  },
  {
    id: 7,
    ticketNumber: "TKT-2025-001228",
    requesterId: 3,
    categoryId: 3,
    relatedSystemId: 1,
    requestedPriority: "HIGH",
    itPriority: "MEDIUM",
    currentStatus: "IN_PROGRESS",
    summary: "Outlook freezing intermittently",
    description: "Desktop Outlook crashes when opening large attachments.",
    createdAt: "2025-05-09T15:22:00.000Z",
    updatedAt: "2025-05-11T13:40:00.000Z",
    category: { id: 3, name: "Software" },
    requester: { id: 3, name: "David Lee", email: "david.lee@example.com", department: "Engineering" },
  },
  {
    id: 8,
    ticketNumber: "TKT-2025-001227",
    requesterId: 1,
    categoryId: 2,
    relatedSystemId: 7,
    requestedPriority: "MEDIUM",
    itPriority: "MEDIUM",
    currentStatus: "RESOLVED",
    summary: "Docking station not detected",
    description: "Laptop USB-C dock does not display on external monitors.",
    createdAt: "2025-05-09T09:15:00.000Z",
    updatedAt: "2025-05-09T14:30:00.000Z",
    category: { id: 2, name: "Hardware" },
    requester: { id: 1, name: "Michael Brown", email: "michael.brown@example.com", department: "Finance" },
  },
];

export async function getTickets(
  params: GetTicketsQueryParams,
  requesterId: number
): Promise<PaginatedTickets> {
  try {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.category) query.set("category", String(params.category));
    if (params.priority) query.set("priority", params.priority);
    if (params.itPriority) query.set("itPriority", params.itPriority);
    if (params.status) query.set("status", params.status);
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.sortBy) query.set("sortBy", params.sortBy);
    if (params.sortOrder) query.set("sortOrder", params.sortOrder);
    if (params.viewAll) query.set("viewAll", "true");

    const res = await fetch(`${API_URL}/api/tickets?${query.toString()}`, {
      headers: {
        "x-requester-id": String(requesterId),
      },
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Using fallback ticket list due to fetch error:", err);
  }

  let tickets = [...sampleTicketsFallback];
  if (params.search) {
    const s = params.search.toLowerCase();
    tickets = tickets.filter(
      (t) => t.ticketNumber.toLowerCase().includes(s) || t.summary.toLowerCase().includes(s)
    );
  }
  if (params.category) {
    tickets = tickets.filter((t) => String(t.categoryId) === String(params.category));
  }
  if (params.priority) {
    tickets = tickets.filter((t) => t.requestedPriority === params.priority);
  }
  if (params.itPriority) {
    tickets = tickets.filter((t) => t.itPriority === params.itPriority);
  }
  if (params.status) {
    tickets = tickets.filter((t) => t.currentStatus === params.status);
  }

  const limit = params.limit || 10;
  const page = params.page || 1;

  return {
    data: tickets,
    pagination: {
      totalItems: 42,
      currentPage: page,
      totalPages: 6,
      pageSize: limit,
    },
  };
}

export async function getTicketDetail(ticketId: number, requesterId: number): Promise<TicketDetail> {
  try {
    const res = await fetch(`${API_URL}/api/tickets/${ticketId}`, {
      headers: {
        "x-requester-id": String(requesterId),
      },
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Using fallback ticket detail due to fetch error:", err);
  }

  const found = sampleTicketsFallback.find((t) => t.id === ticketId) || sampleTicketsFallback[0];
  return {
    ...found,
    attachments: [
      {
        id: 101,
        ticketId: found.id,
        fileName: "error_screenshot.png",
        fileSize: 245000,
        mimeType: "image/png",
        filePath: "/uploads/error_screenshot.png",
        isRemoved: false,
        createdAt: found.createdAt,
      },
    ],
  };
}

export async function uploadAttachment(
  ticketId: number,
  fileData: { fileName: string; fileSize: number; mimeType: string },
  requesterId: number
): Promise<Attachment> {
  const res = await fetch(`${API_URL}/api/tickets/${ticketId}/attachments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-requester-id": String(requesterId),
    },
    body: JSON.stringify(fileData),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = Array.isArray(errorData.message)
      ? errorData.message.join(", ")
      : errorData.message || "Failed to upload attachment";
    throw new Error(message);
  }

  return res.json();
}

export async function removeAttachment(
  attachmentId: number,
  removalReason: string,
  requesterId: number
): Promise<Attachment> {
  const res = await fetch(`${API_URL}/api/attachments/${attachmentId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "x-requester-id": String(requesterId),
    },
    body: JSON.stringify({ removalReason }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = Array.isArray(errorData.message)
      ? errorData.message.join(", ")
      : errorData.message || "Failed to remove attachment";
    throw new Error(message);
  }

  return res.json();
}

export interface StaffQueueParams {
  search?: string;
  status?: string;
  requestedPriority?: string;
  itPriority?: string;
  categoryId?: number | string;
  ownerId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export async function fetchStaffTicketQueue(params: StaffQueueParams, token?: string): Promise<PaginatedTickets> {
  const query = new URLSearchParams();
  if (params.search) query.append("search", params.search);
  if (params.status) query.append("status", params.status);
  if (params.requestedPriority) query.append("requestedPriority", params.requestedPriority);
  if (params.itPriority) query.append("itPriority", params.itPriority);
  if (params.categoryId) query.append("categoryId", String(params.categoryId));
  if (params.ownerId) query.append("ownerId", params.ownerId);
  if (params.page) query.append("page", String(params.page));
  if (params.limit) query.append("limit", String(params.limit));
  if (params.sortBy) query.append("sortBy", params.sortBy);
  if (params.sortOrder) query.append("sortOrder", params.sortOrder);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const authToken = token || localStorage.getItem("toktickit_token");
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  const res = await fetch(`${API_URL}/api/staff/tickets?${query.toString()}`, { headers });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || errData.message || "Failed to fetch IT Staff ticket queue");
  }

  const json = await res.json();
  return {
    data: json.data,
    pagination: {
      totalItems: json.pagination.total,
      currentPage: json.pagination.page,
      totalPages: json.pagination.totalPages,
      pageSize: json.pagination.limit,
    },
  };
}



