import { CalendarDays, ClipboardList, LogOut, Mail, UserRound } from 'lucide-react';
import { Link } from 'react-router';
import { useAuth } from '../Shared/useAuth';
import { formatBDT, toBDTAmount } from '../Shared/currency';

const AccountShell = ({ eyebrow, title, children }) => (
  <div className="bg-surface-soft px-4 py-12 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-5xl">
      <p className="text-sm font-bold uppercase tracking-widest text-primary-600">{eyebrow}</p>
      <h1 className="mt-2 text-4xl font-black text-text sm:text-5xl">{title}</h1>
      <div className="mt-8">{children}</div>
    </div>
  </div>
);

export const Profile = () => {
  const { user, logout } = useAuth();

  return (
    <AccountShell eyebrow="Your space" title="My profile">
      <div className="grid gap-6 md:grid-cols-[1fr_280px]">
        <section className="rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-4 border-b border-border pb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary-700"><UserRound className="h-8 w-8" /></div>
            <div><h2 className="text-2xl font-black text-text">Welcome back</h2><p className="mt-1 text-text-muted">Your A to Z Kids account</p></div>
          </div>
          <div className="mt-6 space-y-5">
            <div className="flex items-center gap-3"><Mail className="h-5 w-5 text-primary-600" /><div><p className="text-xs font-bold uppercase tracking-widest text-text-muted">Email</p><p className="mt-1 font-semibold text-text">{user?.email}</p></div></div>
            <div className="flex items-center gap-3"><UserRound className="h-5 w-5 text-primary-600" /><div><p className="text-xs font-bold uppercase tracking-widest text-text-muted">Sign-in method</p><p className="mt-1 font-semibold capitalize text-text">{user?.method || 'email'} demo account</p></div></div>
          </div>
        </section>
        <aside className="rounded-3xl bg-secondary-900 p-6 text-white"><h2 className="text-xl font-black">Account actions</h2><div className="mt-5 space-y-3"><Link to="/orders" className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 font-bold hover:bg-white/20"><ClipboardList className="h-5 w-5" /> Order history</Link><button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-bold text-secondary-100 hover:bg-white/10"><LogOut className="h-5 w-5" /> Log out</button></div></aside>
      </div>
    </AccountShell>
  );
};

export const Orders = () => {
  const { orders } = useAuth();

  return (
    <AccountShell eyebrow="Your discoveries" title="Order history">
      {orders.length === 0 ? (
        <div className="rounded-3xl border border-border bg-surface p-10 text-center shadow-sm"><ClipboardList className="mx-auto h-12 w-12 text-secondary-400" /><h2 className="mt-4 text-2xl font-black text-text">No orders yet</h2><p className="mt-2 text-text-muted">Your completed WhatsApp orders will appear here.</p><Link to="/shop" className="mt-6 inline-flex rounded-xl bg-primary-600 px-5 py-3 font-bold text-white hover:bg-primary-700">Explore the shop</Link></div>
      ) : (
        <div className="space-y-5">{orders.map((order) => <article key={order.id} className="rounded-3xl border border-border bg-surface p-5 shadow-sm sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4"><div><p className="text-xs font-bold uppercase tracking-widest text-primary-600">{order.id}</p><p className="mt-2 flex items-center gap-2 text-sm text-text-muted"><CalendarDays className="h-4 w-4" /> {new Date(order.createdAt).toLocaleDateString('en-BD', { dateStyle: 'medium' })}</p></div><p className="text-xl font-black text-primary-700">{formatBDT(order.total)}</p></div><div className="mt-4 space-y-3">{order.items.map((item) => <div key={item.name} className="flex items-center gap-3"><img src={item.image} alt="" className="h-12 w-12 rounded-lg object-cover" /><div className="min-w-0 flex-1"><p className="truncate font-bold text-text">{item.name}</p><p className="text-sm text-text-muted">Quantity: {item.quantity}</p></div><span className="text-sm font-semibold text-text">{formatBDT(toBDTAmount(item.price) * item.quantity)}</span></div>)}</div><p className="mt-4 border-t border-border pt-4 text-sm text-text-muted">Delivery to: {order.address.city}, {order.address.postal}</p></article>)}</div>
      )}
    </AccountShell>
  );
};
