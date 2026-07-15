import { Link } from 'react-router-dom';

export function PageBar({ crumb }: { crumb?: string }) {
  return (
    <div className="px-6 md:px-16 pt-6 pb-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-[#fcfcfc]/90 backdrop-blur z-40">
      <Link to="/" className="text-[15px] font-semibold tracking-[-0.02em]">HunarHub</Link>
      <nav className="flex items-center gap-6 text-[10px] font-mono uppercase tracking-widest text-gray-600">
        <Link to="/browse" className="hover:text-black">Browse</Link>
        <Link to="/dashboard" className="hover:text-black">Sell</Link>
        {crumb && <span className="hidden md:inline text-gray-400">{crumb}</span>}
      </nav>
    </div>
  );
}
