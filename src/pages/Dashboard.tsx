import { useState, type ReactNode } from 'react';
import { TrendingUp, Package, Clock, Star, Wallet, Plus, Check } from 'lucide-react';
import { PageBar } from '../components/PageBar';
import { Monogram } from '../components/Monogram';
import { byId } from '../data/mockData';
import { cn, inr } from '../lib/utils';

function Kpi({ icon, label, value, delta }: { icon: ReactNode; label: string; value: ReactNode; delta?: string }) {
  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-white">
      <div className="flex items-center justify-between text-gray-400">{icon}<span className="text-[10px] font-mono uppercase tracking-widest">{label}</span></div>
      <div className="mt-4 text-[1.8rem] font-medium tracking-tight">{value}</div>
      {delta && <div className="mt-1 text-[11px] font-mono text-green-700 flex items-center gap-1"><TrendingUp size={12} />{delta}</div>}
    </div>
  );
}

interface Req { id: number; who: string; svc: string; price: number; when: string; status: 'pending' | 'accepted' | 'declined'; }

export default function Dashboard() {
  const me = byId('ramesh')!;
  const [available, setAvailable] = useState(true);
  const [requests, setRequests] = useState<Req[]>([
    { id: 1, who: 'Priya Sharma', svc: 'Custom Terracotta Pot', price: 250, when: '2h ago', status: 'pending' },
    { id: 2, who: 'Arjun Mehta', svc: 'Diwali Diya Set (12 pcs)', price: 120, when: '5h ago', status: 'pending' },
    { id: 3, who: 'Neha Kapoor', svc: 'Clay Water Bottle', price: 400, when: '1d ago', status: 'pending' },
  ]);
  const act = (id: number, status: Req['status']) => setRequests((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));
  const pending = requests.filter((r) => r.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#fcfcfc]">
      <PageBar crumb="Dashboard" />
      <div className="px-6 md:px-16 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Monogram name={me.name} size={56} />
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Entrepreneur Dashboard</div>
              <div className="text-[1.6rem] font-medium tracking-tight leading-tight">{me.name}</div>
              <div className="text-[12px] font-mono text-gray-500">{me.craft} · {me.city}</div>
            </div>
          </div>
          <label className="inline-flex items-center gap-3 text-[11px] font-mono uppercase tracking-widest text-gray-600 cursor-pointer select-none">
            Availability
            <span onClick={() => setAvailable((a) => !a)} className={cn('relative w-12 h-6 rounded-full transition-colors', available ? 'bg-black' : 'bg-gray-300')}>
              <span className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all', available ? 'left-6' : 'left-0.5')} />
            </span>
            <span className={available ? 'text-green-700' : 'text-gray-400'}>{available ? 'Open' : 'Paused'}</span>
          </label>
        </div>

        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Kpi icon={<Wallet size={16} />} label="This month" value={inr(18400)} delta="+12% vs last" />
          <Kpi icon={<Package size={16} />} label="Active orders" value="7" delta="+2 new" />
          <Kpi icon={<Clock size={16} />} label="Pending requests" value={pending} />
          <Kpi icon={<Star size={16} />} label="Rating" value={`${me.rating} ★`} />
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 border border-gray-200 rounded-xl bg-white">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-widest text-gray-500">Service requests</span>
              <span className="text-[11px] font-mono text-gray-400">{pending} pending</span>
            </div>
            <div className="divide-y divide-gray-100">
              {requests.map((r) => (
                <div key={r.id} className="flex items-center justify-between px-5 py-4 gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Monogram name={r.who} size={38} />
                    <div className="min-w-0"><div className="text-[14px] font-medium truncate">{r.who}</div><div className="text-[12px] text-gray-500 truncate">{r.svc} · <span className="text-[#111] font-medium">{inr(r.price)}</span></div><div className="text-[10px] font-mono uppercase tracking-widest text-gray-400">{r.when}</div></div>
                  </div>
                  {r.status === 'pending' ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => act(r.id, 'accepted')} className="rounded-md bg-[#111] text-white text-[11px] font-mono uppercase tracking-widest px-3 py-2 hover:bg-black flex items-center gap-1"><Check size={13} />Accept</button>
                      <button onClick={() => act(r.id, 'declined')} className="rounded-md border border-gray-300 text-gray-600 text-[11px] font-mono uppercase tracking-widest px-3 py-2 hover:border-black">Decline</button>
                    </div>
                  ) : (
                    <span className={cn('shrink-0 text-[10px] font-mono uppercase tracking-widest px-3 py-2 rounded-md', r.status === 'accepted' ? 'text-green-700 bg-green-50' : 'text-gray-400 bg-gray-50')}>{r.status}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="border border-gray-200 rounded-xl bg-white">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-widest text-gray-500">Your listings</span>
              <button className="w-7 h-7 rounded-full border border-gray-300 hover:border-black flex items-center justify-center"><Plus size={14} /></button>
            </div>
            <div className="divide-y divide-gray-100">
              {me.services.map((s) => (
                <div key={s.name} className="flex items-center justify-between px-5 py-3.5">
                  <div className="text-[13px] font-medium">{s.name}</div><div className="text-[13px] font-semibold">{inr(s.price)}</div>
                </div>
              ))}
              {me.products.map((p, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3.5">
                  <div className="text-[13px] text-gray-600 flex items-center gap-2"><Package size={13} className="text-gray-400" />{p.name}</div><div className="text-[13px] font-semibold">{inr(p.price)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
