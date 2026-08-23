"use client";

import React, { useState } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  FileCode,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Loader2,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Layers,
  ArrowRight,
  Check,
} from "lucide-react";
import Link from "next/link";

export default function BatchReconciliationPage() {
  const [fileContent, setFileContent] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [fileFormat, setFileFormat] = useState<"json" | "csv" | null>(null);
  const [recordCount, setRecordCount] = useState<number>(0);
  const [parseError, setParseError] = useState<string>("");

  const [isProcessing, setIsProcessing] = useState(false);
  const [batchResults, setBatchResults] = useState<any | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Pre-load demo batch files for seamless live demonstrations
  const loadDemoBatch = (type: "standard" | "anomaly" | "large") => {
    setParseError("");
    setBatchResults(null);

    if (type === "standard") {
      const demoData = [
        { recordId: "evt-01", vehicleNumber: "MH02AB1234", eventType: "ENTRY", gate: "Gate A Ingress", timestamp: new Date(Date.now() - 3600000).toISOString() },
        { recordId: "evt-02", vehicleNumber: "DL01CD5678", eventType: "ENTRY", gate: "Gate B Ingress", timestamp: new Date(Date.now() - 3000000).toISOString() },
        { recordId: "evt-03", vehicleNumber: "KA05EF9012", eventType: "ENTRY", gate: "Gate A Ingress", timestamp: new Date(Date.now() - 2400000).toISOString() },
        { recordId: "evt-04", vehicleNumber: "MH02AB1234", eventType: "EXIT", gate: "Gate A Egress", timestamp: new Date(Date.now() - 600000).toISOString() },
        { recordId: "evt-05", vehicleNumber: "TS09GH3456", eventType: "ENTRY", gate: "Gate C Ingress", timestamp: new Date(Date.now() - 1800000).toISOString() },
      ];
      const jsonStr = JSON.stringify(demoData, null, 2);
      setFileContent(jsonStr);
      setFileName("standard_traffic_log.json");
      setFileFormat("json");
      setRecordCount(demoData.length);
    } else if (type === "anomaly") {
      const csvStr = `recordId,vehicleNumber,eventType,gate,timestamp
rec-101,MH12XY9999,ENTRY,Gate A Ingress,2026-08-23T10:00:00Z
rec-102,MH12XY9999,ENTRY,Gate B Ingress,2026-08-23T10:15:00Z
rec-103,DL03ZZ4444,ENTRY,Gate A Ingress,2026-08-23T10:30:00Z
rec-104,INVALID_ROW,,Gate A,2026-08-23T10:45:00Z
rec-105,KA01QQ7777,EXIT,Gate B Egress,2026-08-23T11:00:00Z
rec-106,MH14JK3322,UNRECOGNIZED_BARRIER_OVERRIDE,Gate C,2026-08-23T11:15:00Z`;
      setFileContent(csvStr);
      setFileName("barrier_tailgating_audit.csv");
      setFileFormat("csv");
      setRecordCount(6);
    } else {
      const largeData = Array.from({ length: 40 }, (_, i) => ({
        recordId: `batch-rec-${i + 1}`,
        vehicleNumber: `MH0${(i % 9) + 1}AB${1000 + i}`,
        eventType: i % 4 === 0 ? "EXIT" : "ENTRY",
        gate: i % 2 === 0 ? "Gate A North" : "Gate B South",
        timestamp: new Date(Date.now() - i * 180000).toISOString(),
      }));
      setFileContent(JSON.stringify(largeData, null, 2));
      setFileName("peak_hour_reconciliation_40.json");
      setFileFormat("json");
      setRecordCount(40);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setParseError("");
    setBatchResults(null);

    const isCsv = file.name.endsWith(".csv");
    const isJson = file.name.endsWith(".json");

    if (!isCsv && !isJson) {
      setParseError("Unsupported file format. Please upload a .csv or .json file.");
      return;
    }

    setFileFormat(isCsv ? "csv" : "json");

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setFileContent(text);

      try {
        if (isJson) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            setRecordCount(parsed.length);
          } else {
            setParseError("JSON file must contain an array of parking records.");
          }
        } else {
          const lines = text.trim().split("\n");
          setRecordCount(Math.max(0, lines.length - 1));
        }
      } catch (err: any) {
        setParseError("Malformed file content: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  const parseCsvToRecords = (csv: string) => {
    const lines = csv.trim().split("\n");
    if (lines.length <= 1) return [];

    const headers = lines[0].split(",").map((h) => h.trim());
    const records = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const values = line.split(",").map((v) => v.trim());
      const rec: any = {};
      headers.forEach((h, idx) => {
        rec[h] = values[idx] || "";
      });
      records.push(rec);
    }
    return records;
  };

  const handleProcessBatch = async () => {
    if (!fileContent || !fileFormat) return;

    setIsProcessing(true);
    setParseError("");

    try {
      let records: any[] = [];
      if (fileFormat === "json") {
        records = JSON.parse(fileContent);
      } else {
        records = parseCsvToRecords(fileContent);
      }

      const response = await fetch("/api/rocketride/batch-reconcile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facilityId: "cm-grand",
          batchSource: fileName || "Operator Batch Upload",
          records,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Batch reconciliation pipeline failed.");
      }

      setBatchResults(data.data);
      setPage(1);
    } catch (err: any) {
      setParseError(err.message || "Failed to process batch.");
    } finally {
      setIsProcessing(false);
    }
  };

  const totalPages = batchResults
    ? Math.ceil((batchResults.results?.length || 0) / pageSize)
    : 1;

  const paginatedResults = batchResults
    ? (batchResults.results || []).slice((page - 1) * pageSize, page * pageSize)
    : [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 max-w-[1440px] mx-auto text-[#241F1B]">
      {/* ── 1. HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#241F1B]">
              Batch Occupancy Reconciliation
            </h1>
            <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-[#C93B2F] text-white">
              PIPELINE BATCH
            </span>
          </div>
          <p className="text-[13.5px] text-[#70675F] mt-1">
            Reconcile barrier gate entry/exit logs, session tickets, and physical slot occupancy via RocketRide
          </p>
        </div>

        {/* Demo Batch Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-bold text-[#70675F] hidden sm:inline">Load Sample:</span>
          <button
            type="button"
            onClick={() => loadDemoBatch("standard")}
            className="px-3 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#EDE1D4] border border-[#DED3C7] text-[12px] font-bold text-[#241F1B] cursor-pointer"
          >
            Standard Log (5)
          </button>
          <button
            type="button"
            onClick={() => loadDemoBatch("anomaly")}
            className="px-3 py-1.5 rounded-xl bg-[#FEF5E7] hover:bg-[#FDE8C7] border border-[#D97706]/40 text-[12px] font-bold text-[#92400E] cursor-pointer"
          >
            Anomaly CSV (6)
          </button>
          <button
            type="button"
            onClick={() => loadDemoBatch("large")}
            className="px-3 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#EDE1D4] border border-[#DED3C7] text-[12px] font-bold text-[#241F1B] cursor-pointer"
          >
            Large Batch (40)
          </button>
        </div>
      </div>

      {/* ── 2. UPLOAD & VALIDATION CARD ── */}
      <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl p-6 sm:p-7 shadow-xs flex flex-col gap-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#DED3C7]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#F9E3DE] text-[#C93B2F] flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-[#241F1B]">Upload Event Logs</h3>
              <p className="text-[12px] text-[#70675F]">Accepts JSON array or barrier telemetry CSV files</p>
            </div>
          </div>

          {fileName && (
            <div className="flex items-center gap-2 font-mono text-[12px] font-bold text-[#2F7D5A] bg-[#EBF7F0] px-3 py-1 rounded-xl border border-[#2F7D5A]/30">
              <Check className="w-4 h-4" />
              <span>{fileName} ({recordCount} records)</span>
            </div>
          )}
        </div>

        {parseError && (
          <div className="p-3.5 rounded-xl bg-[#C93B2F]/10 border border-[#C93B2F]/30 text-[#C93B2F] text-[13px] font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{parseError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Dropzone / Upload area */}
          <div className="border-2 border-dashed border-[#DED3C7] hover:border-[#C93B2F] rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3 transition-colors bg-[#FAF7F2]">
            <UploadCloud className="w-10 h-10 text-[#C93B2F]" />
            <div>
              <p className="text-[14px] font-bold text-[#241F1B]">Drag and drop barrier log files</p>
              <p className="text-[12px] text-[#70675F] mt-0.5">Supports .JSON and .CSV up to 5,000 records</p>
            </div>
            <label className="px-4 py-2 rounded-xl bg-[#C93B2F] hover:bg-[#A92E25] text-white text-[13px] font-bold cursor-pointer transition-colors shadow-xs">
              <span>Browse Files</span>
              <input
                type="file"
                accept=".csv,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Payload Preview */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-[12px] font-bold text-[#70675F]">
              <span>Payload Preview</span>
              <span>{fileFormat ? fileFormat.toUpperCase() : "NO FILE"}</span>
            </div>
            <textarea
              value={fileContent}
              onChange={(e) => {
                setFileContent(e.target.value);
                setFileFormat(e.target.value.trim().startsWith("[") ? "json" : "csv");
              }}
              placeholder="Paste JSON array or CSV records directly here..."
              rows={6}
              className="w-full p-3.5 rounded-xl bg-[#241F1B] text-[#FAF7F2] text-[12px] font-mono focus:outline-none focus:ring-2 focus:ring-[#C93B2F]"
            />
          </div>
        </div>

        {/* Process Button */}
        <div className="flex items-center justify-between pt-3 border-t border-[#DED3C7]">
          <span className="text-[12px] text-[#70675F]">
            Pipeline: <span className="font-mono font-bold text-[#241F1B]">occupancy-reconciliation.pipe</span>
          </span>

          <button
            type="button"
            onClick={handleProcessBatch}
            disabled={isProcessing || !fileContent.trim()}
            className="px-6 py-2.5 rounded-xl bg-[#C93B2F] hover:bg-[#A92E25] text-white font-bold text-[14px] transition-all cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Reconciling Batch Records…</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Start Batch Processing</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── 3. BATCH EXECUTION RESULTS ── */}
      {batchResults && (
        <div className="flex flex-col gap-6 animate-in fade-in">
          {/* Metric Overview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-xl p-3.5 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-[#70675F]">Received</span>
              <span className="block text-2xl font-black font-mono text-[#241F1B] mt-1">
                {batchResults.recordsReceived}
              </span>
            </div>

            <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-xl p-3.5 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-[#70675F]">Valid</span>
              <span className="block text-2xl font-black font-mono text-[#2F7D5A] mt-1">
                {batchResults.validRecords}
              </span>
            </div>

            <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-xl p-3.5 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-[#70675F]">Anomalies</span>
              <span className="block text-2xl font-black font-mono text-[#D97706] mt-1">
                {batchResults.anomaliesDetected}
              </span>
            </div>

            <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-xl p-3.5 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-[#70675F]">Review Queue</span>
              <span className="block text-2xl font-black font-mono text-[#C93B2F] mt-1">
                {batchResults.recordsRequiringReview}
              </span>
            </div>

            <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-xl p-3.5 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-[#70675F]">Execution Time</span>
              <span className="block text-2xl font-black font-mono text-[#241F1B] mt-1">
                {batchResults.executionDurationMs}ms
              </span>
            </div>

            <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-xl p-3.5 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-[#70675F]">Estimated Cost</span>
              <span className="block text-2xl font-black font-mono text-[#2F7D5A] mt-1">
                ${batchResults.estimatedCost || 0.0002}
              </span>
            </div>
          </div>

          {/* Records Table */}
          <div className="bg-[#FFFFFF] border border-[#DED3C7] rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-[#DED3C7] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-[16px] font-black text-[#241F1B]">Reconciled Records</h3>
                <span className="font-mono text-[11.5px] text-[#70675F]">
                  (Exec ID: {batchResults.executionId})
                </span>
              </div>

              {batchResults.recordsRequiringReview > 0 && (
                <Link
                  href="/admin/ai-review"
                  className="px-3 py-1.5 rounded-xl bg-[#F9E3DE] hover:bg-[#F3C7BD] text-[#C93B2F] text-[12px] font-bold flex items-center gap-1 transition-colors"
                >
                  <span>Open Review Queue ({batchResults.recordsRequiringReview})</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px] border-collapse">
                <thead>
                  <tr className="bg-[#FAF7F2] border-b border-[#DED3C7] text-[#70675F] text-[11px] uppercase font-black tracking-wider">
                    <th className="py-3 px-5">Record ID</th>
                    <th className="py-3 px-5">Vehicle Plate</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5">Anomaly Detail</th>
                    <th className="py-3 px-5">Intelligence Explanation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DED3C7]">
                  {paginatedResults.map((r: any, idx: number) => (
                    <tr key={idx} className="hover:bg-[#FAF7F2] transition-colors">
                      <td className="py-3.5 px-5 font-mono text-[12px] text-[#70675F]">
                        {r.recordId}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="font-mono font-bold text-[#241F1B] bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#DED3C7]">
                          {r.vehicleNumber}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        {r.status === "VALID" && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#EBF7F0] text-[#2F7D5A] border border-[#2F7D5A]/30">
                            Valid
                          </span>
                        )}
                        {r.status === "ANOMALY" && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#FEF5E7] text-[#D97706] border border-[#D97706]/30">
                            Anomaly Flagged
                          </span>
                        )}
                        {r.status === "FAILED" && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#F9E3DE] text-[#C93B2F] border border-[#C93B2F]/30">
                            Malformed
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 font-bold text-[#241F1B]">
                        {r.anomalyType ? r.anomalyType.replace(/_/g, " ") : "—"}
                      </td>
                      <td className="py-3.5 px-5 text-[#70675F] max-w-md">
                        {r.explanation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-[#DED3C7] flex items-center justify-between text-[13px] text-[#70675F]">
                <span>
                  Page {page} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 rounded-lg border border-[#DED3C7] bg-[#FAF7F2] hover:bg-[#EDE1D4] font-bold disabled:opacity-50 cursor-pointer"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 rounded-lg border border-[#DED3C7] bg-[#FAF7F2] hover:bg-[#EDE1D4] font-bold disabled:opacity-50 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
