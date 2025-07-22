export class SoundEngine {
  private static audioContext: AudioContext | null = null;
  private static gainNode: GainNode | null = null;
  private static initialized: boolean = false;
  private static userInteracted: boolean = false;

  static initialize(volume: number = 75) {
    if (typeof window === 'undefined') return;
    
    // Set up user interaction listener
    if (!this.userInteracted) {
      this.setupUserInteractionListener();
    }

    if (this.audioContext) {
      // If context exists but is suspended, try to resume it
      if (this.audioContext.state === 'suspended') {
        this.resumeContext();
      }
      this.setVolume(volume);
      return;
    }

    if (this.userInteracted) {
      this.createAudioContext(volume);
    }
  }

  private static setupUserInteractionListener() {
    if (typeof window === 'undefined') return;

    const enableAudio = () => {
      this.userInteracted = true;
      this.createAudioContext();
      // Remove listeners after first interaction
      document.removeEventListener('click', enableAudio);
      document.removeEventListener('touchstart', enableAudio);
      document.removeEventListener('keydown', enableAudio);
    };

    document.addEventListener('click', enableAudio, { once: true });
    document.addEventListener('touchstart', enableAudio, { once: true });
    document.addEventListener('keydown', enableAudio, { once: true });
  }

  private static createAudioContext(volume: number = 75) {
    if (typeof window === 'undefined') return;

    try {
      // @ts-expect-error - Safari support
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.setVolume(volume);
      this.initialized = true;
    } catch (error) {
      console.log('Audio not supported');
    }
  }

  private static async resumeContext() {
    if (!this.audioContext) return;

    try {
      await this.audioContext.resume();
    } catch (error) {
      console.log('Failed to resume audio context:', error);
    }
  }

  static setVolume(volume: number) {
    if (this.gainNode) {
      this.gainNode.gain.value = volume / 100 * 0.5; // Max volume of 0.5 to prevent too loud sounds
    }
  }

  private static async playOscillator(options: {
    type: OscillatorType;
    frequency: number;
    duration: number;
    fadeOut?: boolean;
    sweep?: { endFreq: number; };
    volume?: number; // Allow per-sound volume adjustment
  }) {
    if (!this.audioContext || !this.gainNode || !this.userInteracted) return;

    try {
      // Resume context if suspended
      if (this.audioContext.state === 'suspended') {
        await this.resumeContext();
      }

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      const baseVolume = options.volume || 1;

      oscillator.type = options.type;
      oscillator.frequency.setValueAtTime(options.frequency, this.audioContext.currentTime);

      if (options.sweep) {
        oscillator.frequency.exponentialRampToValueAtTime(
          options.sweep.endFreq,
          this.audioContext.currentTime + options.duration
        );
      }

      oscillator.connect(gainNode);
      gainNode.connect(this.gainNode);

      if (options.fadeOut) {
        gainNode.gain.setValueAtTime(0.3 * baseVolume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + options.duration);
      } else {
        gainNode.gain.setValueAtTime(baseVolume, this.audioContext.currentTime);
      }

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + options.duration);

      // Clean up
      return new Promise<void>((resolve) => {
        oscillator.onended = () => {
          try {
            oscillator.disconnect();
            gainNode.disconnect();
          } catch (e) {
            // Ignore disconnection errors
          }
          resolve();
        };
      });
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  }

  static async playTaskComplete() {
    if (!this.userInteracted) return;
    
    // Fortnite chest opening sequence
    // Initial "click" sound
    this.playOscillator({
      type: 'square',
      frequency: 200,
      duration: 0.1,
      fadeOut: true
    });

    // Rising "whoosh"
    setTimeout(() => {
      this.playOscillator({
        type: 'sine',
        frequency: 300,
        duration: 0.3,
        sweep: { endFreq: 600 },
        fadeOut: true
      });
    }, 100);

    // Magical chime
    setTimeout(() => {
      this.playOscillator({
        type: 'sine',
        frequency: 800,
        duration: 0.4,
        fadeOut: true
      });
    }, 300);
  }

  static async playSpiritual() {
    if (!this.userInteracted) return;
    
    // Sacred bell sequence
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
    
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.playOscillator({
          type: 'sine',
          frequency: freq,
          duration: 1.2,
          fadeOut: true,
          volume: 0.8
        });
      }, index * 300);
    });
  }

  static async playLevelUp() {
    if (!this.userInteracted) return;
    
    // Epic achievement fanfare
    const melody = [
      { freq: 261.63, dur: 0.2 }, // C4
      { freq: 329.63, dur: 0.2 }, // E4
      { freq: 392.00, dur: 0.2 }, // G4
      { freq: 523.25, dur: 0.6 }  // C5
    ];

    melody.forEach((note, index) => {
      setTimeout(() => {
        this.playOscillator({
          type: 'sine',
          frequency: note.freq,
          duration: note.dur,
          fadeOut: true
        });
      }, index * 150);
    });
  }

  static async playCombo(comboCount: number) {
    if (!this.userInteracted) return;
    
    // Increasing pitch with combo
    const baseFreq = 440;
    const freq = baseFreq + (comboCount * 50);
    
    this.playOscillator({
      type: 'sine',
      frequency: freq,
      duration: 0.3,
      fadeOut: true
    });
  }

  static async playStreak() {
    if (!this.userInteracted) return;
    
    // Fire-like crackling sound
    this.playOscillator({
      type: 'sawtooth',
      frequency: 150,
      duration: 0.5,
      sweep: { endFreq: 300 },
      fadeOut: true
    });
  }

  static async playAchievement() {
    if (!this.userInteracted) return;
    
    // Victory trumpet
    const notes = [
      { freq: 659.25, dur: 0.3 }, // E5
      { freq: 783.99, dur: 0.3 }, // G5
      { freq: 1046.50, dur: 0.6 } // C6
    ];

    notes.forEach((note, index) => {
      setTimeout(() => {
        this.playOscillator({
          type: 'sine',
          frequency: note.freq,
          duration: note.dur,
          fadeOut: true
        });
      }, index * 200);
    });
  }

  static async playPointsGain() {
    if (!this.userInteracted) return;
    
    // Quick ascending notes
    this.playOscillator({
      type: 'sine',
      frequency: 440,
      duration: 0.2,
      sweep: { endFreq: 880 },
      fadeOut: true
    });
  }

  static async playError() {
    if (!this.userInteracted) return;
    
    // Low error tone
    this.playOscillator({
      type: 'square',
      frequency: 200,
      duration: 0.4,
      fadeOut: true,
      volume: 0.6
    });
  }

  static async playSuccess() {
    if (!this.userInteracted) return;
    
    // Pleasant success chime
    this.playOscillator({
      type: 'sine',
      frequency: 800,
      duration: 0.3,
      fadeOut: true
    });
  }

  // Public method to check if audio is ready
  static isReady(): boolean {
    return this.initialized && this.userInteracted && this.audioContext !== null;
  }

  // Public method to get audio context state
  static getState(): string {
    if (!this.audioContext) return 'not-initialized';
    return this.audioContext.state;
  }
}