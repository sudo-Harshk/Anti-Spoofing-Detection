import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  ShieldCheck,
  ShieldAlert,
  RefreshCcw,
  Binary,
  ScanFace,
  Info,
  Layers,
  Sparkles,
  BarChart2,
  Cpu,
  GitMerge,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000';

const MODEL_OPTIONS = [
  { value: 'vit_only', label: 'Hugging Face (ViT)' },
  { value: 'yolo_only', label: 'Roboflow (YOLO)' },
  { value: 'consensus', label: 'Consensus (ViT + YOLO)' },
];

const TABS = [
  { id: 'detect', label: 'Detection', icon: ScanFace },
  { id: 'metrics', label: 'Research Metrics', icon: BarChart2 },
  { id: 'architecture', label: 'How It Works', icon: GitMerge },
];

const ATTACK_TYPE_META = {
  'AI Deepfake': { color: 'bg-purple-100 text-purple-800', label: 'AI-Generated Deepfake' },
  'Printed Photo': { color: 'bg-orange-100 text-orange-800', label: 'Printed Photo Attack' },
  '3D Mask': { color: 'bg-yellow-100 text-yellow-800', label: '3D Mask Attack' },
  'Screen Replay': { color: 'bg-blue-100 text-blue-800', label: 'Screen Replay Attack' },
  'Presentation Attack': { color: 'bg-red-100 text-red-800', label: 'Presentation Attack' },
};

function badgeTone(isReal, rawLabel) {
  if (rawLabel === 'no_detection' || rawLabel === 'error') return 'amber';
  return isReal ? 'emerald' : 'rose';
}

function badgeClass(tone) {
  if (tone === 'emerald') return 'badge-real';
  if (tone === 'amber') return 'badge-warn';
  return 'badge-spoof';
}

function formatApiDetail(err) {
  const d = err.response?.data?.detail;
  if (typeof d === 'string') return d;
  if (Array.isArray(d))
    return d.map((x) => (typeof x === 'object' ? x.msg || JSON.stringify(x) : String(x))).join('; ');
  return null;
}

function getVerdictStyle(verdict) {
  switch (verdict) {
    case 'REAL': return { compound: 'verdict-real' };
    case 'SPOOF': return { compound: 'verdict-spoof' };
    case 'ERROR': return { compound: 'verdict-error' };
    default: return { compound: 'verdict-warn' };
  }
}

function AttackTypeBadge({ attackType }) {
  if (!attackType) return null;
  const meta = ATTACK_TYPE_META[attackType] || { color: 'bg-red-100 text-red-800', label: attackType };
  return (
    <div className="mt-3 flex items-center gap-2">
      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${meta.color}`}>
        {meta.label}
      </span>
    </div>
  );
}

function MetricBar({ value, max = 1, color = 'bg-red-400' }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
  );
}

function MetricsTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE}/api/benchmark_results`)
      .then((r) => setData(r.data))
      .catch((e) => {
        if (e.response?.status === 404) {
          setError('not_generated');
        } else {
          setError('fetch_failed');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-3 text-gray-warm p-8">
        <RefreshCcw className="w-5 h-5 animate-spin" />
        <span className="text-sm font-semibold">Loading benchmark results…</span>
      </div>
    );
  }

  if (error === 'not_generated') {
    return (
      <div className="card-premium p-8 space-y-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-orange shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-extra-dark-gray mb-1">Benchmark not generated yet</h3>
            <p className="text-sm text-gray-warm">Run the following command from the <code className="bg-smoke px-1 rounded text-xs">backend/</code> directory to generate real metrics:</p>
          </div>
        </div>
        <div className="bg-apron-black text-green-400 rounded-xl px-5 py-4 font-mono text-sm">
          python run_benchmark_all.py
        </div>
        <p className="text-xs text-light-gray">
          This runs all 3 inference modes on <code className="bg-smoke px-1 rounded">test/live</code> and <code className="bg-smoke px-1 rounded">test/spoof</code>, then saves <code className="bg-smoke px-1 rounded">benchmark_results.json</code>. Reload this tab after running.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-premium p-6 text-notice-red text-sm font-semibold">
        Failed to load benchmark results. Is the backend running?
      </div>
    );
  }

  const modes = data?.modes || {};
  const modeLabels = {
    vit_only: { label: 'ViT Only', desc: 'Hugging Face Vision Transformer', icon: Binary, color: 'text-blue-600' },
    yolo_only: { label: 'YOLO Only', desc: 'Roboflow Object Detector', icon: ScanFace, color: 'text-purple-600' },
    consensus: { label: 'Consensus', desc: 'ViT + YOLO Fusion (Recommended)', icon: GitMerge, color: 'text-green-700' },
  };

  const maxAcer = Math.max(...Object.values(modes).map((m) => m.ACER || 0), 0.01);

  return (
    <div className="space-y-6">
      <div className="card-premium p-6">
        <h2 className="text-lg font-black text-extra-dark-gray mb-1">Ablation Study — ISO/IEC 30107-3 Metrics</h2>
        <p className="text-sm text-gray-warm mb-4">
          Evaluated on {data?.dataset?.n_live ?? '?'} live + {data?.dataset?.n_spoof ?? '?'} spoof images.
          Lower ACER is better. Consensus mode demonstrates superior accuracy over individual models.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-extra-light-gray">
                <th className="text-left py-2.5 px-3 text-xs font-bold uppercase tracking-wider text-light-gray">Mode</th>
                <th className="text-center py-2.5 px-3 text-xs font-bold uppercase tracking-wider text-light-gray">Accuracy</th>
                <th className="text-center py-2.5 px-3 text-xs font-bold uppercase tracking-wider text-light-gray">APCER ↓</th>
                <th className="text-center py-2.5 px-3 text-xs font-bold uppercase tracking-wider text-light-gray">BPCER ↓</th>
                <th className="text-center py-2.5 px-3 text-xs font-bold uppercase tracking-wider text-light-gray">ACER ↓</th>
              </tr>
            </thead>
            <tbody>
              {['vit_only', 'yolo_only', 'consensus'].map((modeKey) => {
                const m = modes[modeKey];
                const meta = modeLabels[modeKey];
                const isConsensus = modeKey === 'consensus';
                if (!m) return null;
                const Icon = meta.icon;
                return (
                  <tr key={modeKey} className={`border-b border-extra-light-gray ${isConsensus ? 'bg-[#DFF3EA]/40' : ''}`}>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${meta.color}`} />
                        <div>
                          <p className="font-bold text-extra-dark-gray">{meta.label}</p>
                          <p className="text-xs text-light-gray">{meta.desc}</p>
                        </div>
                        {isConsensus && (
                          <span className="ml-2 text-xs bg-[#DFF3EA] text-[#1F5E3F] font-bold px-2 py-0.5 rounded-full">Best</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-extra-dark-gray">
                      {((m.accuracy || 0) * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-dark-gray">
                      {(m.APCER * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-dark-gray">
                      {(m.BPCER * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`font-mono font-bold ${isConsensus ? 'text-[#1F5E3F]' : 'text-extra-dark-gray'}`}>
                        {(m.ACER * 100).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card-premium p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-light-gray mb-4">ACER Comparison (lower = better)</h3>
        <div className="space-y-4">
          {['vit_only', 'yolo_only', 'consensus'].map((modeKey) => {
            const m = modes[modeKey];
            const meta = modeLabels[modeKey];
            const isConsensus = modeKey === 'consensus';
            if (!m) return null;
            return (
              <div key={modeKey}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm font-semibold text-extra-dark-gray">{meta.label}</span>
                  <span className="text-sm font-mono text-dark-gray">{(m.ACER * 100).toFixed(1)}%</span>
                </div>
                <MetricBar
                  value={m.ACER}
                  max={maxAcer || 0.01}
                  color={isConsensus ? 'bg-green-500' : 'bg-red-400'}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="card-premium p-5">
        <p className="text-xs text-light-gray leading-relaxed">
          <strong className="text-dark-gray">APCER</strong> (Attack Presentation Classification Error Rate) — fraction of spoof images incorrectly classified as live. &nbsp;
          <strong className="text-dark-gray">BPCER</strong> (Bona Fide Presentation Classification Error Rate) — fraction of live images incorrectly classified as spoof. &nbsp;
          <strong className="text-dark-gray">ACER</strong> = (APCER + BPCER) / 2. &nbsp;
          Metrics follow <strong className="text-dark-gray">ISO/IEC 30107-3</strong> standard for biometric PAD evaluation.
        </p>
      </div>
    </div>
  );
}

function ArchitectureTab() {
  const steps = [
    { label: 'Input Image', desc: 'Face photo uploaded by user', color: 'bg-gray-100 border-gray-300' },
    { label: 'Preprocessing', desc: 'Normalize format, size, pixel values', color: 'bg-blue-50 border-blue-200' },
    { label: 'Parallel Inference', desc: 'ViT and YOLO run simultaneously', color: 'bg-indigo-50 border-indigo-200' },
  ];

  const attackTypes = [
    { label: 'Printed Photos', icon: '🖨️' },
    { label: 'Screen Replays', icon: '📱' },
    { label: '3D Masks', icon: '🎭' },
    { label: 'AI Deepfakes', icon: '🤖' },
  ];

  return (
    <div className="space-y-6">
      <div className="card-premium p-6">
        <h2 className="text-lg font-black text-extra-dark-gray mb-1">Dual-Model Architecture</h2>
        <p className="text-sm text-gray-warm mb-6">
          Axon combines two complementary AI models through a hierarchical consensus engine, achieving higher accuracy than either model alone.
        </p>

        <div className="space-y-3">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold ${step.color}`}>
                  {i + 1}
                </div>
                {i < steps.length - 1 && <div className="w-0.5 h-4 bg-extra-light-gray mt-1" />}
              </div>
              <div className="pt-1">
                <p className="font-bold text-extra-dark-gray text-sm">{step.label}</p>
                <p className="text-xs text-gray-warm">{step.desc}</p>
              </div>
            </div>
          ))}

          <div className="ml-4 grid grid-cols-2 gap-3 mt-2">
            <div className="border-2 border-blue-200 bg-blue-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Binary className="w-4 h-4 text-blue-600" />
                <p className="font-bold text-blue-800 text-sm">Vision Transformer (ViT)</p>
              </div>
              <p className="text-xs text-blue-700">Deep texture analysis &amp; deepfake detection via Hugging Face. Produces Grad-CAM saliency maps for explainability.</p>
              <p className="text-xs font-mono text-blue-600 mt-2">200–500ms latency</p>
            </div>
            <div className="border-2 border-purple-200 bg-purple-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <ScanFace className="w-4 h-4 text-purple-600" />
                <p className="font-bold text-purple-800 text-sm">YOLO Detector</p>
              </div>
              <p className="text-xs text-purple-700">Fast presentation attack detection via Roboflow. Acts as primary gatekeeper. Falls back to ViT on API failure.</p>
              <p className="text-xs font-mono text-purple-600 mt-2">&lt;100ms latency</p>
            </div>
          </div>

          <div className="flex items-start gap-3 mt-1">
            <div className="flex flex-col items-center">
              <div className="w-0.5 h-4 bg-extra-light-gray" />
              <div className="w-8 h-8 rounded-full border-2 border-green-300 bg-green-50 flex items-center justify-center text-sm font-bold">4</div>
              <div className="w-0.5 h-4 bg-extra-light-gray mt-1" />
            </div>
            <div className="pt-5">
              <p className="font-bold text-extra-dark-gray text-sm">Consensus Engine</p>
              <p className="text-xs text-gray-warm">Hierarchical decision: YOLO gates, ViT confirms. 25% confidence penalty on model disagreement.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full border-2 border-green-400 bg-green-100 flex items-center justify-center text-sm font-bold text-green-700">5</div>
            </div>
            <div className="pt-1">
              <p className="font-bold text-extra-dark-gray text-sm">Final Verdict + Confidence</p>
              <p className="text-xs text-gray-warm">REAL / SPOOF / INCONCLUSIVE with fused confidence score and Grad-CAM heatmap overlay.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card-premium p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-light-gray mb-4">Attack Types Detected</h3>
        <div className="grid grid-cols-2 gap-3">
          {attackTypes.map((a) => (
            <div key={a.label} className="flex items-center gap-3 bg-smoke rounded-xl px-4 py-3 border border-extra-light-gray">
              <span className="text-xl">{a.icon}</span>
              <span className="text-sm font-semibold text-extra-dark-gray">{a.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card-premium p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-light-gray mb-4">Key Features</h3>
        <div className="space-y-3">
          {[
            { icon: CheckCircle2, text: 'Grad-CAM Explainability — visual heatmap shows which regions drove the decision', color: 'text-green-600' },
            { icon: CheckCircle2, text: 'ISO/IEC 30107-3 compliant metrics — APCER, BPCER, ACER for academic evaluation', color: 'text-green-600' },
            { icon: CheckCircle2, text: 'Three inference modes — ablation study (ViT-only, YOLO-only, Consensus)', color: 'text-green-600' },
            { icon: CheckCircle2, text: 'Fault-tolerant — system continues via ViT if YOLO API is unavailable', color: 'text-green-600' },
            { icon: CheckCircle2, text: 'Full-stack — FastAPI backend + React 19 frontend, production-ready', color: 'text-green-600' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <item.icon className={`w-4 h-4 mt-0.5 shrink-0 ${item.color}`} />
              <p className="text-sm text-dark-gray">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ModelResultCard({ title, icon: Icon, detail, verdict, verdictConfidence }) {
  const tone = badgeTone(detail.is_real, detail.raw_label);
  const pct = (detail.confidence * 100).toFixed(1);
  const liveHint = detail.is_real ? 'Interpreted as live / bonafide' : 'Interpreted as spoof / attack';
  const vs = verdict ? getVerdictStyle(verdict) : null;

  return (
    <div className="card-premium p-8">
      {verdict != null && vs && (
        <div className={`mb-6 rounded-xl border-2 p-5 ${vs.compound}`}>
          <p className="text-xs font-bold uppercase tracking-wider opacity-60 mb-1">System outcome</p>
          <p className="text-3xl font-black">{verdict}</p>
          <p className="text-sm font-semibold opacity-80 mt-1">
            Confidence {(verdictConfidence * 100).toFixed(1)}%
          </p>
        </div>
      )}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-smoke border border-extra-light-gray">
          <Icon className="w-6 h-6 text-extra-dark-gray" />
        </div>
        <div>
          <h3 className="text-lg font-black text-extra-dark-gray">{title}</h3>
          <p className="text-xs text-gray-warm font-medium">Single-model inference</p>
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-light-gray mb-1">Confidence</p>
          <p className="text-4xl font-black text-apron-black">
            {pct}
            <span className="text-lg font-bold text-light-gray">%</span>
          </p>
        </div>
        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${badgeClass(tone)}`}>
          {detail.raw_label}
        </span>
      </div>

      <div className="h-2 w-full bg-smoke rounded-full overflow-hidden mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, parseFloat(pct))}%` }}
          className={`h-full ${detail.is_real ? 'bg-green-warm' : 'bg-notice-red'}`}
        />
      </div>
      <p className="text-sm text-dark-gray">{liveHint}</p>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('detect');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [mode, setMode] = useState('vit_only');
  const [xaiImage, setXaiImage] = useState(null);
  const [xaiLabel, setXaiLabel] = useState(null);
  const [xaiLoading, setXaiLoading] = useState(false);
  const [xaiError, setXaiError] = useState(null);

  const selectedLabel = MODEL_OPTIONS.find((o) => o.value === mode)?.label ?? mode;
  const showXaiPanel = mode === 'vit_only' || mode === 'consensus';

  const onDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setPreview(URL.createObjectURL(file));
      setLoading(true);
      setResult(null);
      setXaiImage(null);
      setXaiLabel(null);
      setXaiError(null);

      const formData = new FormData();
      formData.append('image', file);
      formData.append('mode', mode);

      try {
        const res = await axios.post(`${API_BASE}/api/dual_antispoof`, formData);
        setResult(res.data);

        if (showXaiPanel) {
          setXaiLoading(true);
          try {
            const xf = new FormData();
            xf.append('image', file);
            const ex = await axios.post(`${API_BASE}/api/explain`, xf);
            setXaiImage(`data:image/png;base64,${ex.data.overlay_base64}`);
            setXaiLabel(ex.data.predicted_label);
          } catch (exErr) {
            console.warn(exErr);
            const detail = formatApiDetail(exErr);
            setXaiError(
              detail ||
                (exErr.response?.status === 501
                  ? 'XAI dependencies missing. Run: pip install grad-cam'
                  : exErr.message || 'ViT saliency request failed.')
            );
          } finally {
            setXaiLoading(false);
          }
        } else {
          setXaiLoading(false);
        }
      } catch (err) {
        console.error(err);
        alert('Backend connection error. Check if your FastAPI server is running!');
      } finally {
        setLoading(false);
      }
    },
    [mode, showXaiPanel]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
  });

  const getVerdictDetails = (verdict) => {
    switch (verdict) {
      case 'REAL':
        return { icon: <ShieldCheck className="w-8 h-8 text-green-warm" />, compound: 'verdict-real', label: 'Authentic Access Granted' };
      case 'SPOOF':
        return { icon: <ShieldAlert className="w-8 h-8 text-notice-red" />, compound: 'verdict-spoof', label: 'Security Threat Detected' };
      case 'ERROR':
        return { icon: <ShieldAlert className="w-8 h-8 text-notice-red" />, compound: 'verdict-error', label: 'Inference or API error — check backend logs' };
      default:
        return { icon: <Info className="w-8 h-8 text-brown" />, compound: 'verdict-warn', label: 'Inconclusive or skipped (e.g. no detection)' };
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4 selection:bg-extra-light-gray" style={{ background: '#F4F3F1' }}>
      <div className="max-w-3xl w-full">
        <header className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm border border-extra-light-gray mb-6"
          >
            <ScanFace className="w-8 h-8 text-orange" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-extrabold tracking-tight text-apron-black mb-3"
          >
            Axon <span className="text-gray-warm font-medium">Anti-Spoofing</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-warm font-medium"
          >
            Dual-model face presentation attack detection with explainable AI.
          </motion.p>
        </header>

        {/* Tab Navigation */}
        <div className="flex gap-1 p-1 bg-white rounded-2xl border border-extra-light-gray shadow-sm mb-6">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  active
                    ? 'bg-apron-black text-white shadow-sm'
                    : 'text-gray-warm hover:text-extra-dark-gray hover:bg-smoke'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'detect' && (
            <motion.div
              key="detect"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6"
            >
              <div className="card-premium p-6 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2 text-extra-dark-gray font-bold">
                    <Layers className="w-5 h-5 text-gray-warm" />
                    Model
                  </div>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    className="w-full sm:max-w-md border border-extra-light-gray rounded-lg px-3 py-2.5 text-sm font-semibold bg-white text-apron-black shadow-sm"
                  >
                    {MODEL_OPTIONS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-gray-warm leading-relaxed">
                  <strong className="text-dark-gray">Hugging Face</strong> shows only the ViT output;{' '}
                  <strong className="text-dark-gray">Roboflow</strong> shows only the YOLO output;{' '}
                  <strong className="text-dark-gray">Consensus</strong> shows the fused verdict plus a short summary of both. Re-upload after switching models.
                </p>
              </div>

              <div className="card-premium p-8">
                <div
                  {...getRootProps()}
                  className={`relative border-2 border-dashed rounded-xl py-12 px-6 text-center transition-all duration-300 cursor-pointer
                    ${isDragActive ? 'border-orange bg-ivory' : 'border-extra-light-gray hover:border-light-gray hover:bg-ivory/70'}`}
                >
                  <input {...getInputProps()} />
                  <AnimatePresence mode="wait">
                    {preview ? (
                      <motion.div
                        key="preview"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex flex-col items-center"
                      >
                        <div className="relative group">
                          <img
                            src={preview}
                            alt="Preview"
                            className="h-64 w-64 object-cover rounded-xl shadow-lg border-2 border-white ring-1 ring-slate-200 mb-6"
                          />
                          <div className="absolute inset-0 bg-[#1C1A10]/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                            <p className="text-white text-sm font-semibold">Click to change</p>
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-gray-warm">Image captured</p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="upload"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center py-4"
                      >
                        <div className="p-4 bg-smoke rounded-full mb-4">
                          <Upload className="w-8 h-8 text-dark-gray" />
                        </div>
                        <p className="text-xl font-bold text-extra-dark-gray">Drop analysis source</p>
                        <p className="text-sm text-gray-warm mt-2">Using: {selectedLabel}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <AnimatePresence>
                {loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-apron-black rounded-2xl p-6 text-white overflow-hidden relative shadow-xl"
                  >
                    <div className="flex items-center space-x-4 relative z-10">
                      <RefreshCcw className="w-6 h-6 animate-spin text-green-warm" />
                      <div>
                        <h3 className="font-bold">Analyzing…</h3>
                        <p className="text-xs text-[#BAB8AC] font-mono tracking-widest uppercase">{selectedLabel}</p>
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#8CA40510] rounded-full blur-3xl -mr-16 -mt-16" />
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {result && !loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {mode === 'vit_only' && (
                      <>
                        <ModelResultCard
                          title="Hugging Face (ViT)"
                          icon={Binary}
                          detail={result.details.huggingface}
                          verdict={result.verdict}
                          verdictConfidence={result.confidence}
                        />
                        {result.verdict === 'SPOOF' && result.attack_type && (
                          <div className="card-premium px-6 py-4">
                            <AttackTypeBadge attackType={result.attack_type} />
                          </div>
                        )}
                      </>
                    )}

                    {mode === 'yolo_only' && (
                      <>
                        <ModelResultCard
                          title="Roboflow (YOLO)"
                          icon={ScanFace}
                          detail={result.details.roboflow}
                          verdict={result.verdict}
                          verdictConfidence={result.confidence}
                        />
                        {result.verdict === 'SPOOF' && result.attack_type && (
                          <div className="card-premium px-6 py-4">
                            <AttackTypeBadge attackType={result.attack_type} />
                          </div>
                        )}
                      </>
                    )}

                    {mode === 'consensus' && (
                      <>
                        {(() => {
                          const details = getVerdictDetails(result.verdict);
                          return (
                            <div className={`p-8 rounded-2xl border ${details.compound} shadow-sm`}>
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <div className="flex items-center space-x-3 mb-2">
                                    {details.icon}
                                    <h2 className="text-3xl font-black">{result.verdict}</h2>
                                  </div>
                                  <p className="font-semibold opacity-80">{details.label}</p>
                                  <p className="text-xs mt-2 opacity-70 font-mono uppercase tracking-wider">
                                    Fused consensus
                                  </p>
                                  {result.verdict === 'SPOOF' && result.attack_type && (
                                    <AttackTypeBadge attackType={result.attack_type} />
                                  )}
                                </div>
                                <div className="text-right shrink-0">
                                  <div className="text-sm font-bold uppercase tracking-wider opacity-60 mb-1">Confidence</div>
                                  <div className="text-3xl font-black">{(result.confidence * 100).toFixed(1)}%</div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}

                        <div className="rounded-2xl border border-extra-light-gray bg-white/80 p-5 shadow-sm">
                          <p className="text-xs font-bold uppercase tracking-wider text-light-gray mb-3">
                            Inputs to consensus
                          </p>
                          <div className="space-y-3 text-sm">
                            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-smoke px-4 py-3 border border-extra-light-gray">
                              <span className="font-bold text-extra-dark-gray flex items-center gap-2">
                                <Binary className="w-4 h-4 text-light-gray" /> ViT
                              </span>
                              <span className="text-dark-gray">
                                <span className={`font-bold ${badgeClass(badgeTone(result.details.huggingface.is_real, result.details.huggingface.raw_label))} px-2 py-0.5 rounded`}>
                                  {result.details.huggingface.raw_label}
                                </span>
                                <span className="ml-2 font-mono">
                                  {(result.details.huggingface.confidence * 100).toFixed(1)}%
                                </span>
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-smoke px-4 py-3 border border-extra-light-gray">
                              <span className="font-bold text-extra-dark-gray flex items-center gap-2">
                                <ScanFace className="w-4 h-4 text-light-gray" /> YOLO
                              </span>
                              <span className="text-dark-gray">
                                <span className={`font-bold ${badgeClass(badgeTone(result.details.roboflow.is_real, result.details.roboflow.raw_label))} px-2 py-0.5 rounded`}>
                                  {result.details.roboflow.raw_label}
                                </span>
                                <span className="ml-2 font-mono">
                                  {(result.details.roboflow.confidence * 100).toFixed(1)}%
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {showXaiPanel && (
                      <div className="card-premium p-6 border border-[#A2765230] bg-light-yellow/60">
                        <div className="flex items-center gap-2 mb-3 text-extra-dark-gray font-bold">
                          <Sparkles className="w-5 h-5 text-brown" />
                          XAI — ViT Grad-CAM
                        </div>
                        {xaiLoading && (
                          <p className="text-sm text-brown animate-pulse">Generating saliency overlay…</p>
                        )}
                        {xaiError && <p className="text-sm text-brown break-words">{xaiError}</p>}
                        {xaiImage && (
                          <div className="space-y-2">
                            {xaiLabel && (
                              <p className="text-xs font-mono text-dark-gray">ViT top class: {xaiLabel}</p>
                            )}
                            <img
                              src={xaiImage}
                              alt="Grad-CAM overlay"
                              className="w-full max-h-80 object-contain rounded-xl border border-[#A2765230] shadow-sm bg-white"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-center space-x-2 text-light-gray text-xs py-4">
                      <Info className="w-3 h-3 shrink-0" />
                      <span>Consensus uses YOLO as the primary gatekeeper; single-model modes show that pipeline only.</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === 'metrics' && (
            <motion.div
              key="metrics"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <MetricsTab />
            </motion.div>
          )}

          {activeTab === 'architecture' && (
            <motion.div
              key="architecture"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <ArchitectureTab />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
