import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Plus, MapPin, Check, Clock } from 'lucide-react';
import { PageBar } from '../components/PageBar';
import { Monogram } from '../components/Monogram';
import { Stars } from '../components/Stars';
import { CatIcon } from '../components/craftIcons';
import { byId, ENTREPRENEURS } from '../data/mockData';
import { cn, inr, pic } from '../lib/utils';

const TABS = [{ id: 'services', label: 'Services' }, { id: 'products', label: 'Products' }, { id: 'reviews', label: 'Reviews' }] as const;
type TabId = (typeof TABS)[number]['id'];

const REVIEWS = [
  { n: 'Priya S.', r: 5, t: 'Beautiful craftsmanship and delivered on time. Highly recommend!' },
  { n: 'Arjun M.', r: 5, t: 'Exactly what I wanted. Great communication throughout.' },
  { n: 'Neha K.', r: 4, t: 'Lovely work, took a day longer than expected but worth it.' },
];

export default function Profile() {
  const { id } = useParams();
  const e = byId(id) ?? ENTREPRENEURS[0];
  const [tab, setTab] = useState<TabId>('services');

  return (
    <div className="min-h-screen">
      <PageBar crumb={e.name} />
      <div className="relative h-44 md:h-60 bg-gray-900 overflow-hidden">
        <img src={pic(`cover-${e.id}`, 1600, 500)} alt="" className="w-full h-full object-cover opacity-60" />
        <Link to="/browse" className="absolute top-4 left-6 md:left-16 text-[10px] font-mono uppercase tracking-widest text-white/80 hover:text-white flex items-center gap-1">
          <ArrowUpRight size={13} className="rotate-[225deg]" /> Back to browse
        </Link>
      </div>

      <div className="px-6 md:px-16">
        {/* avatar overlaps the cover; sits ABOVE the image via z-10 */}
        <div className="relative z-10 -mt-12 md:-mt-16 w-fit">
          <Monogram name={e.name} size={96} className="ring-4 ring-[#fcfcfc]" />
        </div>
        {/* identity + stats sit fully BELOW the cover, so nothing is clipped */}
        <div className="mt-4 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[2rem] md:text-[2.6rem] font-medium tracking-tight leading-tight">{e.name}{e.verified && <Check size={20} className="text-blue-600" />}</div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px] font-mono text-gray-600 uppercase tracking-wide">
              <span className="inline-flex items-center gap-1.5"><CatIcon id={e.category} size={13} strokeWidth={2} />{e.craft}</span>
              <span className="inline-flex items-center gap-1"><MapPin size={12} />{e.city}, {e.state}</span>
            </div>
          </div>
          <div className="flex items-center gap-8 md:pt-1 shrink-0">
            <div><div className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Rating</div><div className="flex items-center gap-1.5 mt-1"><Stars value={e.rating} /><span className="text-[13px] font-medium">{e.rating}</span></div></div>
            <div><div className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Experience</div><div className="text-[15px] font-medium mt-1">{e.exp} yrs</div></div>
            <div><div className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Status</div><div className={cn('text-[13px] font-medium mt-1', e.available ? 'text-green-700' : 'text-gray-400')}>{e.available ? 'Available' : 'Busy'}</div></div>
          </div>
        </div>

        <p className="mt-8 max-w-[720px] text-[15px] leading-[1.7] text-gray-700">{e.bio}</p>

        <div className="mt-10 flex gap-8 border-b border-gray-200">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={cn('pb-3 text-[11px] font-mono uppercase tracking-widest transition-colors relative', tab === t.id ? 'text-black' : 'text-gray-400 hover:text-gray-700')}>
              {t.label}{tab === t.id && <span className="absolute left-0 -bottom-[1px] w-full h-[2px] bg-black" />}
            </button>
          ))}
        </div>

        <div className="py-8 pb-24">
          {tab === 'services' && (
            <div className="grid gap-3 max-w-[760px]">
              {e.services.map((s) => (
                <div key={s.name} className="flex items-center justify-between border border-gray-200 rounded-lg px-5 py-4 bg-white hover:border-black transition-colors">
                  <div><div className="text-[15px] font-medium">{s.name}</div><div className="mt-1 flex items-center gap-1 text-[11px] font-mono text-gray-500 uppercase tracking-wide"><Clock size={12} />{s.dur}</div></div>
                  <div className="flex items-center gap-4"><div className="text-[16px] font-semibold">{inr(s.price)}</div>
                    <button className="rounded-md bg-[#111] text-white text-[11px] font-mono uppercase tracking-widest px-4 py-2 hover:bg-black">Request</button></div>
                </div>
              ))}
            </div>
          )}
          {tab === 'products' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {e.products.map((pr, i) => (
                <div key={i} className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:border-black transition-colors">
                  <img src={pic(`prod-${e.id}-${i}`, 500, 500)} alt="" className="w-full h-40 object-cover" />
                  <div className="p-4"><div className="text-[14px] font-medium leading-tight">{pr.name}</div>
                    <div className="mt-3 flex items-center justify-between"><span className="text-[15px] font-semibold">{inr(pr.price)}</span>
                      <button className="rounded-full border border-gray-300 hover:border-black w-8 h-8 flex items-center justify-center"><Plus size={15} /></button></div></div>
                </div>
              ))}
            </div>
          )}
          {tab === 'reviews' && (
            <div className="grid gap-4 max-w-[720px]">
              {REVIEWS.map((rv, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-5 bg-white">
                  <div className="flex items-center justify-between"><div className="flex items-center gap-3"><Monogram name={rv.n} size={34} /><span className="text-[14px] font-medium">{rv.n}</span></div><Stars value={rv.r} /></div>
                  <p className="mt-3 text-[14px] text-gray-700 leading-relaxed">{rv.t}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 border-t border-gray-200 bg-[#fcfcfc]/95 backdrop-blur px-6 md:px-16 py-4 flex items-center justify-between">
        <div className="text-[13px] text-gray-600"><span className="font-mono text-[11px] uppercase tracking-widest text-gray-400">Starting at </span><span className="font-semibold text-[#111]">{inr(e.start)}</span></div>
        <button className="rounded-md bg-[#111] text-white px-6 py-3 text-[13px] font-medium hover:bg-black flex items-center gap-2">Place Service Request <ArrowRight size={16} /></button>
      </div>
    </div>
  );
}
