import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard,
    Users,
    Monitor,
    Megaphone,
    DollarSign,
    Settings,
    LogOut
} from "lucide-react";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = createClient();
    const { data: { user } } = await (await supabase).auth.getUser();

    if (!user) redirect("/login");

    const { data: profile } = await (await supabase)
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    const p = profile as any;
    if (!p || p.role !== "admin") {
        redirect("/dashboard/advertiser"); // Kick out non-admins
    }

    const navItems = [
        { name: "Overview", href: "/admin", icon: LayoutDashboard },
        { name: "Users", href: "/admin/users", icon: Users },
        { name: "Screens", href: "/admin/screens", icon: Monitor },
        { name: "Campaigns", href: "/admin/campaigns", icon: Megaphone },
        { name: "Finance", href: "/admin/finance", icon: DollarSign },
        // { name: "Settings", href: "/admin/settings", icon: Settings },
    ];

    return (
        <div className="flex h-screen bg-gray-900 text-white">
            {/* Sidebar */}
            <aside className="w-64 border-r border-gray-800 flex flex-col">
                <div className="p-6">
                    <h1 className="text-xl font-bold tracking-wider text-indigo-400">ADMIN PANEL</h1>
                    <p className="text-xs text-gray-500 mt-1">Make My Marketing</p>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors text-gray-300 hover:text-white"
                        >
                            <item.icon className="w-5 h-5 mr-3" />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <form action="/auth/signout" method="post">
                        <button className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-red-900/20 rounded-lg transition-colors">
                            <LogOut className="w-5 h-5 mr-3" />
                            Sign Out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-black">
                <header className="h-16 border-b border-gray-800 flex items-center justify-between px-8">
                    <h2 className="text-lg font-semibold">Dashboard</h2>
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-400">
                            Logged in as <span className="text-white font-medium">{user.email}</span>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs">
                            A
                        </div>
                    </div>
                </header>
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
