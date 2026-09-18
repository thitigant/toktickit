import { useState, useEffect, useCallback } from "react";
import {
  fetchStaffTicketQueue,
  Category,
  PaginatedTickets,
  StaffQueueParams,
  Ticket,
} from "../api";

interface StaffTicketQueueProps {
  categories: Category[];
  onSelectTicket?: (ticketId: number) => void;
  currentUser?: { id: number; name: string; role: string };
}

export function StaffTicketQueue({
  categories,
  onSelectTicket,
  currentUser,
}: StaffTicketQueueProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedRequestedPriority, setSelectedRequestedPriority] = useState<string>("");
  const [selectedItPriority, setSelectedItPriority] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedOwner, setSelectedOwner] = useState<string>("ALL");
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PaginatedTickets | null>(null);

  const loadQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: StaffQueueParams = {
        search: search.trim() || undefined,
        status: selectedStatus || undefined,
        requestedPriority: selectedRequestedPriority || undefined,
        itPriority: selectedItPriority || undefined,
        categoryId: selectedCategory || undefined,
        ownerId: selectedOwner || undefined,
        page,
        limit: pageSize,
        sortBy: "createdAt",
        sortOrder: "desc",
      };
      const res = await fetchStaffTicketQueue(params);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load IT Staff queue");
    } finally {
      setLoading(false);
    }
  }, [
    search,
    selectedStatus,
    selectedRequestedPriority,
    selectedItPriority,
    selectedCategory,
    selectedOwner,
    page,
    pageSize,
  ]);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const handleResetFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setSelectedRequestedPriority("");
    setSelectedItPriority("");
    setSelectedStatus("");
    setSelectedOwner("ALL");
    setPage(1);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "NEW":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "OPEN":
        return "bg-amber-100 text-amber-800 border border-amber-200";
      case "IN_PROGRESS":
        return "bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold";
      case "WAITING_FOR_REQUESTER":
        return "bg-purple-100 text-purple-800 border border-purple-200";
      case "RESOLVED":
        return "bg-green-100 text-green-800 border border-green-200";
      case "CLOSED":
        return "bg-gray-100 text-gray-700 border border-gray-300";
      case "REOPENED":
        return "bg-orange-100 text-orange-800 border border-orange-200";
      case "CANCELLED":
        return "bg-rose-100 text-rose-800 border border-rose-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-red-500 text-white font-bold";
      case "HIGH":
        return "bg-orange-500 text-white font-medium";
      case "MEDIUM":
        return "bg-amber-100 text-amber-900 border border-amber-300";
      case "LOW":
        return "bg-slate-100 text-slate-700 border border-slate-300";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
      {/* Header Banner */}
      <div className="bg-emerald-900 text-white p-6 rounded-xl shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">IT Staff Ticket Queue</h1>
          <p className="text-emerald-200 text-sm mt-1">
            Manage, claim, prioritize, and process incoming support requests.
          </p>
        </div>
        {currentUser && (
          <div className="bg-emerald-800/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-emerald-700 text-xs text-emerald-100">
            Logged in as: <span className="font-semibold text-white">{currentUser.name}</span> ({currentUser.role})
          </div>
        )}
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by Ticket No. or Summary..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <svg
              className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Quick Filter: Ownership */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => { setSelectedOwner("ALL"); setPage(1); }}
              className={`px-3 py-1.5 rounded-md transition-all ${selectedOwner === "ALL" ? "bg-white text-emerald-900 shadow-sm font-semibold" : "text-gray-600 hover:text-gray-900"}`}
            >
              All Queue
            </button>
            <button
              onClick={() => { setSelectedOwner("me"); setPage(1); }}
              className={`px-3 py-1.5 rounded-md transition-all ${selectedOwner === "me" ? "bg-emerald-700 text-white font-semibold shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
            >
              My Queue
            </button>
            <button
              onClick={() => { setSelectedOwner("unassigned"); setPage(1); }}
              className={`px-3 py-1.5 rounded-md transition-all ${selectedOwner === "unassigned" ? "bg-amber-600 text-white font-semibold shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
            >
              Unassigned
            </button>
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-gray-100 text-xs">
          <div>
            <label className="block text-gray-600 mb-1 font-medium">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setPage(1); }}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">All Statuses</option>
              <option value="NEW">New</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="WAITING_FOR_REQUESTER">Waiting for Requester</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
              <option value="REOPENED">Reopened</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-600 mb-1 font-medium">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-600 mb-1 font-medium">IT Priority</label>
            <select
              value={selectedItPriority}
              onChange={(e) => { setSelectedItPriority(e.target.value); setPage(1); }}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleResetFilters}
              className="w-full py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-medium text-xs transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Error Feedback */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={loadQueue} className="text-xs font-semibold underline hover:text-rose-900">
            Retry
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 space-y-3">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-600 border-t-transparent"></div>
            <p className="text-sm">Loading IT Staff Queue...</p>
          </div>
        ) : !result || result.data.length === 0 ? (
          <div className="p-12 text-center text-gray-500 space-y-3">
            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-base font-semibold text-gray-700">No tickets found</p>
            <p className="text-xs text-gray-400">Try adjusting your search criteria or filter options.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Ticket No.</th>
                    <th className="py-3 px-4">Created Date</th>
                    <th className="py-3 px-4">Summary</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Req. Priority</th>
                    <th className="py-3 px-4">IT Priority</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Owner</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {result.data.map((ticket: Ticket) => (
                    <tr
                      key={ticket.id}
                      className="hover:bg-emerald-50/40 transition-colors cursor-pointer"
                      onClick={() => onSelectTicket && onSelectTicket(ticket.id)}
                    >
                      <td className="py-3.5 px-4 font-mono text-xs font-bold text-emerald-800">
                        {ticket.ticketNumber}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-500 whitespace-nowrap">
                        {formatDate(ticket.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-gray-900 max-w-xs truncate">
                        {ticket.summary}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-600">
                        {ticket.category?.name || "General"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 text-xs rounded ${getPriorityBadgeClass(ticket.requestedPriority)}`}>
                          {ticket.requestedPriority}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 text-xs rounded ${getPriorityBadgeClass(ticket.itPriority)}`}>
                          {ticket.itPriority}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${getStatusBadgeClass(ticket.currentStatus)}`}>
                          {ticket.currentStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-gray-700">
                        {ticket.requester?.name ? (
                          <span className="inline-flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            {ticket.requester.name}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSelectTicket) onSelectTicket(ticket.id);
                          }}
                          className="px-3 py-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded text-xs font-medium transition-colors"
                        >
                          View Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile / Tablet Card View */}
            <div className="md:hidden divide-y divide-gray-100">
              {result.data.map((ticket: Ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => onSelectTicket && onSelectTicket(ticket.id)}
                  className="p-4 hover:bg-emerald-50/30 transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-800">{ticket.ticketNumber}</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getStatusBadgeClass(ticket.currentStatus)}`}>
                      {ticket.currentStatus}
                    </span>
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm line-clamp-2">{ticket.summary}</h3>
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-1">
                    <span>{ticket.category?.name}</span>
                    <span>IT Priority: <strong className="text-gray-800">{ticket.itPriority}</strong></span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
              <div>
                Showing <span className="font-semibold text-gray-800">{(result.pagination.currentPage - 1) * result.pagination.pageSize + 1}</span> to{" "}
                <span className="font-semibold text-gray-800">
                  {Math.min(result.pagination.currentPage * result.pagination.pageSize, result.pagination.totalItems)}
                </span>{" "}
                of <span className="font-semibold text-gray-800">{result.pagination.totalItems}</span> tickets
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={result.pagination.currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                >
                  Previous
                </button>
                <span className="font-medium px-1">
                  Page {result.pagination.currentPage} of {result.pagination.totalPages}
                </span>
                <button
                  disabled={result.pagination.currentPage >= result.pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
