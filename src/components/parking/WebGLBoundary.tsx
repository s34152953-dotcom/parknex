"use client";

import React, { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw, LayoutGrid } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onFallbackTo2D?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class WebGLBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn("[Interactive Map Boundary] Caught visualization error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="w-full h-full min-h-[420px] rounded-3xl bg-[#10151D] border border-white/10 p-8 flex flex-col items-center justify-center text-center text-[#F5F7FA]">
          <div className="w-14 h-14 rounded-2xl bg-[#D84A2B]/15 border border-[#D84A2B]/30 flex items-center justify-center text-[#D84A2B] mb-4">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h3 className="text-[18px] font-bold text-white">Interactive View Unavailable</h3>
          <p className="text-[13px] text-white/60 max-w-[360px] mt-1 mb-5 leading-relaxed">
            Interactive graphics mode is currently unavailable. You can seamlessly switch to the standard floor plan.
          </p>
          <div className="flex items-center gap-3">
            {this.props.onFallbackTo2D && (
              <button
                type="button"
                onClick={this.props.onFallbackTo2D}
                className="h-11 px-5 rounded-xl bg-[#D84A2B] text-white text-[13px] font-bold inline-flex items-center gap-2 hover:bg-[#C23E21] transition-all cursor-pointer shadow-xs"
              >
                <LayoutGrid className="w-4 h-4" />
                Switch to Floor Plan
              </button>
            )}
            <button
              type="button"
              onClick={() => this.setState({ hasError: false })}
              className="h-11 px-4 rounded-xl bg-white/[0.06] border border-white/10 text-white text-[13px] font-semibold inline-flex items-center gap-2 hover:bg-white/[0.1] transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-white/60" />
              Retry View
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
