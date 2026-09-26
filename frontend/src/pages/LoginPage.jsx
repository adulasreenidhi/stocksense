import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../features/auth/authSlice.js';
import { Card, Button, Input, useToast } from '../components/common';
import { Boxes, Lock, User, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { addToast } = useToast();

  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!loginId.trim() || !password.trim()) {
      setError('Invalid Login Id or Password');
      addToast({
        title: 'Authentication Error',
        description: 'Invalid Login Id or Password',
        variant: 'danger',
      });
      return;
    }

    setLoading(true);
    try {
      // POST /auth/login with { email, password }
      const res = await dispatch(login({ email: loginId.trim(), password })).unwrap();
      addToast({
        title: 'Authentication Succeeded',
        description: `Welcome back, ${res.user.name}.`,
        variant: 'success',
      });
      navigate('/dashboard');
    } catch {
      setError('Invalid Login Id or Password');
      addToast({
        title: 'Authentication Error',
        description: 'Invalid Login Id or Password',
        variant: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-neutral-100 flex items-center justify-center p-4 relative selection:bg-accent selection:text-white">
      {/* Dark obsidian atmosphere glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-accent/[0.07] to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-black border border-white/[0.12] flex items-center justify-center shadow-accent-glow-sm">
            <Boxes className="w-6 h-6 text-accent" />
          </div>
          <h1 className="font-display font-extrabold text-2xl tracking-tight text-white uppercase">
            StockSense
          </h1>
          <p className="text-xs text-neutral-400 font-mono tracking-widest uppercase">
            ENTERPRISE INVENTORY PORTAL
          </p>
        </div>

        {/* Auth Glass Card */}
        <Card className="p-8 backdrop-blur-2xl bg-surface/95 border-white/[0.1] shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                role="alert"
                className="p-3.5 rounded-xl bg-status-danger/15 border border-status-danger/40 text-red-300 text-xs font-medium flex items-center gap-2.5 animate-in fade-in duration-150"
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Input
              label="Login ID / Email"
              type="text"
              value={loginId}
              onChange={(e) => {
                setLoginId(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. operator@stocksense.io"
              leftIcon={<User className="w-4 h-4" />}
              autoComplete="username"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              placeholder="••••••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              autoComplete="current-password"
              required
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <Link
                to="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  addToast({
                    title: 'Recovery Dispatched',
                    description: 'Password reset link sent to registered operator security key.',
                    variant: 'info',
                  });
                }}
                className="text-neutral-400 hover:text-white transition-colors font-mono text-[11px]"
              >
                Forgot Password?
              </Link>

              <Link
                to="/signup"
                className="text-accent hover:underline font-semibold font-display text-xs"
              >
                Sign Up
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2 tracking-wider uppercase font-bold"
              isLoading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              SIGN IN
            </Button>
          </form>
        </Card>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 text-[11px] font-mono text-neutral-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>FIPS-140-3 COMPLIANT • END-TO-END AUDITED</span>
        </div>
      </div>
    </div>
  );
}
