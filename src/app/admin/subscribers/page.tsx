"use client";

import * as React from "react";
import type { Subscriber } from "@/lib/journal-types";

interface Stats {
  total: number;
  confirmed: number;
  pending: number;
  unsubscribed: number;
}

function getStatusColor(status: Subscriber["status"]) {
  const colors: Record<Subscriber["status"], string> = {
    confirmed: "bg-green-500/20 text-green-400 border-green-500/30",
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    unsubscribed: "bg-red-500/20 text-red-400 border-red-500/30",
  };
  return colors[status];
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(dateString: string | null) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = React.useState<Subscriber[]>([]);
  const [stats, setStats] = React.useState<Stats>({ total: 0, confirmed: 0, pending: 0, unsubscribed: 0 });
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<string>("all");
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/subscribers");

        if (res.ok) {
          const data = await res.json();
          setSubscribers(data.subscribers || []);
          setStats(data.stats || { total: 0, confirmed: 0, pending: 0, unsubscribed: 0 });
        }
      } catch (error) {
        console.error("Failed to fetch subscribers:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredSubscribers = React.useMemo(() => {
    return subscribers.filter((sub) => {
      const matchesFilter = filter === "all" || sub.status === filter;
      const matchesSearch =
        search === "" ||
        sub.email.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [subscribers, filter, search]);

  const handleExportCSV = () => {
    const headers = ["Email", "Status", "Source", "Subscribed", "Confirmed", "Unsubscribed"];
    const rows = filteredSubscribers.map((sub) => [
      sub.email,
      sub.status,
      sub.source || "",
      formatDate(sub.created_at),
      sub.confirmed_at ? formatDate(sub.confirmed_at) : "",
      sub.unsubscribed_at ? formatDate(sub.unsubscribed_at) : "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `subscribers_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-[#222] rounded" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-[#18181b] rounded-xl" />
          ))}
        </div>
        <div className="h-12 bg-[#18181b] rounded-lg" />
        <div className="h-96 bg-[#18181b] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Subscribers</h1>
          <p className="text-[#71717a]">Journal newsletter subscribers</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-[#27272a] hover:bg-[#3f3f46] rounded-lg text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5">
          <p className="text-[#71717a] text-sm mb-1">Total</p>
          <p className="text-2xl font-semibold">{stats.total}</p>
        </div>
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5">
          <p className="text-green-400 text-sm mb-1">Confirmed</p>
          <p className="text-2xl font-semibold text-green-400">{stats.confirmed}</p>
        </div>
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5">
          <p className="text-yellow-400 text-sm mb-1">Pending</p>
          <p className="text-2xl font-semibold text-yellow-400">{stats.pending}</p>
        </div>
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-5">
          <p className="text-red-400 text-sm mb-1">Unsubscribed</p>
          <p className="text-2xl font-semibold text-red-400">{stats.unsubscribed}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717a]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search by email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#18181b] border border-[#27272a] rounded-lg text-white placeholder-[#666] focus:outline-none focus:border-[#3f3f46]"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-[#22c55e]/20 text-[#22c55e]"
                : "text-[#a1a1aa] hover:text-white hover:bg-[#27272a]"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("confirmed")}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "confirmed"
                ? "bg-green-500/20 text-green-400"
                : "text-[#a1a1aa] hover:text-white hover:bg-[#27272a]"
            }`}
          >
            Confirmed
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "pending"
                ? "bg-yellow-500/20 text-yellow-400"
                : "text-[#a1a1aa] hover:text-white hover:bg-[#27272a]"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter("unsubscribed")}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === "unsubscribed"
                ? "bg-red-500/20 text-red-400"
                : "text-[#a1a1aa] hover:text-white hover:bg-[#27272a]"
            }`}
          >
            Unsubscribed
          </button>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#27272a]">
              <th className="text-left px-6 py-4 text-sm font-medium text-[#a1a1aa]">Email</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[#a1a1aa]">Status</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[#a1a1aa]">Source</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[#a1a1aa]">Subscribed</th>
              <th className="text-left px-6 py-4 text-sm font-medium text-[#a1a1aa]">Confirmed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222]">
            {filteredSubscribers.length > 0 ? (
              filteredSubscribers.map((subscriber) => (
                <tr key={subscriber.id} className="hover:bg-[#27272a] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#22c55e]/20 flex items-center justify-center text-[#22c55e] font-medium text-sm">
                        {subscriber.email.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white">{subscriber.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(subscriber.status)}`}>
                      {subscriber.status.charAt(0).toUpperCase() + subscriber.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#a1a1aa]">
                    {subscriber.source?.replace(/_/g, " ") || "—"}
                  </td>
                  <td className="px-6 py-4 text-[#71717a] text-sm">
                    {formatDate(subscriber.created_at)}
                  </td>
                  <td className="px-6 py-4 text-[#71717a] text-sm">
                    {formatDateTime(subscriber.confirmed_at)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-[#71717a]">
                  {search || filter !== "all" ? "No subscribers match your filters" : "No subscribers yet"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer with count */}
      {filteredSubscribers.length > 0 && (
        <p className="text-sm text-[#71717a]">
          Showing {filteredSubscribers.length} of {stats.total} subscribers
        </p>
      )}
    </div>
  );
}
