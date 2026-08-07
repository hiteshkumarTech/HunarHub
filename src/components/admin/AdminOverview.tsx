import { Users, UserCog, Store, ShieldCheck, Package, CheckCircle2, Clock, Wallet, Star } from 'lucide-react';
import { Kpi } from '../ui/Kpi';
import { Skeleton, ErrorState } from '../ui/States';
import { useAdminStats } from '../../hooks/admin';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted">{title}</div>
      <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">{children}</div>
    </div>
  );
}

/** Admin "Overview" tab — every number here comes straight from GET /api/admin/stats. */
export function AdminOverview() {
  const { data, isLoading, isError, refetch } = useAdminStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-[104px] rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return <ErrorState message="Could not load platform stats." onRetry={() => refetch()} />;
  }

  const s = data.stats;

  return (
    <div className="space-y-8">
      <Section title="People">
        <Kpi icon={<Users size={16} />} label="Total users" value={s.totalUsers} />
        <Kpi icon={<UserCog size={16} />} label="Customers" value={s.customers} />
        <Kpi icon={<Store size={16} />} label="Entrepreneurs" value={s.entrepreneurs} />
        <Kpi icon={<ShieldCheck size={16} />} label="Admins" value={s.admins} />
      </Section>

      <Section title="Listings">
        <Kpi icon={<Package size={16} />} label="Total listings" value={s.totalListings} />
        <Kpi
          icon={<CheckCircle2 size={16} />}
          label="Active listings"
          value={s.activeListings}
          hint="Seller currently available"
        />
      </Section>

      <Section title="Orders &amp; reviews">
        <Kpi icon={<Wallet size={16} />} label="Total orders" value={s.totalOrders} />
        <Kpi icon={<Clock size={16} />} label="Pending" value={s.pendingOrders} />
        <Kpi icon={<CheckCircle2 size={16} />} label="Completed" value={s.completedOrders} />
        <Kpi icon={<Star size={16} />} label="Reviews" value={s.reviews} />
      </Section>
    </div>
  );
}
