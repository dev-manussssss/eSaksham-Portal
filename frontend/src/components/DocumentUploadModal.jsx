import { useState } from 'react';
import { uploadProjectDocument } from '../api/sakshamApi.js';

const CATEGORIES = [
  'Measurement Book',
  'Bill / Invoice',
  'Recommendation',
  'Work Order',
  'Estimate',
  'BOQ',
  'Geotagged Photo',
  'Progress Report',
  'Completion Certificate',
  'Inspection Evidence',
  'Other',
];

export default function DocumentUploadModal({ projectId, session, isOpen, onClose, onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState('Measurement Book');
  const [stage, setStage] = useState('IDLE'); // IDLE, PROCESSING, SUCCESS, ERROR
  const [progressPercent, setProgressPercent] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleStartUpload = async () => {
    if (!file) return;

    setStage('PROCESSING');
    setProgressPercent(10);
    setStatusMessage('Stage 1/6: Uploading document to secure gateway (0–15%)...');

    // Simulate stage gate progression as backend processes
    const pInterval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev < 30) {
          setStatusMessage('Stage 2/6: Saving document to Supabase Storage (15–35%)...');
          return prev + 8;
        } else if (prev < 50) {
          setStatusMessage('Stage 3/6: Extracting OCR text and quantities (35–55%)...');
          return prev + 6;
        } else if (prev < 70) {
          setStatusMessage('Stage 4/6: Validating quantities against BOQ parameters (55–75%)...');
          return prev + 5;
        } else if (prev < 88) {
          setStatusMessage('Stage 5/6: Running deterministic checks & AI anomaly analysis (75–90%)...');
          return prev + 3;
        }
        return prev;
      });
    }, 350);

    try {
      const result = await uploadProjectDocument(projectId, file, category, session, (pct, msg) => {
        setProgressPercent(pct);
        setStatusMessage(msg);
      });

      clearInterval(pInterval);
      setProgressPercent(100);
      setStatusMessage('Stage 6/6: Saving flags & updating project risk score (90–100%)...');
      setAnalysisResult(result);
      setStage('SUCCESS');
      if (onUploadComplete) onUploadComplete(result);
    } catch (err) {
      clearInterval(pInterval);
      setStage('ERROR');
      setErrorMessage(err.message || 'Processing failed.');
    }
  };

  const handleReset = () => {
    setFile(null);
    setStage('IDLE');
    setProgressPercent(0);
    setStatusMessage('');
    setAnalysisResult(null);
    setErrorMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-primary">
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>upload_file</span>
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Upload & AI Inspection Verification</h2>
              <p className="text-[11px] text-slate-500">Project: {projectId} • Real-time anomaly detection</p>
            </div>
          </div>
          <button onClick={handleReset} className="text-slate-400 hover:text-slate-600 p-1">
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
          </button>
        </div>

        {/* Modal Body */}
        {stage === 'IDLE' && (
          <div className="flex flex-col gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Document Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:border-primary"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Select File (PDF, TXT, or Image)</label>
              <div className="border-2 border-dashed border-slate-200 hover:border-primary/50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50">
                <input
                  type="file"
                  id="document-upload-input"
                  onChange={handleFileChange}
                  accept=".pdf,.txt,.json,.jpg,.png"
                  className="hidden"
                />
                <label htmlFor="document-upload-input" className="cursor-pointer flex flex-col items-center">
                  <span className="material-symbols-outlined text-slate-400 mb-2" style={{ fontSize: 36 }}>
                    cloud_upload
                  </span>
                  <span className="text-xs font-semibold text-slate-700">
                    {file ? file.name : 'Click to browse or drop file here'}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1">
                    {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Supports PDF, Measurement Books, Bills (Max 25MB)'}
                  </span>
                </label>
              </div>
            </div>

            <div className="bg-blue-50/80 rounded-xl p-3 border border-blue-100 flex items-start gap-2.5 text-[11px] text-blue-900">
              <span className="material-symbols-outlined text-blue-600 shrink-0 mt-0.5" style={{ fontSize: 16 }}>info</span>
              <div>
                <strong>Automated Multi-Stage Pipeline:</strong> Upload triggers OCR quantity extraction, deterministic BOQ comparison, Groq AI risk explanation, and updates the immutable project audit trail.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button onClick={handleReset} className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg">
                Cancel
              </button>
              <button
                disabled={!file}
                onClick={handleStartUpload}
                className={`btn-primary text-xs ${!file ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Upload &amp; Analyze
              </button>
            </div>
          </div>
        )}

        {/* Processing State with Stage Progress Bar */}
        {stage === 'PROCESSING' && (
          <div className="py-8 flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-primary animate-spin">
              <span className="material-symbols-outlined" style={{ fontSize: 28 }}>autorenew</span>
            </div>
            <div className="w-full max-w-md">
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                <span>Processing Pipeline</span>
                <span className="font-mono text-primary">{progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                <div
                  className="bg-primary h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-2 font-mono leading-tight">
                {statusMessage}
              </p>
            </div>
          </div>
        )}

        {/* Success Result Card */}
        {stage === 'SUCCESS' && analysisResult && (
          <div className="flex flex-col gap-3 text-xs">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-900">
              <span className="material-symbols-outlined text-emerald-600" style={{ fontSize: 20 }}>check_circle</span>
              <div className="font-semibold text-xs">Document Processed &amp; Authoritative State Saved</div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between font-semibold">
                <span className="text-slate-700">AI Risk Assessment:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  analysisResult.aiAssessment?.data?.risk_level === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                  analysisResult.aiAssessment?.data?.risk_level === 'HIGH' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {analysisResult.aiAssessment?.data?.risk_level || 'EVALUATED'}
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                {analysisResult.aiAssessment?.data?.summary || 'Verification completed successfully.'}
              </p>
              {analysisResult.flagsCreated?.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-200">
                  <span className="font-bold text-red-700 block text-[11px] mb-1">
                    Anomalies Identified ({analysisResult.flagsCreated.length}):
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-700">
                    {analysisResult.flagsCreated.map((f, idx) => (
                      <li key={idx}><strong>{f.title}</strong>: {f.explanation}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button onClick={handleReset} className="btn-primary text-xs">
                Close &amp; Refresh View
              </button>
            </div>
          </div>
        )}

        {/* Error State */}
        {stage === 'ERROR' && (
          <div className="flex flex-col gap-4 text-xs">
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-red-900">
              <span className="material-symbols-outlined text-red-600 shrink-0 mt-0.5" style={{ fontSize: 20 }}>error</span>
              <div>
                <div className="font-bold">Extraction or Processing Failed</div>
                <p className="mt-1 text-[11px] text-red-700">{errorMessage}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={handleReset} className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg">
                Close
              </button>
              <button onClick={() => setStage('IDLE')} className="btn-secondary text-xs">
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
