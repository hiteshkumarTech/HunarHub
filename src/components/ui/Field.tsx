import type { InputHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/utils';

export function Field({ label, error, htmlFor, children }: { label: string; error?: string; htmlFor?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-[13px] font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {error && <p className="mt-1 text-[12px] text-red-600">{error}</p>}
    </div>
  );
}

const inputBase =
  'w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-[14px] outline-none transition-colors ' +
  'placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black/10';

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputBase, className)} />;
}

export function SelectInput({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(inputBase, className)} />;
}
