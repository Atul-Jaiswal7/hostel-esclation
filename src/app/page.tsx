
"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Ticket, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { signInWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase/config';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isFirebaseAvailable, setIsFirebaseAvailable] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  useEffect(() => {
    // Check if Firebase auth is available
    if (!auth) {
      setIsFirebaseAvailable(false);
      setIsCheckingAuth(false);
      toast({
        title: "Configuration Error",
        description: "Firebase is not properly configured. Please check your environment variables.",
        variant: "destructive",
      });
      return;
    }

    setIsFirebaseAvailable(true);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace('/dashboard');
      } else {
        setIsCheckingAuth(false);
      }
    });
    return () => unsubscribe();
  }, [router, toast]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!auth) {
      toast({
        title: "Configuration Error",
        description: "Firebase is not properly configured. Please check your environment variables.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
          title: "Login Successful",
          description: "Redirecting to your dashboard...",
      });
      router.replace('/dashboard');
    } catch (error: any) {
        let errorMessage = "An unknown error occurred.";
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
            errorMessage = "Invalid email or password.";
        }
        toast({
            title: "Login Failed",
            description: errorMessage,
            variant: "destructive",
        });
    } finally {
        setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address first.",
        variant: "destructive",
      });
      return;
    }

    if (!auth) {
      toast({
        title: "Configuration Error",
        description: "Firebase is not properly configured.",
        variant: "destructive",
      });
      return;
    }

    setIsSendingReset(true);
    try {
      const actionCodeSettings = {
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/reset-password`,
        handleCodeInApp: true,
      };

      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      
      toast({
        title: "Reset Email Sent",
        description: "Check your email for a password reset link.",
        variant: "default",
      });
      
      setShowForgotPassword(false);
    } catch (error: any) {
      console.error('Error sending reset email:', error);
      let errorMessage = "Failed to send reset email";
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = "No account found with this email address.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Reset Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSendingReset(false);
    }
  };

  if (isCheckingAuth) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
    )
  }

  if (!isFirebaseAvailable) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-4">
              <AlertCircle className="w-10 h-10 text-destructive" />
            </div>
            <CardTitle className="text-destructive">Configuration Error</CardTitle>
            <CardDescription>
              Firebase is not properly configured. Please check your environment variables.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              To run this application locally, you need to:
            </p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
              <li>• Copy <code className="bg-muted px-1 rounded">env.example</code> to <code className="bg-muted px-1 rounded">.env.local</code></li>
              <li>• Fill in your Firebase configuration</li>
              <li>• Add your SendGrid API key</li>
              <li>• Add your Google AI API key</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-4">
                <h1 className="text-2xl font-bold text-primary">MANIT</h1>
            </div>
          <CardTitle>Hostel Escalation System</CardTitle>
        </CardHeader>
        <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                    id="email" 
                    type="email" 
                    placeholder="your.email@example.com" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                    id="password" 
                    type="password"
                    placeholder="password"
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                />
            </div>
            <div className="text-right">
                <Button
                    type="button"
                    variant="link"
                    className="text-sm text-muted-foreground hover:text-primary"
                    onClick={() => setShowForgotPassword(!showForgotPassword)}
                    disabled={isLoading}
                >
                    Forgot Password?
                </Button>
            </div>
            {showForgotPassword && (
                <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm text-muted-foreground mb-2">
                        Enter your email above and click "Send Reset Link" to receive a password reset email.
                    </p>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleForgotPassword}
                        disabled={isSendingReset || !email}
                        className="w-full"
                    >
                        {isSendingReset && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                        Send Reset Link
                    </Button>
                </div>
            )}
            </CardContent>
            <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
            </Button>
            </CardFooter>
        </form>
      </Card>
    </div>
  );
}
