export type NavItem = {
  label: string;
  href: string;
  icon: string; // remixicon class name
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: "ri-dashboard-2-line" },
      { label: "Brands & Resellers", href: "/admin/brands", icon: "ri-store-2-line" },
      { label: "Orders", href: "/admin/orders", icon: "ri-shopping-bag-3-line" },
      { label: "Contacts", href: "/admin/contacts", icon: "ri-user-heart-line" },
      { label: "Support", href: "/admin/support", icon: "ri-customer-service-2-line" },
      { label: "Products", href: "/admin/products", icon: "ri-flask-line" },
      { label: "Content (CMS)", href: "/admin/content", icon: "ri-article-line" },
      { label: "Shipping", href: "/admin/shipping", icon: "ri-ship-2-line" },
      { label: "Payments", href: "/admin/payments", icon: "ri-bank-card-line" },
      { label: "Invoices", href: "/admin/invoices", icon: "ri-file-list-3-line" },
      { label: "Affiliates", href: "/admin/affiliates", icon: "ri-award-line" },
      { label: "Email Marketing", href: "/admin/email-marketing", icon: "ri-mail-send-line" },
    ],
  },
  {
    label: "Growth",
    items: [
      { label: "Social Analytics", href: "/admin/social-analytics", icon: "ri-bar-chart-grouped-line" },
      { label: "AI Blog Tool", href: "/admin/blog-tool", icon: "ri-article-line" },
      { label: "Reddit Marketing", href: "/admin/reddit-marketing", icon: "ri-reddit-line" },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Tracking & Pixels", href: "/admin/tracking-pixels", icon: "ri-radar-line" },
      { label: "Webhooks", href: "/admin/webhooks", icon: "ri-plug-line" },
      { label: "Settings", href: "/admin/settings", icon: "ri-settings-3-line" },
    ],
  },
];
