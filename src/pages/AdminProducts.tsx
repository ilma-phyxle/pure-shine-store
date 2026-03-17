import { useEffect, useMemo, useState } from "react";
import { getProducts, createProduct, updateProduct, deleteProduct, ApiProduct, getCategories, ApiCategory } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { Package, Plus, Trash2, Download, Upload, Copy } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AdminProducts = () => {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPrice, setNewPrice] = useState<string>("");
  const [newCategoryId, setNewCategoryId] = useState<string>("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageUrl2, setNewImageUrl2] = useState("");
  const [newImageUrl3, setNewImageUrl3] = useState("");
  const [search, setSearch] = useState("");

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [fetchedProducts, fetchedCategories] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);
      setProducts(fetchedProducts);
      setCategories(fetchedCategories);
    } catch (error) {
      toast({ title: "Failed to load data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q) || (p.description?.toLowerCase().includes(q) ?? false));
  }, [products, search]);

  const doAdd = async () => {
    if (!newName.trim() || !newCategoryId) {
      toast({ title: "Name and Category are required", variant: "destructive" });
      return;
    }

    try {
      const added = await createProduct({
        name: newName.trim(),
        category_id: parseInt(newCategoryId),
        description: newDescription.trim() || undefined,
        price: parseFloat(newPrice) || 0,
        image_url: newImageUrl.trim() || undefined,
        image_url_2: newImageUrl2.trim() || undefined,
        image_url_3: newImageUrl3.trim() || undefined,
      });
      setProducts(prev => [...prev, added]);
      setNewName("");
      setNewDescription("");
      setNewPrice("");
      setNewImageUrl("");
      setNewImageUrl2("");
      setNewImageUrl3("");
      setNewCategoryId("");
      toast({ title: "Product added" });
    } catch (error) {
      toast({ title: "Failed to add product", variant: "destructive" });
    }
  };

  const removeProduct = async (id: number) => {
    try {
      await deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      toast({ title: "Product removed" });
    } catch (error) {
      toast({ title: "Failed to delete product", variant: "destructive" });
    }
  };

  const handleUpdate = async (id: number, patch: Partial<ApiProduct>) => {
    try {
      const updated = await updateProduct(id, patch);
      setProducts(prev => prev.map(p => p.id === id ? updated : p));
      toast({ title: "Product updated" });
    } catch (error) {
      toast({ title: "Failed to update product", variant: "destructive" });
    }
  };

  const renderRow = (p: ApiProduct) => {
    return (
      <Card key={p.id} className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold leading-snug truncate text-blue-900">{p.name}</p>
            <p className="text-xs text-muted-foreground">Category: {p.category?.name || 'None'}</p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => removeProduct(p.id)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label>Name</Label>
            <Input defaultValue={p.name} onBlur={(e) => { if (e.target.value !== p.name) handleUpdate(p.id, { name: e.target.value }) }} />
          </div>
          <div className="space-y-1">
            <Label>Price</Label>
            <Input
              inputMode="decimal"
              defaultValue={p.price?.toString()}
              onBlur={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val) && val !== p.price) handleUpdate(p.id, { price: val });
              }}
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label>Image URL (Primary)</Label>
            <div className="flex gap-2">
              <Input type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => handleUpdate(p.id, { image_url: reader.result as string });
                  reader.readAsDataURL(file);
                }
              }} />
              <Input defaultValue={p.image_url ?? ""} onBlur={(e) => { if (e.target.value !== p.image_url) handleUpdate(p.id, { image_url: e.target.value }) }} placeholder="URL or Base64" />
            </div>
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label>Image URL 2 (Optional)</Label>
            <div className="flex gap-2">
              <Input type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => handleUpdate(p.id, { image_url_2: reader.result as string });
                  reader.readAsDataURL(file);
                }
              }} />
              <Input defaultValue={p.image_url_2 ?? ""} onBlur={(e) => { if (e.target.value !== p.image_url_2) handleUpdate(p.id, { image_url_2: e.target.value }) }} placeholder="URL or Base64" />
            </div>
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label>Image URL 3 (Optional)</Label>
            <div className="flex gap-2">
              <Input type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => handleUpdate(p.id, { image_url_3: reader.result as string });
                  reader.readAsDataURL(file);
                }
              }} />
              <Input defaultValue={p.image_url_3 ?? ""} onBlur={(e) => { if (e.target.value !== p.image_url_3) handleUpdate(p.id, { image_url_3: e.target.value }) }} placeholder="URL or Base64" />
            </div>
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label>Description (optional)</Label>
            <Textarea defaultValue={p.description ?? ""} onBlur={(e) => { if (e.target.value !== p.description) handleUpdate(p.id, { description: e.target.value }) }} />
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
            <h1 className="text-3xl font-display font-bold tracking-tight text-slate-900">Product API List</h1>
            <p className="text-slate-500">Manage your product catalog items on the remote database.</p>
          </div>
        </div>

        <Tabs defaultValue="list" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px] bg-white border border-slate-200 rounded-xl p-1">
            <TabsTrigger value="list" className="gap-2 rounded-lg text-slate-600 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              <Package className="h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="add" className="gap-2 rounded-lg text-slate-600 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              <Plus className="h-4 w-4" />
              Add New
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

            {loading ? (
              <div className="text-center py-16 rounded-xl border bg-card">
                <p className="font-semibold text-lg mb-2">Loading products...</p>
              </div>
            ) : filtered.length === 0 ? (
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
              <p className="font-semibold">Add product</p>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <Label>Name</Label>
                  <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g., Bleach 1L" />
                </div>
                <div className="space-y-1">
                  <Label>Category</Label>
                  <Select value={newCategoryId} onValueChange={setNewCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (
                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label>Price</Label>
                  <Input inputMode="decimal" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} placeholder="e.g., 9.99" />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label>Image URL (Primary)</Label>
                  <div className="flex gap-2">
                    <Input type="file" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setNewImageUrl(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }} />
                    <Input value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} placeholder="URL or Base64" />
                  </div>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label>Image URL 2 (Optional)</Label>
                  <div className="flex gap-2">
                    <Input type="file" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setNewImageUrl2(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }} />
                    <Input value={newImageUrl2} onChange={(e) => setNewImageUrl2(e.target.value)} placeholder="URL or Base64" />
                  </div>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label>Image URL 3 (Optional)</Label>
                  <div className="flex gap-2">
                    <Input type="file" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setNewImageUrl3(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }} />
                    <Input value={newImageUrl3} onChange={(e) => setNewImageUrl3(e.target.value)} placeholder="URL or Base64" />
                  </div>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label>Description (optional)</Label>
                  <Textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Short description…" />
                </div>
                <div className="md:col-span-2">
                  <Button onClick={doAdd} disabled={!newName.trim() || !newCategoryId}>
                    Add Product
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
