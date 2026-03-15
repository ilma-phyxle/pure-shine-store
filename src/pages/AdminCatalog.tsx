import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";

/**
 * @deprecated This component is replaced by AdminCatalogPro.
 * It is kept as a placeholder to prevent broken routes while transitioning.
 */
const AdminCatalog = () => {
  return (
    <div className="container py-20 max-w-2xl text-center space-y-6">
      <div className="flex justify-center">
        <div className="p-4 rounded-full bg-amber-100 text-amber-600">
          <AlertCircle className="h-10 w-10" />
        </div>
      </div>
      <h1 className="text-3xl font-bold">Classic Catalog Deprecated</h1>
      <p className="text-muted-foreground">
        The catalog structure has been upgraded to a richer format.
        Please use the <strong>Pro Catalog Manager</strong> for all updates.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
        <Button asChild variant="outline">
          <Link to="/admin">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Link>
        </Button>
        <Button asChild>
          <Link to="/admin/catalog-pro">
            Go to Pro Manager
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default AdminCatalog;
