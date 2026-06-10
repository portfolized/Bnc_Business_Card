"use client";

import { useEffect, useState } from "react";

type Entry = {
  rank: number;
  profileId: string;
  cardLabel: string;
  views: number;
  username: string | null;
  name: string | null;
};

const RANK_STYLES: Record<number, string> = {
  1: "bg-yellow-50 text-yellow-700 border-yellow-200",
  2: "bg-gray-100 text-gray-600 border-gray-200",
  3: "bg-orange-50 text-orange-600 border-orange-200",
};

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((data) => setEntries(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-full bg-gray-50 px-6 py-8 md:px-8 md:py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Top profiles ranked by total card views.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-24 text-sm text-gray-400">
            Loading...
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-base font-medium text-gray-700">No data yet</p>
            <p className="mt-1 text-sm text-gray-400">
              Views are counted when someone visits a public profile.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="w-16 px-5 py-3">Rank</th>
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Card</th>
                  <th className="px-5 py-3 text-right">Views</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {entries.map((entry) => (
                  <tr
                    key={entry.profileId}
                    className={entry.rank <= 3 ? "bg-gray-50/60" : "hover:bg-gray-50 transition"}
                  >
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold ${
                          RANK_STYLES[entry.rank] ?? "bg-white text-gray-500 border-gray-200"
                        }`}
                      >
                        {entry.rank}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-800">
                        {entry.name || entry.username || "—"}
                      </p>
                      {entry.username && (
                        <p className="text-xs text-gray-400">@{entry.username}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-block rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600">
                        {entry.cardLabel}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-gray-800">
                      {entry.views.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
