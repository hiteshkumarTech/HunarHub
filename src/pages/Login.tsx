import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../lib/api';
import { AuthShell } from '../components/auth/AuthShell';
import { Field, TextInput } from '../components/ui/Field';
import { buttonStyles } from '../components/ui/button';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? '/';

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = await login(email.trim(), password);
      navigate(user.role === 'entrepreneur' ? '/dashboard' : from, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to hire local artisans or manage your shop."
      footer={
        <>
          New here?{' '}
          <Link to="/register" className="font-medium text-accent hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700">
            {error}
          </div>
        )}
        <Field label="Email" htmlFor="email">
          <TextInput id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </Field>
        <Field label="Password" htmlFor="password">
          <TextInput id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </Field>
        <button type="submit" disabled={busy} className={buttonStyles({ size: 'lg', className: 'w-full' })}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="mt-4 text-[12px] text-gray-500">
        Demo: <code className="font-mono">priya@example.com</code> / <code className="font-mono">password123</code>
      </p>
    </AuthShell>
  );
}
