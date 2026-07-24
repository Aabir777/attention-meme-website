"use client";

import { Component, type ReactNode } from "react";
import Image from "next/image";

type Props = {
  children: ReactNode;
  onRetry?: () => void;
};

type State = { error: string | null };

/** Catches WebGL / R3F crashes so the page never goes blank white */
export class MascotErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(err: Error): State {
    return { error: err?.message || "3D viewer crashed" };
  }

  componentDidCatch(err: Error) {
    console.error("[Mascot3D]", err);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-full min-h-[360px] flex-col items-center justify-center gap-4 bg-[#0a0a0f] p-6 text-center">
          <div className="relative h-48 w-48">
            <Image
              src="/mascot/main.png"
              alt="Attention mascot"
              fill
              className="object-contain"
              sizes="192px"
            />
          </div>
          <p className="max-w-xs text-sm text-white/70">
            3D viewer hit a snag (often WebGL memory). Showing 2D mascot instead.
          </p>
          <p className="max-w-sm text-[11px] text-white/35">{this.state.error}</p>
          <button
            type="button"
            className="rounded-full bg-[#f5d547] px-4 py-2 text-xs font-bold text-black"
            onClick={() => {
              this.setState({ error: null });
              this.props.onRetry?.();
              window.location.reload();
            }}
          >
            Reload 3D
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
