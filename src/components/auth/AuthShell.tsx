import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../ui/Container';

/** Centered, branded shell for auth screens. */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#fcfcfc]">
      <Container className="flex min-h-screen max-w-[460px] flex-col justify-center py-12">
        <Link to="/" className="text-[22px] font-semibold tracking-[-0.02em]">
          HunarHub
        </Link>
        <h1 className="mt-8 text-[1.8rem] font-semibold tracking-tight text-[#111]">{title}</h1>
        {subtitle && <p className="mt-2 text-[14px] leading-[1.6] text-gray-600">{subtitle}</p>}
        <div className="mt-7">{children}</div>
        {footer && <div className="mt-6 text-[13px] text-gray-600">{footer}</div>}
      </Container>
    </main>
  );
}
