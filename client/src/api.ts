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
}

export interface GetTicketsQueryParams {
  search?: string;
  category?: number | string;
  priority?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
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

export interface SystemStatus {
  online: boolean;
  categories: Category[];
}

export async function checkSystem(): Promise<SystemStatus> {
  const healthRes = await fetch(`${API_URL}/api/health`);
  if (!healthRes.ok) throw new Error("Health check failed");

  const catRes = await fetch(`${API_URL}/api/categories`);
  if (!catRes.ok) throw new Error("Failed to fetch categories");

  const categories: Category[] = await catRes.json();
  return { online: true, categories };
}

export async function getRequesters(): Promise<RequesterUser[]> {
  const res = await fetch(`${API_URL}/api/requesters/active`);
  if (!res.ok) throw new Error("Failed to fetch requesters");
  return res.json();
}

export async function getRelatedSystems(): Promise<RelatedSystem[]> {
  const res = await fetch(`${API_URL}/api/related-systems`);
  if (!res.ok) throw new Error("Failed to fetch related systems");
  return res.json();
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

export async function getTickets(
  params: GetTicketsQueryParams,
  requesterId: number
): Promise<PaginatedTickets> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.category) query.set("category", String(params.category));
  if (params.priority) query.set("priority", params.priority);
  if (params.status) query.set("status", params.status);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.sortBy) query.set("sortBy", params.sortBy);
  if (params.sortOrder) query.set("sortOrder", params.sortOrder);

  const res = await fetch(`${API_URL}/api/tickets?${query.toString()}`, {
    headers: {
      "x-requester-id": String(requesterId),
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const message = errorData.error || errorData.message || "Failed to retrieve tickets";
    throw new Error(message);
  }

  return res.json();
}

