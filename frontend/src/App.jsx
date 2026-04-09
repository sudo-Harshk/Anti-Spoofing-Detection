import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
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
  ArrowLeft,
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
  if (tone === 'emerald') return 'badge-real';
  if (tone === 'amber') return 'badge-warn';
  return 'badge-spoof';
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
      return { compound: 'verdict-real' };
    case 'SPOOF':
      return { compound: 'verdict-spoof' };
    case 'ERROR':
      return { compound: 'verdict-error' };
    default:
      return { compound: 'verdict-warn' };
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
          icon: <ShieldCheck className="w-8 h-8 text-green-warm" />,
          compound: 'verdict-real',
          label: 'Authentic Access Granted'
        };
      case 'SPOOF':
        return {
          icon: <ShieldAlert className="w-8 h-8 text-notice-red" />,
          compound: 'verdict-spoof',
          label: 'Security Threat Detected'
        };
      case 'ERROR':
        return {
          icon: <ShieldAlert className="w-8 h-8 text-notice-red" />,
          compound: 'verdict-error',
          label: 'Inference or API error — check backend logs'
        };
      default:
        return {
          icon: <Info className="w-8 h-8 text-brown" />,
          compound: 'verdict-warn',
          label: 'Inconclusive or skipped (e.g. no detection)'
        };
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center py-12 px-4 selection:bg-extra-light-gray"
      style={{ background: '#F4F3F1' }}
    >
      {/* back nav */}
      <div className="w-full max-w-3xl mb-6">
        <Link to="/">
          <motion.div
            whileHover={{ x: -3 }}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-warm hover:text-orange transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to home
          </motion.div>
        </Link>
      </div>
      <div className="max-w-3xl w-full">
        <header className="text-center mb-12">
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
            Anti-Spoofing <span className="text-gray-warm font-medium">Detection Platform</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-warm font-medium"
          >
            Pick a model — results show that source only (consensus fuses both)
          </motion.p>
        </header>

        <div className="space-y-6">
          <motion.div layout className="card-premium p-6 space-y-3">
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
              <strong className="text-dark-gray">Consensus</strong> shows the fused verdict plus a short summary of
              both. Re-upload after switching models.
            </p>
          </motion.div>

          <motion.div layout className="card-premium p-8">
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
          </motion.div>

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
        </div>
      </div>
    </div>
  );
}
