import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp, signInWithProvider, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = isLogin 
        ? await signIn(email, password)
        : await signUp(email, password, name);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        if (!isLogin) {
          toast({
            title: "Success",
            description: "Please check your email to confirm your account."
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github' | 'twitter') => {
    try {
      const { error } = await signInWithProvider(provider);
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign in with " + provider,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-secondary flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center py-8">
          <div className="text-6xl mb-6">🤱</div>
          <CardTitle className="text-3xl">{isLogin ? 'Welcome Back' : 'Create Account'}</CardTitle>
          <CardDescription className="text-lg mt-2">
            {isLogin ? 'Sign in to your pregnancy tracker' : 'Join us to track your pregnancy journey'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-3">
                <Label htmlFor="name" className="text-base">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLogin}
                  className="text-base py-6"
                />
              </div>
            )}
            
            <div className="space-y-3">
              <Label htmlFor="email" className="text-base">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-base py-6"
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="password" className="text-base">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-base py-6"
              />
            </div>
            
            <Button type="submit" className="w-full text-lg py-6" disabled={loading}>
              {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
            </Button>
          </form>

          <Separator />

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full text-base py-6"
              onClick={() => handleSocialLogin('google')}
            >
              Continue with Google
            </Button>
            <Button
              variant="outline"
              className="w-full text-base py-6"
              onClick={() => handleSocialLogin('github')}
            >
              Continue with GitHub
            </Button>
            <Button
              variant="outline"
              className="w-full text-base py-6"
              onClick={() => handleSocialLogin('twitter')}
            >
              Continue with Twitter
            </Button>
          </div>

          <div className="text-center">
            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="text-base"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};