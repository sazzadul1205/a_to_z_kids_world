import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router";
import {
  Boxes,
  ChevronDown,
  Coins,
  Database,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Moon,
  Package,
  PieChart,
  ReceiptText,
  ShoppingCart,
  Sparkles,
  Sun,
  Tags,
  Truck,
  UserCog,
  Users,
  Warehouse,
} from "lucide-react";
import { useAuth } from "../Frontend/context/auth/useAuth";
import { useTheme } from "../Frontend/context/theme/useTheme";

// Grouped so it is obvious what belongs where: what we sell, the
// stock behind it, the money, the reports and the system setup.
const NAV_GROUPS = [
  {
    id: "overview",
    label: "Overview",
    items: [
      { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
    ],
  },
  {
    id: "selling",
    label: "Selling",
    items: [
      { to: "/admin/pos", label: "POS / Sales", icon: ShoppingCart },
      { to: "/admin/sales-history", label: "Sales History", icon: ReceiptText },
      { to: "/admin/orders", label: "Orders", icon: Boxes },
      { to: "/admin/customers", label: "Customers", icon: Users },
    ],
  },
  {
    id: "catalogue",
    label: "Catalogue",
    items: [
      { to: "/admin/products", label: "Products", icon: Package },
      { to: "/admin/categories", label: "Categories", icon: Tags },
      { to: "/admin/reviews", label: "Reviews", icon: MessageSquare },
    ],
  },
  {
    id: "stock",
    label: "Stock & Supply",
    items: [
      { to: "/admin/inventory", label: "Inventory", icon: Warehouse },
      { to: "/admin/purchase-orders", label: "Purchase Orders", icon: Truck },
    ],
  },
  {
    id: "finance",
    label: "Finance",
    items: [
      { to: "/admin/expenses", label: "Expenses", icon: ReceiptText },
      {
        to: "/admin/expense-categories",
        label: "Expense Categories",
        icon: Coins,
      },
    ],
  },
  {
    id: "reports",
    label: "Reports",
    items: [{ to: "/admin/analytics", label: "Analytics", icon: PieChart }],
  },
  {
    id: "system",
    label: "System",
    items: [
      { to: "/admin/templates", label: "Templates", icon: FileText },
      { to: "/admin/backup", label: "Backup & Restore", icon: Database },
      { to: "/admin/users", label: "Staff", icon: UserCog },
    ],
  },
];

const BackendLayout = () => {
  const { user, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [closedGroups, setClosedGroups] = useState(new Set());

  const handleSignOut = () => {
    signOut();
    navigate("/admin/login", { replace: true });
  };

  const toggle = () => toggleTheme();

  const toggleGroup = (id) => {
    setClosedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const isItemActive = (item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);

  // A group stays open while one of its pages is active, even
  // if the user collapsed it earlier.
  const isGroupActive = (group) => group.items.some(isItemActive);
  const isOpen = (group) => !closedGroups.has(group.id) || isGroupActive(group);

  return (
    <div className="flex min-h-screen flex-col bg-surface-soft text-text lg:flex-row">
      {/* The sidebar keeps the viewport's height on desktop instead of
          stretching with the page, and stays pinned while the main
          column scrolls. */}
      <aside className="flex flex-col border-b border-border bg-surface px-4 py-5 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:overflow-y-auto lg:border-b-0 lg:border-r">
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

        <nav className="mt-6 flex flex-col gap-4">
          {NAV_GROUPS.map((group) => {
            const open = isOpen(group);
            const active = isGroupActive(group);
            return (
              <section key={group.id}>
                <button
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                  aria-expanded={open}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest transition hover:bg-primary-50 ${
                    active ? "text-primary-600" : "text-text-muted"
                  }`}
                >
                  {group.label}
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${
                      open ? "" : "-rotate-90"
                    }`}
                  />
                </button>
                {open && (
                  <div className="mt-1 flex flex-col gap-1">
                    {group.items.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) =>
                          `flex items-center gap-3 rounded-xl py-2 pl-7 pr-4 text-sm font-bold transition ${
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
                  </div>
                )}
              </section>
            );
          })}
        </nav>

        <div className="mt-6 flex flex-col gap-3 border-t border-border pt-5 lg:mt-auto">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-text">{user?.name}</p>
            <p className="truncate text-xs text-text-muted">{user?.email}</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={toggle}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              title={isDark ? "Light mode" : "Dark mode"}
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-bold text-text transition hover:border-primary-300 hover:bg-primary-50"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {isDark ? "Light" : "Dark"}
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-bold text-text transition hover:border-primary-300 hover:bg-primary-50"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-10">
        <Outlet />
      </main>
    </div>
  );
};

export default BackendLayout;
