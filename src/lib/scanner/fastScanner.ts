import jsQR from "jsqr";

export interface ScanResult {
  text: string;
  format?: string;
  source: "barcode-detector" | "jsqr";
}

let sharedAudioCtx: AudioContext | null = null;

/**
 * Play short, clean confirmation audio chime via Web Audio API
 */
export function playScanChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!sharedAudioCtx || sharedAudioCtx.state === "closed") {
      sharedAudioCtx = new AudioContextClass();
    }
    if (sharedAudioCtx.state === "suspended") {
      sharedAudioCtx.resume();
    }

    const ctx = sharedAudioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.08); // E6

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.12);

    // Mobile haptic vibration feedback
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([40, 20, 40]);
    }
  } catch {}
}

/**
 * Ultra-Fast High Performance Camera Pass Scanner
 * Resilient, non-blocking, multi-tier decoding with native BarcodeDetector + jsQR fallback.
 */
export class FastCameraScanner {
  private video: HTMLVideoElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private barcodeDetector: any = null;
  private animationFrameId: number | null = null;
  private isScanning = false;
  private isPaused = false;
  private isProcessingFrame = false;
  private onScanCallback: ((result: ScanResult) => void) | null = null;
  private lastScanTime = 0;
  private lastDetectedText = "";
  private lastDetectedTime = 0;
  private scanIntervalMs = 40; // ~25 FPS check rate for instant capture without CPU choke
  private debounceCooldownMs = 1500; // Prevent duplicate scan spam of the exact same code

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
    this.isPaused = false;
    this.isProcessingFrame = false;
    this.lastScanTime = 0;
    this.lastDetectedText = "";
    this.lastDetectedTime = 0;
    this.loop();
  }

  public pause() {
    this.isPaused = true;
  }

  public resume() {
    this.isPaused = false;
    this.lastDetectedText = "";
  }

  public stop() {
    this.isScanning = false;
    this.isPaused = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private loop = async () => {
    if (!this.isScanning) return;

    const now = performance.now();

    if (
      !this.isPaused &&
      !this.isProcessingFrame &&
      now - this.lastScanTime >= this.scanIntervalMs &&
      this.video.readyState >= 2 // HAVE_CURRENT_DATA or HAVE_ENOUGH_DATA
    ) {
      this.isProcessingFrame = true;
      this.lastScanTime = now;

      try {
        const result = await this.scanCurrentFrame();
        if (result && this.onScanCallback && this.isScanning && !this.isPaused) {
          const isSameCode = result.text === this.lastDetectedText;
          const timeSinceLastDetect = now - this.lastDetectedTime;

          if (!isSameCode || timeSinceLastDetect > this.debounceCooldownMs) {
            this.lastDetectedText = result.text;
            this.lastDetectedTime = now;
            playScanChime();
            this.onScanCallback(result);
          }
        }
      } catch (err) {
        // Continue scanning smoothly
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

    // ── Tier 1: Hardware-Accelerated BarcodeDetector (~2-8ms) ──
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

    // ── Tier 2: Downsampled jsQR (~8-15ms) ──
    if (!this.ctx) return null;

    const vw = video.videoWidth;
    const vh = video.videoHeight;

    // Scale canvas to max 480x360 for high-speed instant CPU decoding
    const maxDimension = 480;
    const scale = Math.min(1, maxDimension / Math.max(vw, vh, 1));
    const cw = Math.max(240, Math.floor(vw * scale));
    const ch = Math.max(180, Math.floor(vh * scale));

    if (this.canvas.width !== cw || this.canvas.height !== ch) {
      this.canvas.width = cw;
      this.canvas.height = ch;
    }

    this.ctx.drawImage(video, 0, 0, cw, ch);
    const imageData = this.ctx.getImageData(0, 0, cw, ch);

    // Regular scan
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "attemptBoth",
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
