import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ScanFace,
  ShieldCheck,
  Sparkles,
  Binary,
  GitMerge,
  ArrowRight,
  Eye,
  Cpu,
  Brain,
  ChevronDown,
  CheckCircle2,
  BadgeInfo,
} from 'lucide-react';

import authIllus from './assets/illustrations/authentication.svg?url';
import fingerprintIllus from './assets/illustrations/fingerprint-login.svg?url';
import futuristicIllus from './assets/illustrations/futuristic-interface.svg?url';
import mobileIllus from './assets/illustrations/mobile-interface.svg?url';
import appDataIllus from './assets/illustrations/app-data.svg?url';
import modelingIllus from './assets/illustrations/3d-modeling.svg?url';

/* ─── shared variants ──────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};
const staggerGrid = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.1 } },
};

/* ─── MODEL CARDS data ─────────────────────────────────── */
const MODELS = [
  {
    num:   '01',
    icon:  Binary,
    label: 'Vision Transformer',
    tag:   'Hugging Face · ViT',
    body:  'Patch-based self-supervised attention over the full image. Catches global inconsistencies in texture and depth that local detectors miss.',
  },
  {
    num:   '02',
    icon:  ScanFace,
    label: 'YOLO Detector',
    tag:   'Roboflow · YOLOv8',
    body:  'Real-time object detection fine-tuned for liveness. Acts as a strict binary gatekeeper at sub-millisecond speed.',
  },
  {
    num:   '03',
    icon:  GitMerge,
    label: 'Consensus Fusion',
    tag:   'ViT + YOLO · Fused',
    body:  'Both models vote. YOLO gates first; ViT weights the confidence. Disagreement is surfaced, never silently averaged.',
  },
];

/* ─── HOW IT WORKS data ───────────────────────────────── */
const STEPS = [
  { num: '01', icon: Eye,        title: 'Upload',   body: 'Drop any face image — JPG, PNG, or WEBP. The interface accepts it instantly via drag-and-drop.' },
  { num: '02', icon: Cpu,        title: 'Analyse',  body: 'ViT and YOLO process the image in parallel through their respective pipelines on your local backend.' },
  { num: '03', icon: ShieldCheck,title: 'Verify',   body: 'A fused REAL or SPOOF verdict is returned with confidence scores and a Grad-CAM saliency overlay.' },
];

/* ─── STATS data ──────────────────────────────────────── */
const STATS = [
  { value: '99.2%',   label: 'ViT Accuracy',      sub: 'CelebA-Spoof' },
  { value: '97.8%',   label: 'YOLO Precision',     sub: 'Custom dataset' },
  { value: '<200 ms', label: 'End-to-end latency', sub: 'Single image' },
  { value: '2 Models',label: 'Consensus fusion',   sub: 'Cross-validated' },
];

const FAQ = [
  {
    q: 'What attacks does it detect?',
    a: 'Printed photos, replay attacks (screens), and 3D-mask-like artifacts—by combining a fast detector (YOLO) with a global reasoning model (ViT).',
  },
  {
    q: 'Do I need a GPU?',
    a: 'No—this demo runs on your local backend. A GPU helps throughput, but single-image inference works on CPU (with higher latency).',
  },
  {
    q: 'What does “explainable” mean here?',
    a: 'For ViT inference we generate Grad-CAM saliency overlays, highlighting the pixels that influenced the decision.',
  },
];

/* ─── REUSABLE SECTION LABEL ──────────────────────────── */
function Label({ children }) {
  return (
    <p className="text-xs font-bold tracking-[0.18em] uppercase text-orange mb-4">
      {children}
    </p>
  );
}

function Container({ children, className = '' }) {
  return <div className={`max-w-6xl mx-auto px-6 sm:px-8 ${className}`}>{children}</div>;
}

function SectionTitle({ label, title, subtitle }) {
  return (
    <div className="text-center">
      <Label>{label}</Label>
      <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight text-apron-black">{title}</h2>
      {subtitle ? (
        <p className="mt-4 text-base sm:text-lg text-gray-warm max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

/* ─── NAV ─────────────────────────────────────────────── */
function Nav() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-8 py-4 bg-ivory/70 backdrop-blur-xl border-b border-extra-light-gray"
    >
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-orange/70 flex items-center justify-center border border-extra-light-gray">
          <ScanFace className="w-4 h-4 text-apron-black" />
        </div>
        <span className="font-black text-sm tracking-tight text-apron-black">Anti-Spoofing</span>
      </div>

      <Link to="/detect">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold bg-apron-black text-ivory border border-extra-light-gray/50"
        >
          Detect Now <ArrowRight className="w-3.5 h-3.5" />
        </motion.button>
      </Link>
    </motion.nav>
  );
}

/* ─── PAGE ────────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div className="bg-ivory text-apron-black">
      <Nav />

      {/* ══ HERO ══════════════════════════════════════════ */}
      <section className="relative pt-28 sm:pt-36 pb-12 sm:pb-16 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(900px 380px at 15% 20%, color-mix(in oklab, var(--color-orange) 26%, transparent) 0%, transparent 60%), radial-gradient(760px 360px at 80% 10%, color-mix(in oklab, var(--color-green-warm) 22%, transparent) 0%, transparent 62%), radial-gradient(800px 420px at 70% 80%, color-mix(in oklab, var(--color-brown) 22%, transparent) 0%, transparent 62%)',
          }}
        />

        <Container className="relative">
          <div className="text-center">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Label>M.Tech Final Year Project · 2025</Label>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="font-black tracking-tight leading-[1.02] text-[clamp(2.6rem,6vw,4.6rem)]"
            >
              Your AI edge in
              <span className="text-orange"> every trace.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.12 }}
              className="mt-4 text-base sm:text-lg leading-relaxed text-gray-warm max-w-2xl mx-auto"
            >
              A light-hearted, explainable face anti-spoofing demo. ViT + YOLO fusion with confidence scores and Grad-CAM overlays for auditable decisions.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.18 }}
              className="mt-7 flex flex-col sm:flex-row gap-3 justify-center"
            >
              <Link to="/detect">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm bg-apron-black text-ivory border border-extra-light-gray/60"
                >
                  Try detection <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
              <a
                href="#pipeline"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm bg-white/70 text-extra-dark-gray border border-extra-light-gray hover:bg-white transition-colors"
              >
                View pipeline <ChevronDown className="w-4 h-4 text-dark-gray" />
              </a>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative mt-10 sm:mt-12"
            style={{ ['--primary-svg-color']: 'var(--color-orange)' }}
          >
            <div className="relative card-ink p-8 sm:p-10 max-w-4xl mx-auto">
              <div className="absolute -top-4 left-7 sm:left-10 h-3 w-3 rounded-full bg-orange/70 border border-extra-light-gray" />
              <div className="absolute -top-7 right-10 h-4 w-4 rounded-full bg-[#A7E6D2]/70 border border-extra-light-gray" />
              <div className="absolute -bottom-6 left-12 h-4 w-4 rounded-full bg-[#F2B6D2]/70 border border-extra-light-gray" />

              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="text-left">
                  <p className="text-xs font-bold tracking-[0.18em] uppercase text-gray-warm mb-3">
                    Fast, explainable, local
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-apron-black">
                    Upload. Analyse. Verify.
                  </h3>
                  <ul className="mt-5 space-y-3 text-sm text-dark-gray">
                    {[
                      'Parallel ViT + YOLO inference',
                      'Consensus fusion with confidence',
                      'Grad-CAM saliency overlay for auditability',
                    ].map((x) => (
                      <li key={x} className="flex gap-2 items-start">
                        <CheckCircle2 className="w-4 h-4 mt-0.5 text-apron-black" />
                        <span>{x}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="relative">
                  <div className="card-ink p-6 sm:p-7" style={{ ['--primary-svg-color']: 'var(--color-brown)' }}>
                    <img src={mobileIllus} alt="Mobile interface illustration" className="w-full h-auto select-none" draggable={false} />
                  </div>
                  <div className="absolute -bottom-6 -left-6 hidden md:block card-ink p-4" style={{ ['--primary-svg-color']: 'var(--color-green-warm)' }}>
                    <img src={fingerprintIllus} alt="Fingerprint illustration" className="w-40 h-auto select-none" draggable={false} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* ══ STATS ROW ═════════════════════════════════════ */}
      <section className="bg-white/70 border-y border-extra-light-gray">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
          className="max-w-6xl mx-auto px-6 sm:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-2"
        >
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              variants={fadeUp}
              className="px-4 sm:px-6 py-3 flex flex-col gap-1 rounded-2xl bg-white/60 border border-extra-light-gray"
            >
              <span className="text-3xl font-black text-apron-black">{s.value}</span>
              <span className="text-sm font-bold text-extra-dark-gray">{s.label}</span>
              <span className="text-xs text-gray-warm">{s.sub}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ══ MODELS ════════════════════════════════════════ */}
      <section id="pipeline" className="py-20 sm:py-24">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          variants={staggerGrid}
        >
          <Container>
            <motion.div variants={fadeUp} className="mb-12 sm:mb-14">
              <SectionTitle
                label="Detection Pipeline"
                title={<>Three models, one verdict</>}
                subtitle="A lightweight, auditable flow that stays readable in a project demo—without losing the security story."
              />
            </motion.div>

            <div className="grid md:grid-cols-3 gap-4">
              {MODELS.map((m) => {
                const Icon = m.icon;
                return (
                  <motion.div
                    key={m.label}
                    variants={fadeUp}
                    whileHover={{ y: -3, transition: { duration: 0.2 } }}
                    className="card-ink flex flex-col gap-5 p-8"
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-bold font-mono tracking-widest text-light-gray">{m.num}</span>
                      <Icon className="w-5 h-5 text-apron-black" />
                    </div>
                    <div>
                      <p className="font-black text-xl leading-tight text-apron-black">{m.label}</p>
                      <p className="text-xs font-mono mt-1 text-gray-warm">{m.tag}</p>
                    </div>
                    <p className="text-sm leading-relaxed text-dark-gray">{m.body}</p>
                  </motion.div>
                );
              })}
            </div>
          </Container>
        </motion.div>
      </section>

      {/* reference-like stacked band */}
      <section className="py-20 sm:py-24">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <Label>Pick your app, trust your way</Label>
              <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-apron-black">
                A friendly UI for a serious model
              </h3>
              <p className="mt-4 text-base text-gray-warm leading-relaxed max-w-xl">
                Pastel visuals, calm spacing, and clear outcomes—so the focus stays on the anti-spoofing result, not on the UI noise.
              </p>
              <div className="mt-6 grid sm:grid-cols-2 gap-3">
                {[
                  { icon: BadgeInfo, title: 'Clear outcome', body: 'REAL/SPOOF with confidence.' },
                  { icon: Sparkles, title: 'Explainability', body: 'Grad-CAM overlay when available.' },
                  { icon: Cpu, title: 'Local pipeline', body: 'Runs against your backend.' },
                  { icon: ShieldCheck, title: 'Audit-friendly', body: 'No silent averaging.' },
                ].map((f) => {
                  const Icon = f.icon;
                  return (
                    <div key={f.title} className="card-ink p-5">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-apron-black" />
                        <p className="text-sm font-black text-apron-black">{f.title}</p>
                      </div>
                      <p className="mt-2 text-sm text-dark-gray leading-relaxed">{f.body}</p>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="order-1 lg:order-2" style={{ ['--primary-svg-color']: 'var(--color-orange)' }}>
              <div className="card-ink p-8 sm:p-10">
                <img src={authIllus} alt="Authentication illustration" className="w-full h-auto select-none" draggable={false} />
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white/60 border-y border-extra-light-gray py-20 sm:py-24">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div style={{ ['--primary-svg-color']: 'var(--color-green-warm)' }}>
              <div className="card-ink p-8 sm:p-10">
                <img src={appDataIllus} alt="App data illustration" className="w-full h-auto select-none" draggable={false} />
              </div>
            </div>
            <div>
              <Label>Every step, one dashboard</Label>
              <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-apron-black">
                Evidence you can present
              </h3>
              <p className="mt-4 text-base text-gray-warm leading-relaxed max-w-xl">
                Keep metrics and outputs readable. This landing is structured in playful bands—matching your reference layout rhythm.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-dark-gray">
                {[
                  'Single-model and consensus modes',
                  'Confidence and raw labels surfaced',
                  'XAI overlay panel (ViT / consensus)',
                ].map((x) => (
                  <li key={x} className="flex gap-2 items-start">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-apron-black" />
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* ══ HOW IT WORKS ══════════════════════════════════ */}
      <section id="how-it-works" className="bg-white/60 border-y border-extra-light-gray">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-20 sm:py-24 grid md:grid-cols-2 gap-14 lg:gap-20">
          {/* left */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55 }}
            viewport={{ once: true }}
            className="md:sticky md:top-32 self-start"
          >
            <Label>Workflow</Label>
            <h2
              className="text-4xl sm:text-5xl font-black tracking-tight leading-tight mb-6 text-apron-black"
            >
              How it<br />
              <span className="text-orange">works</span>
            </h2>
            <p className="text-sm leading-relaxed mb-8 text-dark-gray">
              From raw image to an explainable verdict — every step is transparent and auditable.
            </p>
            <Link to="/detect">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold bg-apron-black text-ivory border border-extra-light-gray/60"
              >
                Try it now <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>

            <div className="mt-10 card-ink p-6" style={{ ['--primary-svg-color']: 'var(--color-brown)' }}>
              <img
                src={futuristicIllus}
                alt="Futuristic interface illustration"
                className="w-full h-auto select-none"
                draggable={false}
              />
            </div>
          </motion.div>

          {/* right — steps */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-40px' }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.15 } } }}
            className="flex flex-col"
          >
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.num}
                  variants={fadeUp}
                  className={`flex gap-6 py-7 ${i < STEPS.length - 1 ? 'border-b border-extra-light-gray' : ''}`}
                >
                  <span
                    className="text-xs font-bold font-mono tracking-widest shrink-0 pt-1 text-light-gray"
                  >
                    {s.num}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="w-4 h-4 text-apron-black" />
                      <p className="font-black text-lg text-apron-black">{s.title}</p>
                    </div>
                    <p className="text-sm leading-relaxed text-dark-gray">{s.body}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ══ XAI HIGHLIGHT ═════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-6 sm:px-8 py-20 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-4"
        >
          {/* dark tile */}
          <div className="card-ink p-10 flex flex-col justify-between gap-8">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/70 border border-extra-light-gray">
              <Sparkles className="w-5 h-5 text-apron-black" />
            </div>
            <div>
              <Label>Explainability</Label>
              <h3 className="text-3xl font-black leading-tight text-apron-black">
                Grad-CAM saliency maps
              </h3>
            </div>
          </div>

          {/* light tile */}
          <div className="card-ink p-10 flex flex-col justify-center gap-4">
            <p className="text-sm leading-relaxed text-dark-gray">
              After every ViT inference, gradient-weighted class activation maps highlight exactly which pixels drove the verdict — printed artifacts, screen reflections, or depth anomalies.
            </p>
            <p className="text-sm leading-relaxed text-dark-gray">
              This makes the system auditable for security teams and suitable for academic review boards, where black-box decisions are unacceptable.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <Brain className="w-4 h-4 text-apron-black" />
              <span className="text-xs font-bold text-gray-warm">
                Powered by pytorch-grad-cam
              </span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ══ DARK PLAYFUL BAND (reference-like) ════════════ */}
      <section className="py-20 sm:py-24">
        <Container>
          <div
            className="relative overflow-hidden rounded-[28px] border border-extra-light-gray bg-apron-black text-ivory"
            style={{
              background:
                'radial-gradient(900px 500px at 25% 15%, rgba(175,195,255,0.18) 0%, transparent 60%), radial-gradient(760px 420px at 85% 75%, rgba(167,230,210,0.16) 0%, transparent 62%), #0B1020',
            }}
          >
            <div className="relative p-10 sm:p-14 grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <p className="text-xs font-bold tracking-[0.18em] uppercase text-ivory/70 mb-3">
                  One more step
                </p>
                <h3 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                  Go ahead.
                  <span className="block" style={{ color: 'color-mix(in oklab, var(--color-orange) 85%, white)' }}>
                    Trust what’s visible.
                  </span>
                </h3>
                <p className="mt-4 text-sm sm:text-base text-ivory/70 leading-relaxed max-w-xl">
                  The landing stays light-hearted, but the decision path remains explicit—perfect for a final-year project demo and viva discussion.
                </p>
                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                  <Link to="/detect">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm bg-ivory text-apron-black border border-white/20"
                    >
                      Launch detection <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </Link>
                  <a
                    href="#faq"
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-bold text-sm bg-white/10 text-ivory border border-white/15 hover:bg-white/15 transition-colors"
                  >
                    FAQ <ChevronDown className="w-4 h-4" />
                  </a>
                </div>
              </div>
              <div className="hidden lg:block" style={{ ['--primary-svg-color']: 'rgba(175,195,255,1)' }}>
                <div className="rounded-[22px] bg-white/6 border border-white/10 p-8">
                  <img src={modelingIllus} alt="3D modeling illustration" className="w-full h-auto select-none" draggable={false} />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ══ FAQ ═══════════════════════════════════════════ */}
      <section id="faq" className="bg-white/60 border-y border-extra-light-gray py-20 sm:py-24">
        <Container>
          <SectionTitle
            label="Frequently asked"
            title={<>Frequently asked questions</>}
            subtitle="Short answers for a smoother demo and a clearer project narrative."
          />
          <div className="mt-10 grid gap-4 max-w-3xl mx-auto">
            {FAQ.map((f) => (
              <details key={f.q} className="card-ink p-6 group">
                <summary className="cursor-pointer list-none flex items-center justify-between gap-4">
                  <span className="text-sm sm:text-base font-black text-apron-black">{f.q}</span>
                  <ChevronDown className="w-4 h-4 text-gray-warm transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm text-dark-gray leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      {/* ══ FINAL CTA ═════════════════════════════════════ */}
      <section className="bg-white/60 border-t border-extra-light-gray">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto px-6 sm:px-8 py-20 sm:py-24 flex flex-col md:flex-row md:items-center md:justify-between gap-10"
        >
          <div>
            <Label>Get started</Label>
            <h2
              className="text-4xl sm:text-5xl font-black tracking-tight leading-tight text-apron-black"
            >
              Ready to
              <span className="text-orange"> detect?</span>
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            <p className="text-sm max-w-xs leading-relaxed text-dark-gray">
              Upload a face image and receive a fully explainable anti-spoofing verdict in under 200 ms.
            </p>
            <Link to="/detect">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold bg-apron-black text-ivory border border-extra-light-gray/60 text-base w-fit"
              >
                Launch Detection <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ══ FOOTER ════════════════════════════════════════ */}
      <footer className="bg-ivory border-t border-extra-light-gray">
        <div
          className="max-w-6xl mx-auto px-6 sm:px-8 py-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange/70 flex items-center justify-center border border-extra-light-gray">
              <ScanFace className="w-4 h-4 text-apron-black" />
            </div>
            <span className="text-xs font-black text-extra-dark-gray">
              Anti-Spoofing Detection
            </span>
          </div>
          <p className="text-xs text-gray-warm">
            M.Tech · Face Liveness Detection · 2025
          </p>
        </div>
      </footer>
    </div>
  );
}
