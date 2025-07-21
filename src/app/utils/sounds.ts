export class SoundEngine {
  private static audioContext: AudioContext | null = null;
  private static gainNode: GainNode | null = null;

  static initialize(volume: number = 75) {
    if (this.audioContext) {
      // If context exists but is suspended, resume it
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      this.setVolume(volume);
      return;
    }

    try {
      // @ts-expect-error - Safari support
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.setVolume(volume);
    } catch (error) {
      console.log('Audio not supported');
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
    if (!this.audioContext || !this.gainNode) return;

    // Resume context if suspended
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
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
        oscillator.disconnect();
        gainNode.disconnect();
        resolve();
      };
    });
  }

  static async playTaskComplete() {
    // Fortnite chest opening sequence
    const time = this.audioContext?.currentTime || 0;
    
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

    // Magical sparkle sounds
    const sparkleNotes = [1200, 1400, 1600, 1800];
    sparkleNotes.forEach((freq, i) => {
      setTimeout(() => {
        this.playOscillator({
          type: 'triangle',
          frequency: freq,
          duration: 0.15,
          fadeOut: true
        });
      }, 200 + i * 50);
    });

    // Final "pop" with reverb
    setTimeout(() => {
      this.playOscillator({
        type: 'sine',
        frequency: 800,
        duration: 0.4,
        fadeOut: true
      });
      this.playOscillator({
        type: 'triangle',
        frequency: 1200,
        duration: 0.3,
        fadeOut: true
      });
    }, 400);
  }

  static async playLevelUp() {
    // Epic level up fanfare inspired by Final Fantasy
    const fanfare = [
      { freq: 196.00, // G3
        duration: 0.2 },
      { freq: 246.94, // B3
        duration: 0.2 },
      { freq: 293.66, // D4
        duration: 0.3 },
      { freq: 392.00, // G4
        duration: 0.4 }
    ];

    fanfare.forEach((note, i) => {
      setTimeout(() => {
        // Main brass-like tone
        this.playOscillator({
          type: 'square',
          frequency: note.freq,
          duration: note.duration,
          fadeOut: true
        });

        // Rich undertone
        this.playOscillator({
          type: 'sine',
          frequency: note.freq / 2,
          duration: note.duration,
          fadeOut: true
        });

        // Shimmer overtone
        if (i > 1) {
          this.playOscillator({
            type: 'triangle',
            frequency: note.freq * 1.5,
            duration: note.duration,
            fadeOut: true
          });
        }
      }, i * 150);
    });
  }

  static async playCombo(count: number) {
    // Deep, satisfying combo sound inspired by games like God of War
    const baseFreq = 150 + (count * 20); // Keep the base frequency low
    
    // Deep impact
    this.playOscillator({
      type: 'sine',
      frequency: baseFreq,
      duration: 0.2,
      fadeOut: true
    });

    // Power up sweep
    setTimeout(() => {
      this.playOscillator({
        type: 'sine',
        frequency: baseFreq * 1.5,
        duration: 0.3,
        sweep: { endFreq: baseFreq * 2 },
        fadeOut: true
      });
    }, 100);

    // Resonant bass
    setTimeout(() => {
      this.playOscillator({
        type: 'triangle',
        frequency: baseFreq / 2,
        duration: 0.4,
        fadeOut: true
      });
    }, 200);
  }

  static async playStreak() {
    // Epic streak sound inspired by Halo shield recharge
    const baseTones = [
      { freq: 200, duration: 0.4 },
      { freq: 300, duration: 0.3 },
      { freq: 400, duration: 0.2 }
    ];

    baseTones.forEach((tone, i) => {
      setTimeout(() => {
        // Bass layer
        this.playOscillator({
          type: 'sine',
          frequency: tone.freq,
          duration: tone.duration,
          sweep: { endFreq: tone.freq * 1.2 },
          fadeOut: true
        });

        // Resonance layer
        this.playOscillator({
          type: 'triangle',
          frequency: tone.freq * 1.5,
          duration: tone.duration,
          fadeOut: true
        });
      }, i * 150);
    });
  }

  static async playSpiritual() {
    // Zen-like meditation bowl sound
    const frequencies = [
      { freq: 196.0, // G3
        duration: 0.8 },
      { freq: 294.7, // D4
        duration: 0.7 },
      { freq: 392.0, // G4
        duration: 0.6 }
    ];

    frequencies.forEach((tone, i) => {
      setTimeout(() => {
        // Main tone
        this.playOscillator({
          type: 'sine',
          frequency: tone.freq,
          duration: tone.duration,
          fadeOut: true
        });

        // Harmonic overtone
        this.playOscillator({
          type: 'sine',
          frequency: tone.freq * 1.5,
          duration: tone.duration * 0.8,
          fadeOut: true
        });
      }, i * 200);
    });
  }

  static async playAchievement() {
    // Epic orchestral achievement sound
    const sequence = [
      { freq: 130.81, // C3
        duration: 0.4 },
      { freq: 196.00, // G3
        duration: 0.4 },
      { freq: 261.63, // C4
        duration: 0.6 }
    ];

    sequence.forEach((note, i) => {
      setTimeout(() => {
        // Bass note
        this.playOscillator({
          type: 'sine',
          frequency: note.freq,
          duration: note.duration,
          fadeOut: true
        });

        // Rich harmonics
        this.playOscillator({
          type: 'triangle',
          frequency: note.freq * 2,
          duration: note.duration,
          fadeOut: true
        });

        // Shimmer effect
        if (i === sequence.length - 1) {
          this.playOscillator({
            type: 'sine',
            frequency: note.freq * 3,
            duration: note.duration * 1.5,
            fadeOut: true
          });
        }
      }, i * 200);
    });
  }

  static async playPointsGain() {
    // Satisfying coin collection sound
    const metallic = [
      { freq: 220, // A3
        duration: 0.15 },
      { freq: 277.18, // C#4
        duration: 0.2 },
      { freq: 329.63, // E4
        duration: 0.25 }
    ];

    metallic.forEach((note, i) => {
      setTimeout(() => {
        // Metallic ping
        this.playOscillator({
          type: 'triangle',
          frequency: note.freq,
          duration: note.duration,
          fadeOut: true
        });

        // Rich undertone
        this.playOscillator({
          type: 'sine',
          frequency: note.freq / 2,
          duration: note.duration,
          fadeOut: true
        });
      }, i * 80);
    });
  }
} 