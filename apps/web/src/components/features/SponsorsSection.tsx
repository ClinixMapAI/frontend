import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/utils/cn";

const SPONSORS: {
  name: string;
  note?: string;
  href?: string;
}[] = [
  { name: "eleveght.ai", note: "Partner", href: "https://eleveght.ai" },
  { name: "HackNation", note: "hack-nation.ai", href: "https://hack-nation.ai" },
  { name: "Red Bull", note: "Wings for ideas", href: "https://www.redbull.com" },
  { name: "TUMO", note: "Creative tech", href: "https://www.tumo.org" },
];

export function SponsorsSection() {
  const reduce = useReducedMotion();

  return (
    <section
      className="rounded-3xl border border-ink-100/90 bg-white/60 px-4 py-8 shadow-sm sm:px-8 dark:border-ink-700 dark:bg-ink-900/40"
      aria-labelledby="sponsors-heading"
    >
      <h3
        id="sponsors-heading"
        className="text-center text-[11px] font-semibold uppercase tracking-[0.25em] text-ink-500 dark:text-ink-400"
      >
        With thanks to our supporters
      </h3>
      <p className="mx-auto mt-2 max-w-lg text-center text-sm text-ink-600 dark:text-ink-400">
        ClinixAi is built in the open with partners who back bold product experiments in healthcare
        navigation.
      </p>
      <ul className="mx-auto mt-8 grid max-w-4xl list-none grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {SPONSORS.map((s, i) => {
          const cardClass = cn(
            "group flex h-full min-h-[5.5rem] flex-col items-center justify-center rounded-2xl border border-ink-100 bg-gradient-to-b from-white to-ink-50/50 px-3 py-4 text-center transition",
            "dark:border-ink-700 dark:from-ink-900/90 dark:to-ink-950/60",
            s.href && "hover:border-brand-200 hover:shadow-md dark:hover:border-brand-800",
          );

          const inner = (
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.06, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className={cardClass}
            >
              <span className="font-display text-sm font-bold text-ink-900 sm:text-base dark:text-ink-50">
                {s.name}
              </span>
              {s.note && (
                <span className="mt-1 text-[11px] text-ink-500 dark:text-ink-400">{s.note}</span>
              )}
            </motion.div>
          );

          if (s.href) {
            return (
              <li key={s.name} className="h-full">
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block h-full rounded-2xl no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                >
                  {inner}
                </a>
              </li>
            );
          }
          return (
            <li key={s.name} className="h-full">
              {inner}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
