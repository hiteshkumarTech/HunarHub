import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../lib/api';
import { AuthShell } from '../components/auth/AuthShell';
import { Field, TextInput, SelectInput } from '../components/ui/Field';
import { buttonStyles } from '../components/ui/button';
import { useCategories } from '../hooks/categories';
import { cn } from '../lib/utils';
import type { CategoryId } from '../types';
import type { RegisterInput } from '../types/api';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<'customer' | 'entrepreneur'>('customer');
  const [form, setForm] = useState({ name: '', email: '', password: '', category: '', craft: '', city: '', state: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Category picker reads from the admin-managed list (GET /api/categories)
  // instead of a compiled-in constant, so a renamed/deactivated category
  // takes effect without a redeploy — see hooks/categories.ts.
  const categories = useCategories();
  const activeCategories = categories.data?.categories.filter((c) => c.active) ?? [];

  useEffect(() => {
    if (activeCategories.length && !activeCategories.some((c) => c.id === form.category)) {
      setForm((f) => ({ ...f, category: activeCategories[0].id }));
    }
    // Only re-sync when the loaded category list changes, not on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories.data]);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const input: RegisterInput = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role,
        ...(role === 'entrepreneur'
          ? { profile: { category: form.category as CategoryId, craft: form.craft.trim(), city: form.city.trim(), state: form.state.trim() } }
          : {}),
      };
      const user = await register(input);
      navigate(user.role === 'entrepreneur' ? '/dashboard' : '/browse', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join HunarHub as a customer or a local seller."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-accent hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl border border-gray-200 bg-gray-50 p-1">
        {(['customer', 'entrepreneur'] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={cn(
              'rounded-lg py-2 text-[13px] font-medium transition-colors',
              role === r ? 'bg-white text-[#111] shadow-sm' : 'text-gray-500 hover:text-gray-800',
            )}
          >
            {r === 'customer' ? 'I want to hire' : 'I sell / offer a service'}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700">
            {error}
          </div>
        )}
        <Field label="Full name" htmlFor="name">
          <TextInput id="name" required value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Your name" />
        </Field>
        <Field label="Email" htmlFor="email">
          <TextInput id="email" type="email" autoComplete="email" required value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" />
        </Field>
        <Field label="Password" htmlFor="password">
          <TextInput id="password" type="password" autoComplete="new-password" required minLength={6} value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="At least 6 characters" />
        </Field>

        {role === 'entrepreneur' && (
          <>
            <Field label="Craft category" htmlFor="category">
              {categories.isError ? (
                <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-[13px] text-red-700">
                  Could not load categories.
                  <button type="button" onClick={() => categories.refetch()} className="font-medium underline">
                    Retry
                  </button>
                </div>
              ) : (
                <SelectInput
                  id="category"
                  required
                  disabled={activeCategories.length === 0}
                  value={form.category}
                  onChange={(e) => set('category', e.target.value)}
                >
                  {activeCategories.length === 0 ? (
                    <option value="">Loading…</option>
                  ) : (
                    activeCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))
                  )}
                </SelectInput>
              )}
            </Field>
            <Field label="Your craft / title" htmlFor="craft">
              <TextInput id="craft" required value={form.craft} onChange={(e) => set('craft', e.target.value)} placeholder="e.g. Potter (Kumhar)" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="City" htmlFor="city">
                <TextInput id="city" required value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="Jaipur" />
              </Field>
              <Field label="State" htmlFor="state">
                <TextInput id="state" required value={form.state} onChange={(e) => set('state', e.target.value)} placeholder="Rajasthan" />
              </Field>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={busy || (role === 'entrepreneur' && !form.category)}
          className={buttonStyles({ size: 'lg', className: 'w-full' })}
        >
          {busy ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </AuthShell>
  );
}
