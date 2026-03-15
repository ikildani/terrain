'use client';

import { useState } from 'react';
import { Copy, Check, AlertTriangle } from 'lucide-react';

interface ApiKeyRevealModalProps {
  apiKey: string;
  onClose: () => void;
}

export function ApiKeyRevealModal({ apiKey, onClose }: ApiKeyRevealModalProps) {
  const [copied, setCopied] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setAcknowledged(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = apiKey;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setAcknowledged(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-navy-700 bg-navy-900 p-6 shadow-2xl">
        {/* Warning header */}
        <div className="mb-5 flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-400" />
          <div>
            <h3 className="text-sm font-semibold text-amber-400">Save Your API Key</h3>
            <p className="mt-1 text-sm text-amber-300/80">
              This key will only be shown once. Copy it now and store it securely. You will not be able to view it
              again.
            </p>
          </div>
        </div>

        {/* Key display */}
        <div className="mb-6">
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
            Your API Key
          </label>
          <div className="group relative">
            <div className="overflow-x-auto rounded-lg border border-navy-700 bg-navy-950 p-4">
              <code className="block whitespace-nowrap font-mono text-sm text-teal-400">{apiKey}</code>
            </div>
            <button
              onClick={handleCopy}
              className="absolute right-2 top-2 rounded-md bg-navy-800 p-2 text-slate-400 transition-colors hover:bg-navy-700 hover:text-white"
              title="Copy to clipboard"
            >
              {copied ? <Check className="h-4 w-4 text-teal-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          {copied && <p className="mt-2 text-xs text-teal-400">Copied to clipboard</p>}
        </div>

        {/* Usage example */}
        <div className="mb-6">
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">
            Usage Example
          </label>
          <div className="rounded-lg border border-navy-700 bg-navy-950 p-4">
            <code className="block whitespace-pre font-mono text-xs text-slate-300">
              {`curl -X POST https://terrain.ambrosiaventures.co/api/v1/analyze/market \\
  -H "Authorization: Bearer ${apiKey.substring(0, 20)}..." \\
  -H "Content-Type: application/json" \\
  -d '{"input": {...}, "product_category": "pharmaceutical"}'`}
            </code>
          </div>
        </div>

        {/* Dismiss */}
        <div className="flex items-center justify-end">
          <button
            onClick={onClose}
            disabled={!acknowledged}
            className={`rounded-lg px-6 py-2.5 text-sm font-medium transition-colors ${
              acknowledged
                ? 'bg-teal-500 text-navy-950 hover:bg-teal-400'
                : 'cursor-not-allowed bg-navy-700 text-slate-500'
            }`}
          >
            {acknowledged ? "I've copied the key" : 'Copy the key first'}
          </button>
        </div>
      </div>
    </div>
  );
}
