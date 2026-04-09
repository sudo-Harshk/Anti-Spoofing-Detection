import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ScanFace,
  ShieldCheck,
  Camera,
  Lock,
  Eye,
  GitBranch,
  BrainCircuit,
  Upload,
  ArrowRight,
  Sparkles,
  Fingerprint,
  Layers,
  Cpu,
  Database,
  CheckCircle2,
  Github,
  FileText,
} from 'lucide-react';

import { cn } from './lib/cn.js';
import { Button } from './components/ui/button.jsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card.jsx';
import { Badge } from './components/ui/badge.jsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs.jsx';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './components/ui/accordion.jsx';
import { Avatar, AvatarImage, AvatarFallback } from './components/ui/avatar.jsx';
import { Tooltip, TooltipContent, TooltipTrigger } from './components/ui/tooltip.jsx';

/** Remote Unsplash assets (centralized) */
const IMAGES = {
  heroShield: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=640&q=80',
  heroRobot: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=640&q=80',
  demoFace: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=900&q=80',
  modesMascot: 'https://images.unsplash.com/photo-1531746797551-88f7fc1c29f7?auto=format&fit=crop&w=720&q=80',
  academicShield: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=560&q=80',
  finalThumbs: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=560&q=80',
  avatar1: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
  avatar2: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
  avatar3: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
};

const LINKS = {
  github: 'https://github.com',
  docs: '#docs',
  whitepaper: '#whitepaper',
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

function Container({ children, className }) {
  return <div className={cn('mx-auto w-full max-w-[1200px] px-6', className)}>{children}</div>;
}

function SectionHeader({ eyebrow, title, subtitle, className }) {
  return (
    <div className={cn('mx-auto max-w-3xl text-center', className)}>
      {eyebrow ? (
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-accent-orange">{eyebrow}</p>
      ) : null}
      <h2 className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-tight tracking-tight text-text">{title}</h2>
      {subtitle ? <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">{subtitle}</p> : null}
    </div>
  );
}

function FloatingOrbit({ Icon, tone = 'blue', className, style, delaySec = 0 }) {
  const tones = {
    blue: 'bg-accent-blue-light text-primary border-border',
    yellow: 'bg-[#FFF8E6] text-[#7A4B00] border-[#F2D58A]',
    orange: 'bg-[#FFF0E8] text-[#9B4A1A] border-[#F5C4A8]',
    green: 'bg-[#E9F6EF] text-secondary border-[#BFE3D3]',
  };
  return (
    <div
      className={cn(
        'float-drift absolute flex h-12 w-12 items-center justify-center rounded-full border shadow-md md:h-14 md:w-14',
        tones[tone],
        className,
      )}
      style={{
        animationDelay: `${delaySec}s`,
        animationDuration: `${10 + (delaySec % 3) * 2}s`,
        ...style,
      }}
    >
      <Icon className="h-5 w-5 md:h-6 md:w-6" aria-hidden />
    </div>
  );
}

function BrowserMock({ children, className }) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_8px_24px_rgba(0,0,0,0.05)]',
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-border bg-[#FAFAF8] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#E8A79A]" />
        <span className="h-2.5 w-2.5 rounded-full bg-accent-yellow" />
        <span className="h-2.5 w-2.5 rounded-full bg-secondary/70" />
        <span className="ml-3 truncate text-xs font-semibold text-muted">liveface.app · secure capture</span>
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}

function GradCamMock({ src, alt }) {
  return (
    <div className="group relative aspect-[4/3] w-full overflow-hidden bg-text/5">
      <img src={src} alt={alt} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" loading="lazy" />
      <div
        className="heatmap-mock pointer-events-none absolute inset-0 opacity-90 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-text/25 via-transparent to-transparent" aria-hidden />
    </div>
  );
}

function MetricTooltip({ label, explanation }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="cursor-help border-b border-dotted border-muted font-semibold text-text underline-offset-2"
        >
          {label}
        </button>
      </TooltipTrigger>
      <TooltipContent className="left-0 top-full max-w-[220px]">{explanation}</TooltipContent>
    </Tooltip>
  );
}

function VerdictPreviewCard() {
  const reducedMotion = useReducedMotion();
  const pct = 73;
  return (
    <Card className="border-white/25 bg-surface text-text shadow-xl">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">Dual-model verdict</Badge>
          <Badge>Grad-CAM enabled</Badge>
        </div>
        <CardTitle className="text-xl md:text-2xl">REAL — with 25% penalty</CardTitle>
        <CardDescription className="text-muted">
          YOLO gate passed; ViT confidence reduced after artifact hints near the jawline. Final fused score remains above the
          bonafide threshold.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted">Fused confidence</p>
            <p className="text-3xl font-bold tabular-nums text-text">{pct}%</p>
          </div>
          <span className="rounded-full bg-[#DFF3EA] px-3 py-1 text-xs font-bold text-[#1F5E3F]">Spoof risk: low</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-border">
          <motion.div
            className="h-full rounded-full bg-secondary"
            initial={{ width: reducedMotion ? `${pct}%` : 0 }}
            whileInView={{ width: `${pct}%` }}
            viewport={{ once: true }}
            transition={{ duration: reducedMotion ? 0 : 0.9, ease: 'easeOut' }}
          />
        </div>
        <p className="text-xs text-muted">Penalty applied from ViT saliency hotspots (paper-edge cues).</p>
      </CardContent>
    </Card>
  );
}

function ConsensusBridge() {
  const reducedMotion = useReducedMotion();
  return (
    <div className="relative mt-8 flex flex-col items-stretch gap-6 sm:flex-row sm:items-center sm:justify-center">
      <Card className="card-premium flex-1 border-primary/20 bg-accent-blue-light/80 p-4 sm:max-w-[200px]">
        <div className="flex items-center gap-2 text-sm font-bold text-text">
          <ScanFace className="h-4 w-4 text-primary" />
          YOLO gatekeeper
        </div>
        <p className="mt-1 text-xs text-muted">Sub-ms bounding box + liveness cue.</p>
      </Card>
      <div className="relative flex h-14 flex-1 items-center justify-center sm:h-auto sm:w-24">
        <motion.div
          className="hidden h-0.5 w-full origin-left rounded-full bg-gradient-to-r from-primary via-accent-orange to-secondary sm:block"
          initial={{ scaleX: reducedMotion ? 1 : 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: reducedMotion ? 0 : 0.7, ease: 'easeOut' }}
        />
        <motion.div
          className="absolute text-xs font-bold text-primary sm:static"
          initial={{ opacity: reducedMotion ? 1 : 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reducedMotion ? 0 : 0.35 }}
        >
          Fuse
        </motion.div>
        <motion.div
          className="block h-10 w-0.5 rounded-full bg-gradient-to-b from-primary via-accent-orange to-secondary sm:hidden"
          initial={{ scaleY: reducedMotion ? 1 : 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: reducedMotion ? 0 : 0.7, ease: 'easeOut' }}
        />
      </div>
      <Card className="card-premium flex-1 border-secondary/30 bg-[#E9F6EF] p-4 sm:max-w-[200px]">
        <div className="flex items-center gap-2 text-sm font-bold text-text">
          <BrainCircuit className="h-4 w-4 text-secondary" />
          ViT analyst
        </div>
        <p className="mt-1 text-xs text-muted">Patch attention + Grad-CAM narrative.</p>
      </Card>
    </div>
  );
}

function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLink = 'text-sm font-semibold text-text/90 hover:text-primary transition-colors';

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-[background,backdrop-filter,border-color] duration-300',
        scrolled ? 'border-b border-border bg-bg/75 backdrop-blur-xl' : 'border-b border-transparent bg-transparent',
      )}
    >
      <Container className="flex h-16 items-center justify-between gap-4 md:h-[4.25rem]">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-border bg-surface shadow-sm">
            <ScanFace className="h-5 w-5 text-primary" aria-hidden />
          </span>
          <span className="text-sm font-bold tracking-tight text-text">LiveFace</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          <a className={navLink} href="#platform">
            Platform
          </a>
          <a className={navLink} href="#research">
            Research
          </a>
          <a className={navLink} href={LINKS.docs}>
            Docs
          </a>
          <a className={navLink} href="#faq">
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/detect" className="hidden sm:block">
            <Button variant="ghost" size="sm">
              Live Demo
            </Button>
          </Link>
          <Link to="/detect">
            <Button size="sm" className="sm:h-11 sm:px-6 sm:text-sm">
              Try Detector
            </Button>
          </Link>
        </div>
      </Container>
    </motion.header>
  );
}

export default function LandingPage() {
  const [modeTab, setModeTab] = useState('consensus');

  return (
    <div className="min-h-screen bg-bg text-text">
      <NavBar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-24 pb-16 md:pt-28 md:pb-20 lg:pt-32">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(900px 420px at 12% 18%, color-mix(in oklab, var(--color-accent-blue-light) 85%, transparent) 0%, transparent 58%), radial-gradient(780px 400px at 88% 12%, color-mix(in oklab, var(--color-accent-yellow) 22%, transparent) 0%, transparent 60%), radial-gradient(700px 380px at 70% 88%, color-mix(in oklab, var(--color-primary) 12%, transparent) 0%, transparent 62%)',
          }}
        />

        <FloatingOrbit Icon={Camera} tone="blue" className="left-[6%] top-[28%]" delaySec={0} />
        <FloatingOrbit Icon={Fingerprint} tone="yellow" className="right-[8%] top-[22%]" delaySec={0.4} />
        <FloatingOrbit Icon={Lock} tone="green" className="left-[12%] bottom-[18%] hidden md:flex" delaySec={0.8} />
        <FloatingOrbit Icon={GitBranch} tone="orange" className="right-[14%] bottom-[20%] hidden lg:flex" delaySec={1.1} />

        <Container className="relative">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-8">
            {/* Left mascot */}
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-40px' }}
              variants={fadeUp}
              className="relative mx-auto hidden max-w-[220px] lg:mx-0 lg:block"
            >
              <div className="float-drift relative overflow-hidden rounded-3xl border border-border bg-surface shadow-[0_8px_24px_rgba(0,0,0,0.05)]" style={{ animationDuration: '12s' }}>
                <img
                  src={IMAGES.heroShield}
                  alt="Friendly security shield illustration"
                  className="h-48 w-full object-cover md:h-56"
                  loading="lazy"
                />
                <div className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-primary/90 text-white shadow-lg">
                  <Eye className="h-5 w-5" aria-hidden />
                </div>
              </div>
            </motion.div>

            {/* Center copy */}
            <div className="text-center">
              <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
                <Badge variant="outline" className="mb-4">
                  M.Tech Project · Anti-spoofing AI
                </Badge>
                <h1 className="text-[clamp(2rem,5.5vw,3.5rem)] font-bold leading-[1.08] tracking-tight text-text">
                  Your AI edge against deepfakes.
                </h1>
                <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted md:text-lg">
                  Real-time liveness detection powered by Vision Transformers and YOLO. Stop printed photos, 3D masks, and video
                  replays.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link to="/detect">
                    <Button size="lg" className="w-full min-w-[200px] sm:w-auto">
                      <Upload className="h-4 w-4" />
                      Upload &amp; Scan
                    </Button>
                  </Link>
                  <a href="#platform">
                    <Button variant="secondary" size="lg" className="w-full min-w-[200px] sm:w-auto">
                      Explore platform
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </a>
                </div>
              </motion.div>
            </div>

            {/* Right mascot */}
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: '-40px' }}
              variants={fadeUp}
              className="relative mx-auto hidden max-w-[240px] lg:mx-0 lg:block"
            >
              <div
                className="float-drift relative overflow-hidden rounded-3xl border border-border bg-surface shadow-[0_8px_24px_rgba(0,0,0,0.05)]"
                style={{ animationDuration: '11s', animationDelay: '0.5s' }}
              >
                <img
                  src={IMAGES.heroRobot}
                  alt="Friendly robot mascot representing LiveFace AI"
                  className="h-52 w-full object-cover md:h-60"
                  loading="lazy"
                />
                <Badge variant="primary" className="absolute bottom-3 left-3">
                  LiveFace Guard
                </Badge>
              </div>
            </motion.div>
          </div>

          {/* Mobile mascots - smaller */}
          <div className="mt-10 flex justify-center gap-4 lg:hidden">
            <div className="relative w-[42%] max-w-[180px] overflow-hidden rounded-2xl border border-border bg-surface shadow-md">
              <img src={IMAGES.heroShield} alt="" className="h-32 w-full object-cover" loading="lazy" />
            </div>
            <div className="relative w-[42%] max-w-[180px] overflow-hidden rounded-2xl border border-border bg-surface shadow-md">
              <img src={IMAGES.heroRobot} alt="" className="h-32 w-full object-cover" loading="lazy" />
            </div>
          </div>
        </Container>
      </section>

      {/* Demo / heatmap */}
      <section id="platform" className="border-t border-border bg-surface/60 py-12 md:py-20">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={fadeUp}>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-orange">In-browser demo</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-text md:text-[clamp(1.75rem,3vw,2.25rem)]">
                Bank-grade security. Right in your browser.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">
                Capture a selfie, run ViT saliency, and read a fused verdict card—no guesswork, no black box. Built for researchers
                who need explainability on stage.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-text">
                {[
                  'Spoof detection confidence target: 99.2% on curated splits',
                  'Grad-CAM overlay highlights generative seams and print boundaries',
                  'Consensus mode surfaces penalties when models disagree',
                ].map((t) => (
                  <li key={t} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary" aria-hidden />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: '-60px' }} variants={fadeUp}>
              <div className="relative">
                <BrowserMock>
                  <GradCamMock src={IMAGES.demoFace} alt="Face capture preview with simulated Grad-CAM heatmap" />
                </BrowserMock>
                <div className="float-drift absolute -left-2 top-1/4 z-10 md:-left-4" style={{ animationDuration: '9s' }}>
                  <Badge variant="secondary" className="shadow-md">
                    Real
                  </Badge>
                </div>
                <div className="float-drift absolute -right-2 top-1/3 z-10 md:-right-4" style={{ animationDuration: '11s', animationDelay: '0.3s' }}>
                  <Badge variant="warn">Spoof</Badge>
                </div>
                <div className="float-drift absolute -bottom-2 left-1/3 z-10 md:-bottom-4" style={{ animationDuration: '10s', animationDelay: '0.6s' }}>
                  <Badge variant="primary" className="shadow-md">
                    Confidence 98%
                  </Badge>
                </div>
              </div>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Operating modes */}
      <section className="py-12 md:py-20">
        <Container>
          <SectionHeader
            eyebrow="Operating modes"
            title="Pick Your Mode. Verify Your Way."
            subtitle="Switch between deep visual reasoning, ultra-fast gates, or hierarchical fusion—with confidence scoring that stays honest when models disagree."
          />

          <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-16">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
              <Tabs value={modeTab} onValueChange={setModeTab}>
                <TabsList className="flex w-full flex-wrap justify-start gap-1 p-2">
                  <TabsTrigger value="vit">
                    <span className="flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      ViT
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="yolo">
                    <span className="flex items-center gap-2">
                      <ScanFace className="h-4 w-4" />
                      YOLO
                    </span>
                  </TabsTrigger>
                  <TabsTrigger value="consensus">
                    <span className="flex items-center gap-2">
                      <GitBranch className="h-4 w-4" />
                      Consensus
                    </span>
                  </TabsTrigger>
                </TabsList>

                {/* Mode avatar row */}
                <div className="mt-6 flex flex-wrap gap-3">
                  {[
                    { id: 'vit', icon: Layers, label: 'Transformer' },
                    { id: 'yolo', icon: Cpu, label: 'YOLO' },
                    { id: 'consensus', icon: Sparkles, label: 'Fusion' },
                  ].map((m) => {
                    const Icon = m.icon;
                    const active = modeTab === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setModeTab(m.id)}
                        className={cn(
                          'flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all',
                          active
                            ? 'border-primary bg-accent-blue-light text-primary shadow-sm'
                            : 'border-border bg-surface text-text hover:border-primary/40',
                        )}
                      >
                        <span
                          className={cn(
                            'flex h-9 w-9 items-center justify-center rounded-full border',
                            active ? 'border-primary/30 bg-white' : 'border-border bg-bg',
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        {m.label}
                      </button>
                    );
                  })}
                </div>

                <TabsContent value="vit">
                  <ul className="mt-6 space-y-3 text-sm text-muted">
                    <li className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                      Deep analysis with patch attention and Grad-CAM explanations for reviewers.
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                      Best when you need a narrative: “why did the model worry about the cheeks?”
                    </li>
                  </ul>
                </TabsContent>
                <TabsContent value="yolo">
                  <ul className="mt-6 space-y-3 text-sm text-muted">
                    <li className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                      Ultra-fast gatekeeper for prints, replays, and obvious presentation attacks.
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                      Ideal for pre-screening at the edge before heavier ViT work.
                    </li>
                  </ul>
                </TabsContent>
                <TabsContent value="consensus">
                  <ul className="mt-6 space-y-3 text-sm text-muted">
                    <li className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                      Hierarchical fusion: Roboflow/YOLO gates first; ViT revises with explainable cues.
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                      Confidence scoring shows penalties and disagreements instead of silent averaging.
                    </li>
                  </ul>
                  {modeTab === 'consensus' ? <ConsensusBridge /> : null}
                </TabsContent>

                <div className="mt-8">
                  <a href={LINKS.docs}>
                    <Button variant="secondary">
                      <FileText className="h-4 w-4" />
                      View Docs
                    </Button>
                  </a>
                </div>
              </Tabs>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={fadeUp}
              className="relative"
            >
              <div className="card-ink overflow-hidden p-2">
                <img
                  src={IMAGES.modesMascot}
                  alt="Friendly robot with magnifier exploring a face mesh concept"
                  className="w-full rounded-[14px] object-cover"
                  loading="lazy"
                />
              </div>
              {modeTab === 'consensus' ? (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 text-center text-xs font-semibold text-primary"
                >
                  Consensus path: gate → analyze → fused verdict
                </motion.p>
              ) : null}
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Architecture / dashboard preview */}
      <section id="research" className="py-12 md:py-20">
        <Container>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={fadeUp}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-secondary p-8 text-white shadow-[0_8px_24px_rgba(0,0,0,0.08)] md:p-12"
          >
            <div
              className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
              aria-hidden
            />
            <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <Badge variant="primary" className="mb-4 border-white/20 bg-white/15 text-white">
                  Architecture
                </Badge>
                <h2 className="text-2xl font-bold leading-tight md:text-3xl">
                  Hierarchical Consensus Logic. Roboflow as Gatekeeper, ViT as Deep Analyst.
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-white/85 md:text-base">
                  YOLO clears obvious spoofs early; ViT interrogates texture and depth cues. When signals conflict, LiveFace
                  lowers fused confidence and points to salient regions—so your lab can trace the decision.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-white/30 bg-white/10 text-white">
                    Hugging Face · ViT
                  </Badge>
                  <Badge variant="outline" className="border-white/30 bg-white/10 text-white">
                    Roboflow · YOLO
                  </Badge>
                </div>
              </div>

              <div className="relative">
                <div
                  className="absolute -right-2 -z-10 w-[92%] max-w-md rotate-2 rounded-2xl border border-white/20 bg-white/10 p-6 text-white shadow-lg md:-right-4 md:top-6"
                  aria-hidden
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">Dual engines</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">Hugging Face</span>
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">Roboflow</span>
                  </div>
                </div>
                <div className="absolute -inset-3 -z-10 rounded-2xl border border-white/15 bg-white/10 blur-sm" aria-hidden />
                <VerdictPreviewCard />
              </div>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Features grid */}
      <section className="border-t border-border bg-surface/40 py-12 md:py-20">
        <Container>
          <SectionHeader
            eyebrow="Product"
            title="Everything Detection Teams Need."
            subtitle="Explainability where it matters, speed where it counts, and research metrics baked in."
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
              <Card>
                <CardHeader>
                  <Sparkles className="mb-2 h-8 w-8 text-accent-orange" />
                  <CardTitle>Explainable AI</CardTitle>
                  <CardDescription>
                    Grad-CAM visualizations map model focus to pixels—perfect for viva boards and security audits.
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
              <Card>
                <CardHeader>
                  <ShieldCheck className="mb-2 h-8 w-8 text-primary" />
                  <CardTitle>Deepfake Shield</CardTitle>
                  <CardDescription>
                    ViT backbone tuned to generative artifacts, glare seams, and unnatural symmetry breaks.
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
              <Card className="border-white/20 bg-secondary text-white !shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                <CardHeader>
                  <Camera className="mb-2 h-8 w-8 text-accent-yellow" />
                  <CardTitle className="text-white">Presentation Attack Detection</CardTitle>
                  <CardDescription className="text-white/85">
                    YOLO catches printed masks, screens, and replay rigs before they hit the deep model.
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
              <Card>
                <CardHeader>
                  <Database className="mb-2 h-8 w-8 text-secondary" />
                  <CardTitle>Research Metrics</CardTitle>
                  <CardDescription>
                    Built-in reporting hooks for{' '}
                    <MetricTooltip
                      label="APCER"
                      explanation="Attack Presentation Classification Error Rate — spoof samples incorrectly accepted as live."
                    />
                    ,{' '}
                    <MetricTooltip
                      label="BPCER"
                      explanation="Bona Fide Presentation Classification Error Rate — live samples incorrectly rejected."
                    />
                    , and{' '}
                    <MetricTooltip
                      label="ACER"
                      explanation="Average Classification Error Rate — balanced blend of APCER and BPCER for threshold tuning."
                    />{' '}
                    benchmarks (demo targets: APCER 0.5%, BPCER 0.5%, ACER 0.5%).
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Tech */}
      <section className="py-12 md:py-20">
        <Container>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-text md:text-[clamp(1.75rem,3vw,2.25rem)]">
              One platform. Dual models. Infinite scale.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted">
              FastAPI serves inference; React delivers the demo; Python ties training to deployment. Bring your own weights or wire
              ours.
            </p>
            <div className="relative mx-auto mt-12 max-w-3xl">
              <FloatingOrbit Icon={Sparkles} tone="yellow" className="-left-4 top-0" delaySec={0.2} />
              <FloatingOrbit Icon={Cpu} tone="blue" className="-right-6 top-4" delaySec={0.6} />
              <FloatingOrbit Icon={Database} tone="green" className="left-1/4 bottom-0" delaySec={1} />
              <div className="flex flex-wrap justify-center gap-3">
                {['Hugging Face', 'Roboflow', 'FastAPI', 'React', 'Python'].map((name) => (
                  <Badge key={name} variant="outline" className="px-4 py-2 text-sm">
                    {name}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="mt-10">
              <a href={LINKS.github} target="_blank" rel="noreferrer">
                <Button variant="secondary" size="lg">
                  <Github className="h-4 w-4" />
                  View on GitHub
                </Button>
              </a>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Academic CTA */}
      <section className="py-12 md:pb-20">
        <Container>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="overflow-hidden rounded-2xl bg-primary px-6 py-12 text-white shadow-[0_8px_24px_rgba(0,0,0,0.1)] md:px-12 md:py-16"
          >
            <div className="grid gap-10 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
              <ul className="space-y-3 text-sm font-medium text-white/90">
                {['Research-grade accuracy targets on public spoof splits', 'Composable modes for ablation studies', 'Open outputs: logits, overlays, and fused rationale'].map((t) => (
                  <li key={t} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-yellow" />
                    {t}
                  </li>
                ))}
              </ul>

              <div className="flex flex-col items-center text-center">
                <div className="relative w-40 overflow-hidden rounded-3xl border border-white/25 bg-white/10 shadow-lg md:w-48">
                  <img src={IMAGES.academicShield} alt="Shield mascot with technology motif" className="h-44 w-full object-cover md:h-52" loading="lazy" />
                  <Badge className="absolute bottom-3 left-1/2 -translate-x-1/2 border-white/30 bg-primary text-white">
                    M.Tech Project
                  </Badge>
                </div>
              </div>

              <ul className="space-y-3 text-sm font-medium text-white/90">
                {['Serverless-friendly API contracts', 'Dataset cards for transparent benchmarking', 'Starter notebooks for Grad-CAM sweeps'].map((t) => (
                  <li key={t} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-yellow" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-10 flex justify-center">
              <a href={LINKS.whitepaper}>
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90"
                >
                  Read Whitepaper
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Testimonials */}
      <section className="border-t border-border bg-surface/50 py-12 md:py-20">
        <Container>
          <SectionHeader
            eyebrow="Social proof"
            title="Join the researchers. Secure the future."
            subtitle="Teams use LiveFace-style consensus flows when false positives are as costly as misses."
          />
          <div className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
            {[
              {
                quote:
                  'The consensus mode eliminated false positives in our biometrics lab testing.',
                name: 'Dr. Elena Varga',
                role: 'Ph.D. Candidate, Computer Vision',
                img: IMAGES.avatar1,
                initials: 'EV',
              },
              {
                quote:
                  'Grad-CAM overlays turned our viva prep from slides into evidence—we could point to pixels.',
                name: 'Marcus Chen',
                role: 'Security Research Fellow',
                img: IMAGES.avatar2,
                initials: 'MC',
              },
              {
                quote:
                  'YOLO-as-gatekeeper keeps latency honest; ViT only runs when we need the story.',
                name: 'Priya Nair',
                role: 'Applied ML Engineer',
                img: IMAGES.avatar3,
                initials: 'PN',
              },
            ].map((t) => (
              <Card key={t.name} className="min-w-[min(100%,320px)] shrink-0 snap-center md:min-w-0">
                <CardHeader className="flex flex-row items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={t.img} alt="" loading="lazy" />
                    <AvatarFallback>{t.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm leading-relaxed text-text">&ldquo;{t.quote}&rdquo;</p>
                    <p className="mt-4 text-sm font-bold text-text">{t.name}</p>
                    <p className="text-xs text-muted">{t.role}</p>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Trusted by */}
      <section className="py-10 md:py-14">
        <Container>
          <p className="text-center text-xs font-bold uppercase tracking-[0.18em] text-muted">Trusted by teams like</p>
          <p className="mt-2 text-center text-lg font-bold text-text">Built for Researchers. By Researchers.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 md:gap-6">
            {[
              'Institute CV Lab',
              'SecureFace Incubator',
              'Biometric Ethics Consortium',
              'Hugging Face · OSS',
              'Regional Tech University',
            ].map((name) => (
              <span
                key={name}
                className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-muted opacity-70 grayscale"
              >
                {name}
              </span>
            ))}
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-border bg-surface/40 py-12 md:py-20">
        <Container>
          <SectionHeader eyebrow="FAQ" title="Questions, answered." subtitle="Straight talk for demos, reviews, and deployment discussions." />
          <div className="mx-auto mt-10 max-w-2xl">
            <Accordion type="single" collapsible className="flex flex-col gap-3">
              <AccordionItem value="consensus">
                <AccordionTrigger>How does Consensus Mode work?</AccordionTrigger>
                <AccordionContent>
                  YOLO screens for obvious presentation attacks first. If the gate opens, ViT scores deeper texture cues. The UI
                  combines both signals with explicit penalties when ViT spots contradictions—so you never see a single averaged
                  mystery score.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="gradcam">
                <AccordionTrigger>What is Grad-CAM?</AccordionTrigger>
                <AccordionContent>
                  Gradient-weighted Class Activation Mapping highlights regions that pushed the ViT toward spoof vs live. In LiveFace,
                  overlays use warm colors (yellow/orange) over the face to mirror heatmap conventions from the explainability
                  literature.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="privacy">
                <AccordionTrigger>Is my biometric data stored?</AccordionTrigger>
                <AccordionContent>
                  This academic build processes images in-memory for inference and visualization. Nothing is persisted unless you
                  extend the FastAPI service to do so—keep disks off if you are running human subjects data.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="pb-12 md:pb-20">
        <Container>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="overflow-hidden rounded-2xl border border-border bg-accent-blue-light shadow-[0_8px_24px_rgba(0,0,0,0.05)]"
          >
            <div className="grid items-center gap-8 p-8 md:grid-cols-2 md:gap-12 md:p-12">
              <div>
                <h2 className="text-3xl font-bold tracking-tight text-text md:text-4xl">Your AI security sidekick is ready.</h2>
                <p className="mt-4 text-muted">
                  Ship a confident story: fast gates, deep analysis, and overlays you can point to in reviews.
                </p>
                <Link to="/detect" className="mt-8 inline-block">
                  <Button size="lg">Start Detecting</Button>
                </Link>
              </div>
              <div className="relative flex justify-center md:justify-end">
                <div className="float-drift relative w-full max-w-xs overflow-hidden rounded-2xl border border-border bg-surface shadow-md" style={{ animationDuration: '10s' }}>
                  <img
                    src={IMAGES.finalThumbs}
                    alt="Face mesh style portrait with positive gesture"
                    className="aspect-square w-full object-cover"
                    loading="lazy"
                  />
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        'radial-gradient(circle at 50% 35%, transparent 40%, color-mix(in oklab, var(--color-primary) 25%, transparent) 100%)',
                    }}
                    aria-hidden
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Footer */}
      <footer id="docs" className="border-t border-border bg-bg py-12">
        <Container>
          <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
            <div className="max-w-sm">
              <div className="flex items-center gap-2">
                <ScanFace className="h-6 w-6 text-primary" />
                <span className="font-bold text-text">LiveFace</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Anti-Spoofing Detection Platform | M.Tech Final Year Project
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
              {[
                {
                  title: 'Product',
                  links: [
                    ['Platform', '#platform'],
                    ['Detector', '/detect'],
                  ],
                },
                {
                  title: 'Research',
                  links: [
                    ['Architecture', '#research'],
                    ['Whitepaper', LINKS.whitepaper],
                  ],
                },
                {
                  title: 'Socials',
                  links: [
                    ['GitHub', LINKS.github],
                    ['Docs', LINKS.docs],
                  ],
                },
                {
                  title: 'Legal',
                  links: [
                    ['Privacy', '#'],
                    ['Terms', '#'],
                  ],
                },
              ].map((col) => (
                <div key={col.title}>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted">{col.title}</p>
                  <ul className="mt-3 space-y-2 text-sm">
                    {col.links.map(([label, href]) => (
                      <li key={label}>
                        {href.startsWith('/') ? (
                          <Link className="font-medium text-text hover:text-primary" to={href}>
                            {label}
                          </Link>
                        ) : (
                          <a className="font-medium text-text hover:text-primary" href={href}>
                            {label}
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <p className="mt-10 text-center text-xs text-muted">© {new Date().getFullYear()} LiveFace demo. Built for academic showcase.</p>
        </Container>
      </footer>
    </div>
  );
}
