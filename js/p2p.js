/**
 * TABOO GAME - WEBRTC PEER-TO-PEER MULTI-DEVICE CONTROLLER
 * Connects 2 phones directly via WebRTC Data Channels (using PeerJS).
 * Real-time active card sync, independent dual-device scoring, and dispute reconciliation.
 */

const P2PEngine = {
  peer: null,
  conn: null,
  role: null, // 'host' | 'client' | null
  roomCode: null,
  isConnected: false,
  myTeamIdx: 0, // 0 for Team 1 (Host), 1 for Team 2 (Client)
  onMessageHandlers: {},

  // Generate random 4-digit room code
  generateRoomCode: function() {
    return Math.floor(1000 + Math.random() * 9000).toString();
  },

  formatPeerId: function(code) {
    return `taboo-game-room-${code}-host`;
  },

  // Initialize Host (Device 1 - Team 1)
  initHost: function(customCode) {
    return new Promise((resolve, reject) => {
      this.disconnect();
      this.role = "host";
      this.myTeamIdx = 0; // Host = Team 1
      this.roomCode = customCode || this.generateRoomCode();
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
          reject(new Error("Peer connection timed out. Please check internet connection."));
        }
      }, 12000);

      this.peer.on("open", (id) => {
        clearTimeout(timeout);
        this.updateConnectionStatus("Waiting for Team 2 to join...", "waiting");
        resolve(this.roomCode);
      });

      this.peer.on("connection", (c) => {
        this.conn = c;
        this.setupConnectionListeners();
      });

      this.peer.on("error", (err) => {
        clearTimeout(timeout);
        console.warn("PeerJS Host Error:", err);
        // If ID taken, retry with new random code
        if (err.type === "unavailable-id") {
          this.initHost(this.generateRoomCode()).then(resolve).catch(reject);
        } else {
          reject(err);
        }
      });
    });
  },

  // Initialize Client / Joiner (Device 2 - Team 2)
  joinRoom: function(roomCode) {
    return new Promise((resolve, reject) => {
      if (!roomCode) {
        reject(new Error("Please enter a 4-digit room code."));
        return;
      }

      this.disconnect();
      this.role = "client";
      this.myTeamIdx = 1; // Client = Team 2
      this.roomCode = roomCode.trim().toUpperCase().replace("TABOO-", "");
      const hostPeerId = this.formatPeerId(this.roomCode);

      try {
        // Random client ID
        this.peer = new Peer({
          debug: 1
        });
      } catch (err) {
        reject(err);
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error("Could not find host with room code " + this.roomCode));
      }, 12000);

      this.peer.on("open", () => {
        this.updateConnectionStatus("Connecting to host...", "connecting");
        this.conn = this.peer.connect(hostPeerId, {
          reliable: true
        });

        this.conn.on("open", () => {
          clearTimeout(timeout);
          this.isConnected = true;
          this.setupConnectionListeners();
          this.updateConnectionStatus("Connected to Team 1!", "connected");
          // Send handshake
          this.send("CLIENT_HELLO", { teamName: "Team Blue 🔷" });
          resolve(this.roomCode);
        });

        this.conn.on("error", (err) => {
          clearTimeout(timeout);
          reject(err);
        });
      });

      this.peer.on("error", (err) => {
        clearTimeout(timeout);
        reject(err);
      });
    });
  },

  setupConnectionListeners: function() {
    if (!this.conn) return;

    this.conn.on("open", () => {
      this.isConnected = true;
      this.updateConnectionStatus("Devices Connected! Ready to play.", "connected");
      if (this.onConnect) this.onConnect();
    });

    this.conn.on("data", (data) => {
      if (!data || !data.type) return;
      this.handleIncomingMessage(data);
    });

    this.conn.on("close", () => {
      this.isConnected = false;
      this.updateConnectionStatus("Other device disconnected.", "disconnected");
      if (this.onDisconnect) this.onDisconnect();
    });
  },

  send: function(type, payload = {}) {
    if (this.conn && this.conn.open) {
      try {
        this.conn.send({
          type: type,
          payload: payload,
          senderRole: this.role,
          timestamp: Date.now()
        });
      } catch (e) {
        console.warn("Failed to send P2P message:", e);
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

    // Also update in-game badge
    const gameBadge = document.getElementById("p2p-ingame-badge");
    if (gameBadge) {
      if (this.isConnected) {
        gameBadge.style.display = "flex";
        gameBadge.textContent = this.role === "host" ? "📱 P2P (Team 1)" : "📱 P2P (Team 2)";
      } else {
        gameBadge.style.display = "none";
      }
    }
  },

  disconnect: function() {
    this.isConnected = false;
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
  }
};
