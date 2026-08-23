import jsQR from "jsqr";

export interface ScanResult {
  text: string;
  format?: string;
  source: "barcode-detector" | "jsqr";
}

/**
 * Play short, clean confirmation audio chime via Web Audio API (no external audio assets required)
 */
export function playScanChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.08); // E6

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.12);

    // Haptic vibration feedback for mobile devices
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([40, 30, 40]);
    }
  } catch {}
}

/**
 * Ultra-Fast High Performance Multi-Tier QR Decoder
 *
 * Tier 1: Hardware-accelerated native BarcodeDetector API (~5-10ms)
 * Tier 2: Downsampled high-contrast Canvas + jsQR with both regular & inverted attempts (~8-15ms)
 */
export class FastCameraScanner {
  private video: HTMLVideoElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private barcodeDetector: any = null;
  private animationFrameId: number | null = null;
  private isScanning = false;
  private isProcessingFrame = false;
  private onScanCallback: ((result: ScanResult) => void) | null = null;
  private targetWidth = 640;
  private targetHeight = 480;
  private lastScanTime = 0;
  private scanIntervalMs = 35; // ~28-30 frame checks per second for instant capture

  constructor(videoElement: HTMLVideoElement) {
    this.video = videoElement;
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d", { willReadFrequently: true });

    // Initialize Tier 1 Native Hardware BarcodeDetector if available
    if (typeof window !== "undefined" && "BarcodeDetector" in window) {
      try {
        this.barcodeDetector = new (window as any).BarcodeDetector({
          formats: ["qr_code", "code_128", "code_39", "data_matrix"],
        });
      } catch {
        this.barcodeDetector = null;
      }
    }
  }

  public start(onScan: (result: ScanResult) => void) {
    this.onScanCallback = onScan;
    this.isScanning = true;
    this.isProcessingFrame = false;
    this.lastScanTime = 0;
    this.loop();
  }

  public stop() {
    this.isScanning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private loop = async () => {
    if (!this.isScanning) return;

    const now = performance.now();
    if (
      !this.isProcessingFrame &&
      now - this.lastScanTime >= this.scanIntervalMs &&
      this.video.readyState === this.video.HAVE_ENOUGH_DATA
    ) {
      this.isProcessingFrame = true;
      this.lastScanTime = now;

      try {
        const result = await this.scanCurrentFrame();
        if (result && this.onScanCallback && this.isScanning) {
          playScanChime();
          this.onScanCallback(result);
          this.isProcessingFrame = false;
          return;
        }
      } catch (err) {
        // Continue scanning silently
      } finally {
        this.isProcessingFrame = false;
      }
    }

    if (this.isScanning) {
      this.animationFrameId = requestAnimationFrame(this.loop);
    }
  };

  private async scanCurrentFrame(): Promise<ScanResult | null> {
    const video = this.video;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      return null;
    }

    // ── Tier 1: Hardware-Accelerated BarcodeDetector ──
    if (this.barcodeDetector) {
      try {
        const barcodes = await this.barcodeDetector.detect(video);
        if (barcodes && barcodes.length > 0) {
          const rawValue = barcodes[0].rawValue;
          if (rawValue && rawValue.trim()) {
            return {
              text: rawValue.trim(),
              format: barcodes[0].format || "qr_code",
              source: "barcode-detector",
            };
          }
        }
      } catch {
        // Fallback to Tier 2
      }
    }

    // ── Tier 2: Downsampled jsQR (<15ms per frame) ──
    if (!this.ctx) return null;

    const vw = video.videoWidth;
    const vh = video.videoHeight;

    // Calculate downsample ratio to keep canvas around 640px max for maximum speed
    const scale = Math.min(1, this.targetWidth / Math.max(vw, 1));
    const cw = Math.max(320, Math.floor(vw * scale));
    const ch = Math.max(240, Math.floor(vh * scale));

    if (this.canvas.width !== cw || this.canvas.height !== ch) {
      this.canvas.width = cw;
      this.canvas.height = ch;
    }

    this.ctx.drawImage(video, 0, 0, cw, ch);
    const imageData = this.ctx.getImageData(0, 0, cw, ch);

    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "attemptBoth", // Handles dark-mode and glossy phone screens
    });

    if (code && code.data && code.data.trim()) {
      return {
        text: code.data.trim(),
        format: "qr_code",
        source: "jsqr",
      };
    }

    return null;
  }
}
