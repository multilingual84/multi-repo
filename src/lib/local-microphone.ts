// Owns capture resources only; no transcription, network requests or logging.
export class LocalMicrophone {
  private generation = 0;
  private stream: MediaStream | null = null;
  private context: AudioContext | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private buffer: Float32Array | null = null;

  async start(audio: boolean | MediaTrackConstraints = true): Promise<boolean> {
    this.stop();
    const generation = this.generation;
    const stream = await navigator.mediaDevices.getUserMedia({ audio });
    if (generation !== this.generation) {
      stream.getTracks().forEach(track => track.stop());
      return false;
    }
    this.stream = stream;
    try {
      const context = new AudioContext();
      this.context = context;
      const source = context.createMediaStreamSource(stream);
      const processor = context.createScriptProcessor(2048, 1, 1);
      this.source = source; this.processor = processor;
      this.buffer = new Float32Array(2048);
      processor.onaudioprocess = event => {
        // One bounded scratch buffer, overwritten each frame; no recording archive.
        if (this.buffer) this.buffer.set(event.inputBuffer.getChannelData(0));
        event.outputBuffer.getChannelData(0).fill(0);
      };
      source.connect(processor); processor.connect(context.destination);
      await context.resume();
      if (generation !== this.generation) return false;
      return true;
    } catch (error) { this.stop(); throw error; }
  }

  stop(): void {
    this.generation += 1;
    this.stream?.getTracks().forEach(track => track.stop()); this.stream = null;
    if (this.processor) { this.processor.onaudioprocess = null; this.processor.disconnect(); }
    this.processor = null;
    this.source?.disconnect(); this.source = null;
    this.buffer?.fill(0); this.buffer = null;
    const context = this.context; this.context = null;
    if (context && context.state !== 'closed') void context.close().catch(() => {});
  }
}