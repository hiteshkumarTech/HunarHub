import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Plus, MapPin, Check, Clock, X } from 'lucide-react';
import { PageBar } from '../components/PageBar';
import { Monogram } from '../components/Monogram';
import { Stars } from '../components/Stars';
import { CatIcon } from '../components/craftIcons';
import { FavoriteButton } from '../components/FavoriteButton';
import { EntrepreneurCardTile } from '../components/EntrepreneurCardTile';
import { Skeleton, ErrorState, EmptyState } from '../components/ui/States';
import { Tabs, TabPanel } from '../components/ui/Tabs';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';
import { useEntrepreneur, useEntrepreneurs } from '../hooks/entrepreneurs';
import { useCreateOrder } from '../hooks/orders';
import { pushRecentlyViewed } from '../lib/recentlyViewed';
import { cn, inr, pic } from '../lib/utils';
import type { CategoryId } from '../types';
import type { ProductItem, ReviewItem, ServiceItem } from '../types/api';

const TABS = [
  { id: 'services', label: 'Services' },
  { id: 'products', label: 'Products' },
  { id: 'reviews', label: 'Reviews' },
] as const;
type TabId = (typeof TABS)[number]['id'];

const reviewerName = (r: ReviewItem): string => (typeof r.customer === 'object' && r.customer ? r.customer.name : 'Customer');

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const createOrder = useCreateOrder();
  const { data, isLoading, isError, error, refetch } = useEntrepreneur(id);
  const similar = useEntrepreneurs({ cat: data?.entrepreneur.category ?? undefined, sort: 'rating' });
  const [tab, setTab] = useState<TabId>('services');
  const [lightbox, setLightbox] = useState<ProductItem | null>(null);

  useEffect(() => {
    if (data?.entrepreneur) {
      const en = data.entrepreneur;
      pushRecentlyViewed({ id: en.id, name: en.name, craft: en.craft, city: en.city, category: en.category });
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <PageBar crumb="Profile" />
        <Skeleton className="h-44 rounded-none md:h-60" />
        <div id="main-content" tabIndex={-1} className="px-6 md:px-16">
          <Skeleton className="-mt-12 h-24 w-24 rounded-full md:-mt-16" />
          <Skeleton className="mt-4 h-8 w-64" />
          <Skeleton className="mt-3 h-4 w-40" />
          <Skeleton className="mt-8 h-24 w-full max-w-[720px]" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen">
        <PageBar crumb="Profile" />
        <div id="main-content" tabIndex={-1} className="px-6 py-10 md:px-16">
          <ErrorState message={error instanceof Error ? error.message : 'Could not load this profile.'} onRetry={() => refetch()} />
        </div>
      </div>
    );
  }

  const { entrepreneur: e, services, products, reviews } = data;
  const similarList = (similar.data?.entrepreneurs ?? []).filter((x) => x.id !== e.id).slice(0, 4);

  const requireCustomer = (): boolean => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return false;
    }
    if (user.role !== 'customer') {
      toast('Only customer accounts can place orders.', 'error');
      return false;
    }
    return true;
  };

  const requestService = (s: ServiceItem) => {
    if (!requireCustomer()) return;
    createOrder.mutate(
      { entrepreneurId: e.id, kind: 'service', itemId: s.id },
      {
        onSuccess: () => toast(`Request sent to ${e.name} for “${s.name}”.`, 'success'),
        onError: (err) => toast(err instanceof Error ? err.message : 'Could not place request.', 'error'),
      },
    );
  };

  const buyProduct = (p: ProductItem) => {
    if (!requireCustomer()) return;
    createOrder.mutate(
      { entrepreneurId: e.id, kind: 'product', itemId: p.id },
      {
        onSuccess: () => {
          setLightbox(null);
          toast(`Order placed with ${e.name} for “${p.name}”.`, 'success');
        },
        onError: (err) => toast(err instanceof Error ? err.message : 'Could not place order.', 'error'),
      },
    );
  };

  return (
    <div className="min-h-screen">
      <PageBar crumb={e.name} />
      <div className="relative h-44 overflow-hidden bg-gray-900 md:h-60">
        <img src={pic(`cover-${e.id}`, 1600, 500)} alt="" className="h-full w-full object-cover opacity-60" />
        <Link
          to="/browse"
          className="absolute left-6 top-4 flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-white/80 hover:text-white md:left-16"
        >
          <ArrowUpRight size={13} className="rotate-[225deg]" /> Back to browse
        </Link>
      </div>

      <div id="main-content" tabIndex={-1} className="px-6 md:px-16">
        <div className="relative z-10 -mt-12 w-fit md:-mt-16">
          <Monogram name={e.name} size={96} className="ring-4 ring-[#fcfcfc]" />
        </div>
        <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[2rem] font-medium leading-tight tracking-tight md:text-[2.6rem]">
              {e.name}
              {e.verified && <Check size={20} className="text-blue-600" />}
              <FavoriteButton entrepreneurId={e.id} size={18} className="ml-1 h-9 w-9 self-center" />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px] font-mono uppercase tracking-wide text-gray-600">
              <span className="inline-flex items-center gap-1.5">
                <CatIcon id={(e.category ?? 'artisan') as CategoryId} size={13} strokeWidth={2} />
                {e.craft}
              </span>
              <span className="inline-flex items-center gap-1">
                <MapPin size={12} />
                {e.city}, {e.state}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-8 md:pt-1">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Rating</div>
              <div className="mt-1 flex items-center gap-1.5">
                <Stars value={e.rating} />
                <span className="text-[13px] font-medium">{e.rating}</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Experience</div>
              <div className="mt-1 text-[15px] font-medium">{e.exp} yrs</div>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Status</div>
              <div className={cn('mt-1 text-[13px] font-medium', e.available ? 'text-green-700' : 'text-gray-400')}>
                {e.available ? 'Available' : 'Busy'}
              </div>
            </div>
          </div>
        </div>

        {e.bio && <p className="mt-8 max-w-[720px] text-[15px] leading-[1.7] text-gray-700">{e.bio}</p>}

        <Tabs
          className="mt-10"
          idPrefix="profile"
          value={tab}
          onChange={setTab}
          items={TABS.map((t) => ({
            id: t.id,
            label: t.id === 'reviews' ? `${t.label} (${reviews.length})` : t.label,
          }))}
        />

        <div className="py-8">
          <TabPanel id="services" activeId={tab} idPrefix="profile">
            {services.length === 0 ? (
              <EmptyState title="No services listed yet" />
            ) : (
              <div className="grid max-w-[760px] gap-3">
                {services.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-5 py-4 transition-colors hover:border-black">
                    <div>
                      <div className="text-[15px] font-medium">{s.name}</div>
                      <div className="mt-1 flex items-center gap-1 text-[11px] font-mono uppercase tracking-wide text-gray-500">
                        <Clock size={12} />
                        {s.dur}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-[16px] font-semibold">{inr(s.price)}</div>
                      <button
                        onClick={() => requestService(s)}
                        disabled={createOrder.isPending}
                        className="rounded-md bg-[#111] px-4 py-2 text-[11px] font-mono uppercase tracking-widest text-white hover:bg-black disabled:opacity-50"
                      >
                        Request
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabPanel>

          <TabPanel id="products" activeId={tab} idPrefix="profile">
            {products.length === 0 ? (
              <EmptyState title="No products listed yet" />
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {products.map((p) => (
                  <div key={p.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white transition-colors hover:border-black">
                    <button type="button" onClick={() => setLightbox(p)} className="block w-full cursor-zoom-in" aria-label={`View ${p.name}`}>
                      <img src={p.image || pic(`prod-${p.id}`, 500, 500)} alt={p.name} loading="lazy" className="h-40 w-full object-cover" />
                    </button>
                    <div className="p-4">
                      <div className="text-[14px] font-medium leading-tight">{p.name}</div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[15px] font-semibold">{inr(p.price)}</span>
                        <button
                          onClick={() => buyProduct(p)}
                          disabled={createOrder.isPending}
                          aria-label={`Order ${p.name}`}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 hover:border-black disabled:opacity-50"
                        >
                          <Plus size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabPanel>

          <TabPanel id="reviews" activeId={tab} idPrefix="profile">
            {reviews.length === 0 ? (
              <EmptyState title="No reviews yet" hint="Reviews appear after a completed order." />
            ) : (
              <div className="grid max-w-[720px] gap-4">
                {reviews.map((r) => (
                  <div key={r.id} className="rounded-lg border border-gray-200 bg-white p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Monogram name={reviewerName(r)} size={34} />
                        <span className="text-[14px] font-medium">{reviewerName(r)}</span>
                      </div>
                      <Stars value={r.rating} />
                    </div>
                    {r.text && <p className="mt-3 text-[14px] leading-relaxed text-gray-700">{r.text}</p>}
                  </div>
                ))}
              </div>
            )}
          </TabPanel>
        </div>

        {similarList.length > 0 && (
          <div className="border-t border-gray-100 py-10">
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-accent">More like this</div>
            <h2 className="mt-2 text-[1.4rem] font-semibold tracking-tight">Similar makers</h2>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {similarList.map((s) => (
                <EntrepreneurCardTile key={s.id} e={s} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 flex items-center justify-between border-t border-gray-200 bg-[#fcfcfc]/95 px-6 py-4 backdrop-blur md:px-16">
        <div className="text-[13px] text-gray-600">
          <span className="font-mono text-[11px] uppercase tracking-widest text-gray-400">Starting at </span>
          <span className="font-semibold text-[#111]">{inr(e.start)}</span>
        </div>
        <button onClick={() => setTab('services')} className="flex items-center gap-2 rounded-md bg-[#111] px-6 py-3 text-[13px] font-medium text-white hover:bg-black">
          Request a service <ArrowRight size={16} />
        </button>
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-6"
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.name}
          onClick={() => setLightbox(null)}
        >
          <div className="max-w-lg overflow-hidden rounded-2xl bg-white" onClick={(ev) => ev.stopPropagation()}>
            <img src={lightbox.image || pic(`prod-${lightbox.id}`, 800, 800)} alt={lightbox.name} className="max-h-[70vh] w-full object-contain" />
            <div className="flex items-center justify-between gap-4 p-4">
              <div>
                <div className="text-[15px] font-medium">{lightbox.name}</div>
                <div className="text-[14px] font-semibold">{inr(lightbox.price)}</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => buyProduct(lightbox)}
                  disabled={createOrder.isPending}
                  className="rounded-md bg-[#111] px-4 py-2 text-[12px] font-medium text-white hover:bg-black disabled:opacity-50"
                >
                  Order
                </button>
                <button onClick={() => setLightbox(null)} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 hover:border-black">
                  <X size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
