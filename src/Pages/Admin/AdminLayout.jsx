import { NavLink, Outlet, useNavigate } from "react-router";
import {
  Boxes,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  Sparkles,
  Tags,
  UserCog,
} from "lucide-react";
import { useAuth } from "../../Shared/useAuth";

const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/reviews", label: "Reviews", icon: MessageSquare },
  { to: "/admin/orders", label: "Orders", icon: Boxes },
  { to: "/admin/users", label: "Staff", icon: UserCog },
];

const AdminLayout = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface-soft text-text lg:flex-row">
      <aside className="flex flex-col border-b border-border bg-surface px-4 py-5 lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-fill text-ink-on-brand">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary-600">
              Admin
            </p>
            <p className="font-black text-text">A to Z Kids</p>
          </div>
        </div>

        <nav className="mt-6 flex gap-1 overflow-x-auto lg:flex-col">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                  isActive
                    ? "bg-brand-fill text-ink-on-brand"
                    : "text-text hover:bg-primary-50 hover:text-primary-700"
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-6 flex flex-col gap-3 border-t border-border pt-5 lg:mt-auto">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-text">{user?.name}</p>
            <p className="truncate text-xs text-text-muted">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-text transition hover:border-primary-300 hover:bg-primary-50"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-10">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
