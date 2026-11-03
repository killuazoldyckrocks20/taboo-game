/**
 * TABOO GAME - WEBRTC PEER-TO-PEER MULTI-DEVICE CONTROLLER
 * Connects 2 phones directly via WebRTC Data Channels (using PeerJS).
 * Secured with a Party Code & Security Passcode to prevent strangers from joining.
 */

const P2PEngine = {
  peer: null,
  conn: null,
  role: null, // 'host' | 'client' | null
  roomCode: null, // Party Code
  passcode: null, // Security Passcode / PIN
  isConnected: false,
  isAuthenticated: false,
  myTeamIdx: 0, // 0 for Team 1 (Host), 1 for Team 2 (Client)
  onMessageHandlers: {},

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

  // Initialize Host (Device 1 - Team 1)
  initHost: function(customCode, customPasscode) {
    return new Promise((resolve, reject) => {
      this.disconnect();
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
          reject(new Error("Peer connection timed out. Please check internet connection."));
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
          const startBtn = document.getElementById("btn-p2p-host-start");
          if (startBtn) startBtn.style.display = "block";
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
      const startBtn = document.getElementById("btn-p2p-host-start");
      if (startBtn) startBtn.style.display = "none";
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
      this.role = "client";
      this.myTeamIdx = 1; // Client = Team 2
      this.roomCode = code;
      this.passcode = pass;
      this.isAuthenticated = false;
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

    const joinStatus = document.getElementById("p2p-join-status");
    if (joinStatus && this.role === "client") {
      joinStatus.textContent = text;
      joinStatus.className = `p2p-status-pill p2p-status-${stateClass}`;
    }

    // Also update in-game badge
    const gameBadge = document.getElementById("p2p-ingame-badge");
    if (gameBadge) {
      if (this.isConnected && this.isAuthenticated) {
        gameBadge.style.display = "flex";
        gameBadge.textContent = this.role === "host" ? "📱 P2P (Team 1)" : "📱 P2P (Team 2)";
      } else {
        gameBadge.style.display = "none";
      }
    }
  },

  disconnect: function() {
    this.isConnected = false;
    this.isAuthenticated = false;
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