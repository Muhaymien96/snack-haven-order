
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="text-center p-6">
        <h1 className="text-6xl font-bold text-terracotta mb-4">404</h1>
        <p className="text-xl text-earth mb-8">Oops! Page not found</p>
        <p className="mb-8 text-muted-foreground max-w-md">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Button asChild className="bg-terracotta hover:bg-terracotta/90">
          <Link to="/">
            <Home className="mr-2 h-4 w-4" /> Return to Home
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
