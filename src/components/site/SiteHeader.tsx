import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, Phone, Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Logo } from "./Logo";
import { SearchDialog } from "./SearchDialog";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/use-settings";
import { formatPhone, telLink } from "@/lib/site";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/gallery", label: "Gallery" },
  { to: "/services", label: "Repair & Service" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const { contact, content } = useSettings();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <div className="relative z-50 overflow-hidden bg-ink text-ink-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 py-2 text-center text-xs sm:justify-between">
          <p className="truncate">
            <span className="mr-2 text-gold">✦</span>
            {content.announcement}
          </p>
          <a href={telLink(contact.phone)} className="hidden shrink-0 items-center gap-1.5 font-semibold text-gold hover:underline sm:inline-flex">
            <Phone className="h-3.5 w-3.5" /> {formatPhone(contact.phone)}
          </a>
        </div>
      </div>
      <header
        className={cn(
          "sticky top-0 z-40 transition-all duration-500",
          scrolled ? "glass shadow-soft" : "bg-background/0",
        )}
      >
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 md:px-6" style={{ height: 72 }}>
          <Link to="/" aria-label="SARTAJ home">
            <Logo />
          </Link>
          <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.to === "/" }}
                className="relative rounded-full px-3.5 py-2 text-sm font-medium text-foreground/75 transition-colors hover:text-foreground"
                activeProps={{ className: "text-foreground" }}
              >
                {({ isActive }) => (
                  <>
                    {n.label}
                    {isActive && (
                      <motion.span layoutId="nav-dot" className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-gold" />
                    )}
                  </>
                )}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search products"
              className="grid h-10 w-10 place-items-center rounded-full border border-border text-foreground transition-colors hover:border-gold"
            >
              <Search className="h-4 w-4" />
            </button>
            <Button asChild variant="gold" className="hidden rounded-full md:inline-flex">
              <Link to="/enquire">Enquire Now</Link>
            </Button>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="grid h-10 w-10 place-items-center rounded-full bg-ink text-ink-foreground lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-gradient-ink text-ink-foreground lg:hidden"
          >
            <div className="flex h-18 items-center justify-between px-4" style={{ height: 72 }}>
              <Logo tone="light" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="grid h-10 w-10 place-items-center rounded-full border border-gold/40"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav aria-label="Mobile" className="flex flex-col gap-1 px-6 pt-6">
              {NAV.map((n, i) => (
                <motion.div key={n.to} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
                  <Link
                    to={n.to}
                    onClick={() => setOpen(false)}
                    activeOptions={{ exact: n.to === "/" }}
                    activeProps={{ className: "text-gold" }}
                    className="block border-b border-ink-foreground/10 py-4 font-display text-3xl"
                  >
                    {n.label}
                  </Link>
                </motion.div>
              ))}
              <Button asChild variant="gold" size="xl" className="mt-8">
                <Link to="/enquire" onClick={() => setOpen(false)}>
                  Enquire Now
                </Link>
              </Button>
              <a href={telLink(contact.phone)} className="mt-4 text-center text-sm text-gold">
                Call {formatPhone(contact.phone)}
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
