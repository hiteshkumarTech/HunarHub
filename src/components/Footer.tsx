import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Mail } from 'lucide-react';
import { Container } from './ui/Container';
import { CATEGORIES } from '../data/mockData';

const linkCls = 'text-[13px] text-gray-500 hover:text-[#111] transition-colors';

function FooterCol({ title, links }: { title: string; links: { label: string; to: string }[] }) {
  return (
    <div>
      <div className="text-[11px] font-mono uppercase tracking-widest text-gray-400">{title}</div>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link to={l.to} className={linkCls}>{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Global site footer — reusable across pages. */
export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-[#fcfcfc]">
      <Container className="py-14">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2">
            <div className="text-[20px] font-semibold tracking-[-0.02em]">HunarHub</div>
            <p className="mt-3 max-w-[340px] text-[13px] leading-[1.7] text-gray-600">
              A digital home for local micro-entrepreneurs — helping cobblers, potters, tailors, artisans and
              vendors reach customers directly, keep more of what they earn, and keep traditional skills alive.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {[
                { Icon: Instagram, label: 'HunarHub on Instagram' },
                { Icon: Twitter, label: 'HunarHub on Twitter' },
                { Icon: Facebook, label: 'HunarHub on Facebook' },
                { Icon: Mail, label: 'Email HunarHub' },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors hover:border-black hover:text-black"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <FooterCol title="Explore" links={CATEGORIES.map((c) => ({ label: c.name, to: `/browse?cat=${c.id}` }))} />
          <FooterCol
            title="For customers"
            links={[
              { label: 'Browse artisans', to: '/browse' },
              { label: 'How it works', to: '/' },
              { label: 'Favourites', to: '/browse' },
            ]}
          />
          <FooterCol
            title="For sellers"
            links={[
              { label: 'Become a seller', to: '/dashboard' },
              { label: 'Seller dashboard', to: '/dashboard' },
              { label: 'Success stories', to: '/' },
            ]}
          />
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-gray-200 pt-6 text-[12px] text-gray-500 md:flex-row md:items-center">
          <span>© 2026 HunarHub — Made in India, for local artisans.</span>
          <div className="flex gap-6">
            <a href="#" className={linkCls}>Privacy</a>
            <a href="#" className={linkCls}>Terms</a>
            <a href="#" className={linkCls}>Contact</a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
