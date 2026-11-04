/**
 * TABOO GAME - WEBRTC PEER-TO-PEER MULTI-DEVICE CONTROLLER
 * Connects 2 devices directly via WebRTC Data Channels.
 * Supports:
 * 1. Online / Hotspot Mode (with 4-digit Party Code + Passcode via PeerJS signaling)
 * 2. 100% Offline Hotspot / Zero-Internet QR Mode (Air-Gapped native WebRTC signaling with camera scan or text)
 */

const P2PEngine = {
  peer: null,
  conn: null,
  rawPeerConnection: null,
  rawDataChannel: null,
  isOfflineMode: false,
  role: null, // 'host' | 'client' | null
  roomCode: null, // Party Code
  passcode: null, // Security Passcode / PIN
  isConnected: false,
  isAuthenticated: false,
  myTeamIdx: 0, // 0 for Team 1 (Host), 1 for Team 2 (Client)
  onMessageHandlers: {},

  // QR Scanner references
  qrScanStream: null,
  qrScanTimer: null,

  // Generate random 4-digit room code
  generateRoomCode: function() {
    return Math.floor(1000 + Math.random() * 9000).toString();
  },

  // Generate random 4-digit security passcode
  generatePasscode: function() {
    return Math.floor(1000 + Math.random() * 9000).toString();
  },

  formatPeerId: function(code) {
    return `taboo-game-room-${code}-host`;
  },

  setHostStartButtonsVisible: function(visible) {
    const b1 = document.getElementById("btn-p2p-host-start");
    const b2 = document.getElementById("btn-p2p-offline-start");
    const display = visible ? "block" : "none";
    if (b1) b1.style.display = display;
    if (b2) b2.style.display = display;
  },

  // =============================================================
  // MODE 1: ONLINE / HOTSPOT PEERJS (4-DIGIT CODE + PASSCODE)
  // =============================================================

  // Initialize Host (Device 1 - Team 1)
  initHost: function(customCode, customPasscode) {
    return new Promise((resolve, reject) => {
      this.disconnect();
      this.isOfflineMode = false;
      this.role = "host";
      this.myTeamIdx = 0; // Host = Team 1
      this.roomCode = customCode || this.generateRoomCode();
      this.passcode = customPasscode || this.generatePasscode();
      this.isAuthenticated = true; // Host is owner

      const peerId = this.formatPeerId(this.roomCode);

      try {
        this.peer = new Peer(peerId, {
          debug: 1
        });
      } catch (err) {
        reject(err);
        return;
      }

      const timeout = setTimeout(() => {
        if (!this.peer || !this.peer.id) {
          reject(new Error("Peer connection timed out. Please check internet/hotspot connection."));
        }
      }, 12000);

      this.peer.on("open", () => {
        clearTimeout(timeout);
        this.updateConnectionStatus("Waiting for Team 2 to join with Passcode...", "waiting");
        resolve({
          roomCode: this.roomCode,
          passcode: this.passcode
        });
      });

      this.peer.on("connection", (c) => {
        // If host already has an active, authenticated peer connection, reject excess connections
        if (this.conn && this.conn.open && this.isConnected) {
          c.on("open", () => {
            c.send({
              type: "AUTH_REJECTED",
              payload: { reason: "Game party is already full (2 devices active)." }
            });
            setTimeout(() => c.close(), 600);
          });
          return;
        }

        this.conn = c;
        this.setupHostListeners();
      });

      this.peer.on("error", (err) => {
        clearTimeout(timeout);
        console.warn("PeerJS Host Error:", err);
        // If ID taken, retry with new random code
        if (err.type === "unavailable-id") {
          this.initHost(this.generateRoomCode(), this.passcode).then(resolve).catch(reject);
        } else {
          reject(err);
        }
      });
    });
  },

  // Setup listeners on Host to verify client passcode
  setupHostListeners: function() {
    if (!this.conn) return;

    this.conn.on("open", () => {
      this.updateConnectionStatus("Verifying Team 2 passcode...", "waiting");
    });

    this.conn.on("data", (data) => {
      if (!data || !data.type) return;

      // Handle Authentication Request from joiner
      if (data.type === "AUTH_REQUEST") {
        const submittedPass = data.payload && String(data.payload.passcode).trim();
        const expectedPass = String(this.passcode).trim();

        if (submittedPass === expectedPass) {
          this.isConnected = true;
          this.send("AUTH_ACCEPTED", { hostTeam: "Team Orange 🍊" });
          this.updateConnectionStatus("Team 2 verified with passcode! Ready to play.", "connected");
          this.setHostStartButtonsVisible(true);
          if (this.onConnect) this.onConnect();
        } else {
          // Reject stranger
          this.send("AUTH_REJECTED", { reason: "Incorrect passcode! Strangers are not allowed." });
          this.updateConnectionStatus("Stranger rejected (wrong passcode).", "disconnected");
          setTimeout(() => {
            if (this.conn) {
              try { this.conn.close(); } catch (e) {}
              this.conn = null;
            }
          }, 800);
        }
        return;
      }

      // If not yet verified, ignore other gameplay messages
      if (!this.isConnected) return;

      this.handleIncomingMessage(data);
    });

    this.conn.on("close", () => {
      this.isConnected = false;
      this.updateConnectionStatus("Team 2 disconnected.", "disconnected");
      this.setHostStartButtonsVisible(false);
      if (this.onDisconnect) this.onDisconnect();
    });
  },

  // Initialize Client / Joiner (Device 2 - Team 2)
  joinRoom: function(roomCode, passcode) {
    return new Promise((resolve, reject) => {
      const code = roomCode ? String(roomCode).trim().toUpperCase().replace("TABOO-", "") : "";
      const pass = passcode ? String(passcode).trim() : "";

      if (!code) {
        reject(new Error("Please enter the 4-digit Party Code."));
        return;
      }
      if (!pass) {
        reject(new Error("Please enter the 4-digit Passcode."));
        return;
      }

      this.disconnect();
      this.isOfflineMode = false;
      this.role = "client";
      this.myTeamIdx = 1; // Client = Team 2
      this.roomCode = code;
      this.passcode = pass;
      this.isAuthenticated = false;
      const hostPeerId = this.formatPeerId(this.roomCode);

      try {
        this.peer = new Peer({
          debug: 1
        });
      } catch (err) {
        reject(err);
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error("Could not find host with party code " + this.roomCode + ". Check code and connection."));
      }, 14000);

      this.peer.on("open", () => {
        this.updateConnectionStatus("Connecting to party...", "waiting");
        this.conn = this.peer.connect(hostPeerId, {
          reliable: true
        });

        this.conn.on("open", () => {
          this.updateConnectionStatus("Submitting passcode to host...", "waiting");
          // Immediately send authentication handshake
          this.send("AUTH_REQUEST", {
            partyCode: this.roomCode,
            passcode: this.passcode
          });
        });

        this.conn.on("data", (data) => {
          if (!data || !data.type) return;

          if (data.type === "AUTH_ACCEPTED") {
            clearTimeout(timeout);
            this.isAuthenticated = true;
            this.isConnected = true;
            this.updateConnectionStatus("Passcode verified! Connected to Team 1.", "connected");
            // Send client hello
            this.send("CLIENT_HELLO", { teamName: "Team Blue 🔷" });
            if (this.onConnect) this.onConnect();
            resolve({ roomCode: this.roomCode, passcode: this.passcode });
            return;
          }

          if (data.type === "AUTH_REJECTED") {
            clearTimeout(timeout);
            this.isAuthenticated = false;
            this.isConnected = false;
            const reason = (data.payload && data.payload.reason) || "Incorrect passcode! Access denied.";
            this.updateConnectionStatus(reason, "disconnected");
            if (this.conn) {
              try { this.conn.close(); } catch (e) {}
              this.conn = null;
            }
            reject(new Error(reason));
            return;
          }

          // If authenticated, route game events
          if (this.isAuthenticated) {
            this.handleIncomingMessage(data);
          }
        });

        this.conn.on("error", (err) => {
          clearTimeout(timeout);
          reject(err);
        });

        this.conn.on("close", () => {
          this.isConnected = false;
          this.isAuthenticated = false;
          this.updateConnectionStatus("Disconnected from host.", "disconnected");
          if (this.onDisconnect) this.onDisconnect();
        });
      });

      this.peer.on("error", (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
  },

  // =============================================================
  // MODE 2: ZERO-INTERNET AIR-GAPPED WEBRTC (OFFLINE QR PAIRING)
  // =============================================================

  compressSDP: function(sdp) {
    const lines = sdp.split(/\r?\n/);
    let ufrag = "", pwd = "", fingerprint = "", setup = "actpass", candidates = [];
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      if (l.indexOf("a=ice-ufrag:") === 0) ufrag = l.slice(12);
      else if (l.indexOf("a=ice-pwd:") === 0) pwd = l.slice(10);
      else if (l.indexOf("a=fingerprint:") === 0) fingerprint = l.slice(14);
      else if (l.indexOf("a=setup:") === 0) setup = l.slice(8);
      else if (l.indexOf("a=candidate:") === 0) candidates.push(l.slice(12));
    }
    return JSON.stringify({ u: ufrag, p: pwd, f: fingerprint, s: setup, c: candidates });
  },

  decompressSDP: function(jsonStr, type) {
    let cleanJson = jsonStr.trim();
    if (cleanJson.startsWith("TABOO_OFFER:") || cleanJson.startsWith("TABOO_ANSWER:")) {
      cleanJson = cleanJson.slice(cleanJson.indexOf(":") + 1);
    }
    const data = JSON.parse(cleanJson);
    const sdpLines = [
      "v=0",
      "o=- " + Date.now() + " 2 IN IP4 127.0.0.1",
      "s=-",
      "t=0 0",
      "a=group:BUNDLE 0",
      "m=application 9 UDP/DTLS/SCTP webrtc-datachannel",
      "c=IN IP4 0.0.0.0",
      "a=mid:0",
      "a=setup:" + (data.s || (type === "offer" ? "actpass" : "active")),
      "a=ice-ufrag:" + data.u,
      "a=ice-pwd:" + data.p,
      "a=fingerprint:" + data.f,
      "a=sctp-port:5000",
      "a=max-message-size:262144"
    ];
    if (Array.isArray(data.c)) {
      data.c.forEach(c => sdpLines.push("a=candidate:" + c));
    }
    return {
      type: type,
      sdp: sdpLines.join("\r\n") + "\r\n"
    };
  },

  parseSignalPayload: function(payloadStr, expectedType) {
    let text = payloadStr.trim();
    if (text.startsWith("TABOO_OFFER:") || text.startsWith("TABOO_ANSWER:")) {
      text = text.slice(text.indexOf(":") + 1);
    }
    try {
      const obj = JSON.parse(text);
      if (obj.sdp && obj.type) {
        return obj;
      }
      if (obj.u && obj.p && obj.f) {
        return this.decompressSDP(text, expectedType);
      }
    } catch (e) {}
    throw new Error("Invalid connection QR code / text.");
  },

  waitForIceGathering: function(pc) {
    return new Promise(resolve => {
      if (pc.iceGatheringState === "complete") {
        resolve();
      } else {
        const timeout = setTimeout(() => resolve(), 1200);
        function checkState() {
          if (pc.iceGatheringState === "complete") {
            clearTimeout(timeout);
            pc.removeEventListener("icegatheringstatechange", checkState);
            resolve();
          }
        }
        pc.addEventListener("icegatheringstatechange", checkState);
      }
    });
  },

  setupRawDataChannel: function(dc) {
    if (!dc) return;
    this.rawDataChannel = dc;

    dc.onopen = () => {
      this.isConnected = true;
      this.isAuthenticated = true;
      this.updateConnectionStatus("✈️ Connected via Offline WebRTC!", "connected");
      if (this.role === "client") {
        this.send("CLIENT_HELLO", { teamName: "Team Blue 🔷" });
      }
      if (this.role === "host") this.setHostStartButtonsVisible(true);
      if (this.onConnect) this.onConnect();
    };

    dc.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data && data.type) {
          this.handleIncomingMessage(data);
        }
      } catch (e) {
        console.warn("Offline message parse error:", e);
      }
    };

    dc.onclose = () => {
      this.isConnected = false;
      this.isAuthenticated = false;
      this.updateConnectionStatus("Offline device disconnected.", "disconnected");
      if (this.onDisconnect) this.onDisconnect();
    };
  },

  // Host: Step 1 - Generate local WebRTC Offer
  createOfflineOffer: async function() {
    this.disconnect();
    this.isOfflineMode = true;
    this.role = "host";
    this.myTeamIdx = 0;
    this.isAuthenticated = true;

    this.rawPeerConnection = new RTCPeerConnection({ iceServers: [] });
    const dc = this.rawPeerConnection.createDataChannel("taboo-game-sync", { ordered: true });
    this.setupRawDataChannel(dc);

    const offer = await this.rawPeerConnection.createOffer();
    await this.rawPeerConnection.setLocalDescription(offer);

    await this.waitForIceGathering(this.rawPeerConnection);

    const compressed = this.compressSDP(this.rawPeerConnection.localDescription.sdp);
    return "TABOO_OFFER:" + compressed;
  },

  // Joiner: Step 2 - Consume Offer and Generate Answer
  createOfflineAnswer: async function(offerPayload) {
    this.disconnect();
    this.isOfflineMode = true;
    this.role = "client";
    this.myTeamIdx = 1;
    this.isAuthenticated = true;

    this.rawPeerConnection = new RTCPeerConnection({ iceServers: [] });
    this.rawPeerConnection.ondatachannel = (e) => {
      this.setupRawDataChannel(e.channel);
    };

    const offerDesc = this.parseSignalPayload(offerPayload, "offer");
    await this.rawPeerConnection.setRemoteDescription(new RTCSessionDescription(offerDesc));

    const answer = await this.rawPeerConnection.createAnswer();
    await this.rawPeerConnection.setLocalDescription(answer);

    await this.waitForIceGathering(this.rawPeerConnection);

    const compressed = this.compressSDP(this.rawPeerConnection.localDescription.sdp);
    return "TABOO_ANSWER:" + compressed;
  },

  // Host: Step 3 - Apply Answer and finalize connection
  applyOfflineAnswer: async function(answerPayload) {
    if (!this.rawPeerConnection) throw new Error("Host connection not initialized.");
    const answerDesc = this.parseSignalPayload(answerPayload, "answer");
    await this.rawPeerConnection.setRemoteDescription(new RTCSessionDescription(answerDesc));
  },

  // Camera QR Scanner using jsQR
  startQRScanner: function(videoEl, onResult, onError) {
    this.stopQRScanner();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      if (onError) onError(new Error("Camera access not supported on this browser."));
      return;
    }

    navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } }
    }).then(stream => {
      this.qrScanStream = stream;
      videoEl.srcObject = stream;
      videoEl.setAttribute("playsinline", "true");
      videoEl.play();

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      this.qrScanTimer = setInterval(() => {
        if (videoEl.readyState === videoEl.HAVE_ENOUGH_DATA) {
          canvas.width = videoEl.videoWidth;
          canvas.height = videoEl.videoHeight;
          ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          if (typeof jsQR !== "undefined") {
            const code = jsQR(imageData.data, imageData.width, imageData.height);
            if (code && code.data && code.data.trim().length > 0) {
              this.stopQRScanner();
              onResult(code.data.trim());
            }
          }
        }
      }, 150);
    }).catch(err => {
      if (onError) onError(err);
    });
  },

  stopQRScanner: function() {
    if (this.qrScanTimer) {
      clearInterval(this.qrScanTimer);
      this.qrScanTimer = null;
    }
    if (this.qrScanStream) {
      this.qrScanStream.getTracks().forEach(t => t.stop());
      this.qrScanStream = null;
    }
  },

  // =============================================================
  // COMMON MESSAGING & DISCONNECT
  // =============================================================

  send: function(type, payload = {}) {
    const packet = {
      type: type,
      payload: payload,
      senderRole: this.role,
      timestamp: Date.now()
    };

    if (this.isOfflineMode) {
      if (this.rawDataChannel && this.rawDataChannel.readyState === "open") {
        try {
          this.rawDataChannel.send(JSON.stringify(packet));
        } catch (e) {
          console.warn("Offline P2P send error:", e);
        }
      }
    } else {
      if (this.conn && this.conn.open) {
        try {
          this.conn.send(packet);
        } catch (e) {
          console.warn("P2P send error:", e);
        }
      }
    }
  },

  handleIncomingMessage: function(msg) {
    const handler = this.onMessageHandlers[msg.type];
    if (handler) {
      handler(msg.payload, msg.senderRole);
    }
  },

  on: function(type, handler) {
    this.onMessageHandlers[type] = handler;
  },

  updateConnectionStatus: function(text, stateClass) {
    const el = document.getElementById("p2p-connection-status");
    if (el) {
      el.textContent = text;
      el.className = `p2p-status-pill p2p-status-${stateClass}`;
    }

    const joinStatus = document.getElementById("p2p-join-status");
    if (joinStatus && this.role === "client") {
      joinStatus.textContent = text;
      joinStatus.className = `p2p-status-pill p2p-status-${stateClass}`;
    }

    const offlineStatus = document.getElementById("p2p-offline-status");
    if (offlineStatus) {
      offlineStatus.textContent = text;
      offlineStatus.className = `p2p-status-pill p2p-status-${stateClass}`;
    }

    // Also update in-game badge
    const gameBadge = document.getElementById("p2p-ingame-badge");
    if (gameBadge) {
      if (this.isConnected && this.isAuthenticated) {
        gameBadge.style.display = "flex";
        const modeLabel = this.isOfflineMode ? "✈️ Offline" : "📱 P2P";
        gameBadge.textContent = `${modeLabel} (${this.role === "host" ? "Team 1" : "Team 2"})`;
      } else {
        gameBadge.style.display = "none";
      }
    }
  },

  disconnect: function() {
    this.stopQRScanner();
    this.setHostStartButtonsVisible(false);
    this.isConnected = false;
    this.isAuthenticated = false;
    this.isOfflineMode = false;

    if (this.rawDataChannel) {
      try { this.rawDataChannel.close(); } catch (e) {}
      this.rawDataChannel = null;
    }
    if (this.rawPeerConnection) {
      try { this.rawPeerConnection.close(); } catch (e) {}
      this.rawPeerConnection = null;
    }
    if (this.conn) {
      try { this.conn.close(); } catch (e) {}
      this.conn = null;
    }
    if (this.peer) {
      try { this.peer.destroy(); } catch (e) {}
      this.peer = null;
    }
    this.role = null;
    this.roomCode = null;
    this.passcode = null;
  }
};