"use client";

import { Component, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { Villa } from "./Villa";

/* the 3D villa is client-only and code-split; the coded CSS villa shows while
   it loads and is the fallback if WebGL is unavailable (old/low-end devices). */
const Villa3D = dynamic(() => import("./Villa3D"), {
  ssr: false,
  loading: () => <Villa entrance={0} lights={0} flag={0} />,
});

interface Props {
  entrance: number;
  lights: number;
  flag: number;
  cool: number;
}

export class VillaStage extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render(): ReactNode {
    const { entrance, lights, flag, cool } = this.props;
    if (this.state.failed) {
      // graceful, identical-looking fallback — same drivers, no WebGL
      return <Villa entrance={entrance} lights={lights} flag={flag} />;
    }
    return <Villa3D entrance={entrance} lights={lights} flag={flag} cool={cool} />;
  }
}
