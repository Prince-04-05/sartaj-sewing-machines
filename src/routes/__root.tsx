import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { FloatingActions } from "@/components/site/FloatingActions";
import { CrownMark } from "@/components/site/Logo";
import { settingsQuery } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";

function NotFoundComponent() {
  return (
    <div className="grain flex min-h-[80vh] items-center justify-center bg-gradient-ink px-4 text-ink-foreground">
      <div className="max-w-md text-center">
        <CrownMark className="mx-auto h-14 w-14 animate-float" />
        <p className="eyebrow mt-6 text-gold">Error 404</p>
        <h1 className="mt-3 text-5xl font-medium">This thread came loose.</h1>
        <p className="mt-4 text-sm text-ink-foreground/70">
          The page you're looking for doesn't exist or has been moved. Let's get you back to the collection.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="rounded-full bg-gradient-gold px-6 py-3 text-sm font-semibold text-gold-foreground">
            Go home
          </Link>
          <Link to="/products" className="rounded-full border border-gold/50 px-6 py-3 text-sm font-semibold text-gold">
            Browse products
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-medium text-foreground">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Try again
          </button>
          <a href="/" className="inline-flex items-center justify-center rounded-full border border-input px-5 py-2.5 text-sm font-medium text-foreground">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  loader: ({ context }) => context.queryClient.ensureQueryData(settingsQuery).catch(() => null),
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "SARTAJ — Premium Sewing Machines, Motors & Repair | Hariana, Punjab" },
      {
        name: "description",
        content:
          "SARTAJ, Hariana: domestic & industrial sewing machines, servo motors, spare parts and expert repair. Enquire online and visit our showroom.",
      },
      { name: "author", content: "SARTAJ Sewing Machines" },
      { name: "theme-color", content: "#141a2e" },
      { property: "og:site_name", content: "SARTAJ Sewing Machines" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..600&family=Manrope:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RouteProgress() {
  const loading = useRouterState({ select: (s) => s.status === "pending" });
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-0.5 origin-left bg-gradient-gold transition-all duration-500"
      style={{ transform: `scaleX(${loading ? 0.7 : 0})`, opacity: loading ? 1 : 0 }}
    />
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAppArea = pathname.startsWith("/admin") || pathname.startsWith("/auth") || pathname.startsWith("/reset-password");

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => data.subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <RouteProgress />
      {!isAppArea && (
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-ink-foreground">
          Skip to content
        </a>
      )}
      {!isAppArea && <SiteHeader />}
      <main id="main" className={isAppArea ? undefined : "min-h-[50vh]"}>
        <Outlet />
      </main>
      {!isAppArea && <SiteFooter />}
      {/* Space for the phone action bar so the footer is never hidden behind it */}
      {!isAppArea && <div aria-hidden="true" className="h-[calc(64px+env(safe-area-inset-bottom))] bg-ink md:hidden" />}
      {!isAppArea && <FloatingActions />}
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}
