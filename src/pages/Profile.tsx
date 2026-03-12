import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { Link } from "react-router-dom";

import authBg from "@/assets/auth-bg.jpg";

const Profile = () => {
  return (
    <main
      className="flex-1 flex items-center justify-center py-16 px-4 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: `url(${authBg})` }}
    >
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl p-8 text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3">
          <User className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">My Profile</h1>
        <p className="text-sm text-white/70 mt-1 mb-6">Sign in to view and manage your profile</p>
        <p className="text-sm text-white/60 mb-6">
          You're not signed in yet. Sign in to access your order history, saved addresses, and more.
        </p>
        <div className="flex gap-3 justify-center">
          <Button asChild className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30">
            <Link to="/sign-in">Sign In</Link>
          </Button>
          <Button variant="outline" asChild className="border-white/30 text-white hover:bg-white/20 bg-transparent">
            <Link to="/sign-up">Create Account</Link>
          </Button>
        </div>
      </div>
    </main>
  );
};

export default Profile;
