import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Box, Minus, Pause, Play, Plus, RotateCcw, Rotate3d } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Reveal } from "@/components/site/Reveal";
import { WhatsAppIcon } from "@/components/site/FloatingActions";
import { useSettings } from "@/hooks/use-settings";
import { whatsappLink } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { MachineScene, MachineView } from "./machine3d/scene";

const HIGHLIGHTS = [
  { title: "Industrial head", body: "Straight-stitch lockstitch built for long working days." },
  { title: "Signature bed", body: "Navy table top framed with the SARTAJ gold border." },
  { title: "See it in person", body: "Visit the Hariana showroom for a live demo." },
];

const VIEWS: { id: MachineView; label: string }[] = [
  { id: "front", label: "Front" },
  { id: "side", label: "Side" },
  { id: "top", label: "Top" },
];

type Status = "idle" | "loading" | "ready" | "unsupported";

function ControlButton({
  pressed,
  onClick,
  children,
  label,
  className,
}: {
  pressed?: boolean;
  onClick: () => void;
  children: ReactNode;
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      aria-label={label}
      className={cn(
        "inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border px-4 text-xs font-semibold tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold [&_svg]:h-4 [&_svg]:w-4",
        pressed
          ? "border-transparent bg-gradient-gold text-gold-foreground shadow-gold"
          : "border-ink-foreground/15 bg-ink-foreground/5 text-ink-foreground hover:border-gold/70 hover:text-gold",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Machine3DShowcase() {
  const { contact } = useSettings();
  const stageRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<MachineScene | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [autoRotate, setAutoRotate] = useState(true);
  const [running, setRunning] = useState(false);

  // Load three.js only when the section approaches the viewport, and pause rendering off-screen.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let cancelled = false;
    let started = false;

    const io = new IntersectionObserver(
      ([entry]) => {
        const visible = !!entry?.isIntersecting;
        sceneRef.current?.setActive(visible);
        if (!visible || started) return;
        started = true;
        setStatus("loading");
        import("./machine3d/scene")
          .then(({ createMachineScene }) => {
            if (cancelled) return;
            const created = createMachineScene(stage, {
              autoRotate: true,
              onAutoRotateChange: setAutoRotate,
              onReady: () => {
                stage.dataset["sceneReady"] = "true";
                setStatus("ready");
              },
            });
            if (!created) setStatus("unsupported");
            sceneRef.current = created;
          })
          .catch(() => !cancelled && setStatus("unsupported"));
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(stage);

    return () => {
      cancelled = true;
      io.disconnect();
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  const ready = status === "ready";
  const toggleRun = () => {
    const next = !running;
    setRunning(next);
    sceneRef.current?.setRunning(next);
  };

  return (
    <section className="grain relative overflow-hidden bg-gradient-ink py-16 text-ink-foreground md:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 top-1/3 h-72 w-72 rounded-full bg-gold/10 blur-3xl"
      />
      <div className="relative mx-auto grid max-w-7xl gap-8 px-4 md:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:grid-rows-[1fr_auto_1fr] lg:gap-x-14 lg:gap-y-0">
        <div className="lg:col-start-1 lg:row-start-1 lg:self-end [&>div]:mb-0 lg:[&>div]:mb-8">
          <SectionHeading
            align="left"
            tone="light"
            eyebrow="Explore in 3D"
            title={
              <>
                SARTAJ <em className="text-gradient-gold">95 T 10</em>, from every angle
              </>
            }
            subtitle="Turn it, zoom in and run the machine. Then come to our shop to see the real one stitch."
          />
        </div>

        <Reveal className="min-w-0 lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:self-center">
          <div className="rounded-3xl border border-gold/20 bg-ink-soft/40 p-2 shadow-lift sm:p-3">
            <div
              ref={stageRef}
              className="relative h-[320px] w-full touch-none overflow-hidden rounded-[1.25rem] bg-gradient-stage sm:h-[440px] lg:h-[540px]"
            >
              {!ready && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
                  {status === "unsupported" ? (
                    <>
                      <Box className="h-8 w-8 text-gold" />
                      <p className="max-w-xs text-sm text-ink-foreground/70">
                        Your browser can't show 3D graphics. Visit our showroom to see the 95 T 10
                        in person.
                      </p>
                    </>
                  ) : (
                    <>
                      <span className="h-10 w-10 animate-spin rounded-full border-2 border-gold/25 border-t-gold" />
                      <p className="eyebrow text-[0.6rem] text-gold">Loading 3D model</p>
                    </>
                  )}
                </div>
              )}
              <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-full border border-gold/25 bg-ink/60 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gold backdrop-blur">
                <Rotate3d className="h-3.5 w-3.5" /> 360° view
              </div>
              {ready && (
                <>
                  <div className="absolute right-3 top-3 flex flex-col gap-2">
                    <ControlButton
                      label="Zoom in"
                      className="w-10 bg-ink/60 px-0 backdrop-blur"
                      onClick={() => sceneRef.current?.zoom(1)}
                    >
                      <Plus />
                    </ControlButton>
                    <ControlButton
                      label="Zoom out"
                      className="w-10 bg-ink/60 px-0 backdrop-blur"
                      onClick={() => sceneRef.current?.zoom(-1)}
                    >
                      <Minus />
                    </ControlButton>
                  </div>
                  <p className="pointer-events-none absolute inset-x-3 bottom-3 text-center text-[0.7rem] text-ink-foreground/60 sm:text-left">
                    Drag to rotate · use + and − to zoom
                  </p>
                </>
              )}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2 p-1 sm:mt-3">
              <ControlButton
                pressed={autoRotate}
                onClick={() => sceneRef.current?.setAutoRotate(!autoRotate)}
              >
                <RotateCcw /> Auto-rotate
              </ControlButton>
              <ControlButton pressed={running} onClick={toggleRun}>
                {running ? <Pause /> : <Play />} {running ? "Stop machine" : "Run machine"}
              </ControlButton>
              <span
                aria-hidden="true"
                className="mx-1 hidden h-6 w-px bg-ink-foreground/15 sm:block"
              />
              {VIEWS.map((v) => (
                <ControlButton key={v.id} onClick={() => sceneRef.current?.goTo(v.id)}>
                  {v.label}
                </ControlButton>
              ))}
              <ControlButton onClick={() => sceneRef.current?.goTo("reset")}>Reset</ControlButton>
            </div>
          </div>
          <p className="mt-3 px-1 text-xs text-ink-foreground/50">
            3D preview built from a product photo — shape and proportions are approximate.
          </p>
        </Reveal>

        <Reveal delay={0.08} className="lg:col-start-1 lg:row-start-2">
          <ul className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {HIGHLIGHTS.map((h) => (
              <li key={h.title} className="glass-ink flex h-full gap-3 rounded-2xl p-4">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold" />
                <div>
                  <p className="font-display text-lg leading-tight">{h.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-foreground/70">{h.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>

        <div className="grid gap-3 sm:flex sm:flex-wrap lg:col-start-1 lg:row-start-3 lg:mt-8 lg:self-start">
          <Button asChild variant="gold" size="xl">
            <Link to="/enquire" search={{ type: "Product Enquiry" }}>
              Enquire now <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="outline-gold" size="xl">
            <a
              href={whatsappLink(
                contact.whatsapp,
                "Hello SARTAJ, I'd like to know more about the 95 T 10 machine.",
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon className="h-4 w-4" /> Ask on WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
