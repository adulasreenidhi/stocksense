import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { signup } from '../features/auth/authSlice.js';
import { Card, Button, Input, useToast } from '../components/common';
import { Boxes, User, Mail, Lock, Check, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export default function SignupPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    loginId: '',
    email: '',
    password: '',
    rePassword: '',
  });

  const [touched, setTouched] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Client validation checks
  const isLoginIdLengthValid = formData.loginId.trim().length >= 3;
  const isEmailFormatValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());

  const hasUpper = /[A-Z]/.test(formData.password);
  const hasLower = /[a-z]/.test(formData.password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);
  const hasMinLength = formData.password.length >= 8;
  const isPasswordValid = hasUpper && hasLower && hasSpecial && hasMinLength;
  const isConfirmMatch = formData.rePassword.length > 0 && formData.password === formData.rePassword;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setGeneralError('');
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ loginId: true, email: true, password: true, rePassword: true });

    if (!isLoginIdLengthValid) {
      setGeneralError('Please enter a valid display name or Login ID (min 3 characters).');
      addToast({
        title: 'Validation Error',
        description: 'Please enter a valid display name or Login ID.',
        variant: 'danger',
      });
      return;
    }
    if (!isEmailFormatValid) {
      setGeneralError('Please enter a valid email address.');
      addToast({
        title: 'Validation Error',
        description: 'Please enter a valid email address.',
        variant: 'danger',
      });
      return;
    }
    if (!isPasswordValid) {
      setGeneralError('Password does not meet the complexity requirements.');
      addToast({
        title: 'Weak Password',
        description: 'Must include uppercase, lowercase, special character, and min 8 chars.',
        variant: 'danger',
      });
      return;
    }
    if (!isConfirmMatch) {
      setGeneralError('Passwords do not match.');
      addToast({
        title: 'Password Mismatch',
        description: 'Confirmation password does not match.',
        variant: 'danger',
      });
      return;
    }

    setLoading(true);
    try {
      const res = await dispatch(
        signup({
          name: formData.loginId.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          role: 'inventory_manager',
        })
      ).unwrap();

      setSuccessMsg('Account created successfully! Redirecting...');
      addToast({
        title: 'Account Registered',
        description: `Operator badge issued for ${res.user.name}. Welcome to StockSense.`,
        variant: 'success',
      });
      navigate('/dashboard');
    } catch (err) {
      const message = err?.message || (typeof err === 'string' ? err : 'Registration failed');
      setGeneralError(message);
      addToast({
        title: 'Registration Error',
        description: message,
        variant: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-neutral-100 flex items-center justify-center p-4 relative selection:bg-accent selection:text-white">
      {/* Dark atmospheric ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[850px] h-[350px] bg-gradient-to-b from-accent/[0.07] to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="w-full max-w-lg space-y-6">
        {/* Brand header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-black border border-white/[0.12] flex items-center justify-center shadow-accent-glow-sm">
            <Boxes className="w-6 h-6 text-accent" />
          </div>
          <h1 className="font-display font-extrabold text-2xl tracking-tight text-white uppercase">
            Create Operator Account
          </h1>
          <p className="text-xs text-neutral-400 font-mono tracking-widest uppercase">
            STOCKSENSE SECURE ENROLLMENT
          </p>
        </div>

        {/* Signup Glass Card */}
        <Card className="p-8 backdrop-blur-2xl bg-surface/95 border-white/[0.1] shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {generalError && (
              <div
                role="alert"
                className="p-3.5 rounded-xl bg-status-danger/15 border border-status-danger/40 text-red-300 text-xs font-medium flex items-center gap-2.5 animate-in fade-in duration-150"
              >
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{generalError}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-xl bg-status-success/15 border border-status-success/40 text-emerald-300 text-xs font-medium flex items-center gap-2.5 animate-in fade-in duration-150">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Login ID / Name */}
            <div>
              <Input
                label="Full Name / Operator ID"
                type="text"
                placeholder="e.g. Victor Vance"
                value={formData.loginId}
                onChange={(e) => handleChange('loginId', e.target.value)}
                onBlur={() => handleBlur('loginId')}
                leftIcon={<User className="w-4 h-4" />}
                required
              />
              {touched.loginId && (
                <div className="mt-1.5 flex items-center gap-3 text-[11px] font-mono">
                  <span
                    className={
                      isLoginIdLengthValid ? 'text-emerald-400 flex items-center gap-1' : 'text-neutral-400'
                    }
                  >
                    {isLoginIdLengthValid ? '✓' : '•'} Min 3 characters
                  </span>
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <Input
                label="Corporate Email"
                type="email"
                placeholder="operator@company.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />
              {touched.email && (
                <div className="mt-1.5 text-[11px] font-mono">
                  {isEmailFormatValid ? (
                    <span className="text-emerald-400">✓ Valid corporate email address</span>
                  ) : (
                    <span className="text-neutral-400">• Enter a valid email format</span>
                  )}
                </div>
              )}
            </div>

            {/* Password */}
            <div>
              <Input
                label="Password"
                type="password"
                placeholder="Min 8 chars, uppercase, lowercase, symbol"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />
              {/* Password complexity checklist */}
              <div className="mt-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                <div className={hasMinLength ? 'text-emerald-400' : 'text-neutral-400'}>
                  {hasMinLength ? '✓' : '•'} Min 8 characters
                </div>
                <div className={hasUpper ? 'text-emerald-400' : 'text-neutral-400'}>
                  {hasUpper ? '✓' : '•'} 1 Uppercase (A-Z)
                </div>
                <div className={hasLower ? 'text-emerald-400' : 'text-neutral-400'}>
                  {hasLower ? '✓' : '•'} 1 Lowercase (a-z)
                </div>
                <div className={hasSpecial ? 'text-emerald-400' : 'text-neutral-400'}>
                  {hasSpecial ? '✓' : '•'} 1 Special symbol
                </div>
              </div>
            </div>

            {/* Re-enter Password */}
            <div>
              <Input
                label="Re-enter Password"
                type="password"
                placeholder="Confirm password"
                value={formData.rePassword}
                onChange={(e) => handleChange('rePassword', e.target.value)}
                onBlur={() => handleBlur('rePassword')}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />
              {touched.rePassword && formData.rePassword && (
                <div className="mt-1.5 text-[11px] font-mono">
                  {isConfirmMatch ? (
                    <span className="text-emerald-400">✓ Passwords match</span>
                  ) : (
                    <span className="text-red-400">✕ Passwords do not match</span>
                  )}
                </div>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-4 tracking-wider uppercase font-bold"
              isLoading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              SIGN UP
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/[0.06] text-center text-xs text-neutral-400">
            <span>Already have an authorized ID? </span>
            <Link
              to="/login"
              className="text-white hover:text-accent font-semibold underline underline-offset-4"
            >
              Sign In
            </Link>
          </div>
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
