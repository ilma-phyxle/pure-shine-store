import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User, Mail, Phone, MapPin, ShoppingBag } from "lucide-react";

export interface CustomerInfo {
  name: string;
  email: string;
  mobile: string;
  address: string;
}

interface CustomerInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (info: CustomerInfo) => Promise<void>;
  title?: string;
  description?: string;
}

const emptyForm: CustomerInfo = { name: "", email: "", mobile: "", address: "" };

export const CustomerInfoDialog = ({
  open,
  onOpenChange,
  onConfirm,
  title = "Your Delivery Details",
  description = "Please enter your details so we can process your order.",
}: CustomerInfoDialogProps) => {
  const [form, setForm] = useState<CustomerInfo>(emptyForm);
  const [errors, setErrors] = useState<Partial<CustomerInfo>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: Partial<CustomerInfo> = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.mobile.trim()) newErrors.mobile = "Mobile number is required";
    if (!form.address.trim()) newErrors.address = "Delivery address is required";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await onConfirm(form);
      setForm(emptyForm);
      setErrors({});
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof CustomerInfo) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!isSubmitting) { onOpenChange(v); if (!v) { setForm(emptyForm); setErrors({}); } } }}>
      <DialogContent className="max-w-md rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <ShoppingBag className="h-5 w-5 text-white" />
            </div>
            <DialogHeader className="space-y-0">
              <DialogTitle className="text-xl font-display font-black text-white">{title}</DialogTitle>
              <DialogDescription className="text-slate-400 text-sm font-medium mt-0.5">{description}</DialogDescription>
            </DialogHeader>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5 bg-white">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="cust-name" className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
              <User className="h-3 w-3" /> Full Name <span className="text-primary">*</span>
            </Label>
            <Input
              id="cust-name"
              placeholder="e.g. John Smith"
              value={form.name}
              onChange={handleChange("name")}
              className={`h-11 rounded-xl border-slate-200 focus-visible:ring-primary/30 focus-visible:border-primary bg-slate-50 ${errors.name ? "border-red-400 bg-red-50" : ""}`}
            />
            {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name}</p>}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="cust-email" className="text-xs font-black uppercase tracking-widest text-slate-600 flex items-center gap-1.5">
              <Mail className="h-3 w-3" /> Email Address <span className="text-slate-400 text-[10px] normal-case tracking-normal font-medium">(optional)</span>
            </Label>
            <Input
              id="cust-email"
              type="email"
              placeholder="e.g. john@email.com"
              value={form.email}
              onChange={handleChange("email")}
              className={`h-11 rounded-xl border-slate-200 focus-visible:ring-primary/30 focus-visible:border-primary bg-slate-50 ${errors.email ? "border-red-400 bg-red-50" : ""}`}
            />
            {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email}</p>}
          </div>

          {/* Mobile */}
          <div className="space-y-1.5">
            <Label htmlFor="cust-mobile" className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
              <Phone className="h-3 w-3" /> Mobile Number <span className="text-primary">*</span>
            </Label>
            <Input
              id="cust-mobile"
              type="tel"
              placeholder="e.g. +61 400 000 000"
              value={form.mobile}
              onChange={handleChange("mobile")}
              className={`h-11 rounded-xl border-slate-200 focus-visible:ring-primary/30 focus-visible:border-primary bg-slate-50 ${errors.mobile ? "border-red-400 bg-red-50" : ""}`}
            />
            {errors.mobile && <p className="text-xs text-red-500 font-medium">{errors.mobile}</p>}
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <Label htmlFor="cust-address" className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
              <MapPin className="h-3 w-3" /> Delivery Address <span className="text-primary">*</span>
            </Label>
            <Input
              id="cust-address"
              placeholder="e.g. 123 Main St, Melbourne VIC 3000"
              value={form.address}
              onChange={handleChange("address")}
              className={`h-11 rounded-xl border-slate-200 focus-visible:ring-primary/30 focus-visible:border-primary bg-slate-50 ${errors.address ? "border-red-400 bg-red-50" : ""}`}
            />
            {errors.address && <p className="text-xs text-red-500 font-medium">{errors.address}</p>}
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-12 rounded-2xl border-slate-200 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-[2] h-12 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-200 transition-all hover:-translate-y-0.5 active:translate-y-0"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Confirm & Place Order
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
