import { useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";

import { ProjectFlowInteractive } from "@/components/features/ProjectFlowInteractive";
import { SponsorsSection } from "@/components/features/SponsorsSection";
import { SparkleIcon, HospitalIcon, MapPinIcon, SearchIcon, ChartIcon } from "@/components/ui/icons";
import { cn } from "@/utils/cn";

const easeOut = [0.16, 1, 0.3, 1] as const;

function SectionTitle({
  eyebrow,
  title,
  subtitle,
  className,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-2xl text-center", className)}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">
        {eyebrow}
      </p>
      <h2 className="mt-2 font-display text-2xl font-bold text-ink-900 sm:text-3xl dark:text-ink-50">
        {title}
      </h2>
      <p className="mt-2 text-sm text-ink-600 dark:text-ink-400 sm:text-base">{subtitle}</p>
    </div>
  );
}

function RevealBlock({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const visible = reduce || inView;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
      transition={{ duration: 0.55, delay, ease: easeOut }}
    >
      {children}
    </motion.div>
  );
}

const benefits = [
  {
    title: "Intent, not keywords",
    body: "Describe the care you need in plain language. The agent turns messy questions into structured search—so you are not limited to the exact phrasing a form expects.",
    icon: SearchIcon,
  },
  {
    title: "Ranked with a reason",
    body: "Every shortlist is ordered with a clear narrative: why these facilities fit and how we weighed quality, services, and context—not a black-box list from a static directory.",
    icon: ChartIcon,
  },
  {
    title: "Location-aware by design",
    body: "Pair natural-language intent with where people actually are. Distance and quality can be balanced transparently, so “near me” and “best for my case” can coexist.",
    icon: MapPinIcon,
  },
] as const;

const reasons = [
  {
    headline: "Built on a healthcare data foundation",
    text: "Results are driven by a curated facility intelligence layer and governed pipelines—not scraped pages with stale contact rows.",
  },
  {
    headline: "Explainable, not just automated",
    text: "You get a defensible line of reasoning alongside matches. That matters when a decision affects patients, members, or providers downstream.",
  },
  {
    headline: "One flow from question to action",
    text: "Skip jumping between map apps, search engines, and PDF directories. Ask once, iterate in chat, and move from exploration to a short list faster.",
  },
] as const;

const steps = [
  { n: "01", t: "You ask in your own words", d: "Specialty, city, quality bar, or a complex case—no rigid filter wizard required at the start." },
  { n: "02", t: "We extract intent and retrieve", d: "The agent normalizes the query, calls the intelligence layer, and pulls candidates that fit your constraints." },
  { n: "03", t: "You see ranked options + rationale", d: "Facilities with scores and a concise explanation you can stand behind in the next step of your workflow." },
] as const;

export default function AgentIntroPage() {
  const reduce = useReducedMotion();
  const heroRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 40]);
  const heroOp = useTransform(scrollYProgress, [0, 0.5], [1, reduce ? 1 : 0.85]);

  return (
    <div className="space-y-0 overflow-x-hidden pb-16 sm:pb-20">
      {/* Hero */}
      <section
        ref={heroRef}
        className="relative -mx-2 overflow-hidden rounded-3xl border border-ink-100/80 bg-gradient-to-br from-white via-brand-50/50 to-accent-50/30 px-4 py-10 shadow-soft sm:-mx-4 sm:px-8 sm:py-14 lg:-mx-8 lg:px-10 lg:py-20 dark:border-ink-800 dark:from-ink-900 dark:via-brand-950/50 dark:to-ink-900 dark:shadow-soft-dark"
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-brand-400/20 blur-3xl dark:bg-brand-500/15"
          animate={
            reduce
              ? {}
              : { scale: [1, 1.08, 1], opacity: [0.35, 0.5, 0.35] }
          }
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-accent-400/20 blur-3xl dark:bg-accent-500/10"
          animate={reduce ? {} : { scale: [1, 1.12, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        <motion.div style={{ y: heroY, opacity: heroOp }} className="relative z-[1] mx-auto max-w-3xl text-center">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOut }}
            className="inline-flex items-center gap-1.5 rounded-full border border-brand-200/80 bg-white/80 px-3 py-1 text-xs font-medium text-brand-800 shadow-sm backdrop-blur dark:border-brand-800/50 dark:bg-ink-900/60 dark:text-brand-200"
          >
            <SparkleIcon size={14} />
            ClinixAi intelligence
          </motion.div>
          <motion.h1
            className="mt-5 font-display text-[1.75rem] font-extrabold leading-[1.12] tracking-tight text-ink-900 sm:text-4xl lg:text-5xl dark:text-ink-50"
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08, ease: easeOut }}
          >
            Ask in plain English.
            <br />
            <span className="bg-gradient-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent dark:from-brand-400 dark:to-accent-400">
              Get care options you can justify.
            </span>
          </motion.h1>
          <motion.p
            className="mt-4 text-base text-ink-600 sm:text-lg dark:text-ink-400"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16, ease: easeOut }}
          >
            The AI agent turns natural questions into ranked facility matches and a clear
            line of reasoning—so your next step in care navigation is faster and more defensible.
          </motion.p>
          <motion.div
            className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.24, ease: easeOut }}
          >
            <Link
              to="/agent/chat"
              className={cn(
                "inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-brand-700/20 bg-brand-600 px-6 text-base font-medium text-white shadow-soft transition",
                "hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                "dark:focus-visible:ring-offset-ink-900",
              )}
            >
              <SparkleIcon size={18} />
              Start chatting with the agent
            </Link>
            <a
              href="#why"
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-ink-200 bg-white/70 px-5 text-sm font-medium text-ink-800 transition hover:border-brand-200 hover:bg-brand-50/80 dark:border-ink-600 dark:bg-ink-800/50 dark:text-ink-100 dark:hover:border-brand-700 dark:hover:bg-ink-800"
            >
              See why teams choose us
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* Value cards */}
      <section id="why" className="pt-12 sm:pt-16">
        <RevealBlock>
          <SectionTitle
            eyebrow="Why it matters"
            title="Search alone is not enough for care decisions"
            subtitle="Directories give rows. You need ranked, contextual answers when stakes are high. The agent is built to bridge that gap."
          />
        </RevealBlock>
        <div className="mt-10 grid gap-4 sm:grid-cols-3 sm:gap-5">
          {benefits.map((b, i) => (
            <RevealBlock key={b.title} delay={i * 0.08} className="h-full">
              <motion.div
                whileHover={reduce ? undefined : { y: -4, transition: { duration: 0.25 } }}
                className="group h-full rounded-2xl border border-ink-100 bg-white/90 p-5 shadow-sm transition-shadow hover:shadow-md dark:border-ink-700 dark:bg-ink-900/80 dark:hover:shadow-lg dark:hover:shadow-ink-950/40"
              >
                <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 transition group-hover:scale-105 group-hover:bg-brand-200 dark:bg-brand-900/50 dark:text-brand-200 dark:group-hover:bg-brand-800/50">
                  <b.icon size={22} />
                </div>
                <h3 className="font-display text-lg font-semibold text-ink-900 dark:text-ink-50">
                  {b.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600 dark:text-ink-400">{b.body}</p>
              </motion.div>
            </RevealBlock>
          ))}
        </div>
      </section>

      {/* Interactive full-stack flow (center of the page) */}
      <section id="project-flow" className="pt-16 sm:pt-20" aria-label="Project architecture flow">
        <RevealBlock>
          <ProjectFlowInteractive />
        </RevealBlock>
      </section>

      <section id="sponsors" className="pt-10 sm:pt-12">
        <RevealBlock>
          <SponsorsSection />
        </RevealBlock>
      </section>

      {/* Why choose ClinixAi */}
      <section className="pt-16 sm:pt-20" id="trust">
        <RevealBlock>
          <SectionTitle
            eyebrow="Our edge"
            title="Why choose ClinixAi for facility intelligence"
            subtitle="A concise case for a product that pairs data discipline with a conversational experience your users will actually use."
          />
        </RevealBlock>
        <div className="mt-10 space-y-3">
          {reasons.map((r, i) => (
            <RevealBlock key={r.headline} delay={i * 0.06}>
              <div className="flex gap-4 rounded-2xl border border-ink-100 bg-white/80 p-4 sm:p-5 dark:border-ink-700 dark:bg-ink-900/60">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ink-900 text-sm font-bold text-white dark:bg-brand-600">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-display text-base font-semibold text-ink-900 dark:text-ink-50 sm:text-lg">
                    {r.headline}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-600 dark:text-ink-400">
                    {r.text}
                  </p>
                </div>
              </div>
            </RevealBlock>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="pt-16 sm:pt-20" id="how">
        <RevealBlock>
          <SectionTitle
            eyebrow="How it works"
            title="From message to shortlist in three beats"
            subtitle="The experience is simple on the surface; underneath, intent extraction, retrieval, and ranking work together."
          />
        </RevealBlock>
        <div className="relative mx-auto mt-10 max-w-xl">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-brand-300 via-brand-400/50 to-transparent sm:left-5 dark:from-brand-600 dark:via-brand-600/30" />
          <ul className="space-y-8">
            {steps.map((s, i) => (
              <RevealBlock key={s.n} delay={i * 0.1}>
                <li className="relative flex gap-4 pl-1 sm:gap-5">
                  <span className="z-[1] flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-white bg-brand-600 text-xs font-bold text-white shadow sm:h-9 sm:w-9 dark:border-ink-900">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-display text-sm font-semibold text-ink-900 dark:text-ink-50 sm:text-base">
                      {s.t}
                    </p>
                    <p className="mt-1 text-sm text-ink-600 dark:text-ink-400">{s.d}</p>
                  </div>
                </li>
              </RevealBlock>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA band */}
      <section className="pt-16 sm:pt-20" id="start">
        <RevealBlock>
          <div className="relative overflow-hidden rounded-3xl border border-brand-200/60 bg-gradient-to-br from-brand-600 via-brand-700 to-ink-900 p-8 text-center shadow-lg sm:p-10 dark:border-brand-800/30">
            <HospitalIcon
              className="pointer-events-none absolute -right-4 -top-4 text-white/10"
              size={180}
            />
            <h2 className="relative z-[1] font-display text-2xl font-bold text-white sm:text-3xl">
              Ready to try the full agent?
            </h2>
            <p className="relative z-[1] mx-auto mt-2 max-w-lg text-sm text-white/90 sm:text-base">
              Open the live chat, ask a real question, and see ranked facilities with an explanation
              you can take into your next conversation.
            </p>
            <div className="relative z-[1] mt-6">
              <Link
                to="/agent/chat"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white px-6 text-base font-semibold text-brand-800 shadow-lg transition hover:bg-ink-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
              >
                <SparkleIcon size={18} />
                Open AI agent
              </Link>
            </div>
          </div>
        </RevealBlock>
      </section>
    </div>
  );
}
