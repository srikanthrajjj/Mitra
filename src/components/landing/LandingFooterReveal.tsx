import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
  cubicBezier,
} from 'motion/react';
import {
  ArrowRight,
  Facebook,
  Instagram,
  Linkedin,
  MoveUpRight,
} from 'lucide-react';
import { IlluminaiteLogo } from '../IlluminaiteLogo';

const easeOutExpo = cubicBezier(0.16, 1, 0.3, 1);

interface LandingFooterRevealProps {
  onGetStarted: () => void;
}

export function LandingFooterReveal({ onGetStarted }: LandingFooterRevealProps) {
  const spacerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const [footerHeight, setFooterHeight] = useState(720);

  const { scrollYProgress } = useScroll({
    target: spacerRef,
    offset: ['start end', 'end end'],
  });

  const reveal = useTransform(scrollYProgress, [0, 1], [0, 1], { ease: easeOutExpo });
  const opacity = useTransform(reveal, [0, 1], [0, 1]);
  const y = useTransform(reveal, [0, 1], [36, 0]);
  const scale = useTransform(reveal, [0, 1], [0.98, 1]);
  const blur = useTransform(reveal, [0, 1], [8, 0]);
  const filter = useMotionTemplate`blur(${blur}px)`;

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;

    const measure = () => setFooterHeight(el.offsetHeight);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const quickLinks = ['Home', 'About', 'AI Solutions & Industries', 'Contact Us'];
  const aiSolutions = ['CPG & Retail', 'Public Sector', 'Non Profit', 'Healthcare', 'Financial Services'];
  const inspiredLinks = [
    'Customer Stories',
    'Testimonial From Customers',
    'Thought Leadership',
    'AI Innovation Labs',
  ];

  return (
    <>
      <div
        ref={spacerRef}
        aria-hidden
        className="pointer-events-none"
        style={{ height: footerHeight }}
      />

      <motion.footer
        ref={footerRef}
        style={{ opacity, y, scale, filter }}
        className="fixed inset-x-0 bottom-0 z-0 overflow-hidden border-t border-white/[0.04] bg-[var(--landing-bg)] px-6 py-14 will-change-transform md:py-16"
      >
        <div
          className="pointer-events-none absolute inset-x-0 bottom-[-12rem] h-[26rem] bg-[radial-gradient(circle_at_center,rgba(50,215,75,0.28)_0%,rgba(0,201,160,0.12)_22%,rgba(50,215,75,0.06)_40%,transparent_68%)] blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-[22%] bottom-0 h-px bg-[rgba(50,215,75,0.28)] blur-sm"
          aria-hidden
        />

        <div className="relative z-10 mx-auto max-w-6xl">
          <div className="grid gap-10 border-b border-white/[0.04] pb-10 md:grid-cols-12 md:pb-12">
            <div className="md:col-span-4">
              <IlluminaiteLogo className="h-[22px] w-auto opacity-90" />
              <div className="mt-6 flex items-center gap-4 text-white/45">
                <Facebook className="h-4 w-4 transition-colors hover:text-white" />
                <Linkedin className="h-4 w-4 transition-colors hover:text-white" />
                <Instagram className="h-4 w-4 transition-colors hover:text-white" />
                <MoveUpRight className="h-4 w-4 transition-colors hover:text-white" />
              </div>
            </div>

            <div className="md:col-span-2">
              <h4 className="text-sm font-semibold text-white">Quick Links</h4>
              <ul className="mt-5 space-y-3 text-sm text-white/55">
                {quickLinks.map((link) => (
                  <li key={link}>
                    <button
                      type="button"
                      onClick={onGetStarted}
                      className="transition-colors hover:text-white"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-3">
              <h4 className="text-sm font-semibold text-white">AI Solutions</h4>
              <ul className="mt-5 space-y-3 text-sm text-white/55">
                {aiSolutions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-3">
              <h4 className="text-sm font-semibold text-white">Get Inspired</h4>
              <ul className="mt-5 space-y-3 text-sm text-white/55">
                {inspiredLinks.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid gap-8 border-b border-white/[0.04] py-8 md:grid-cols-[1.2fr_0.8fr] md:items-center md:py-10">
            <div>
              <p className="max-w-2xl text-2xl leading-[1.45] text-white/82 md:text-[2rem]">
                Get IlluminAIte updates on AI, ServiceNow & industry impact, direct in your inbox.
              </p>
            </div>

            <div className="flex justify-start md:justify-end">
              <div className="flex w-full max-w-md items-center rounded-full border border-white/[0.08] bg-white/[0.03] p-1.5">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="h-11 flex-1 bg-transparent px-4 text-sm text-white placeholder:text-white/28 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={onGetStarted}
                  className="inline-flex h-10 items-center rounded-full bg-white px-5 text-sm font-medium text-black transition-opacity hover:opacity-90"
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start justify-between gap-5 pt-6 text-xs text-white/30 md:flex-row md:items-center">
            <span>© 2026 IlluminAIte. All rights reserved.</span>
            <div className="flex items-center gap-6 self-stretch md:self-auto">
              <span className="ml-auto md:ml-0">Privacy Policy</span>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--landing-accent)]/45 text-[var(--landing-accent)] transition-colors hover:border-[var(--landing-accent)] hover:bg-[var(--landing-accent)]/10"
                aria-label="Scroll to top"
              >
                <ArrowRight className="h-4 w-4 -rotate-90" />
              </button>
            </div>
          </div>
        </div>
      </motion.footer>
    </>
  );
}
