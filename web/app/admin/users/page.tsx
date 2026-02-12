"use client";

import { useEffect, useState } from "react";
import { Search, Shield, Ban, CheckCircle } from "lucide-react";
import { format } from "date-fns";

type User = {
    id: string;
    email: string;
    role: string;
    is_blocked: boolean;
    created_at: string;
    name?: string;
};

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/users");
            const data = await res.json();
            if (data.users) setUsers(data.users);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAction = async (userId: string, action: "block" | "unblock") => {
        if (!confirm(`Are you sure you want to ${action} this user?`)) return;
        try {
            const res = await fetch("/api/admin/users", {
                method: "POST",
                body: JSON.stringify({ userId, action }),
            });
            if (res.ok) {
                fetchUsers(); // Refresh
            } else {
                alert("Action failed");
            }
        } catch (err) {
            alert("Error");
        }
    };

    const filtered = users.filter(u =>
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white">User Management</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="bg-gray-900 border border-gray-700 text-white pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm text-gray-400">
                    <thead className="bg-gray-950 text-gray-200 uppercase font-medium">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Joined</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center">Loading users...</td></tr>
                        ) : filtered.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-8 text-center">No users found</td></tr>
                        ) : (
                            filtered.map(user => (
                                <tr key={user.id} className="hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-white">{user.name || "No Name"}</div>
                                        <div className="text-xs">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium border ${user.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                                user.role === 'owner' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                    'bg-gray-700/50 text-gray-300 border-gray-700'
                                            }`}>
                                            {user.role.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.is_blocked ? (
                                            <span className="flex items-center text-red-400"><Ban className="w-3 h-3 mr-1" /> Blocked</span>
                                        ) : (
                                            <span className="flex items-center text-green-400"><CheckCircle className="w-3 h-3 mr-1" /> Active</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {format(new Date(user.created_at), "MMM d, yyyy")}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {user.role !== 'admin' && (
                                            <button
                                                onClick={() => handleAction(user.id, user.is_blocked ? "unblock" : "block")}
                                                className={`text-xs px-3 py-1.5 rounded border transition-colors ${user.is_blocked
                                                        ? "border-green-500/30 text-green-400 hover:bg-green-500/10"
                                                        : "border-red-500/30 text-red-400 hover:bg-red-500/10"
                                                    }`}
                                            >
                                                {user.is_blocked ? "Unblock" : "Block"}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
