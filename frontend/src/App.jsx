import { useState, useCallback } from 'react';
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
  Sparkles
} from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000';

/** API `mode` values */
const MODEL_OPTIONS = [
  { value: 'vit_only', label: 'Hugging Face (ViT)' },
  { value: 'yolo_only', label: 'Roboflow (YOLO)' },
  { value: 'consensus', label: 'Consensus (ViT + YOLO)' }
];

function badgeTone(isReal, rawLabel) {
  if (rawLabel === 'no_detection' || rawLabel === 'error') return 'amber';
  return isReal ? 'emerald' : 'rose';
}

function badgeClass(tone) {
  if (tone === 'emerald') return 'bg-emerald-100 text-emerald-700';
  if (tone === 'amber') return 'bg-amber-100 text-amber-800';
  return 'bg-rose-100 text-rose-700';
}

function formatApiDetail(err) {
  const d = err.response?.data?.detail;
  if (typeof d === 'string') return d;
  if (Array.isArray(d)) return d.map((x) => (typeof x === 'object' ? x.msg || JSON.stringify(x) : String(x))).join('; ');
  return null;
}

function getVerdictStyle(verdict) {
  switch (verdict) {
    case 'REAL':
      return {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'text-emerald-900'
      };
    case 'SPOOF':
      return {
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        text: 'text-rose-900'
      };
    case 'ERROR':
      return { bg: 'bg-slate-100', border: 'border-slate-300', text: 'text-slate-900' };
    default:
      return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-900' };
  }
}

function ModelResultCard({ title, icon: Icon, detail, verdict, verdictConfidence }) {
  const tone = badgeTone(detail.is_real, detail.raw_label);
  const pct = (detail.confidence * 100).toFixed(1);
  const liveHint = detail.is_real ? 'Interpreted as live / bonafide' : 'Interpreted as spoof / attack';
  const vs = verdict ? getVerdictStyle(verdict) : null;

  return (
    <div className="card-premium p-8">
      {verdict != null && vs && (
        <div className={`mb-6 rounded-xl border-2 p-5 ${vs.bg} ${vs.border} ${vs.text}`}>
          <p className="text-xs font-bold uppercase tracking-wider opacity-60 mb-1">System outcome</p>
          <p className="text-3xl font-black">{verdict}</p>
          <p className="text-sm font-semibold opacity-80 mt-1">
            Confidence {(verdictConfidence * 100).toFixed(1)}%
          </p>
        </div>
      )}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200">
          <Icon className="w-6 h-6 text-slate-700" />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500 font-medium">Single-model inference</p>
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Confidence</p>
          <p className="text-4xl font-black text-slate-900">
            {pct}
            <span className="text-lg font-bold text-slate-400">%</span>
          </p>
        </div>
        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider ${badgeClass(tone)}`}>
          {detail.raw_label}
        </span>
      </div>

      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, parseFloat(pct))}%` }}
          className={`h-full ${detail.is_real ? 'bg-emerald-500' : 'bg-rose-500'}`}
        />
      </div>
      <p className="text-sm text-slate-600">{liveHint}</p>
    </div>
  );
}

export default function App() {
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
    multiple: false
  });

  const getVerdictDetails = (verdict) => {
    switch (verdict) {
      case 'REAL':
        return {
          icon: <ShieldCheck className="w-8 h-8 text-emerald-600" />,
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          text: 'text-emerald-900',
          label: 'Authentic Access Granted'
        };
      case 'SPOOF':
        return {
          icon: <ShieldAlert className="w-8 h-8 text-rose-600" />,
          bg: 'bg-rose-50',
          border: 'border-rose-200',
          text: 'text-rose-900',
          label: 'Security Threat Detected'
        };
      case 'ERROR':
        return {
          icon: <ShieldAlert className="w-8 h-8 text-slate-700" />,
          bg: 'bg-slate-100',
          border: 'border-slate-300',
          text: 'text-slate-900',
          label: 'Inference or API error — check backend logs'
        };
      default:
        return {
          icon: <Info className="w-8 h-8 text-amber-600" />,
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-900',
          label: 'Inconclusive or skipped (e.g. no detection)'
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 selection:bg-slate-200">
      <div className="max-w-3xl w-full">
        <header className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm border border-slate-200 mb-6"
          >
            <ScanFace className="w-8 h-8 text-slate-800" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-extrabold tracking-tight text-slate-900 mb-3"
          >
            Anti-Spoofing <span className="text-slate-500 font-medium">Detection Platform</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 font-medium"
          >
            Pick a model — results show that source only (consensus fuses both)
          </motion.p>
        </header>

        <div className="space-y-6">
          <motion.div layout className="card-premium p-6 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 text-slate-700 font-bold">
                <Layers className="w-5 h-5 text-slate-500" />
                Model
              </div>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full sm:max-w-md border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-semibold bg-white text-slate-800 shadow-sm"
              >
                {MODEL_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              <strong className="text-slate-600">Hugging Face</strong> shows only the ViT output;{' '}
              <strong className="text-slate-600">Roboflow</strong> shows only the YOLO output;{' '}
              <strong className="text-slate-600">Consensus</strong> shows the fused verdict plus a short summary of
              both. Re-upload after switching models.
            </p>
          </motion.div>

          <motion.div layout className="card-premium p-8">
            <div
              {...getRootProps()}
              className={`relative border-2 border-dashed rounded-xl py-12 px-6 text-center transition-all duration-300 cursor-pointer
                ${isDragActive ? 'border-slate-900 bg-slate-50' : 'border-slate-200 hover:border-slate-400 hover:bg-slate-50/50'}`}
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
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                        <p className="text-white text-sm font-semibold">Click to change</p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-slate-500">Image captured</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center py-4"
                  >
                    <div className="p-4 bg-slate-100 rounded-full mb-4">
                      <Upload className="w-8 h-8 text-slate-600" />
                    </div>
                    <p className="text-xl font-bold text-slate-800">Drop analysis source</p>
                    <p className="text-sm text-slate-500 mt-2">Using: {selectedLabel}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-slate-900 rounded-2xl p-6 text-white overflow-hidden relative shadow-xl"
              >
                <div className="flex items-center space-x-4 relative z-10">
                  <RefreshCcw className="w-6 h-6 animate-spin text-emerald-400" />
                  <div>
                    <h3 className="font-bold">Analyzing…</h3>
                    <p className="text-xs text-slate-400 font-mono tracking-widest uppercase">{selectedLabel}</p>
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
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
                  <ModelResultCard
                    title="Hugging Face (ViT)"
                    icon={Binary}
                    detail={result.details.huggingface}
                    verdict={result.verdict}
                    verdictConfidence={result.confidence}
                  />
                )}

                {mode === 'yolo_only' && (
                  <ModelResultCard
                    title="Roboflow (YOLO)"
                    icon={ScanFace}
                    detail={result.details.roboflow}
                    verdict={result.verdict}
                    verdictConfidence={result.confidence}
                  />
                )}

                {mode === 'consensus' && (
                  <>
                    {(() => {
                      const details = getVerdictDetails(result.verdict);
                      return (
                        <div className={`p-8 rounded-2xl border ${details.bg} ${details.border} ${details.text} shadow-sm`}>
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
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-sm font-bold uppercase tracking-wider opacity-60 mb-1">
                                Confidence
                              </div>
                              <div className="text-3xl font-black">{(result.confidence * 100).toFixed(1)}%</div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                        Inputs to consensus
                      </p>
                      <div className="space-y-3 text-sm">
                        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-4 py-3 border border-slate-100">
                          <span className="font-bold text-slate-700 flex items-center gap-2">
                            <Binary className="w-4 h-4 text-slate-400" /> ViT
                          </span>
                          <span className="text-slate-600">
                            <span className={`font-bold ${badgeClass(badgeTone(result.details.huggingface.is_real, result.details.huggingface.raw_label))} px-2 py-0.5 rounded`}>
                              {result.details.huggingface.raw_label}
                            </span>
                            <span className="ml-2 font-mono">
                              {(result.details.huggingface.confidence * 100).toFixed(1)}%
                            </span>
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-50 px-4 py-3 border border-slate-100">
                          <span className="font-bold text-slate-700 flex items-center gap-2">
                            <ScanFace className="w-4 h-4 text-slate-400" /> YOLO
                          </span>
                          <span className="text-slate-600">
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
                  <div className="card-premium p-6 border border-violet-100 bg-violet-50/40">
                    <div className="flex items-center gap-2 mb-3 text-violet-900 font-bold">
                      <Sparkles className="w-5 h-5" />
                      XAI — ViT Grad-CAM
                    </div>
                    {xaiLoading && (
                      <p className="text-sm text-violet-700 animate-pulse">Generating saliency overlay…</p>
                    )}
                    {xaiError && <p className="text-sm text-amber-800 break-words">{xaiError}</p>}
                    {xaiImage && (
                      <div className="space-y-2">
                        {xaiLabel && (
                          <p className="text-xs font-mono text-violet-800">ViT top class: {xaiLabel}</p>
                        )}
                        <img
                          src={xaiImage}
                          alt="Grad-CAM overlay"
                          className="w-full max-h-80 object-contain rounded-xl border border-violet-200 shadow-sm bg-white"
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-center space-x-2 text-slate-400 text-xs py-4">
                  <Info className="w-3 h-3 shrink-0" />
                  <span>Consensus uses YOLO as the primary gatekeeper; single-model modes show that pipeline only.</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
