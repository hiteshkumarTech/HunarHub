import { useState } from 'react';
import { PageBar } from '../components/PageBar';
import { Tabs, TabPanel } from '../components/ui/Tabs';
import { AdminOverview } from '../components/admin/AdminOverview';
import { AdminUsersPanel } from '../components/admin/AdminUsersPanel';
import { AdminListingsPanel } from '../components/admin/AdminListingsPanel';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'users', label: 'Users' },
  { id: 'listings', label: 'Listings' },
] as const;
type TabId = (typeof TABS)[number]['id'];

/** /admin — platform metrics, user directory, and cross-seller listing moderation. */
export default function AdminDashboard() {
  const [tab, setTab] = useState<TabId>('overview');

  return (
    <div className="min-h-screen">
      <PageBar crumb="Admin" />
      <main id="main-content" tabIndex={-1} className="px-6 py-10 md:px-16">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted">[ Platform ]</div>
        <h1 className="mt-2 text-[2rem] font-medium tracking-tight text-fg md:text-[3rem]">Admin</h1>

        <div className="mt-8">
          <Tabs items={TABS.map((t) => ({ id: t.id, label: t.label }))} value={tab} onChange={setTab} idPrefix="admin" />
        </div>

        <div className="mt-6">
          <TabPanel id="overview" activeId={tab} idPrefix="admin">
            <AdminOverview />
          </TabPanel>
          <TabPanel id="users" activeId={tab} idPrefix="admin">
            <AdminUsersPanel />
          </TabPanel>
          <TabPanel id="listings" activeId={tab} idPrefix="admin">
            <AdminListingsPanel />
          </TabPanel>
        </div>
      </main>
    </div>
  );
}
