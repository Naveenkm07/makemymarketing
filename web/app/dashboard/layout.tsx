import Link from 'next/link';
import { Home, LogOut } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="h-16 flex items-center justify-center border-b">
          <Link href="/" className="text-xl font-bold text-indigo-600">MakeMyMarketing</Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
           {/* Navigation would be dynamic based on role, but simpler here */}
           <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Menu</div>
           <Link href="/dashboard/owner" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
             <Home className="mr-3 h-5 w-5" />
             Owner Dashboard
           </Link>
           <Link href="/dashboard/advertiser" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
             <Home className="mr-3 h-5 w-5" />
             Advertiser Dashboard
           </Link>
        </nav>
        <div className="p-4 border-t">
          <Link href="/" className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-md">
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
