import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingCart, Minus, Plus, Trash2, CreditCard, Loader2, Package } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useOrderStore } from "@/stores/orderStore";
import { createOrder } from "@/lib/api";
import { toast } from "sonner";
import { CustomerInfoDialog, CustomerInfo } from "@/components/CustomerInfoDialog";
import { formatWhatsAppOrder, WHATSAPP_NUMBER } from "@/lib/whatsapp";

export const CartDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const { items, isLoading, isSyncing, updateQuantity, removeItem, clearCart, syncCart } = useCartStore();
  const { addOrder } = useOrderStore();

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (parseFloat(item.price.amount) * item.quantity), 0);
  const currency = items[0]?.price.currencyCode || "LKR";

  useEffect(() => { if (isOpen) syncCart(); }, [isOpen, syncCart]);

  const handleConfirmOrder = async (customerInfo: CustomerInfo) => {
    if (items.length === 0) return;

    const orderData = {
      customer: customerInfo.name,
      mobile: customerInfo.mobile,
      total: `${totalPrice.toFixed(2)}`,
      status: 'Processing' as const,
      payment: 'Pending' as const,
      info: `${totalItems} item${totalItems !== 1 ? 's' : ''}: ${items.map(i => `${i.quantity}x ${i.name}`).join(', ')}`,
      items: items.map(item => ({
        id: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: parseFloat(item.price.amount),
        currency: item.price.currencyCode,
        image: item.image
      }))
    };

    // 1. Save to DB in background (fire-and-forget)
    createOrder(orderData)
      .then(result => {
        addOrder({
          ...orderData,
          total: `${currency} ${totalPrice.toFixed(2)}`,
          info: orderData.info,
          items: orderData.items
        });
        console.log("Order saved to DB:", result?.id);
      })
      .catch(err => console.error("DB order save failed (WhatsApp still sent):", err));

    // 2. Build WhatsApp message with a temporary order ID
    const tempOrderId = `ORD-${Date.now()}`;
    const message = formatWhatsAppOrder({
      orderId: tempOrderId,
      items: items.map(i => ({ name: i.name, quantity: i.quantity, price: parseFloat(i.price.amount), currency: i.price.currencyCode })),
      total: `${currency} ${totalPrice.toFixed(2)}`,
      customer: customerInfo.name,
      mobile: customerInfo.mobile,
      address: customerInfo.address,
      email: customerInfo.email,
    });

    // 3. Immediately redirect to WhatsApp
    toast.success("Order Placed! Redirecting to WhatsApp...", { id: "payment" });
    setTimeout(() => {
      window.open(`https://wa.me/${WHATSAPP_NUMBER.replace('+', '')}?text=${message}`, '_blank');
      clearCart();
      setIsOpen(false);
      setShowInfoDialog(false);
    }, 800);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-slate-100 rounded-full h-10 w-10 transition-all">
          <ShoppingCart className="h-5 w-5 text-slate-700" />
          {totalItems > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] font-bold bg-primary text-primary-foreground border-2 border-white">
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full bg-white border-l border-slate-100 p-0">
        <div className="p-6 border-b border-slate-50">
          <SheetHeader className="space-y-1">
            <SheetTitle className="text-2xl font-display font-bold text-slate-900">Your Cart</SheetTitle>
            <SheetDescription className="text-slate-500 font-medium">
              {totalItems === 0 ? "Your cart is empty" : `You have ${totalItems} item${totalItems !== 1 ? 's' : ''} ready for checkout`}
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex flex-col flex-1 overflow-hidden">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-4">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                <ShoppingCart className="h-10 w-10 text-slate-200" />
              </div>
              <h3 className="font-display font-bold text-xl text-slate-900">Cart is Empty</h3>
              <p className="text-slate-400 text-sm max-w-[200px]">Looks like you haven't added any premium supplies yet.</p>
              <Button variant="outline" onClick={() => setIsOpen(false)} className="rounded-xl px-8 border-slate-200 hover:bg-slate-50 mt-4">
                Start Shopping
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 rounded-2xl border border-slate-100 bg-white hover:border-primary/20 transition-all group">
                    <div className="w-20 h-20 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0 border border-slate-50">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-slate-100" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-slate-900 text-sm line-clamp-2 leading-tight">{item.name}</h4>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-slate-300 hover:text-red-500 p-1 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        {item.type === 'shopify' && item.selectedOptions.length > 0 && (
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                            {item.selectedOptions.map(o => o.value).join(' · ')}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-auto">
                        <p className="font-display font-black text-primary text-sm">
                          <span className="text-[10px] font-bold text-slate-400 mr-1">{item.price.currencyCode}</span>
                          {parseFloat(item.price.amount).toFixed(2)}
                        </p>
                        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-100">
                          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md hover:bg-white hover:shadow-sm" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center text-xs font-bold text-slate-700">{item.quantity}</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md hover:bg-white hover:shadow-sm" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-8 border-t border-slate-100 space-y-6 bg-slate-50/30 backdrop-blur-sm">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-slate-500 text-sm">
                    <span>Subtotal</span>
                    <span className="font-medium">{currency} {totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500 text-sm">
                    <span>Shipping</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Calculated at payment</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-lg font-display font-bold text-slate-900">Total</span>
                    <span className="text-2xl font-display font-black text-primary">{currency} {totalPrice.toFixed(2)}</span>
                  </div>
                </div>
                <Button
                  onClick={() => setShowInfoDialog(true)}
                  className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-200 transition-all hover:-translate-y-1 active:translate-y-0"
                  size="lg"
                  disabled={isLoading || isSyncing}
                >
                  {isLoading || isSyncing ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-3" />
                      <span className="font-bold tracking-tight">Pay Now & Place Order</span>
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
      <CustomerInfoDialog
        open={showInfoDialog}
        onOpenChange={setShowInfoDialog}
        onConfirm={handleConfirmOrder}
        title="Your Delivery Details"
        description={`Complete your order of ${totalItems} item${totalItems !== 1 ? 's' : ''} — tell us where to deliver!`}
      />
    </Sheet>
  );
};
