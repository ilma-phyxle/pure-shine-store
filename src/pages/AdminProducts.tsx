import { useMemo, useState } from "react";
import { useLocalProductsStore, type LocalProduct } from "@/stores/localProductsStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import {
  Package,
  Search,
  Download,
  Plus,
  Trash2,
  Edit2,
  Save,
  Upload,
  Copy,
  ExternalLink,
  DollarSign,
  ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { cn } from "@/lib/utils";

const AdminProducts = () => {
  const products = useLocalProductsStore((s) => s.products);
  const lastUpdatedAt = useLocalProductsStore((s) => s.lastUpdatedAt);
  const addProduct = useLocalProductsStore((s) => s.addProduct);
  const updateProduct = useLocalProductsStore((s) => s.updateProduct);
  const removeProduct = useLocalProductsStore((s) => s.removeProduct);
  const replaceAll = useLocalProductsStore((s) => s.replaceAll);
  const exportJson = useLocalProductsStore((s) => s.exportJson);

  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriceAmount, setNewPriceAmount] = useState<string>("");
  const [newCurrencyCode, setNewCurrencyCode] = useState("USD");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [search, setSearch] = useState("");

  const [importText, setImportText] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q) || (p.description?.toLowerCase().includes(q) ?? false));
  }, [products, search]);

  const parsePrice = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return undefined;
    const n = Number(trimmed);
    if (!Number.isFinite(n) || n < 0) return undefined;
    return n;
  };

  const doAdd = () => {
    if (!newName.trim()) return;
    addProduct({
      name: newName.trim(),
      description: newDescription.trim() || undefined,
      priceAmount: parsePrice(newPriceAmount),
      currencyCode: newCurrencyCode.trim() || undefined,
      imageUrl: newImageUrl.trim() || undefined,
      url: newUrl.trim() || undefined,
      active: true,
    });
    setNewName("");
    setNewDescription("");
    setNewPriceAmount("");
    setNewImageUrl("");
    setNewUrl("");
    toast({ title: "Product added" });
  };

  const doExportCopy = async () => {
    const json = exportJson();
    await navigator.clipboard.writeText(json);
    toast({ title: "Copied export JSON" });
  };

  const doExportDownload = () => {
    const json = exportJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `local-products-${new Date(lastUpdatedAt).toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const doImport = () => {
    try {
      const parsed = JSON.parse(importText);
      if (!parsed || !Array.isArray(parsed.products)) throw new Error("Invalid JSON");
      replaceAll(parsed);
      setImportText("");
      toast({ title: "Imported products data" });
    } catch {
      toast({ title: "Import failed", description: "Paste valid JSON exported from this page.", variant: "destructive" });
    }
  };

  const renderRow = (p: LocalProduct) => {
    const currency = p.currencyCode || "USD";
    const priceText = typeof p.priceAmount === "number" ? `${currency} ${p.priceAmount.toFixed(2)}` : "—";
    return (
      <Card key={p.id} className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold leading-snug truncate">{p.name}</p>
            <p className="text-xs text-muted-foreground">Updated: {new Date(p.updatedAt).toLocaleString()}</p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              removeProduct(p.id);
              toast({ title: "Product removed" });
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label>Name</Label>
            <Input value={p.name} onChange={(e) => updateProduct(p.id, { name: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Price</Label>
            <Input
              inputMode="decimal"
              placeholder={priceText}
              value={typeof p.priceAmount === "number" ? p.priceAmount.toString() : ""}
              onChange={(e) => updateProduct(p.id, { priceAmount: parsePrice(e.target.value) })}
            />
          </div>
          <div className="space-y-1">
            <Label>Currency</Label>
            <Input value={currency} onChange={(e) => updateProduct(p.id, { currencyCode: e.target.value })} placeholder="USD" />
          </div>
          <div className="space-y-1">
            <Label>URL (optional)</Label>
            <Input value={p.url ?? ""} onChange={(e) => updateProduct(p.id, { url: e.target.value })} placeholder="https://..." />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label>Image URL (optional)</Label>
            <Input value={p.imageUrl ?? ""} onChange={(e) => updateProduct(p.id, { imageUrl: e.target.value })} placeholder="https://..." />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label>Description (optional)</Label>
            <Textarea value={p.description ?? ""} onChange={(e) => updateProduct(p.id, { description: e.target.value })} />
          </div>
        </div>
      </Card>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold tracking-tight text-slate-100">Product List</h1>
            <p className="text-slate-500">Manage your local product inventory and catalog items.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => toast({ title: "Exporting..." })} className="gap-2 border-slate-800 bg-slate-900 text-slate-200">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button size="sm" className="gap-2 bg-primary text-primary-foreground shadow-lg shadow-primary/20" onClick={() => toast({ title: "Auto-saving is enabled" })}>
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </div>
        </div>

        <Tabs defaultValue="list" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[600px] bg-slate-900 border-slate-800">
            <TabsTrigger value="list" className="gap-2 data-[state=active]:bg-primary transition-all">
              <Package className="h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="add" className="gap-2 data-[state=active]:bg-primary transition-all">
              <Plus className="h-4 w-4" />
              Add New
            </TabsTrigger>
            <TabsTrigger value="import" className="gap-2 data-[state=active]:bg-primary transition-all">
              <Upload className="h-4 w-4" />
              Import / Export
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-6 space-y-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="min-w-[220px] flex-1 max-w-lg">
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…" />
              </div>
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{filtered.length}</span> product{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16 rounded-xl border bg-card">
                <p className="font-semibold text-lg mb-2">No products yet</p>
                <p className="text-muted-foreground">Add your first product above.</p>
              </div>
            ) : (
              <div className="space-y-4">{filtered.map(renderRow)}</div>
            )}
          </TabsContent>

          <TabsContent value="add" className="mt-6 space-y-6">
            <Card className="p-4 space-y-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <p className="font-semibold">Add product</p>
                <p className="text-xs text-muted-foreground">Last updated: {new Date(lastUpdatedAt).toLocaleString()}</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <Label>Name</Label>
                  <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g., Bleach 1L" />
                </div>
                <div className="space-y-1">
                  <Label>Price</Label>
                  <Input inputMode="decimal" value={newPriceAmount} onChange={(e) => setNewPriceAmount(e.target.value)} placeholder="e.g., 9.99" />
                </div>
                <div className="space-y-1">
                  <Label>Currency</Label>
                  <Input value={newCurrencyCode} onChange={(e) => setNewCurrencyCode(e.target.value)} placeholder="USD" />
                </div>
                <div className="space-y-1">
                  <Label>URL (optional)</Label>
                  <Input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://..." />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label>Image URL (optional)</Label>
                  <Input value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} placeholder="https://..." />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label>Description (optional)</Label>
                  <Textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Short description…" />
                </div>
                <div className="md:col-span-2">
                  <Button onClick={doAdd} disabled={!newName.trim()}>
                    Add
                  </Button>
                </div>
              </div>
            </Card>

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="min-w-[220px] flex-1 max-w-lg">
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…" />
              </div>
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{filtered.length}</span> product{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16 rounded-xl border bg-card">
                <p className="font-semibold text-lg mb-2">No products yet</p>
                <p className="text-muted-foreground">Add your first product above.</p>
              </div>
            ) : (
              <div className="space-y-4">{filtered.map(renderRow)}</div>
            )}
          </TabsContent>

          <TabsContent value="import" className="mt-6 space-y-4">
            <Card className="p-4 space-y-3">
              <p className="font-semibold">Export</p>
              <div className="flex gap-2 flex-wrap">
                <Button variant="outline" onClick={doExportCopy}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy JSON
                </Button>
                <Button variant="outline" onClick={doExportDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download JSON
                </Button>
              </div>
            </Card>

            <Card className="p-4 space-y-3">
              <p className="font-semibold">Import</p>
              <Textarea value={importText} onChange={(e) => setImportText(e.target.value)} placeholder="Paste JSON exported from this page…" className="min-h-40" />
              <Button onClick={doImport} disabled={!importText.trim()}>
                <Upload className="h-4 w-4 mr-2" />
                Import (replace all)
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
