import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { Link } from "react-router-dom";

const Profile = () => {
  return (
    <main className="flex-1 flex items-center justify-center py-16 px-4 bg-muted/30">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-2">
            <User className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">My Profile</CardTitle>
          <CardDescription>Sign in to view and manage your profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You're not signed in yet. Sign in to access your order history, saved addresses, and more.
          </p>
          <div className="flex gap-3 justify-center">
            <Button asChild>
              <Link to="/sign-in">Sign In</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/sign-up">Create Account</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default Profile;
