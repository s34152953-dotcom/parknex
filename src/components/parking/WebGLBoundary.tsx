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
    console.warn("[WebGL Boundary] Caught 3D visualization error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="w-full h-full min-h-[420px] rounded-3xl bg-[#FAF7F2] border border-[#EAE3D9] p-8 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#FFF5F2] border border-[#FADCD5] flex items-center justify-center text-[#D84A2B] mb-4">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h3 className="text-[18px] font-bold text-[#1C1917]">3D WebGL Visualization Unavailable</h3>
          <p className="text-[13px] text-[#78716C] max-w-[360px] mt-1 mb-5 leading-relaxed">
            Your browser or device hardware acceleration encountered a temporary graphics limitation. You can seamlessly switch to the full-featured 2D parking grid.
          </p>
          <div className="flex items-center gap-3">
            {this.props.onFallbackTo2D && (
              <button
                type="button"
                onClick={this.props.onFallbackTo2D}
                className="h-11 px-5 rounded-xl bg-[#D84A2B] text-white text-[13px] font-bold inline-flex items-center gap-2 hover:bg-[#C23E21] transition-all cursor-pointer shadow-xs"
              >
                <LayoutGrid className="w-4 h-4" />
                Switch to 2D Grid Mode
              </button>
            )}
            <button
              type="button"
              onClick={() => this.setState({ hasError: false })}
              className="h-11 px-4 rounded-xl bg-white border border-[#E2D9CC] text-[#1C1917] text-[13px] font-semibold inline-flex items-center gap-2 hover:border-[#D84A2B]/40 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-[#78716C]" />
              Retry 3D
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
