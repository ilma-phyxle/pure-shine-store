import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { LogIn } from "lucide-react";
import authBg from "@/assets/auth-bg.jpg";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Coming soon", description: "Sign in functionality requires a backend. Stay tuned!" });
  };

  return (
    <main
      className="flex-1 flex items-center justify-center py-16 px-4 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${authBg})` }}
    >
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl p-8">
        <div className="text-center mb-6">
          <div className="mx-auto h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
            <LogIn className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-sm text-white/70 mt-1">Sign in to your GRAPC account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/90">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-white/30" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white/90">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-white/30" />
          </div>
          <Button type="submit" className="w-full bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 transition-all">Sign In</Button>
        </form>
        <p className="text-center text-sm text-white/70 mt-6">
          Don't have an account?{" "}
          <Link to="/sign-up" className="text-white font-medium hover:underline">Sign Up</Link>
        </p>
      </div>
    </main>
  );
};

export default SignIn;
