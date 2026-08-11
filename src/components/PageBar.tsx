import { Link } from 'react-router-dom';
import { UserMenu } from './UserMenu';

export function PageBar({ crumb }: { crumb?: string }) {
  return (
    <div className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-200 bg-[#fcfcfc]/90 px-6 pb-4 pt-5 backdrop-blur md:px-16">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-black focus:px-4 focus:py-2 focus:text-[13px] focus:font-medium focus:text-white"
      >
        Skip to content
      </a>
      <div className="flex items-center gap-6">
        <Link to="/" className="text-[15px] font-semibold tracking-[-0.02em]">
          HunarHub
        </Link>
        <Link to="/browse" className="text-[11px] font-mono uppercase tracking-widest text-gray-600 hover:text-black">
          Browse
        </Link>
        <Link to="/marketplace" className="text-[11px] font-mono uppercase tracking-widest text-gray-600 hover:text-black">
          Marketplace
        </Link>
        {crumb && <span className="hidden text-[11px] font-mono uppercase tracking-widest text-gray-400 md:inline">{crumb}</span>}
      </div>
      <UserMenu />
    </div>
  );
}
