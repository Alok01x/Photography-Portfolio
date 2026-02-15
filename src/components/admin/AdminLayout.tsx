'use client';

import Sidebar from './Sidebar';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-[#09090b] text-foreground">
            <Sidebar />
            <main className="flex-1 lg:pl-64">
                <div className="container py-12 px-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
