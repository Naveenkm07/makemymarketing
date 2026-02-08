"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Building2,
  CircleDollarSign,
  Clock,
  FileCheck2,
  Layers,
  LineChart,
  MapPin,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const primary = "#2563EB";

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: "easeOut" },
} as const;

function Container({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}

function GradientMesh() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div
        className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full blur-3xl opacity-30"
        style={{ background: `radial-gradient(circle at center, ${primary}, transparent 60%)` }}
      />
      <div className="absolute -top-24 right-[-140px] h-[460px] w-[460px] rounded-full bg-purple-500/25 blur-3xl" />
      <div className="absolute bottom-[-180px] left-[-180px] h-[520px] w-[520px] rounded-full bg-teal-400/20 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.12),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(20,184,166,0.10),transparent_55%)]" />
    </div>
  );
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-all",
        scrolled ? "border-slate-200/70 bg-white/75 backdrop-blur-xl shadow-sm" : "border-transparent bg-transparent"
      )}
    >
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-extrabold tracking-tight">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-white" style={{ background: primary }}>
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="text-lg sm:text-xl">DigiOut</span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-700 md:flex">
            <a href="#advertisers" className="hover:text-slate-950 transition-colors">For Advertisers</a>
            <a href="#owners" className="hover:text-slate-950 transition-colors">For Owners</a>
            <a href="#market" className="hover:text-slate-950 transition-colors">Market Data</a>
            <Link href="/login" className="hover:text-slate-950 transition-colors">Login</Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.99]"
              style={{ background: primary }}
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </Container>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      <GradientMesh />
      <Container className="py-16 sm:py-20 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <motion.div {...fadeUp}>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                <BadgeCheck className="h-4 w-4" style={{ color: primary }} />
                Built for Bengaluru DOOH
              </div>
            </motion.div>

            <motion.h1
              {...fadeUp}
              transition={{ duration: 0.65, ease: "easeOut", delay: 0.05 }}
              className="mt-5 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl"
            >
              Bengaluru’s Premier Marketplace for Digital Screen Advertising.
            </motion.h1>

            <motion.p
              {...fadeUp}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
              className="mt-5 text-lg leading-relaxed text-slate-600"
            >
              The smartest way to buy and sell DOOH inventory. Connect directly with top malls, tech parks, and cinema screens
              across the city.
            </motion.p>

            <motion.div
              {...fadeUp}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <Link
                href="/dashboard/advertiser"
                className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.99]"
                style={{ background: primary }}
              >
                Book Ads Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/dashboard/owner"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-slate-50"
              >
                List Your Screen
              </Link>
            </motion.div>

            <motion.div
              {...fadeUp}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
              className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3"
            >
              <MiniKpi icon={MapPin} label="Map-based discovery" />
              <MiniKpi icon={Clock} label="Real-time booking" />
              <MiniKpi icon={FileCheck2} label="Proof of play" />
            </motion.div>
          </div>

          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.65, ease: "easeOut" }}
              className="relative"
            >
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-600/25 via-purple-500/20 to-teal-400/20 blur-2xl" />
              <div className="relative rounded-3xl border border-slate-200 bg-white/70 p-4 shadow-xl backdrop-blur">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                      <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                      <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
                    </div>
                    <div className="text-xs font-semibold text-slate-600">Live Marketplace</div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <MockCard title="Koramangala" sub="Tech park screens" pill="High footfall" />
                    <MockCard title="Whitefield" sub="Mall LED walls" pill="Prime" />
                    <MockCard title="MG Road" sub="Billboard digital" pill="Premium" />
                    <MockCard title="JP Nagar" sub="Cinema lobby" pill="New" />
                  </div>

                  <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                    <img
                      alt="Bengaluru map placeholder"
                      className="h-48 w-full object-cover"
                      src="https://images.unsplash.com/photo-1526779259212-939e64788e3c?auto=format&fit=crop&w=1600&q=80"
                    />
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <Pill icon={ScanSearch} text="Filters" />
                  <Pill icon={Zap} text="Instant slots" />
                  <Pill icon={LineChart} text="Live analytics" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function MiniKpi({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-3 py-2 shadow-sm backdrop-blur">
      <Icon className="h-4 w-4" style={{ color: primary }} />
      <span className="text-xs font-semibold text-slate-700">{label}</span>
    </div>
  );
}

function MockCard({ title, sub, pill }: { title: string; sub: string; pill: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-bold text-slate-950">{title}</div>
        <div className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700 shadow-sm">{pill}</div>
      </div>
      <div className="mt-1 text-xs text-slate-600">{sub}</div>
    </div>
  );
}

function Pill({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm">
      <Icon className="h-4 w-4" style={{ color: primary }} />
      {text}
    </div>
  );
}

function StatsBar() {
  const items = useMemo(
    () => [
      { value: "10M+", label: "Daily Impressions" },
      { value: "500+", label: "Screens in Bengaluru" },
      { value: "Real-time", label: "Proof of Play" },
    ],
    []
  );

  return (
    <section id="market" className="bg-slate-50">
      <Container className="py-10">
        <div className="grid gap-4 sm:grid-cols-3">
          {items.map((it) => (
            <motion.div
              key={it.label}
              {...fadeUp}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="text-3xl font-extrabold tracking-tight text-slate-950">{it.value}</div>
              <div className="mt-1 text-sm font-semibold text-slate-600">{it.label}</div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function HowItWorks() {
  const steps = useMemo(
    () => [
      {
        title: "Browse Inventory",
        desc: "Filter by location, screen type, and price — all on a live map.",
        icon: MapPin,
      },
      {
        title: "Book & Schedule",
        desc: "Select slots, upload creatives, and schedule instantly with automation.",
        icon: Layers,
      },
      {
        title: "Track Results",
        desc: "Get live proof-of-play logs and performance analytics.",
        icon: BarChart3,
      },
    ],
    []
  );

  return (
    <section className="bg-white">
      <Container className="py-16 sm:py-20">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">How it works</div>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">From discovery to proof‑of‑play</h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            A simple flow that makes DOOH buying and selling feel like modern SaaS.
          </p>
        </motion.div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {steps.map((s, idx) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, ease: "easeOut", delay: idx * 0.06 }}
              className="rounded-3xl border border-slate-200 bg-slate-50 p-6"
            >
              <div className="flex items-center justify-between">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <s.icon className="h-6 w-6" style={{ color: primary }} />
                </div>
                <div className="text-sm font-extrabold text-slate-300">0{idx + 1}</div>
              </div>
              <div className="mt-4 text-lg font-bold text-slate-950">{s.title}</div>
              <div className="mt-2 text-sm leading-relaxed text-slate-600">{s.desc}</div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function SplitValueProps() {
  return (
    <section className="bg-slate-50">
      <Container className="py-16 sm:py-20">
        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div
            {...fadeUp}
            id="advertisers"
            className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
              <Activity className="h-4 w-4" />
              Advertisers
            </div>
            <h3 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-950">Run hyper-local campaigns.</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Launch campaigns without minimum spend, with transparent pricing and real-time availability across Bengaluru.
            </p>
            <div className="mt-6 grid gap-3">
              <ValueBullet icon={ScanSearch} title="Flexible discovery" desc="Search by area, venue type, and screen format." />
              <ValueBullet icon={Clock} title="Real-time slots" desc="Book instantly with live availability." />
              <ValueBullet icon={FileCheck2} title="Proof-of-play" desc="Track plays and download logs." />
            </div>
            <div className="mt-8">
              <Link
                href="/dashboard/advertiser"
                className="inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-sm"
                style={{ background: primary }}
              >
                Book Ads Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </motion.div>

          <motion.div {...fadeUp} id="owners" className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">
              <Building2 className="h-4 w-4" />
              Screen Owners
            </div>
            <h3 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-950">Monetize your empty slots.</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Automate booking and scheduling, protect revenue with secure payments, and manage inventory from a single dashboard.
            </p>
            <div className="mt-6 grid gap-3">
              <ValueBullet icon={Zap} title="Automated scheduling" desc="Slots fill automatically with rules and availability." />
              <ValueBullet icon={CircleDollarSign} title="Guaranteed payments" desc="Secure flow that reduces collection headaches." />
              <ValueBullet icon={ShieldCheck} title="Trusted marketplace" desc="Verified advertisers and platform enforcement." />
            </div>
            <div className="mt-8">
              <Link
                href="/dashboard/owner"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
              >
                List Your Screen
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

function ValueBullet({
  icon: Icon,
  title,
  desc,
}: {
  icon: LucideIcon;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-sm">
        <Icon className="h-5 w-5" style={{ color: primary }} />
      </div>
      <div>
        <div className="text-sm font-extrabold text-slate-950">{title}</div>
        <div className="mt-1 text-sm text-slate-600">{desc}</div>
      </div>
    </div>
  );
}

function BentoFeatures() {
  const features = useMemo(
    () =>
      [
        {
          title: "Map-Based Discovery",
          desc: "Find screens by neighborhood, venue type, and audience context.",
          icon: MapPin,
          className: "md:col-span-2",
        },
        {
          title: "Automated Scheduling",
          desc: "Upload creatives and schedule slots with smart defaults.",
          icon: Layers,
          className: "md:col-span-1",
        },
        {
          title: "Secure Payments (Escrow)",
          desc: "Reduce risk with secure payment flows and clear payout rules.",
          icon: ShieldCheck,
          className: "md:col-span-1",
        },
        {
          title: "Live Analytics",
          desc: "Track proof-of-play and performance in near real time.",
          icon: LineChart,
          className: "md:col-span-2",
        },
      ] satisfies Array<{ title: string; desc: string; icon: LucideIcon; className: string }>,
    []
  );

  return (
    <section className="bg-white">
      <Container className="py-16 sm:py-20">
        <motion.div {...fadeUp} className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Features</div>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">A marketplace that feels like modern software</h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            Designed for speed, trust, and transparency across the buying + selling lifecycle.
          </p>
        </motion.div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {features.map((f, idx) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, ease: "easeOut", delay: idx * 0.05 }}
              className={cn(
                "group rounded-3xl border border-slate-200 bg-slate-50 p-7 shadow-sm transition-colors hover:bg-white",
                f.className
              )}
            >
              <div className="flex items-center justify-between">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                  <f.icon className="h-6 w-6" style={{ color: primary }} />
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-600 shadow-sm">
                  <Zap className="h-3.5 w-3.5" style={{ color: primary }} />
                  High‑trust
                </div>
              </div>
              <div className="mt-5 text-lg font-extrabold text-slate-950">{f.title}</div>
              <div className="mt-2 text-sm leading-relaxed text-slate-600">{f.desc}</div>
              <div className="mt-6 inline-flex items-center text-sm font-bold text-slate-900">
                Learn more
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}

function BottomCta() {
  return (
    <section className="bg-slate-50">
      <Container className="py-16 sm:py-20">
        <motion.div
          {...fadeUp}
          className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-10 shadow-sm"
        >
          <div className="absolute inset-0 -z-10">
            <div className="absolute -top-24 left-1/2 h-[360px] w-[360px] -translate-x-1/2 rounded-full blur-3xl opacity-25" style={{ background: primary }} />
            <div className="absolute -bottom-24 right-[-80px] h-[340px] w-[340px] rounded-full bg-purple-500/20 blur-3xl" />
          </div>

          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Get started</div>
              <h3 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">Ready to light up Bengaluru?</h3>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
                Launch your first campaign in minutes or start monetizing your screens with automated inventory.
              </p>
            </div>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.99]"
              style={{ background: primary }}
            >
              Launch Your Campaign
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <Container className="py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm font-bold text-slate-900">DigiOut</div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-slate-600">
            <a className="hover:text-slate-950" href="#">Privacy Policy</a>
            <a className="hover:text-slate-950" href="#">Terms</a>
            <a className="hover:text-slate-950" href="#">Contact Support</a>
          </div>
        </div>
        <div className="mt-6 text-xs font-semibold text-slate-500">© 2026 DigiOut.</div>
      </Container>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />
      <Hero />
      <StatsBar />
      <HowItWorks />
      <SplitValueProps />
      <BentoFeatures />
      <BottomCta />
      <Footer />
    </div>
  );
}
