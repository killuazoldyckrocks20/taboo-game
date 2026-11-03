/**
 * TABOO GAME - LOCAL ROUND AUDIO RECORDER & PLAYBACK ENGINE
 * Strictly local in-memory recording for dispute resolution.
 * Zero network transmission; audio blobs are revoked and cleared when the match ends.
 */

const AudioRecorder = {
  stream: null,
  mediaRecorder: null,
  recordedChunks: [],
  currentAudioUrl: null,
  allAudioUrls: [],
  isRecording: false,
  startTime: null,
  duration: 0,
  audioEl: null,
  isPlaying: false,

  // Check if browser supports audio recording
  isSupported: function() {
    return Boolean(navigator.mediaDevices && window.MediaRecorder);
  },

  // Request mic permission and setup stream
  requestPermission: async function() {
    if (!this.isSupported()) {
      throw new Error("Audio recording is not supported in this browser.");
    }
    if (this.stream) return true;

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      return true;
    } catch (err) {
      console.warn("Microphone access denied or error:", err);
      return false;
    }
  },

  // Pick optimal supported MIME type
  getSupportedMimeType: function() {
    if (!window.MediaRecorder) return "";
    const types = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
      "audio/aac",
      "audio/ogg"
    ];
    for (const t of types) {
      if (MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t)) {
        return t;
      }
    }
    return "";
  },

  // Start recording the round
  startRecording: async function() {
    const granted = await this.requestPermission();
    if (!granted || !this.stream) {
      return false;
    }

    try {
      const mimeType = this.getSupportedMimeType();
      const options = mimeType ? { mimeType: mimeType } : {};
      
      this.mediaRecorder = new MediaRecorder(this.stream, options);
      this.recordedChunks = [];
      this.startTime = Date.now();
      this.isRecording = true;

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(250); // Slice every 250ms for smooth collection
      return true;
    } catch (e) {
      console.error("Failed to start MediaRecorder:", e);
      this.isRecording = false;
      return false;
    }
  },

  // Stop recording and return local blob URL
  stopRecording: function() {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === "inactive") {
        this.isRecording = false;
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        this.isRecording = false;
        this.duration = Math.round((Date.now() - (this.startTime || Date.now())) / 1000);
        
        const mimeType = (this.mediaRecorder && this.mediaRecorder.mimeType) || "audio/webm";
        const blob = new Blob(this.recordedChunks, { type: mimeType });
        this.recordedChunks = [];

        if (blob.size === 0) {
          resolve(null);
          return;
        }

        // Revoke previous turn's active URL if necessary
        if (this.currentAudioUrl) {
          // Keep in history list for total cleanup
          this.allAudioUrls.push(this.currentAudioUrl);
        }

        this.currentAudioUrl = URL.createObjectURL(blob);
        this.allAudioUrls.push(this.currentAudioUrl);

        resolve({
          url: this.currentAudioUrl,
          duration: this.duration,
          blob: blob
        });
      };

      try {
        this.mediaRecorder.stop();
      } catch (e) {
        this.isRecording = false;
        resolve(null);
      }
    });
  },

  // Audio Playback Controller
  getAudioElement: function() {
    if (!this.audioEl) {
      this.audioEl = new Audio();
      this.audioEl.addEventListener("ended", () => {
        this.isPlaying = false;
        if (this.onPlaybackStateChange) this.onPlaybackStateChange(false);
      });
      this.audioEl.addEventListener("timeupdate", () => {
        if (this.onTimeUpdate) {
          this.onTimeUpdate(this.audioEl.currentTime, this.audioEl.duration || this.duration);
        }
      });
    }
    return this.audioEl;
  },

  play: function(url) {
    const audio = this.getAudioElement();
    const playUrl = url || this.currentAudioUrl;
    if (!playUrl) return;

    if (audio.src !== playUrl) {
      audio.src = playUrl;
    }

    audio.play().then(() => {
      this.isPlaying = true;
      if (this.onPlaybackStateChange) this.onPlaybackStateChange(true);
    }).catch(err => {
      console.warn("Audio playback error:", err);
    });
  },

  pause: function() {
    if (this.audioEl) {
      this.audioEl.pause();
      this.isPlaying = false;
      if (this.onPlaybackStateChange) this.onPlaybackStateChange(false);
    }
  },

  togglePlay: function(url) {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play(url);
    }
  },

  seek: function(seconds) {
    if (this.audioEl && this.audioEl.duration) {
      this.audioEl.currentTime = Math.max(0, Math.min(seconds, this.audioEl.duration));
    }
  },

  skip: function(offsetSec) {
    if (this.audioEl) {
      this.seek(this.audioEl.currentTime + offsetSec);
    }
  },

  // Completely wipe all audio blobs and release microphone on match completion
  clearAll: function() {
    if (this.audioEl) {
      this.audioEl.pause();
      this.audioEl.src = "";
      this.isPlaying = false;
    }
    this.allAudioUrls.forEach(url => {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {}
    });
    this.allAudioUrls = [];
    this.currentAudioUrl = null;
    this.recordedChunks = [];
    this.isRecording = false;

    // Release microphone tracks
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }
};
