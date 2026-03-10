import { AdminLayout } from "@/components/admin/AdminLayout";
import { Users } from "lucide-react";

const AdminCustomers = () => {
    return (
        <AdminLayout>
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="p-4 rounded-full bg-slate-900 border border-slate-800">
                    <Users className="h-12 w-12 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-slate-100">Customers Management</h1>
                <p className="text-slate-500">This module is coming soon in the next update.</p>
            </div>
        </AdminLayout>
    );
};

export default AdminCustomers;
