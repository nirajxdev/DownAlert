import { useState } from 'react';
import { X, Code, Server, Bell, Globe, Copy, Check } from 'lucide-react';

interface DocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DocsModal({ isOpen, onClose }: DocsModalProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const webhookExample = `{
  "event": "monitor.down",
  "monitor_id": "mon_89fd7a21",
  "name": "Production API Gateway",
  "url": "https://api.myapp.com/health",
  "status_code": 503,
  "response_time_ms": 3412,
  "detected_at": "2026-08-15T21:04:00Z",
  "incident_url": "https://downalert.com/incidents/inc_4982"
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1220]/60 backdrop-blur-xs">
      <div
        id="docs-modal-card"
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white rounded-2xl border border-[#E6E8EC] p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-[#0B1220]"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-[#667085] hover:text-[#0B1220] hover:bg-[#F7F8FA] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-mono font-bold bg-[#12B8A6]/10 text-[#12B8A6] px-2.5 py-1 rounded">
            DOCUMENTATION
          </span>
          <span className="text-xs font-mono text-[#667085]">v1.0 Developer Guide</span>
        </div>

        <h3 className="text-2xl font-bold tracking-tight text-[#0B1220] mb-2">
          DownAlert Integration & Specs
        </h3>
        <p className="text-sm text-[#667085] mb-6">
          Everything you need to configure endpoints, regional nodes, and webhook alerts.
        </p>

        <div className="space-y-6">
          {/* Section 1: Health Check Endpoint */}
          <div className="p-4 bg-[#F7F8FA] rounded-xl border border-[#E6E8EC]">
            <h4 className="text-sm font-bold text-[#0B1220] flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-[#12B8A6]" />
              1. Recommended Health Check Endpoint
            </h4>
            <p className="text-xs text-[#667085] leading-relaxed mb-3">
              DownAlert sends HTTP HEAD and GET requests. Return an HTTP 200–299 status code with a fast JSON or text response.
            </p>
            <div className="bg-[#0B1220] text-[#94a3b8] font-mono text-xs p-3 rounded-lg flex items-center justify-between">
              <code>app.get("/health", (req, res) =&gt; res.status(200).send("OK"));</code>
              <button
                onClick={() => copyCode('app.get("/health", (req, res) => res.status(200).send("OK"));', 'endpoint')}
                className="text-[#667085] hover:text-white p-1"
              >
                {copiedSection === 'endpoint' ? <Check className="w-3.5 h-3.5 text-[#16A67A]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Section 2: Webhook Alert Payload */}
          <div className="p-4 bg-[#F7F8FA] rounded-xl border border-[#E6E8EC]">
            <h4 className="text-sm font-bold text-[#0B1220] flex items-center gap-2 mb-2">
              <Bell className="w-4 h-4 text-[#12B8A6]" />
              2. Webhook Incident JSON Payload
            </h4>
            <p className="text-xs text-[#667085] leading-relaxed mb-3">
              When an outage is confirmed from 2+ regional nodes, DownAlert sends a POST webhook payload:
            </p>
            <div className="relative bg-[#0B1220] text-slate-200 font-mono text-xs p-3.5 rounded-lg overflow-x-auto">
              <button
                onClick={() => copyCode(webhookExample, 'webhook')}
                className="absolute top-3 right-3 text-[#667085] hover:text-white p-1"
              >
                {copiedSection === 'webhook' ? <Check className="w-3.5 h-3.5 text-[#16A67A]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <pre>{webhookExample}</pre>
            </div>
          </div>

          {/* Section 3: Monitoring Edge Nodes */}
          <div className="p-4 bg-[#F7F8FA] rounded-xl border border-[#E6E8EC]">
            <h4 className="text-sm font-bold text-[#0B1220] flex items-center gap-2 mb-2">
              <Server className="w-4 h-4 text-[#12B8A6]" />
              3. Regional Edge Probes
            </h4>
            <p className="text-xs text-[#667085] leading-relaxed mb-3">
              Checks are distributed across global edge datacenters to eliminate false positives:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px]">
              <div className="p-2 bg-white rounded border border-[#E6E8EC]">
                <strong className="text-[#0B1220] block">us-east-1</strong>
                <span className="text-[#667085]">Virginia, USA</span>
              </div>
              <div className="p-2 bg-white rounded border border-[#E6E8EC]">
                <strong className="text-[#0B1220] block">eu-west-1</strong>
                <span className="text-[#667085]">Frankfurt, DE</span>
              </div>
              <div className="p-2 bg-white rounded border border-[#E6E8EC]">
                <strong className="text-[#0B1220] block">ap-southeast-1</strong>
                <span className="text-[#667085]">Singapore</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal footer */}
        <div className="mt-6 pt-4 border-t border-[#E6E8EC] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#0B1220] text-white text-xs font-medium rounded-xl hover:bg-[#1e293b] transition-colors"
          >
            Close Docs
          </button>
        </div>
      </div>
    </div>
  );
}
