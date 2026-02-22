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
  ChevronRight
} from 'lucide-react';

export default function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.post('http://127.0.0.1:8000/api/dual_antispoof', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert('Backend connection error. Check if your FastAPI server is running!');
    } finally {
      setLoading(false);
    }
  }, []);

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
      default:
        return {
          icon: <Info className="w-8 h-8 text-amber-600" />,
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          text: 'text-amber-900',
          label: 'Inconclusive Consensus'
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 selection:bg-slate-200">
      <div className="max-w-3xl w-full">

        {/* Header Section */}
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
            Dual-Inference Consensus Engine (ViT + YOLO)
          </motion.p>
        </header>

        {/* Main Interface */}
        <div className="space-y-6">

          <motion.div
            layout
            className="card-premium p-8"
          >
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
                    <p className="text-sm text-slate-500 mt-2">v2.1 Consensus Protocol Ready</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Loading Layer */}
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
                    <h3 className="font-bold">Analyzing consensus...</h3>
                    <p className="text-xs text-slate-400 font-mono tracking-widest uppercase">Cross-sampling ViT & YOLO weights</p>
                  </div>
                </div>
                {/* Background flare */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Dashboard */}
          <AnimatePresence>
            {result && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Verdict Card */}
                {(() => {
                  const details = getVerdictDetails(result.verdict);
                  return (
                    <div className={`p-8 rounded-2xl border ${details.bg} ${details.border} ${details.text} shadow-sm`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            {details.icon}
                            <h2 className="text-3xl font-black">{result.verdict}</h2>
                          </div>
                          <p className="font-semibold opacity-80">{details.label}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold uppercase tracking-wider opacity-60 mb-1">Global Confidence</div>
                          <div className="text-3xl font-black">{(result.confidence * 100).toFixed(1)}%</div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Model Breakdown */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="card-premium p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Binary className="w-5 h-5 text-slate-400" />
                      <h4 className="font-bold text-slate-700">Hugging Face (ViT)</h4>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-2xl font-black text-slate-900">
                        {(result.details.huggingface.confidence * 100).toFixed(1)}<span className="text-sm font-bold text-slate-400">%</span>
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${result.details.huggingface.raw_label === 'real' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                        {result.details.huggingface.raw_label}
                      </span>
                    </div>
                    <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${result.details.huggingface.confidence * 100}%` }}
                        className={`h-full ${result.details.huggingface.raw_label === 'real' ? 'bg-emerald-500' : 'bg-rose-500'}`}
                      />
                    </div>
                  </div>

                  <div className="card-premium p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <ScanFace className="w-5 h-5 text-slate-400" />
                      <h4 className="font-bold text-slate-700">Roboflow (YOLO)</h4>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-2xl font-black text-slate-900">
                        {(result.details.roboflow.confidence * 100).toFixed(1)}<span className="text-sm font-bold text-slate-400">%</span>
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${result.details.roboflow.raw_label === 'real' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                        {result.details.roboflow.raw_label}
                      </span>
                    </div>
                    <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${result.details.roboflow.confidence * 100}%` }}
                        className={`h-full ${result.details.roboflow.raw_label === 'real' ? 'bg-emerald-500' : 'bg-rose-500'}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Insight */}
                <div className="flex items-center justify-center space-x-2 text-slate-400 text-xs py-4">
                  <Info className="w-3 h-3" />
                  <span>Consensus reached via cross-model disagreement filtering</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
