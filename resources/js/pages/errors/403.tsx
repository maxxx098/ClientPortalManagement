import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { ShieldAlert } from 'lucide-react';

export default function Error403() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        <div className="flex justify-center">
          <ShieldAlert className="h-24 w-24 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Access Denied</h1>
          <p className="text-xl text-muted-foreground">
            403 - Forbidden
          </p>
        </div>
        
        <p className="text-muted-foreground max-w-md mx-auto">
          You don't have permission to access this resource. 
          This area is restricted to administrators only.
        </p>
        
        <div className="flex gap-4 justify-center">
          <Button asChild variant="default">
            <Link href="/dashboard">
              Go to Dashboard
            </Link>
          </Button>
          
          <Button asChild variant="outline">
            <Link href="/">
              Go to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}