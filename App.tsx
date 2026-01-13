
import React, { useState } from 'react';
import { Plus, Trash2, Download, Wand2, FileSpreadsheet, XCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { InputFragment, ExtractedInfo } from './types';
import { extractInformation } from './services/geminiService';
import { downloadAsExcel } from './utils/excelGenerator';

const MAX_FRAGMENTS = 10;

const App: React.FC = () => {
  const [fragments, setFragments] = useState<InputFragment[]>([
    { id: crypto.randomUUID(), text: '', isProcessing: false }
  ]);
  const [isProcessingAll, setIsProcessingAll] = useState(false);

  const addFragment = () => {
    if (fragments.length < MAX_FRAGMENTS) {
      setFragments([...fragments, { id: crypto.randomUUID(), text: '', isProcessing: false }]);
    }
  };

  const removeFragment = (id: string) => {
    if (fragments.length > 1) {
      setFragments(fragments.filter(f => f.id !== id));
    } else {
      setFragments([{ id: crypto.randomUUID(), text: '', isProcessing: false }]);
    }
  };

  const updateFragmentText = (id: string, text: string) => {
    setFragments(fragments.map(f => f.id === id ? { ...f, text } : f));
  };

  const processAll = async () => {
    setIsProcessingAll(true);
    const updatedFragments = [...fragments];

    const tasks = updatedFragments.map(async (fragment, index) => {
      if (!fragment.text.trim() || fragment.result) return;

      updatedFragments[index] = { ...fragment, isProcessing: true, error: undefined };
      setFragments([...updatedFragments]);

      try {
        const result = await extractInformation(fragment.text);
        updatedFragments[index] = { ...updatedFragments[index], isProcessing: false, result };
      } catch (err) {
        updatedFragments[index] = { ...updatedFragments[index], isProcessing: false, error: 'Extraction failed' };
      }
      setFragments([...updatedFragments]);
    });

    await Promise.all(tasks);
    setIsProcessingAll(false);
  };

  const handleDownload = () => {
    const dataToExport = fragments
      .filter(f => f.result)
      .map(f => f.result as ExtractedInfo);

    if (dataToExport.length === 0) {
      alert("No data to export!");
      return;
    }

    downloadAsExcel(dataToExport);
  };

  const allProcessedCount = fragments.filter(f => f.result).length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      {/* Header */}
      <header className="mb-10 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-2xl mb-4">
          <FileSpreadsheet className="w-8 h-8 text-indigo-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Quality Data Extractor</h1>
      </header>

      <div className="grid gap-8">
        {/* Input Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              Input Fragments <span className="text-xs font-normal text-slate-500">({fragments.length}/{MAX_FRAGMENTS})</span>
            </h2>
            <div className="flex gap-2">
              <button
                onClick={processAll}
                disabled={isProcessingAll || fragments.every(f => !f.text.trim())}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
              >
                {isProcessingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                Process All
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {fragments.map((fragment, index) => (
              <div key={fragment.id} className="relative group animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex gap-3">
                  <div className="flex-none w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                    {index + 1}
                  </div>
                  <div className="flex-grow space-y-2">
                    <textarea
                      value={fragment.text}
                      onChange={(e) => updateFragmentText(fragment.id, e.target.value)}
                      placeholder="e.g., 名称：123，件号：ABC，是否客服返修件：新品，供应商名称：XH，问题点：划伤，不良批次：647，不良数量：1"
                      className="w-full min-h-[80px] p-3 text-sm text-slate-700 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none resize-none"
                    />
                    
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2 text-xs">
                        {fragment.isProcessing && (
                          <span className="flex items-center gap-1 text-indigo-500 animate-pulse font-medium">
                            <Loader2 className="w-3 h-3 animate-spin" /> Extracting...
                          </span>
                        )}
                        {fragment.result && !fragment.isProcessing && (
                          <span className="flex items-center gap-1 text-emerald-600 font-medium">
                            <CheckCircle2 className="w-3 h-3" /> Extraction Complete
                          </span>
                        )}
                        {fragment.error && (
                          <span className="flex items-center gap-1 text-rose-500 font-medium">
                            <XCircle className="w-3 h-3" /> {fragment.error}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeFragment(fragment.id)}
                        className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {fragments.length < MAX_FRAGMENTS && (
              <button
                onClick={addFragment}
                className="w-full py-4 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center gap-2 text-slate-400 hover:text-indigo-500 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group"
              >
                <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Add Fragment</span>
              </button>
            )}
          </div>
        </section>

        {/* Preview Section */}
        {allProcessedCount > 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                Extraction Preview
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  {allProcessedCount} items
                </span>
              </h2>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors shadow-lg"
              >
                <Download className="w-4 h-4" />
                Download Excel
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                    <th className="px-6 py-4">Name (G)</th>
                    <th className="px-6 py-4">Part # (F)</th>
                    <th className="px-6 py-4">Supplier (N)</th>
                    <th className="px-6 py-4">Problem (E)</th>
                    <th className="px-6 py-4">Batch (H)</th>
                    <th className="px-6 py-4">Qty (I)</th>
                    <th className="px-6 py-4">Status (K)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fragments.map((f) => f.result && (
                    <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{f.result.name}</td>
                      <td className="px-6 py-4 text-slate-600 font-mono text-xs">{f.result.partNumber}</td>
                      <td className="px-6 py-4 text-slate-600">{f.result.supplierName}</td>
                      <td className="px-6 py-4 text-slate-600">{f.result.problemPoint}</td>
                      <td className="px-6 py-4 text-slate-500">{f.result.defectBatch}</td>
                      <td className="px-6 py-4 text-slate-900 font-semibold">{f.result.defectQuantity}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-[10px]">
                          {f.result.isCustomerReturn}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      <footer className="mt-12 text-center text-slate-400 text-xs pb-8">
        <p>AI-Powered Quality Data System • Driven by Gemini 3</p>
      </footer>
    </div>
  );
};

export default App;
