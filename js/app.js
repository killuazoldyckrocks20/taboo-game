/**
 * TABOO PARTY GAME - MASTER APPLICATION ENGINE
 * Complete Game State Machine, Turn Cycling, Dispute Resolution & UI Controller
 */

const TabooApp = {
  // Global Game Configuration
  config: {
    gameFormat: "teams", // "teams" | "ffa"
    roundDuration: 60,
    targetScore: 30,
    isFixedRounds: false,
    maxRounds: 3,
    skipPenalty: -1, // default -1 pt
    tabooPenalty: -2, // default -2 pts
    skipLimit: 0, // 0 = unlimited
    selectedCategory: "All",
    soundEnabled: true,
    vibrationEnabled: true,
    recordAudio: false,
    configVersion: 2
  },

  // Game Match State
  state: {
    teams: [
      { id: 1, name: "Team Orange 🍊", color: "var(--team-orange)", score: 0 },
      { id: 2, name: "Team Blue 🔷", color: "var(--team-blue)", score: 0 }
    ],
    players: [
      { id: 1, name: "Player 1", color: "#f97316", score: 0 },
      { id: 2, name: "Player 2", color: "#3b82f6", score: 0 },
      { id: 3, name: "Player 3", color: "#10b981", score: 0 },
      { id: 4, name: "Player 4", color: "#8b5cf6", score: 0 }
    ],
    ffaTurnIndex: 0,
    isWordScorePaused: false,
    currentTeamIdx: 0,
    roundNumber: 1,
    isGameOver: false,
    winner: null,
    roundAudioUrl: null,

    // Active Turn State
    deck: [],
    currentCardIdx: 0,
    timeLeft: 60,
    timerId: null,
    isPaused: false,
    skipsUsedThisTurn: 0,
    turnCards: [], // { card, status: 'correct'|'taboo'|'skip', hostVote, peerVote, originalStatus }
    currentCardVotes: { hostVote: null, peerVote: null }
  },

  currentOfflineSignalCode: "",

  init: function() {
    SoundEngine.loadMuteState();
    this.loadSavedSettings();
    this.setupEventListeners();
    this.setupP2PListeners();
    this.renderCategoryChips();
    this.renderPlayersSetupList();
    this.showScreen("screen-welcome");
    this.checkAndDisplayResumeBanner();
    ConfettiEngine.init();
    this.checkUrlForRoomCode();
  },

  // ==========================================
  // NAVIGATION & SCREEN SWITCHING
  // ==========================================
  showScreen: function(screenId) {
    // If this device is the client (Device 2 in P2P), block access to setup screen!
    if (P2PEngine.isConnected && P2PEngine.role === "client" && screenId === "screen-setup") {
      this.showToast("Match settings are managed by Team 1's phone.");
      this.showScreen("screen-p2p-lobby");
      return;
    }

    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    const target = document.getElementById(screenId);
    if (target) {
      target.classList.add("active");
    }
    if (screenId === "screen-welcome") {
      this.checkAndDisplayResumeBanner();
    }
  },

  showModal: function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add("active");
      if (modalId === "modal-custom-cards") {
        this.renderCustomCardsList();
      }
    }
  },

  closeModal: function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove("active");
    }
    if (modalId === "modal-dual-device") {
      P2PEngine.stopQRScanner();
      const cam = document.getElementById("p2p-camera-container");
      if (cam) cam.style.display = "none";
    }
  },

  showToast: function(message, duration = 2500) {
    const container = document.getElementById("toast-container");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.3s ease";
      setTimeout(() => {
        if (toast.remove) {
          toast.remove();
        } else if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, duration);
  },

  // ==========================================
  // SETUP SCREEN LOGIC
  // ==========================================
  renderCategoryChips: function() {
    const container = document.getElementById("category-chips-container");
    if (!container) return;
    container.innerHTML = "";

    const categories = ["All", ...CardDB.getCategories()];
    categories.forEach(cat => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = `category-chip ${this.config.selectedCategory === cat ? "active" : ""}`;
      chip.textContent = cat;
      chip.addEventListener("click", () => {
        document.querySelectorAll(".category-chip").forEach(c => c.classList.remove("active"));
        chip.classList.add("active");
        this.config.selectedCategory = cat;
        this.saveSettings();
      });
      container.appendChild(chip);
    });
  },

  addTeam: function() {
    if (this.state.teams.length >= 4) {
      this.showToast("Maximum 4 teams allowed!");
      return;
    }
    const colors = ["var(--team-orange)", "var(--team-blue)", "var(--team-green)", "var(--team-purple)"];
    const names = ["Team Green 🍏", "Team Purple 🍇"];
    const newIdx = this.state.teams.length;
    this.state.teams.push({
      id: newIdx + 1,
      name: names[newIdx - 2] || `Team ${newIdx + 1}`,
      color: colors[newIdx] || "var(--team-orange)",
      score: 0
    });
    this.renderTeamsSetupList();
  },

  removeTeam: function(idx) {
    if (this.state.teams.length <= 2) {
      this.showToast("At least 2 teams required!");
      return;
    }
    this.state.teams.splice(idx, 1);
    this.renderTeamsSetupList();
  },

  renderTeamsSetupList: function() {
    const container = document.getElementById("teams-setup-list");
    if (!container) return;
    container.innerHTML = "";

    this.state.teams.forEach((team, idx) => {
      const row = document.createElement("div");
      row.className = "team-input-row";
      row.innerHTML = `
        <div class="team-color-indicator" style="background: ${team.color};"></div>
        <input type="text" class="team-name-input" value="${team.name}" placeholder="Team Name">
        ${this.state.teams.length > 2 ? `<button type="button" class="btn-ghost text-red-400" data-remove-idx="${idx}">✕</button>` : ""}
      `;

      const input = row.querySelector(".team-name-input");
      if (input) {
        input.addEventListener("input", (e) => {
          team.name = e.target.value.trim() || `Team ${idx + 1}`;
        });
      }

      const removeBtn = row.querySelector("[data-remove-idx]");
      if (removeBtn) {
        removeBtn.addEventListener("click", () => this.removeTeam(idx));
      }

      container.appendChild(row);
    });
  },

  renderPlayersSetupList: function() {
    const container = document.getElementById("ffa-players-setup-list");
    if (!container) return;
    container.innerHTML = "";

    this.state.players.forEach((player, idx) => {
      const row = document.createElement("div");
      row.className = "team-input-row";
      row.innerHTML = `
        <div class="team-color-indicator" style="background: ${player.color};"></div>
        <input type="text" class="team-name-input" value="${player.name}" placeholder="Player Name">
        ${this.state.players.length > 3 ? `<button type="button" class="btn-ghost text-red-400" data-remove-player-idx="${idx}">✕</button>` : ""}
      `;

      const input = row.querySelector(".team-name-input");
      if (input) {
        input.addEventListener("input", (e) => {
          player.name = e.target.value.trim() || `Player ${idx + 1}`;
          this.saveSettings();
        });
      }

      const removeBtn = row.querySelector("[data-remove-player-idx]");
      if (removeBtn) {
        removeBtn.addEventListener("click", () => this.removePlayer(idx));
      }

      container.appendChild(row);
    });
  },

  addPlayer: function() {
    if (this.state.players.length >= 8) {
      this.showToast("Maximum 8 players allowed!");
      return;
    }
    const colors = ["#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899", "#f59e0b", "#06b6d4", "#84cc16"];
    const idx = this.state.players.length;
    this.state.players.push({
      id: Date.now() + idx,
      name: `Player ${idx + 1}`,
      color: colors[idx % colors.length],
      score: 0
    });
    this.renderPlayersSetupList();
    this.saveSettings();
  },

  removePlayer: function(idx) {
    if (this.state.players.length <= 3) {
      this.showToast("At least 3 players required for Free-For-All mode!");
      return;
    }
    this.state.players.splice(idx, 1);
    this.renderPlayersSetupList();
    this.saveSettings();
  },

  getCurrentClueGiver: function() {
    if (this.config.gameFormat === "ffa") {
      const count = this.state.players.length;
      return this.state.players[this.state.ffaTurnIndex % count];
    }
    return { name: this.state.teams[this.state.currentTeamIdx].name, color: this.state.teams[this.state.currentTeamIdx].color };
  },

  getCurrentMonitor: function() {
    if (this.config.gameFormat === "ffa") {
      const count = this.state.players.length;
      return this.state.players[(this.state.ffaTurnIndex + 1) % count];
    }
    return { name: "Opponent", color: "var(--team-blue)" };
  },

  getCurrentGuessers: function() {
    if (this.config.gameFormat === "ffa") {
      const cg = this.getCurrentClueGiver();
      const mon = this.getCurrentMonitor();
      return this.state.players.filter(p => p.id !== cg.id && p.id !== mon.id);
    }
    return [];
  },

  startNewGame: function() {
    this.clearActiveSession();
    AudioRecorder.clearAll();
    this.state.roundAudioUrl = null;

    // Reset match scores
    this.state.teams.forEach(t => t.score = 0);
    this.state.players.forEach(p => p.score = 0);
    this.state.currentTeamIdx = 0;
    this.state.ffaTurnIndex = 0;
    this.state.roundNumber = 1;
    this.state.isGameOver = false;
    this.state.winner = null;

    // Build and shuffle deck
    this.prepareDeck();

    if (P2PEngine.isConnected && P2PEngine.role === "host") {
      P2PEngine.send("MATCH_START", {
        gameFormat: this.config.gameFormat,
        teams: this.state.teams,
        players: this.state.players,
        ffaTurnIndex: this.state.ffaTurnIndex,
        deck: this.state.deck,
        roundNumber: this.state.roundNumber,
        currentTeamIdx: this.state.currentTeamIdx,
        config: this.config
      });
    }

    this.showHandoffScreen();
  },

  prepareDeck: function() {
    let pool = CardDB.getCardsByCategory(this.config.selectedCategory);
    if (!pool || pool.length === 0) {
      pool = CardDB.getAllCards();
    }
    // Fisher-Yates shuffle
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    this.state.deck = shuffled;
    this.state.currentCardIdx = 0;
  },

  getNextCard: function() {
    if (this.state.currentCardIdx >= this.state.deck.length) {
      // Re-shuffle if deck runs out during long match
      this.prepareDeck();
    }
    const card = this.state.deck[this.state.currentCardIdx];
    this.state.currentCardIdx++;
    return card;
  },

  // ==========================================
  // HANDOFF SCREEN (PASS & PLAY)
  // ==========================================
  showHandoffScreen: function() {
    const banner = document.getElementById("handoff-round-banner");
    const teamsView = document.getElementById("handoff-view-teams");
    const ffaView = document.getElementById("handoff-view-ffa");

    if (this.config.gameFormat === "ffa") {
      if (banner) {
        banner.textContent = `Round ${this.state.roundNumber} • Turn ${this.state.ffaTurnIndex + 1}`;
        banner.style.background = "linear-gradient(135deg, #f97316, #ef4444)";
      }
      if (teamsView) teamsView.style.display = "none";
      if (ffaView) ffaView.style.display = "block";

      const clueGiver = this.getCurrentClueGiver();
      const monitor = this.getCurrentMonitor();
      const guessers = this.getCurrentGuessers();

      const cgName = document.getElementById("handoff-ffa-cluegiver-name");
      const monName = document.getElementById("handoff-ffa-monitor-name");
      const gNames = document.getElementById("handoff-ffa-guessers-list");

      if (cgName) cgName.textContent = clueGiver.name;
      if (monName) monName.textContent = monitor.name;
      if (gNames) gNames.textContent = guessers.map(g => g.name).join(", ");
    } else {
      const currentTeam = this.state.teams[this.state.currentTeamIdx];
      if (banner) {
        banner.textContent = `Round ${this.state.roundNumber} • Turn ${this.state.currentTeamIdx + 1} of ${this.state.teams.length}`;
        banner.style.backgroundColor = currentTeam.color;
      }
      if (teamsView) teamsView.style.display = "block";
      if (ffaView) ffaView.style.display = "none";

      const teamTitle = document.getElementById("handoff-team-title");
      if (teamTitle) {
        teamTitle.textContent = currentTeam.name;
        teamTitle.style.color = currentTeam.color;
      }

      const scoreBadge = document.getElementById("handoff-team-score");
      if (scoreBadge) {
        scoreBadge.textContent = `Current Score: ${currentTeam.score} pts`;
      }

      const desc = document.getElementById("handoff-prompt-desc");
      if (desc) {
        if (P2PEngine.isConnected) {
          const isMyTurn = (this.state.currentTeamIdx === P2PEngine.myTeamIdx);
          desc.textContent = isMyTurn 
            ? `Your Team's Turn! You are giving clues on this phone. Opponents will watch on their phone!`
            : `Opponent's Turn! Watch their phone and prepare your buzzer for any Taboo slips!`;
        } else {
          desc.textContent = `Hand the phone to ${currentTeam.name}'s Clue Giver. Opponents, prepare your buzzer!`;
        }
      }
    }

    this.showScreen("screen-handoff");
    this.saveActiveSession();
  },

  triggerCountdown: function() {
    const overlay = document.getElementById("countdown-overlay");
    const countNum = document.getElementById("countdown-number");
    if (!overlay || !countNum) {
      this.startTurn();
      return;
    }

    overlay.classList.add("active");
    let count = 3;
    countNum.textContent = count;
    SoundEngine.playTick();

    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        countNum.textContent = count;
        SoundEngine.playTick();
      } else {
        clearInterval(interval);
        overlay.classList.remove("active");
        this.startTurn();
      }
    }, 900);
  },

  // ==========================================
  // ACTIVE TURN GAMEPLAY
  // ==========================================
  startTurn: function() {
    this.state.timeLeft = this.config.roundDuration;
    this.state.isPaused = false;
    this.state.isWordScorePaused = false;
    this.state.skipsUsedThisTurn = 0;
    this.state.turnCards = [];
    this.state.currentCardVotes = { hostVote: null, peerVote: null };
    this.state.roundAudioUrl = null;

    // Snapshot base scores so in-turn pause scoring and dispute edits are always 100% exact
    this.state.teams.forEach(t => t.baseScore = t.score);
    this.state.players.forEach(p => p.baseScore = p.score);

    // Header info
    const teamDot = document.getElementById("active-team-dot");
    const teamName = document.getElementById("active-team-name");

    if (this.config.gameFormat === "ffa") {
      const clueGiver = this.getCurrentClueGiver();
      const monitor = this.getCurrentMonitor();
      if (teamDot) teamDot.style.backgroundColor = clueGiver.color;
      if (teamName) teamName.textContent = `🗣️ ${clueGiver.name} (Clue Giver) | 🚨 ${monitor.name} (Monitor)`;
    } else {
      const currentTeam = this.state.teams[this.state.currentTeamIdx];
      if (teamDot) teamDot.style.backgroundColor = currentTeam.color;
      if (teamName) teamName.textContent = currentTeam.name;
    }

    // Hide word score pause modal
    const ffaModal = document.getElementById("ffa-scoring-modal");
    if (ffaModal) ffaModal.style.display = "none";

    this.updateTurnScorePill();
    this.updateSkipButtonLabel();
    this.updateTabooButtonLabel();
    this.showScreen("screen-game");

    // Audio recording (if enabled) - records in local memory on Host phone (or single phone)
    const shouldRecord = this.config.recordAudio && (!P2PEngine.isConnected || P2PEngine.role === "host");
    const recIndicator = document.getElementById("recording-indicator");
    if (shouldRecord && AudioRecorder.isSupported()) {
      AudioRecorder.startRecording().then(success => {
        if (success && recIndicator) recIndicator.style.display = "flex";
      });
    } else {
      if (recIndicator) recIndicator.style.display = "none";
    }

    // Load first card
    this.displayNextCard();

    // Start timer
    this.startTimer();
    this.saveActiveSession();

    if (P2PEngine.isConnected && P2PEngine.role === "host") {
      P2PEngine.send("TURN_START", {
        gameFormat: this.config.gameFormat,
        teams: this.state.teams,
        currentTeamIdx: this.state.currentTeamIdx,
        ffaTurnIndex: this.state.ffaTurnIndex,
        players: this.state.players,
        clueGiver: this.getCurrentClueGiver(),
        monitor: this.getCurrentMonitor(),
        guessers: this.getCurrentGuessers(),
        roundNumber: this.state.roundNumber,
        timeLeft: this.state.timeLeft,
        activeCard: this.activeCard
      });
    }
  },

  renderCard: function(card) {
    if (!card) return;
    this.activeCard = card;

    const targetEl = document.getElementById("card-target-word");
    const categoryEl = document.getElementById("card-category-tag");
    const diffEl = document.getElementById("card-difficulty-tag");
    const listEl = document.getElementById("card-taboo-list");

    if (targetEl) targetEl.textContent = card.word;
    if (categoryEl) categoryEl.textContent = card.category || "General";
    if (diffEl) {
      diffEl.textContent = card.difficulty || "medium";
      diffEl.style.backgroundColor = card.difficulty === "easy" ? "#dcfce7" : card.difficulty === "hard" ? "#fee2e2" : "#fef3c7";
      diffEl.style.color = card.difficulty === "easy" ? "#15803d" : card.difficulty === "hard" ? "#b91c1c" : "#b45309";
    }

    if (listEl) {
      listEl.innerHTML = "";
      (card.taboo || []).forEach(w => {
        const item = document.createElement("div");
        item.className = "taboo-word-item";
        item.textContent = w;
        listEl.appendChild(item);
      });
    }

    const cardEl = document.getElementById("active-taboo-card");
    if (cardEl) {
      cardEl.className = "taboo-card";
    }
  },

  displayNextCard: function() {
    const card = this.getNextCard();
    this.state.currentCardVotes = { hostVote: null, peerVote: null };
    this.renderCard(card);
    this.saveActiveSession();

    if (P2PEngine.isConnected && P2PEngine.role === "host") {
      P2PEngine.send("CARD_DRAW", { card: card });
    }
  },

  handleCorrect: function() {
    if (this.state.isPaused || this.state.isWordScorePaused || !this.activeCard) return;
    this.pauseWordForScoring("correct");
  },

  handleTaboo: function() {
    if (this.state.isPaused || this.state.isWordScorePaused || !this.activeCard) return;
    this.pauseWordForScoring("taboo");
  },

  handleSkip: function() {
    if (this.state.isPaused || this.state.isWordScorePaused || !this.activeCard) return;

    if (this.config.skipLimit > 0 && this.state.skipsUsedThisTurn >= this.config.skipLimit) {
      this.showToast(`Skip limit reached (${this.config.skipLimit} max)!`);
      SoundEngine.vibrate([100]);
      return;
    }

    this.pauseWordForScoring("skip");
  },

  // ==========================================
  // UNIVERSAL WORD SCORING & IN-BETWEEN WORD PAUSE
  // (Both Team-Based & Free-For-All Individual Modes)
  // ==========================================
  pauseWordForScoring: function(status) {
    if (this.state.isPaused || !this.activeCard) return;

    this.state.isWordScorePaused = true;

    // Broadcast pause state to Device 2
    if (P2PEngine.isConnected) {
      P2PEngine.send("TIMER_SYNC", { timeLeft: this.state.timeLeft, isPaused: true });
    }

    const modal = document.getElementById("ffa-scoring-modal");
    const stepGuesser = document.getElementById("ffa-step-select-guesser");
    const stepNext = document.getElementById("ffa-step-next-word");
    const grid = document.getElementById("ffa-guessers-btn-grid");
    const banner = document.getElementById("ffa-outcome-banner");

    if (modal) modal.style.display = "flex";

    if (this.config.gameFormat === "ffa") {
      const clueGiver = this.getCurrentClueGiver();
      if (status === "correct") {
        SoundEngine.playCorrect();
        if (stepGuesser) stepGuesser.style.display = "block";
        if (stepNext) stepNext.style.display = "none";

        if (grid) {
          grid.innerHTML = "";
          const guessers = this.getCurrentGuessers();
          guessers.forEach(p => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "ffa-guesser-btn";
            btn.innerHTML = `<span style="width:10px;height:10px;border-radius:50%;background:${p.color};display:inline-block;"></span> <span>${p.name}</span>`;
            btn.addEventListener("click", () => this.selectGuesser(p.id));
            grid.appendChild(btn);
          });

          const cancelBtn = document.createElement("button");
          cancelBtn.type = "button";
          cancelBtn.className = "ffa-guesser-btn";
          cancelBtn.style.opacity = "0.75";
          cancelBtn.style.borderColor = "rgba(255,255,255,0.2)";
          cancelBtn.innerHTML = `<span>✕ Cancel / Nobody</span>`;
          cancelBtn.addEventListener("click", () => this.selectGuesser("none"));
          grid.appendChild(cancelBtn);
        }
      } else if (status === "taboo") {
        SoundEngine.playBuzzer();
        const penalty = this.config.tabooPenalty;

        this.state.turnCards.push({
          card: this.activeCard,
          status: "taboo",
          originalStatus: "taboo",
          clueGiverId: clueGiver.id,
          clueGiverName: clueGiver.name
        });

        this.recalculateScoresFromTurnCards();

        if (stepGuesser) stepGuesser.style.display = "none";
        if (stepNext) stepNext.style.display = "block";
        if (banner) {
          banner.className = "ffa-outcome-banner ffa-outcome-taboo";
          banner.textContent = `🚨 Taboo violation by ${clueGiver.name}! (${penalty} pts)`;
        }

        this.updateTurnScorePill();
        this.broadcastScoreEvent("taboo", this.activeCard.word, clueGiver.name, null, penalty);
      } else if (status === "skip") {
        this.state.skipsUsedThisTurn++;
        SoundEngine.playSkip();
        const penalty = this.config.skipPenalty;

        this.state.turnCards.push({
          card: this.activeCard,
          status: "skip",
          originalStatus: "skip",
          clueGiverId: clueGiver.id,
          clueGiverName: clueGiver.name
        });

        this.recalculateScoresFromTurnCards();

        if (stepGuesser) stepGuesser.style.display = "none";
        if (stepNext) stepNext.style.display = "block";
        if (banner) {
          banner.className = "ffa-outcome-banner ffa-outcome-skip";
          banner.textContent = `↷ Skipped by ${clueGiver.name} (${penalty} pt)`;
        }

        this.updateSkipButtonLabel();
        this.updateTurnScorePill();
        this.broadcastScoreEvent("skip", this.activeCard.word, clueGiver.name, null, penalty);
      }
    } else {
      // Classic Team Mode
      const currentTeam = this.state.teams[this.state.currentTeamIdx];
      if (status === "correct") {
        SoundEngine.playCorrect();
        this.state.turnCards.push({
          card: this.activeCard,
          status: "correct",
          originalStatus: "correct",
          teamName: currentTeam.name
        });

        this.recalculateScoresFromTurnCards();

        if (stepGuesser) stepGuesser.style.display = "none";
        if (stepNext) stepNext.style.display = "block";
        if (banner) {
          banner.className = "ffa-outcome-banner ffa-outcome-correct";
          banner.textContent = `✓ CORRECT GUESS! (+1 pt to ${currentTeam.name})`;
        }

        this.updateTurnScorePill();
        this.broadcastScoreEvent("correct", this.activeCard.word, currentTeam.name, null, 1);
      } else if (status === "taboo") {
        SoundEngine.playBuzzer();
        const penalty = this.config.tabooPenalty;
        this.state.turnCards.push({
          card: this.activeCard,
          status: "taboo",
          originalStatus: "taboo",
          teamName: currentTeam.name
        });

        this.recalculateScoresFromTurnCards();

        if (stepGuesser) stepGuesser.style.display = "none";
        if (stepNext) stepNext.style.display = "block";
        if (banner) {
          banner.className = "ffa-outcome-banner ffa-outcome-taboo";
          banner.textContent = `🚨 TABOO FOUL! (${penalty} pts to ${currentTeam.name})`;
        }

        this.updateTurnScorePill();
        this.broadcastScoreEvent("taboo", this.activeCard.word, currentTeam.name, null, penalty);
      } else if (status === "skip") {
        this.state.skipsUsedThisTurn++;
        SoundEngine.playSkip();
        const penalty = this.config.skipPenalty;
        this.state.turnCards.push({
          card: this.activeCard,
          status: "skip",
          originalStatus: "skip",
          teamName: currentTeam.name
        });

        this.recalculateScoresFromTurnCards();

        if (stepGuesser) stepGuesser.style.display = "none";
        if (stepNext) stepNext.style.display = "block";
        if (banner) {
          banner.className = "ffa-outcome-banner ffa-outcome-skip";
          banner.textContent = `↷ CARD SKIPPED (${penalty} pt)`;
        }

        this.updateSkipButtonLabel();
        this.updateTurnScorePill();
        this.broadcastScoreEvent("skip", this.activeCard.word, currentTeam.name, null, penalty);
      }
    }
  },

  selectGuesser: function(guesserId) {
    if (guesserId === "none") {
      this.state.isWordScorePaused = false;
      const modal = document.getElementById("ffa-scoring-modal");
      if (modal) modal.style.display = "none";
      if (P2PEngine.isConnected) {
        P2PEngine.send("TIMER_SYNC", { timeLeft: this.state.timeLeft, isPaused: false });
      }
      return;
    }

    const clueGiver = this.getCurrentClueGiver();
    const guesser = this.state.players.find(p => p.id === guesserId);
    if (!guesser) return;

    this.state.turnCards.push({
      card: this.activeCard,
      status: "correct",
      originalStatus: "correct",
      clueGiverId: clueGiver.id,
      clueGiverName: clueGiver.name,
      guesserId: guesser.id,
      guesserName: guesser.name
    });

    this.recalculateScoresFromTurnCards();

    const stepGuesser = document.getElementById("ffa-step-select-guesser");
    const stepNext = document.getElementById("ffa-step-next-word");
    const banner = document.getElementById("ffa-outcome-banner");

    if (stepGuesser) stepGuesser.style.display = "none";
    if (stepNext) stepNext.style.display = "block";
    if (banner) {
      banner.className = "ffa-outcome-banner ffa-outcome-correct";
      banner.textContent = `✓ ${guesser.name} guessed correctly! (+1 ${clueGiver.name}, +1 ${guesser.name})`;
    }

    this.updateTurnScorePill();
    this.broadcastScoreEvent("correct", this.activeCard.word, clueGiver.name, guesser.name, 1);
  },

  undoLastCardScore: function() {
    if (!this.state.isWordScorePaused || this.state.turnCards.length === 0) return;
    const removed = this.state.turnCards.pop();
    if (removed && removed.status === "skip") {
      this.state.skipsUsedThisTurn = Math.max(0, this.state.skipsUsedThisTurn - 1);
      this.updateSkipButtonLabel();
    }
    this.recalculateScoresFromTurnCards();
    this.updateTurnScorePill();

    const modal = document.getElementById("ffa-scoring-modal");
    if (modal) modal.style.display = "none";
    this.state.isWordScorePaused = false;

    if (P2PEngine.isConnected) {
      P2PEngine.send("TIMER_SYNC", { timeLeft: this.state.timeLeft, isPaused: false });
      P2PEngine.send("WORD_SCORED", {
        gameFormat: this.config.gameFormat,
        outcome: "undo",
        targetWord: this.activeCard.word,
        feedText: `↩️ Undone: <strong>${this.activeCard.word}</strong>`,
        players: this.state.players,
        teams: this.state.teams,
        timeLeft: this.state.timeLeft,
        isPaused: false
      });
    }
  },

  proceedToNextWord: function() {
    const modal = document.getElementById("ffa-scoring-modal");
    if (modal) modal.style.display = "none";

    this.state.isWordScorePaused = false;
    this.displayNextCard();

    if (P2PEngine.isConnected) {
      P2PEngine.send("NEXT_WORD", {
        isPaused: false,
        timeLeft: this.state.timeLeft
      });
      P2PEngine.send("FFA_NEXT_WORD", {
        isPaused: false,
        timeLeft: this.state.timeLeft
      });
    }
  },

  recalculateScoresFromTurnCards: function() {
    if (this.config.gameFormat === "ffa") {
      this.state.players.forEach(p => {
        p.score = (p.baseScore !== undefined ? p.baseScore : p.score);
      });
      const clueGiver = this.getCurrentClueGiver();
      this.state.turnCards.forEach(item => {
        if (item.status === "correct") {
          if (clueGiver) clueGiver.score += 1;
          if (item.guesserId) {
            const g = this.state.players.find(p => String(p.id) === String(item.guesserId));
            if (g) g.score += 1;
          }
        } else if (item.status === "taboo") {
          if (clueGiver) clueGiver.score += this.config.tabooPenalty;
        } else if (item.status === "skip") {
          if (clueGiver) clueGiver.score += this.config.skipPenalty;
        }
      });
    } else {
      const currentTeam = this.state.teams[this.state.currentTeamIdx];
      if (currentTeam) {
        currentTeam.score = (currentTeam.baseScore !== undefined ? currentTeam.baseScore : 0) + this.calculateCurrentTurnScore();
      }
    }
  },

  broadcastScoreEvent: function(outcome, targetWord, clueOrTeamName, guesserName, points) {
    if (!P2PEngine.isConnected) return;
    let feedText = "";
    if (this.config.gameFormat === "ffa") {
      if (outcome === "correct") {
        feedText = `✓ <strong>${targetWord}</strong>: Guessed by ${guesserName} (+1 ${clueOrTeamName}, +1 ${guesserName})`;
      } else if (outcome === "taboo") {
        feedText = `🚨 <strong>${targetWord}</strong>: Taboo foul by ${clueOrTeamName} (${points} pts)`;
      } else {
        feedText = `↷ <strong>${targetWord}</strong>: Skipped by ${clueOrTeamName} (${points} pt)`;
      }
    } else {
      if (outcome === "correct") {
        feedText = `✓ <strong>${targetWord}</strong>: Correct (+1 pt to ${clueOrTeamName})`;
      } else if (outcome === "taboo") {
        feedText = `🚨 <strong>${targetWord}</strong>: Taboo foul (${points} pts to ${clueOrTeamName})`;
      } else {
        feedText = `↷ <strong>${targetWord}</strong>: Skipped (${points} pt)`;
      }
    }

    const payload = {
      gameFormat: this.config.gameFormat,
      outcome: outcome,
      targetWord: targetWord,
      feedText: feedText,
      clueOrTeamName: clueOrTeamName,
      guesserName: guesserName,
      points: points,
      players: this.state.players,
      teams: this.state.teams,
      timeLeft: this.state.timeLeft,
      isPaused: true
    };

    P2PEngine.send("WORD_SCORED", payload);
    P2PEngine.send("FFA_WORD_SCORED", payload);
  },

  renderSpectatorScoreboard: function() {
    const list = document.getElementById("spectator-leaderboard-list");
    if (!list) return;
    list.innerHTML = "";

    const medals = ["🥇", "🥈", "🥉"];

    if (this.config.gameFormat === "teams") {
      const ffaRoles = document.getElementById("spectator-roles-ffa");
      const teamsRoles = document.getElementById("spectator-roles-teams");
      if (ffaRoles) ffaRoles.style.display = "none";
      if (teamsRoles) teamsRoles.style.display = "flex";

      const currentTeam = this.state.teams[this.state.currentTeamIdx];
      const activeTeamName = document.getElementById("spectator-active-team-name");
      if (activeTeamName && currentTeam) {
        activeTeamName.textContent = currentTeam.name;
        activeTeamName.style.color = currentTeam.color;
      }

      const roundBanner = document.getElementById("spectator-round-banner");
      if (roundBanner) {
        roundBanner.textContent = `Round ${this.state.roundNumber} • Turn ${this.state.currentTeamIdx + 1} of ${this.state.teams.length}`;
      }

      const sorted = [...this.state.teams].sort((a, b) => b.score - a.score);
      sorted.forEach((team, idx) => {
        const card = document.createElement("div");
        card.className = "spectator-player-card";
        const isActive = currentTeam && (team.id === currentTeam.id || team.name === currentTeam.name);
        if (isActive) {
          card.classList.add("active-role");
        }

        const rankBadge = idx < 3 ? medals[idx] : `#${idx + 1}`;
        const activeTag = isActive ? `<span class="ffa-role-badge" style="color: #f97316; margin-left: 6px;">🗣️ Active Turn</span>` : "";

        card.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
            <span class="spectator-player-rank">${rankBadge}</span>
            <span style="width: 12px; height: 12px; border-radius: 50%; background: ${team.color}; display: inline-block;"></span>
            <span class="spectator-player-name">${team.name} ${activeTag}</span>
          </div>
          <span class="spectator-player-score">${team.score} pts</span>
        `;
        list.appendChild(card);
      });
    } else {
      // Free-For-All Mode
      const ffaRoles = document.getElementById("spectator-roles-ffa");
      const teamsRoles = document.getElementById("spectator-roles-teams");
      if (ffaRoles) ffaRoles.style.display = "flex";
      if (teamsRoles) teamsRoles.style.display = "none";

      const clueGiver = this.getCurrentClueGiver();
      const monitor = this.getCurrentMonitor();

      const cgName = document.getElementById("spectator-cluegiver-name");
      const monName = document.getElementById("spectator-monitor-name");
      if (cgName && clueGiver) cgName.textContent = clueGiver.name;
      if (monName && monitor) monName.textContent = monitor.name;

      const roundBanner = document.getElementById("spectator-round-banner");
      if (roundBanner) {
        roundBanner.textContent = `Round ${this.state.roundNumber} • Turn ${this.state.ffaTurnIndex + 1}`;
      }

      const sorted = [...this.state.players].sort((a, b) => b.score - a.score);
      sorted.forEach((p, idx) => {
        const card = document.createElement("div");
        card.className = "spectator-player-card";
        if (clueGiver && monitor && (p.id === clueGiver.id || p.id === monitor.id)) {
          card.classList.add("active-role");
        }

        let roleTag = "";
        if (clueGiver && p.id === clueGiver.id) {
          roleTag = `<span class="ffa-role-badge" style="color: #f97316; margin-left: 6px;">🗣️ Clue Giver</span>`;
        } else if (monitor && p.id === monitor.id) {
          roleTag = `<span class="ffa-role-badge" style="color: #ef4444; margin-left: 6px;">🚨 Monitor</span>`;
        }

        const rankBadge = idx < 3 ? medals[idx] : `#${idx + 1}`;

        card.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
            <span class="spectator-player-rank">${rankBadge}</span>
            <span style="width: 12px; height: 12px; border-radius: 50%; background: ${p.color}; display: inline-block;"></span>
            <span class="spectator-player-name">${p.name} ${roleTag}</span>
          </div>
          <span class="spectator-player-score">${p.score} pts</span>
        `;
        list.appendChild(card);
      });
    }
  },

  updateSkipButtonLabel: function() {
    const subLabel = document.getElementById("btn-skip-sub");
    if (!subLabel) return;
    if (this.config.skipLimit > 0) {
      const remaining = Math.max(0, this.config.skipLimit - this.state.skipsUsedThisTurn);
      subLabel.textContent = `${remaining} left`;
    } else {
      subLabel.textContent = this.config.skipPenalty < 0 ? `${this.config.skipPenalty} pt` : "0 pt";
    }
  },

  updateTabooButtonLabel: function() {
    const subLabel = document.getElementById("btn-taboo-sub");
    if (!subLabel) return;
    subLabel.textContent = `${this.config.tabooPenalty} pts`;
  },

  calculateCurrentTurnScore: function() {
    let score = 0;
    this.state.turnCards.forEach(item => {
      if (item.status === "correct") score += 1;
      else if (item.status === "taboo") score += this.config.tabooPenalty;
      else if (item.status === "skip") score += this.config.skipPenalty;
    });
    return score;
  },

  updateTurnScorePill: function() {
    const pill = document.getElementById("round-score-display");
    if (!pill) return;
    const score = this.calculateCurrentTurnScore();
    pill.textContent = `${score >= 0 ? "+" : ""}${score} pts`;
    pill.style.color = score > 0 ? "var(--color-correct)" : score < 0 ? "var(--color-taboo)" : "var(--text-primary)";
  },

  // ==========================================
  // TIMER & PAUSE LOGIC
  // ==========================================
  startTimer: function() {
    if (this.state.timerId) clearInterval(this.state.timerId);

    const circle = document.getElementById("timer-circle-progress");
    const textEl = document.getElementById("timer-display-text");
    const circumference = 2 * Math.PI * 30; // r=30 -> 188.49px

    if (circle) {
      circle.style.strokeDasharray = `${circumference} ${circumference}`;
    }

    this.updateTimerDisplay(circle, textEl, circumference);

    this.state.timerId = setInterval(() => {
      if (this.state.isPaused || this.state.isWordScorePaused) return;

      this.state.timeLeft--;
      this.updateTimerDisplay(circle, textEl, circumference);
      this.saveActiveSession();

      if (P2PEngine.isConnected && P2PEngine.role === "host") {
        P2PEngine.send("TIMER_SYNC", { timeLeft: this.state.timeLeft, isPaused: false });
      }

      // Audio warnings
      if (this.state.timeLeft === 10) {
        SoundEngine.playWarning();
      } else if (this.state.timeLeft < 10 && this.state.timeLeft > 5) {
        SoundEngine.playTick();
      } else if (this.state.timeLeft <= 5 && this.state.timeLeft > 0) {
        SoundEngine.playWarning();
      }

      if (this.state.timeLeft <= 0) {
        this.endTurn();
      }
    }, 1000);
  },

  updateTimerDisplay: function(circle, textEl, circumference) {
    if (textEl) {
      textEl.textContent = Math.max(0, this.state.timeLeft);
      if (this.state.timeLeft <= 10) {
        textEl.classList.add("timer-urgent");
      } else {
        textEl.classList.remove("timer-urgent");
      }
    }

    if (circle) {
      const progress = Math.max(0, this.state.timeLeft / this.config.roundDuration);
      const offset = circumference * (1 - progress);
      circle.style.strokeDashoffset = offset;

      // Color shift
      if (progress > 0.4) {
        circle.style.stroke = "var(--color-correct)";
      } else if (progress > 0.15) {
        circle.style.stroke = "var(--color-skip)";
      } else {
        circle.style.stroke = "var(--color-taboo)";
      }
    }
  },

  togglePause: function() {
    this.state.isPaused = !this.state.isPaused;
    const overlay = document.getElementById("pause-overlay");
    const titleEl = document.getElementById("pause-title-text");
    const descEl = document.getElementById("pause-desc-text");
    if (titleEl) titleEl.textContent = "GAME PAUSED";
    if (descEl) descEl.textContent = "Card is hidden to prevent peeking!";
    if (overlay) {
      if (this.state.isPaused) {
        overlay.classList.add("active");
      } else {
        overlay.classList.remove("active");
      }
    }
    this.saveActiveSession();
  },

  endTurn: async function() {
    if (this.state.timerId) {
      clearInterval(this.state.timerId);
      this.state.timerId = null;
    }

    const recIndicator = document.getElementById("recording-indicator");
    if (recIndicator) recIndicator.style.display = "none";

    // Stop audio recording if running
    if (AudioRecorder.isRecording) {
      const recResult = await AudioRecorder.stopRecording();
      if (recResult && recResult.url) {
        this.state.roundAudioUrl = recResult.url;
      }
    }

    SoundEngine.playTimesUp();
    this.showReviewScreen();

    if (P2PEngine.isConnected && P2PEngine.role === "host") {
      P2PEngine.send("TURN_END", { turnCards: this.state.turnCards });
    }
  },

  // ==========================================
  // REVIEW & DISPUTE ROOM SCREEN
  // ==========================================
  showReviewScreen: function() {
    const headerTitle = document.getElementById("review-team-header");
    if (headerTitle) {
      if (this.config.gameFormat === "ffa") {
        const clueGiver = this.getCurrentClueGiver();
        headerTitle.textContent = `${clueGiver.name}'s Clue Turn Review`;
        headerTitle.style.color = clueGiver.color;
      } else {
        const currentTeam = this.state.teams[this.state.currentTeamIdx];
        headerTitle.textContent = `${currentTeam.name}'s Round Review`;
        headerTitle.style.color = currentTeam.color;
      }
    }

    // Configure Audio Review Player
    const playerCard = document.getElementById("audio-review-player");
    if (playerCard) {
      if (this.state.roundAudioUrl) {
        playerCard.style.display = "flex";
        this.setupAudioPlayer();
      } else {
        playerCard.style.display = "none";
      }
    }

    this.renderReviewCardsList();
    this.updateReviewScoreSummary();
    this.showScreen("screen-review");
    this.saveActiveSession();
  },

  setupAudioPlayer: function() {
    const playBtn = document.getElementById("btn-audio-play-pause");
    const playIcon = document.getElementById("audio-play-icon");
    const playLabel = document.getElementById("audio-play-label");
    const timeDisplay = document.getElementById("audio-player-time");
    const progressSlider = document.getElementById("audio-progress-slider");
    const rewindBtn = document.getElementById("btn-audio-rewind");
    const forwardBtn = document.getElementById("btn-audio-forward");

    AudioRecorder.onPlaybackStateChange = (isPlaying) => {
      if (playIcon) playIcon.textContent = isPlaying ? "⏸️" : "▶️";
      if (playLabel) playLabel.textContent = isPlaying ? "Pause" : "Play Recording";
    };

    AudioRecorder.onTimeUpdate = (currTime, totalDuration) => {
      const formatTime = (sec) => {
        if (!sec || isNaN(sec)) return "0:00";
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
      };
      if (timeDisplay) {
        timeDisplay.textContent = `${formatTime(currTime)} / ${formatTime(totalDuration)}`;
      }
      if (progressSlider && totalDuration > 0) {
        progressSlider.value = Math.round((currTime / totalDuration) * 100);
      }
    };

    if (playBtn) {
      playBtn.onclick = () => {
        AudioRecorder.togglePlay(this.state.roundAudioUrl);
      };
    }

    if (rewindBtn) {
      rewindBtn.onclick = () => AudioRecorder.skip(-5);
    }

    if (forwardBtn) {
      forwardBtn.onclick = () => AudioRecorder.skip(5);
    }

    if (progressSlider) {
      progressSlider.oninput = (e) => {
        const pct = parseFloat(e.target.value) / 100;
        const audio = AudioRecorder.getAudioElement();
        if (audio && audio.duration) {
          AudioRecorder.seek(pct * audio.duration);
        }
      };
    }
  },

  renderReviewCardsList: function() {
    const container = document.getElementById("review-cards-list");
    if (!container) return;
    container.innerHTML = "";

    if (this.state.turnCards.length === 0) {
      container.innerHTML = `<div class="text-center text-slate-400 py-8 font-semibold">No cards played this round!</div>`;
      return;
    }

    this.state.turnCards.forEach((item, idx) => {
      const isDisputed = item.hostVote && item.peerVote && (item.hostVote !== item.peerVote);
      let voteBadgeHtml = "";
      if (item.hostVote && item.peerVote) {
        if (isDisputed) {
          voteBadgeHtml = `<div class="review-votes-bar"><span class="review-badge-disputed">⚠️ DISPUTED: Team 1 (${item.hostVote.toUpperCase()}) vs Team 2 (${item.peerVote.toUpperCase()})</span></div>`;
        } else {
          voteBadgeHtml = `<div class="review-votes-bar"><span class="review-badge-agreed">✅ Both Agreed: ${item.status.toUpperCase()}</span></div>`;
        }
      }

      let ffaGuesserHtml = "";
      if (this.config.gameFormat === "ffa" && item.status === "correct") {
        ffaGuesserHtml = `
          <div class="flex items-center gap-2 mt-1" style="display: flex; align-items: center; gap: 6px;">
            <span class="text-xs text-slate-300 font-semibold">Guessed by:</span>
            <select class="review-guesser-select font-bold text-xs" data-card-idx="${idx}" style="background: rgba(15,23,42,0.8); border: 1px solid rgba(255,255,255,0.2); color: #34d399; border-radius: 6px; padding: 2px 6px;">
              ${this.state.players.map(p => `<option value="${p.id}" ${p.id === item.guesserId ? 'selected' : ''}>${p.name}</option>`).join("")}
              <option value="none" ${!item.guesserId ? 'selected' : ''}>Nobody / Void</option>
            </select>
          </div>
        `;
      }

      const row = document.createElement("div");
      row.className = `review-item ${isDisputed ? 'disputed' : ''}`;
      row.innerHTML = `
        <div class="review-item-info">
          <span class="review-item-word">${item.card.word}</span>
          <span class="review-item-cat">${item.card.category || "General"}</span>
          ${voteBadgeHtml}
          ${ffaGuesserHtml}
        </div>
        <div class="review-toggle-buttons">
          <button type="button" class="review-toggle-btn ${item.status === 'correct' ? 'active-correct' : ''}" data-status="correct">✓ +1</button>
          <button type="button" class="review-toggle-btn ${item.status === 'taboo' ? 'active-taboo' : ''}" data-status="taboo">✗ ${this.config.tabooPenalty}</button>
          <button type="button" class="review-toggle-btn ${item.status === 'skip' ? 'active-skip' : ''}" data-status="skip">↷ ${this.config.skipPenalty}</button>
        </div>
      `;

      row.querySelectorAll(".review-toggle-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const newStatus = btn.dataset.status;
          item.status = newStatus;
          if (isDisputed) {
            item.hostVote = newStatus;
            item.peerVote = newStatus;
          }
          this.recalculateScoresFromTurnCards();
          this.renderReviewCardsList();
          this.updateReviewScoreSummary();
          this.saveActiveSession();

          if (P2PEngine.isConnected) {
            P2PEngine.send("DISPUTE_UPDATE", { cardIdx: idx, status: newStatus });
          }
        });
      });

      const select = row.querySelector(".review-guesser-select");
      if (select) {
        select.addEventListener("change", (e) => {
          const val = e.target.value;
          if (val === "none") {
            item.guesserId = null;
            item.guesserName = null;
          } else {
            const numId = parseInt(val, 10) || val;
            const p = this.state.players.find(pl => String(pl.id) === String(numId));
            if (p) {
              item.guesserId = p.id;
              item.guesserName = p.name;
            }
          }
          this.recalculateScoresFromTurnCards();
          this.updateReviewScoreSummary();
        });
      }

      container.appendChild(row);
    });
  },

  updateReviewScoreSummary: function() {
    let correctCount = 0;
    let tabooCount = 0;
    let skipCount = 0;

    this.state.turnCards.forEach(item => {
      if (item.status === "correct") correctCount++;
      else if (item.status === "taboo") tabooCount++;
      else if (item.status === "skip") skipCount++;
    });

    const netScore = (correctCount * 1) + (tabooCount * this.config.tabooPenalty) + (skipCount * this.config.skipPenalty);

    const correctEl = document.getElementById("review-stat-correct");
    const tabooEl = document.getElementById("review-stat-taboo");
    const netEl = document.getElementById("review-stat-net");

    if (correctEl) correctEl.textContent = correctCount;
    if (tabooEl) tabooEl.textContent = tabooCount;
    if (netEl) {
      netEl.textContent = `${netScore >= 0 ? "+" : ""}${netScore}`;
      netEl.style.color = netScore > 0 ? "var(--color-correct)" : netScore < 0 ? "var(--color-taboo)" : "var(--text-primary)";
    }
  },

  confirmRoundScore: function() {
    AudioRecorder.pause();

    this.recalculateScoresFromTurnCards();

    if (this.config.gameFormat === "ffa") {
      this.state.players.forEach(p => p.baseScore = p.score);

      // Advance FFA turn rotation
      this.state.ffaTurnIndex++;
      if (this.state.ffaTurnIndex % this.state.players.length === 0) {
        this.state.roundNumber++;
      }

      // Check win condition
      if (this.config.isFixedRounds && this.state.roundNumber > this.config.maxRounds) {
        let winner = this.state.players[0];
        this.state.players.forEach(p => {
          if (p.score > winner.score) winner = p;
        });
        this.triggerVictory(winner);
        return;
      } else if (!this.config.isFixedRounds && this.config.targetScore) {
        let highestScorer = null;
        for (const p of this.state.players) {
          if (p.score >= this.config.targetScore) {
            if (!highestScorer || p.score > highestScorer.score) highestScorer = p;
          }
        }
        if (highestScorer) {
          this.triggerVictory(highestScorer);
          return;
        }
      }

      if (P2PEngine.isConnected && P2PEngine.role === "host") {
        P2PEngine.send("CONFIRM_SCORE", {
          gameFormat: "ffa",
          players: this.state.players,
          ffaTurnIndex: this.state.ffaTurnIndex,
          roundNumber: this.state.roundNumber
        });
      }

      this.showHandoffScreen();
      return;
    }

    // Classic Team Mode
    const currentTeam = this.state.teams[this.state.currentTeamIdx];
    this.state.teams.forEach(t => t.baseScore = t.score);

    // Check if target score reached (only if playing in Points Mode)
    if (!this.config.isFixedRounds && this.config.targetScore && currentTeam.score >= this.config.targetScore) {
      this.triggerVictory(currentTeam);
      return;
    }

    // Advance to next team
    this.state.currentTeamIdx++;
    if (this.state.currentTeamIdx >= this.state.teams.length) {
      this.state.currentTeamIdx = 0;
      this.state.roundNumber++;

      // If playing in fixed rounds mode, check if game over
      if (this.config.isFixedRounds && this.state.roundNumber > this.config.maxRounds) {
        let winner = this.state.teams[0];
        this.state.teams.forEach(t => {
          if (t.score > winner.score) winner = t;
        });
        this.triggerVictory(winner);
        return;
      }
    }

    if (P2PEngine.isConnected && P2PEngine.role === "host") {
      P2PEngine.send("CONFIRM_SCORE", {
        gameFormat: "teams",
        teams: this.state.teams,
        currentTeamIdx: this.state.currentTeamIdx,
        roundNumber: this.state.roundNumber
      });
    }

    this.showHandoffScreen();
  },

  // ==========================================
  // VICTORY SCREEN
  // ==========================================
  triggerVictory: function(winningTarget) {
    this.state.isGameOver = true;
    this.state.winner = winningTarget;
    this.clearActiveSession();
    AudioRecorder.clearAll();

    const winnerCallout = document.getElementById("victory-winner-team");
    if (winnerCallout) {
      winnerCallout.textContent = `${winningTarget.name} WINS! (${winningTarget.score} pts)`;
      winnerCallout.style.color = winningTarget.color;
    }

    const scoreboard = document.getElementById("victory-scoreboard");
    if (scoreboard) {
      scoreboard.innerHTML = "";
      const list = (this.config.gameFormat === "ffa") ? this.state.players : this.state.teams;
      const sorted = [...list].sort((a, b) => b.score - a.score);
      const medals = ["🥇", "🥈", "🥉"];

      sorted.forEach((item, rank) => {
        const row = document.createElement("div");
        row.className = `final-score-row ${item.id === winningTarget.id ? 'winner' : ''}`;
        const rankBadge = rank < 3 ? medals[rank] : `#${rank + 1}`;
        row.innerHTML = `
          <div class="flex items-center gap-3">
            <span class="font-bold text-slate-400" style="width: 24px;">${rankBadge}</span>
            <span class="final-team-name" style="color: ${item.color}">${item.name}</span>
          </div>
          <span class="final-team-points">${item.score} pts</span>
        `;
        scoreboard.appendChild(row);
      });
    }

    this.showScreen("screen-victory");
    ConfettiEngine.fire(5000);
    SoundEngine.playVictory();
  },

  // ==========================================
  // CUSTOM CARDS & DECK MANAGER
  // ==========================================
  renderCustomCardsList: function() {
    const container = document.getElementById("custom-cards-container");
    const countBadge = document.getElementById("custom-cards-badge-count");
    const cards = CardDB.getCustomCards();

    if (countBadge) {
      countBadge.textContent = cards.length;
    }

    if (!container) return;

    if (cards.length === 0) {
      container.innerHTML = `<div class="text-center text-slate-400 py-6 text-sm">No custom cards created yet. Use the <strong>Import AI / JSON</strong> tab to add your first deck!</div>`;
      return;
    }

    container.innerHTML = cards.map(c => `
      <div class="review-item">
        <div class="review-item-info">
          <div class="flex items-center gap-2">
            <span class="review-item-word">${c.word}</span>
            <span class="text-xs px-2 py-0.5 rounded bg-slate-800 text-orange-400 font-semibold">${c.category || "Custom"}</span>
          </div>
          <span class="review-item-cat">${c.taboo.join(" • ")}</span>
        </div>
        <button type="button" class="btn-danger-outline py-1 px-3 text-xs" data-delete-id="${c.id}">Delete</button>
      </div>
    `).join("");

    container.querySelectorAll("[data-delete-id]").forEach(btn => {
      btn.addEventListener("click", () => {
        CardDB.deleteCustomCard(btn.dataset.deleteId);
        this.renderCustomCardsList();
        this.renderCategoryChips();
        this.showToast("Custom card deleted!");
      });
    });
  },

  handleAddCustomCardSubmit: function(e) {
    e.preventDefault();
    const wordInput = document.getElementById("new-card-word");
    const t1 = document.getElementById("new-taboo-1");
    const t2 = document.getElementById("new-taboo-2");
    const t3 = document.getElementById("new-taboo-3");
    const t4 = document.getElementById("new-taboo-4");
    const t5 = document.getElementById("new-taboo-5");
    const catInput = document.getElementById("new-card-category");

    const word = wordInput.value.trim().toUpperCase();
    const taboos = [t1.value, t2.value, t3.value, t4.value, t5.value]
      .map(t => t.trim().toUpperCase())
      .filter(t => t.length > 0);

    if (!word) {
      this.showToast("Please enter a target guess word!");
      return;
    }
    if (taboos.length < 3) {
      this.showToast("Please enter at least 3 taboo words!");
      return;
    }

    CardDB.saveCustomCard({
      word: word,
      taboo: taboos,
      category: catInput.value.trim() || "Custom",
      difficulty: "medium"
    });

    // Reset fields
    wordInput.value = "";
    t1.value = ""; t2.value = ""; t3.value = ""; t4.value = ""; t5.value = "";
    this.renderCustomCardsList();
    this.renderCategoryChips();
    this.showToast("Card created and added to deck!");
  },

  switchDeckManagerTab: function(tabName) {
    const tabs = ["import", "add", "view"];
    tabs.forEach(t => {
      const btn = document.getElementById(`tab-deck-${t}`);
      const view = document.getElementById(`view-deck-${t}`);
      if (btn && view) {
        if (t === tabName) {
          btn.classList.add("active");
          view.style.display = "block";
        } else {
          btn.classList.remove("active");
          view.style.display = "none";
        }
      }
    });

    if (tabName === "view") {
      this.renderCustomCardsList();
    }
  },

  // ==========================================
  // SETTINGS & STORAGE
  // ==========================================
  loadSavedSettings: function() {
    try {
      const saved = localStorage.getItem("taboo_game_config");
      if (saved) {
        Object.assign(this.config, JSON.parse(saved));
      }
    } catch (e) {}

    // Version migration to apply new defaults (skip = -1, taboo = -2) if upgraded or new
    if (!this.config.configVersion || this.config.configVersion < 2) {
      this.config.tabooPenalty = -2;
      this.config.skipPenalty = -1;
      this.config.configVersion = 2;
      this.saveSettings();
    }

    // Update settings DOM toggles
    const durPill = document.querySelector(`[data-time-val="${this.config.roundDuration}"]`);
    if (durPill) {
      document.querySelectorAll("[data-time-val]").forEach(p => p.classList.remove("active"));
      durPill.classList.add("active");
    }

    const scorePill = document.querySelector(`[data-score-val="${this.config.targetScore}"]`);
    if (scorePill) {
      document.querySelectorAll("[data-score-val]").forEach(p => p.classList.remove("active"));
      scorePill.classList.add("active");
    }

    const soundToggle = document.getElementById("toggle-sound");
    if (soundToggle) soundToggle.checked = !SoundEngine.isMuted;

    // Update taboo penalty pills
    const tabooPill = document.querySelector(`[data-taboo-val="${this.config.tabooPenalty}"]`);
    if (tabooPill) {
      document.querySelectorAll("[data-taboo-val]").forEach(p => p.classList.remove("active"));
      tabooPill.classList.add("active");
    }

    // Update skip penalty pills
    const skipPill = document.querySelector(`[data-skip-val="${this.config.skipPenalty}"]`);
    if (skipPill) {
      document.querySelectorAll("[data-skip-val]").forEach(p => p.classList.remove("active"));
      skipPill.classList.add("active");
    }

    const audioToggle = document.getElementById("toggle-record-audio");
    if (audioToggle) audioToggle.checked = Boolean(this.config.recordAudio);

    const muteIcon = document.getElementById("mute-icon");
    if (muteIcon) muteIcon.textContent = SoundEngine.isMuted ? "🔇" : "🔊";

    // Update game format toggle (teams vs ffa)
    if (this.config.gameFormat === "ffa") {
      const ffaPill = document.getElementById("format-pill-ffa");
      const teamPill = document.getElementById("format-pill-teams");
      if (ffaPill && teamPill) {
        ffaPill.classList.add("active");
        teamPill.classList.remove("active");
        const ffaView = document.getElementById("setup-ffa-view");
        const teamsView = document.getElementById("setup-teams-view");
        const ffaDesc = document.getElementById("format-desc-ffa");
        const teamsDesc = document.getElementById("format-desc-teams");
        if (ffaView) ffaView.style.display = "block";
        if (teamsView) teamsView.style.display = "none";
        if (ffaDesc) ffaDesc.style.display = "block";
        if (teamsDesc) teamsDesc.style.display = "none";
      }
    } else {
      const ffaPill = document.getElementById("format-pill-ffa");
      const teamPill = document.getElementById("format-pill-teams");
      if (ffaPill && teamPill) {
        teamPill.classList.add("active");
        ffaPill.classList.remove("active");
        const ffaView = document.getElementById("setup-ffa-view");
        const teamsView = document.getElementById("setup-teams-view");
        const ffaDesc = document.getElementById("format-desc-ffa");
        const teamsDesc = document.getElementById("format-desc-teams");
        if (teamsView) teamsView.style.display = "block";
        if (ffaView) ffaView.style.display = "none";
        if (teamsDesc) teamsDesc.style.display = "block";
        if (ffaDesc) ffaDesc.style.display = "none";
      }
    }

    try {
      const savedPlayers = localStorage.getItem("taboo_game_players");
      if (savedPlayers) {
        const parsed = JSON.parse(savedPlayers);
        if (Array.isArray(parsed) && parsed.length >= 3) {
          this.state.players = parsed;
        }
      }
    } catch (e) {}

    this.updateSkipButtonLabel();
    this.updateTabooButtonLabel();
  },

  saveSettings: function() {
    try {
      localStorage.setItem("taboo_game_config", JSON.stringify(this.config));
      localStorage.setItem("taboo_game_players", JSON.stringify(this.state.players));
    } catch (e) {}
  },

  // ==========================================
  // ACTIVE SESSION PERSISTENCE & RESUME CACHE
  // ==========================================
  saveActiveSession: function() {
    if (this.state.isGameOver) {
      this.clearActiveSession();
      return;
    }

    // Only save once a match has actually begun (handoff, gameplay, or dispute review)
    const activeScreen = document.querySelector(".screen.active");
    const screenId = activeScreen ? activeScreen.id : null;
    if (screenId === "screen-welcome" || screenId === "screen-setup" || screenId === "screen-victory") {
      return;
    }

    try {
      const sessionData = {
        config: this.config,
        teams: this.state.teams,
        currentTeamIdx: this.state.currentTeamIdx,
        roundNumber: this.state.roundNumber,
        deck: this.state.deck,
        currentCardIdx: this.state.currentCardIdx,
        currentScreen: screenId || "screen-handoff",
        activeCard: this.activeCard || null,
        timeLeft: this.state.timeLeft,
        skipsUsedThisTurn: this.state.skipsUsedThisTurn,
        turnCards: this.state.turnCards,
        savedAt: Date.now()
      };
      localStorage.setItem("taboo_active_session", JSON.stringify(sessionData));
    } catch (e) {
      console.warn("Failed to persist session to localStorage:", e);
    }
  },

  hasActiveSession: function() {
    try {
      const raw = localStorage.getItem("taboo_active_session");
      if (!raw) return false;
      const data = JSON.parse(raw);
      return Boolean(data && data.teams && data.teams.length >= 2);
    } catch (e) {
      return false;
    }
  },

  getActiveSession: function() {
    try {
      const raw = localStorage.getItem("taboo_active_session");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  clearActiveSession: function() {
    try {
      localStorage.removeItem("taboo_active_session");
    } catch (e) {}
  },

  checkAndDisplayResumeBanner: function() {
    const banner = document.getElementById("resume-banner");
    if (!banner) return;

    const session = this.getActiveSession();
    if (!session || !session.teams || session.teams.length < 2) {
      banner.style.display = "none";
      return;
    }

    // Format human-friendly details
    const teamScores = session.teams.map(t => `<span style="color: ${t.color || 'var(--text-primary)'}; font-weight: 700;">${t.name}:</span> ${t.score} pts`).join(" • ");
    const currentTeam = session.teams[session.currentTeamIdx] || session.teams[0];
    
    let stageInfo = "";
    if (session.currentScreen === "screen-game") {
      stageInfo = `Mid-round (${session.timeLeft}s left) • ${currentTeam.name}'s turn`;
    } else if (session.currentScreen === "screen-review") {
      stageInfo = `Dispute review room • ${currentTeam.name}'s turn`;
    } else {
      stageInfo = `Next up: ${currentTeam.name}`;
    }

    const detailsEl = document.getElementById("resume-details");
    if (detailsEl) {
      detailsEl.innerHTML = `<div>Round ${session.roundNumber} • ${stageInfo}</div><div style="margin-top: 5px; font-size: 0.85rem; color: #cbd5e1;">${teamScores}</div>`;
    }

    const timeEl = document.getElementById("resume-saved-time");
    if (timeEl && session.savedAt) {
      const diffSec = Math.floor((Date.now() - session.savedAt) / 1000);
      if (diffSec < 60) {
        timeEl.textContent = "Saved just now";
      } else if (diffSec < 3600) {
        timeEl.textContent = `Saved ${Math.floor(diffSec / 60)}m ago`;
      } else {
        timeEl.textContent = `Saved ${Math.floor(diffSec / 3600)}h ago`;
      }
    }

    banner.style.display = "block";
  },

  restoreSession: function() {
    const session = this.getActiveSession();
    if (!session) {
      this.showToast("No active session found!");
      this.checkAndDisplayResumeBanner();
      return;
    }

    // Restore configuration and state
    if (session.config) Object.assign(this.config, session.config);
    this.state.teams = session.teams;
    this.state.currentTeamIdx = session.currentTeamIdx || 0;
    this.state.roundNumber = session.roundNumber || 1;
    this.state.deck = session.deck || [];
    this.state.currentCardIdx = session.currentCardIdx || 0;
    this.state.turnCards = session.turnCards || [];
    this.state.skipsUsedThisTurn = session.skipsUsedThisTurn || 0;
    this.state.isGameOver = false;
    this.state.winner = null;

    if (session.currentScreen === "screen-game" && session.activeCard) {
      // Reconstitute in-flight turn in PAUSED state
      const currentTeam = this.state.teams[this.state.currentTeamIdx];
      this.state.timeLeft = typeof session.timeLeft === "number" ? session.timeLeft : this.config.roundDuration;
      this.state.isPaused = true;

      // Header info
      const teamDot = document.getElementById("active-team-dot");
      if (teamDot) teamDot.style.backgroundColor = currentTeam.color;

      const teamName = document.getElementById("active-team-name");
      if (teamName) teamName.textContent = currentTeam.name;

      this.updateTurnScorePill();
      this.updateSkipButtonLabel();

      // Render the saved card without advancing deck index
      this.renderCard(session.activeCard);

      this.showScreen("screen-game");

      // Start timer loop (will idle while isPaused = true)
      this.startTimer();

      // Open pause overlay with helpful guidance
      const overlay = document.getElementById("pause-overlay");
      const titleEl = document.getElementById("pause-title-text");
      const descEl = document.getElementById("pause-desc-text");
      if (titleEl) titleEl.textContent = "GAME RESTORED";
      if (descEl) descEl.textContent = `Paused at ${this.state.timeLeft}s left. Tap Resume Round when your team is ready!`;
      if (overlay) overlay.classList.add("active");

      this.showToast(`Restored round for ${currentTeam.name}!`);
    } else if (session.currentScreen === "screen-review") {
      this.showReviewScreen();
      this.showToast("Restored dispute review room!");
    } else {
      // Default to Handoff screen
      this.showHandoffScreen();
      this.showToast("Restored match! Ready for next turn.");
    }
  },

  discardActiveSession: function() {
    this.clearActiveSession();
    this.checkAndDisplayResumeBanner();
    this.showToast("Saved game discarded.");
  },

  handleQuitMatch: function() {
    if (confirm("End this match and return to the main menu? Current progress will be discarded.")) {
      if (this.state.timerId) {
        clearInterval(this.state.timerId);
        this.state.timerId = null;
      }
      this.clearActiveSession();
      AudioRecorder.clearAll();
      const overlay = document.getElementById("pause-overlay");
      if (overlay) overlay.classList.remove("active");
      this.showScreen("screen-welcome");
      this.checkAndDisplayResumeBanner();
      this.showToast("Match ended.");
    }
  },

  // ==========================================
  // PEER-TO-PEER 2-DEVICE SYNC ENGINE
  // ==========================================
  setupP2PListeners: function() {
    P2PEngine.on("CLIENT_HELLO", (payload) => {
      this.showToast("📱 Team 2 connected from second phone!");
      P2PEngine.setHostStartButtonsVisible(true);

      const currentScreen = document.querySelector(".screen.active")?.id;
      const isGameActive = this.state.deck.length > 0 && !this.state.isGameOver;

      P2PEngine.send("MATCH_CONFIG", {
        config: this.config,
        teams: this.state.teams,
        players: this.state.players,
        gameFormat: this.config.gameFormat,
        ffaTurnIndex: this.state.ffaTurnIndex,
        isGameStarted: isGameActive && (currentScreen === "screen-game" || currentScreen === "screen-handoff" || currentScreen === "screen-spectator"),
        currentScreen: currentScreen,
        activeCard: this.activeCard,
        timeLeft: this.state.timeLeft,
        currentTeamIdx: this.state.currentTeamIdx,
        roundNumber: this.state.roundNumber
      });
    });

    P2PEngine.on("MATCH_CONFIG", (payload) => {
      if (payload.config) Object.assign(this.config, payload.config);
      if (payload.teams) this.state.teams = payload.teams;
      if (payload.players) this.state.players = payload.players;
      if (payload.ffaTurnIndex !== undefined) this.state.ffaTurnIndex = payload.ffaTurnIndex;
      this.updateSkipButtonLabel();
      this.updateTabooButtonLabel();
      this.showToast("Connected to match!");

      this.closeModal("modal-dual-device");

      if (payload.isGameStarted) {
        this.state.currentTeamIdx = payload.currentTeamIdx || 0;
        this.state.roundNumber = payload.roundNumber || 1;
        if (payload.currentScreen === "screen-game" || payload.currentScreen === "screen-spectator") {
          this.renderSpectatorScoreboard();
          this.showScreen("screen-spectator");
        } else {
          this.showHandoffScreen();
        }
      } else {
        // Match not yet started by host: show lobby, NEVER setup screen!
        this.showScreen("screen-p2p-lobby");
      }
    });

    P2PEngine.on("MATCH_START", (payload) => {
      this.closeModal("modal-dual-device");
      if (payload.config) Object.assign(this.config, payload.config);
      if (payload.teams) this.state.teams = payload.teams;
      if (payload.players) this.state.players = payload.players;
      if (payload.ffaTurnIndex !== undefined) this.state.ffaTurnIndex = payload.ffaTurnIndex;
      this.state.deck = payload.deck;
      this.state.roundNumber = payload.roundNumber || 1;
      this.state.currentTeamIdx = payload.currentTeamIdx || 0;
      this.updateSkipButtonLabel();
      this.updateTabooButtonLabel();
      this.showHandoffScreen();
    });

    P2PEngine.on("TURN_START", (payload) => {
      this.config.gameFormat = payload.gameFormat || this.config.gameFormat;
      if (payload.teams) this.state.teams = payload.teams;
      if (payload.players) this.state.players = payload.players;
      this.state.currentTeamIdx = payload.currentTeamIdx !== undefined ? payload.currentTeamIdx : 0;
      this.state.ffaTurnIndex = payload.ffaTurnIndex !== undefined ? payload.ffaTurnIndex : 0;
      this.state.roundNumber = payload.roundNumber || 1;
      this.state.timeLeft = payload.timeLeft || this.config.roundDuration || 60;
      this.state.turnCards = [];

      const timerBadge = document.getElementById("spectator-timer-badge");
      if (timerBadge) timerBadge.textContent = `⏱️ ${this.state.timeLeft}s`;

      const pauseAlert = document.getElementById("spectator-pause-alert");
      if (pauseAlert) pauseAlert.style.display = "none";

      this.renderSpectatorScoreboard();
      this.showScreen("screen-spectator");
    });

    P2PEngine.on("CARD_DRAW", (payload) => {
      this.activeCard = payload.card;
      this.renderCard(this.activeCard);
    });

    P2PEngine.on("CARD_ACTION", (payload) => {
      if (payload.action === "taboo") {
        SoundEngine.playBuzzer();
        SoundEngine.vibrate([200, 100, 200]);
        this.showToast("🚨 Opponent / Spectator buzzed TABOO!");
        if (P2PEngine.role === "host") {
          this.handleTaboo();
        }
      } else if (payload.action === "correct") {
        SoundEngine.playCorrect();
      }
    });

    const handleWordScoredOnSpectator = (payload) => {
      if (payload.players) this.state.players = payload.players;
      if (payload.teams) this.state.teams = payload.teams;
      if (payload.gameFormat) this.config.gameFormat = payload.gameFormat;

      if (payload.outcome === "correct") {
        SoundEngine.playCorrect();
      } else if (payload.outcome === "taboo") {
        SoundEngine.playBuzzer();
      } else if (payload.outcome === "skip") {
        SoundEngine.playSkip();
      }

      const pauseAlert = document.getElementById("spectator-pause-alert");
      if (pauseAlert) pauseAlert.style.display = payload.isPaused ? "block" : "none";

      const feedList = document.getElementById("spectator-feed-list");
      if (feedList) {
        const item = document.createElement("div");
        item.className = `spectator-feed-item feed-${payload.outcome}`;
        item.innerHTML = payload.feedText || `Outcome: ${payload.outcome}`;
        feedList.insertBefore(item, feedList.firstChild);
      }

      this.renderSpectatorScoreboard();
    };

    P2PEngine.on("WORD_SCORED", handleWordScoredOnSpectator);
    P2PEngine.on("FFA_WORD_SCORED", handleWordScoredOnSpectator);

    const handleNextWordOnSpectator = (payload) => {
      const pauseAlert = document.getElementById("spectator-pause-alert");
      if (pauseAlert) pauseAlert.style.display = "none";
      if (payload.timeLeft !== undefined) {
        this.state.timeLeft = payload.timeLeft;
        const badge = document.getElementById("spectator-timer-badge");
        if (badge) badge.textContent = `⏱️ ${this.state.timeLeft}s`;
      }
    };

    P2PEngine.on("NEXT_WORD", handleNextWordOnSpectator);
    P2PEngine.on("FFA_NEXT_WORD", handleNextWordOnSpectator);

    P2PEngine.on("TIMER_SYNC", (payload) => {
      if (P2PEngine.role === "client") {
        this.state.timeLeft = payload.timeLeft;
        const circle = document.getElementById("timer-circle-progress");
        const textEl = document.getElementById("timer-display-text");
        const circumference = 2 * Math.PI * 30;
        this.updateTimerDisplay(circle, textEl, circumference);

        // Update Spectator on Device 2
        const timerBadge = document.getElementById("spectator-timer-badge");
        if (timerBadge) {
          timerBadge.textContent = `⏱️ ${this.state.timeLeft}s ${payload.isPaused ? "(PAUSED)" : ""}`;
        }
        const pauseAlert = document.getElementById("spectator-pause-alert");
        if (pauseAlert) {
          pauseAlert.style.display = payload.isPaused ? "block" : "none";
        }
      }
    });

    P2PEngine.on("TURN_END", (payload) => {
      this.state.turnCards = payload.turnCards || [];
      SoundEngine.playTimesUp();
      this.showReviewScreen();
    });

    P2PEngine.on("DISPUTE_UPDATE", (payload) => {
      if (this.state.turnCards[payload.cardIdx]) {
        this.state.turnCards[payload.cardIdx].status = payload.status;
        this.renderReviewCardsList();
        this.updateReviewScoreSummary();
      }
    });

    P2PEngine.on("CONFIRM_SCORE", (payload) => {
      if (payload.gameFormat === "ffa") {
        if (payload.players) this.state.players = payload.players;
        this.state.ffaTurnIndex = payload.ffaTurnIndex || 0;
        this.state.roundNumber = payload.roundNumber || 1;
        this.showHandoffScreen();
        return;
      }
      this.state.teams = payload.teams;
      this.state.currentTeamIdx = payload.currentTeamIdx;
      this.state.roundNumber = payload.roundNumber;
      this.showHandoffScreen();
    });
  },

  recordCardVote: function(source, action) {
    if (!this.state.currentCardVotes) {
      this.state.currentCardVotes = { hostVote: null, peerVote: null };
    }
    if (source === "host") {
      this.state.currentCardVotes.hostVote = action;
    } else {
      this.state.currentCardVotes.peerVote = action;
    }
  },

  initDualDeviceHost: function() {
    const codeEl = document.getElementById("p2p-display-code");
    const passEl = document.getElementById("p2p-display-passcode");
    const qrContainer = document.getElementById("p2p-qrcode-container");

    P2PEngine.initHost().then(creds => {
      if (codeEl) codeEl.textContent = creds.roomCode;
      if (passEl) passEl.textContent = creds.passcode;

      if (qrContainer && typeof QRCode !== "undefined") {
        qrContainer.innerHTML = "";
        const joinUrl = `${window.location.origin}${window.location.pathname}?party=${creds.roomCode}&pass=${creds.passcode}`;
        new QRCode(qrContainer, {
          text: joinUrl,
          width: 140,
          height: 140,
          colorDark: "#0f172a",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.M
        });
      }
    }).catch(err => {
      console.warn("Host init error:", err);
      P2PEngine.updateConnectionStatus("Signaling unavailable. Re-attempting...", "disconnected");
    });
  },

  initOfflineHostView: async function() {
    const qrContainer = document.getElementById("p2p-offline-offer-qr");
    const statusEl = document.getElementById("p2p-offline-status");
    if (statusEl) {
      statusEl.textContent = "Generating Host Offer QR...";
      statusEl.className = "p2p-status-pill p2p-status-waiting";
    }

    try {
      const offerCode = await P2PEngine.createOfflineOffer();
      this.currentOfflineSignalCode = offerCode;

      if (qrContainer && typeof QRCode !== "undefined") {
        qrContainer.innerHTML = "";
        new QRCode(qrContainer, {
          text: offerCode,
          width: 180,
          height: 180,
          colorDark: "#0f172a",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.L
        });
      }

      if (statusEl) {
        statusEl.textContent = "Waiting for Team 2 to scan Offer QR...";
        statusEl.className = "p2p-status-pill p2p-status-waiting";
      }
    } catch (err) {
      console.warn("Offline host error:", err);
      if (statusEl) {
        statusEl.textContent = "Could not create offer: " + err.message;
        statusEl.className = "p2p-status-pill p2p-status-disconnected";
      }
    }
  },

  checkUrlForRoomCode: function() {
    const params = new URLSearchParams(window.location.search);
    const room = params.get("party") || params.get("room");
    const pass = params.get("pass") || params.get("pin");

    if (room) {
      this.showModal("modal-dual-device");
      const joinTab = document.getElementById("p2p-tab-join");
      const hostView = document.getElementById("p2p-view-host");
      const joinView = document.getElementById("p2p-view-join");
      const hostTab = document.getElementById("p2p-tab-host");

      if (joinTab && hostTab && hostView && joinView) {
        hostTab.classList.remove("active");
        joinTab.classList.add("active");
        hostView.style.display = "none";
        joinView.style.display = "block";
      }

      const codeInput = document.getElementById("input-p2p-room-code");
      if (codeInput) codeInput.value = room;

      const passInput = document.getElementById("input-p2p-passcode");
      if (passInput && pass) passInput.value = pass;

      if (room && pass) {
        P2PEngine.joinRoom(room, pass).then(() => {
          this.closeModal("modal-dual-device");
          this.showScreen("screen-p2p-lobby");
        }).catch(err => {
          this.showToast("Could not join game: " + err.message);
        });
      }
    }
  },

  // ==========================================
  // EVENT LISTENERS SETUP
  // ==========================================
  setupEventListeners: function() {
    // Top Bar Actions
    document.getElementById("btn-mute-toggle")?.addEventListener("click", () => {
      const isMuted = !SoundEngine.isMuted;
      SoundEngine.setMuted(isMuted);
      const icon = document.getElementById("mute-icon");
      if (icon) icon.textContent = isMuted ? "🔇" : "🔊";
      const soundToggle = document.getElementById("toggle-sound");
      if (soundToggle) soundToggle.checked = !isMuted;
      this.showToast(isMuted ? "Audio muted" : "Audio unmuted");
    });

    document.getElementById("toggle-sound")?.addEventListener("change", (e) => {
      SoundEngine.setMuted(!e.target.checked);
      const icon = document.getElementById("mute-icon");
      if (icon) icon.textContent = SoundEngine.isMuted ? "🔇" : "🔊";
      this.showToast(SoundEngine.isMuted ? "Audio muted" : "Audio unmuted");
    });

    // Taboo penalty pill options (-2 pts default vs -1 pt)
    document.querySelectorAll("[data-taboo-val]").forEach(pill => {
      pill.addEventListener("click", () => {
        document.querySelectorAll("[data-taboo-val]").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        this.config.tabooPenalty = parseInt(pill.dataset.tabooVal, 10);
        this.updateTabooButtonLabel();
        this.saveSettings();
        this.showToast(`Taboo penalty set to ${this.config.tabooPenalty} pts`);
      });
    });

    // Skip penalty pill options (-1 pt default vs 0 pt)
    document.querySelectorAll("[data-skip-val]").forEach(pill => {
      pill.addEventListener("click", () => {
        document.querySelectorAll("[data-skip-val]").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        this.config.skipPenalty = parseInt(pill.dataset.skipVal, 10);
        this.updateSkipButtonLabel();
        this.saveSettings();
        this.showToast(this.config.skipPenalty < 0 ? "Skip penalty enabled (-1 pt)" : "Skip penalty disabled (0 pt)");
      });
    });

    document.getElementById("toggle-record-audio")?.addEventListener("change", (e) => {
      this.config.recordAudio = e.target.checked;
      this.saveSettings();
      if (e.target.checked) {
        if (!AudioRecorder.isSupported()) {
          this.showToast("Audio recording not supported in this browser.");
          e.target.checked = false;
          this.config.recordAudio = false;
        } else {
          AudioRecorder.requestPermission().then(granted => {
            if (granted) {
              this.showToast("🎙️ Round audio recording enabled!");
            } else {
              this.showToast("Microphone permission denied.");
              e.target.checked = false;
              this.config.recordAudio = false;
            }
          });
        }
      } else {
        this.showToast("Audio recording disabled.");
      }
    });

    // Dual Device Modal Open
    document.getElementById("btn-nav-dual-device")?.addEventListener("click", () => {
      this.showModal("modal-dual-device");
      this.initDualDeviceHost();
    });

    // P2P Tab switching
    document.getElementById("p2p-tab-host")?.addEventListener("click", () => {
      document.getElementById("p2p-tab-host").classList.add("active");
      document.getElementById("p2p-tab-join").classList.remove("active");
      document.getElementById("p2p-view-host").style.display = "block";
      document.getElementById("p2p-view-join").style.display = "none";
      this.initDualDeviceHost();
    });

    document.getElementById("p2p-tab-join")?.addEventListener("click", () => {
      document.getElementById("p2p-tab-join").classList.add("active");
      document.getElementById("p2p-tab-host").classList.remove("active");
      document.getElementById("p2p-view-join").style.display = "block";
      document.getElementById("p2p-view-host").style.display = "none";
    });

    // Join submit
    document.getElementById("btn-p2p-join-submit")?.addEventListener("click", () => {
      const codeInput = document.getElementById("input-p2p-room-code");
      const passInput = document.getElementById("input-p2p-passcode");
      const code = codeInput ? codeInput.value.trim() : "";
      const pass = passInput ? passInput.value.trim() : "";

      if (!code) {
        this.showToast("Please enter the 4-digit Party Code!");
        return;
      }
      if (!pass) {
        this.showToast("Please enter the 4-digit Passcode!");
        return;
      }

      const statusEl = document.getElementById("p2p-join-status");
      if (statusEl) {
        statusEl.textContent = "Connecting & verifying passcode with Team 1...";
        statusEl.className = "p2p-status-pill p2p-status-waiting";
      }

      P2PEngine.joinRoom(code, pass).then(() => {
        this.closeModal("modal-dual-device");
        this.showToast("🎉 Passcode verified! Connected to Team 1.");
        this.showScreen("screen-p2p-lobby");
      }).catch(err => {
        if (statusEl) {
          statusEl.textContent = err.message;
          statusEl.className = "p2p-status-pill p2p-status-disconnected";
        }
        this.showToast(err.message);
      });
    });

    // Leave P2P Lobby
    document.getElementById("btn-leave-p2p-lobby")?.addEventListener("click", () => {
      P2PEngine.disconnect();
      this.showScreen("screen-welcome");
      this.showToast("Disconnected from 2-device match.");
    });

    // Copy room invite link (includes party and passcode)
    document.getElementById("btn-copy-room-link")?.addEventListener("click", () => {
      const code = P2PEngine.roomCode;
      const pass = P2PEngine.passcode;
      if (!code || !pass) return;
      const url = `${window.location.origin}${window.location.pathname}?party=${code}&pass=${pass}`;
      navigator.clipboard.writeText(url).then(() => {
        this.showToast("Invite link copied to clipboard! (Party & Passcode included)");
      }).catch(() => {
        prompt("Copy this invite link:", url);
      });
    });

    // Host start match button
    document.getElementById("btn-p2p-host-start")?.addEventListener("click", () => {
      this.closeModal("modal-dual-device");
      this.renderTeamsSetupList();
      this.showScreen("screen-setup");
    });

    document.getElementById("btn-p2p-offline-start")?.addEventListener("click", () => {
      this.closeModal("modal-dual-device");
      this.renderTeamsSetupList();
      this.showScreen("screen-setup");
    });

    // Dual Device: Mode Toggle (Online/Hotspot vs Zero-Internet QR)
    const btnModeOnline = document.getElementById("btn-mode-online");
    const btnModeOffline = document.getElementById("btn-mode-offline");
    const sectionOnline = document.getElementById("p2p-section-online");
    const sectionOffline = document.getElementById("p2p-section-offline");

    btnModeOnline?.addEventListener("click", () => {
      btnModeOnline.classList.add("active");
      btnModeOffline?.classList.remove("active");
      if (sectionOnline) sectionOnline.style.display = "block";
      if (sectionOffline) sectionOffline.style.display = "none";
      P2PEngine.stopQRScanner();
      const cam = document.getElementById("p2p-camera-container");
      if (cam) cam.style.display = "none";
      const txt = document.getElementById("p2p-text-fallback-container");
      if (txt) txt.style.display = "none";
      if (document.getElementById("p2p-tab-host")?.classList.contains("active")) {
        this.initDualDeviceHost();
      }
    });

    btnModeOffline?.addEventListener("click", () => {
      btnModeOffline.classList.add("active");
      btnModeOnline?.classList.remove("active");
      if (sectionOnline) sectionOnline.style.display = "none";
      if (sectionOffline) sectionOffline.style.display = "block";
      if (document.getElementById("p2p-offline-tab-host")?.classList.contains("active")) {
        this.initOfflineHostView();
      }
    });

    // Offline Sub-tabs: Host vs Join
    const tabOffHost = document.getElementById("p2p-offline-tab-host");
    const tabOffJoin = document.getElementById("p2p-offline-tab-join");
    const viewOffHost = document.getElementById("p2p-offline-view-host");
    const viewOffJoin = document.getElementById("p2p-offline-view-join");

    tabOffHost?.addEventListener("click", () => {
      tabOffHost.classList.add("active");
      tabOffJoin?.classList.remove("active");
      if (viewOffHost) viewOffHost.style.display = "block";
      if (viewOffJoin) viewOffJoin.style.display = "none";
      P2PEngine.stopQRScanner();
      const cam = document.getElementById("p2p-camera-container");
      if (cam) cam.style.display = "none";
      const txt = document.getElementById("p2p-text-fallback-container");
      if (txt) txt.style.display = "none";
      this.initOfflineHostView();
    });

    tabOffJoin?.addEventListener("click", () => {
      tabOffJoin.classList.add("active");
      tabOffHost?.classList.remove("active");
      if (viewOffJoin) viewOffJoin.style.display = "block";
      if (viewOffHost) viewOffHost.style.display = "none";
      P2PEngine.stopQRScanner();
      const cam = document.getElementById("p2p-camera-container");
      if (cam) cam.style.display = "none";
      const txt = document.getElementById("p2p-text-fallback-container");
      if (txt) txt.style.display = "none";
      const ansCont = document.getElementById("p2p-offline-answer-container");
      if (ansCont) ansCont.style.display = "none";
      const statusEl = document.getElementById("p2p-offline-status");
      if (statusEl) {
        statusEl.textContent = "Ready to scan Team 1's Offer QR";
        statusEl.className = "p2p-status-pill p2p-status-idle";
      }
    });

    // Offline Joiner scans Host's Offer QR
    document.getElementById("btn-offline-scan-offer")?.addEventListener("click", () => {
      const camContainer = document.getElementById("p2p-camera-container");
      const videoEl = document.getElementById("p2p-scanner-video");
      const camStatus = document.getElementById("p2p-camera-status-text");

      if (camContainer) camContainer.style.display = "block";
      if (camStatus) camStatus.textContent = "Point camera at Team 1's Offer QR code...";

      P2PEngine.startQRScanner(
        videoEl,
        async (scannedText) => {
          try {
            if (camContainer) camContainer.style.display = "none";
            const statusEl = document.getElementById("p2p-offline-status");
            if (statusEl) {
              statusEl.textContent = "Offer scanned! Generating Answer QR...";
              statusEl.className = "p2p-status-pill p2p-status-waiting";
            }
            const answerCode = await P2PEngine.createOfflineAnswer(scannedText);
            this.currentOfflineSignalCode = answerCode;

            const ansCont = document.getElementById("p2p-offline-answer-container");
            const ansQrBox = document.getElementById("p2p-offline-answer-qr");
            if (ansCont && ansQrBox && typeof QRCode !== "undefined") {
              ansCont.style.display = "flex";
              ansQrBox.innerHTML = "";
              new QRCode(ansQrBox, {
                text: answerCode,
                width: 180,
                height: 180,
                colorDark: "#0f172a",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.L
              });
            }

            if (statusEl) {
              statusEl.textContent = "Answer ready! Let Team 1 scan your QR.";
              statusEl.className = "p2p-status-pill p2p-status-waiting";
            }
            this.showToast("✓ Offer received! Now let Team 1 scan your Answer QR.");
          } catch (e) {
            this.showToast("Invalid Offer QR: " + e.message);
          }
        },
        (err) => {
          if (camContainer) camContainer.style.display = "none";
          this.showToast("Camera access error: " + err.message);
        }
      );
    });

    // Offline Host scans Joiner's Answer QR
    document.getElementById("btn-offline-scan-answer")?.addEventListener("click", () => {
      const camContainer = document.getElementById("p2p-camera-container");
      const videoEl = document.getElementById("p2p-scanner-video");
      const camStatus = document.getElementById("p2p-camera-status-text");

      if (camContainer) camContainer.style.display = "block";
      if (camStatus) camStatus.textContent = "Point camera at Team 2's Answer QR code...";

      P2PEngine.startQRScanner(
        videoEl,
        async (scannedText) => {
          try {
            if (camContainer) camContainer.style.display = "none";
            const statusEl = document.getElementById("p2p-offline-status");
            if (statusEl) {
              statusEl.textContent = "Connecting to Team 2...";
              statusEl.className = "p2p-status-pill p2p-status-waiting";
            }
            await P2PEngine.applyOfflineAnswer(scannedText);
            this.showToast("🎉 Answer applied! Connecting via offline WebRTC...");
          } catch (e) {
            this.showToast("Invalid Answer QR: " + e.message);
          }
        },
        (err) => {
          if (camContainer) camContainer.style.display = "none";
          this.showToast("Camera access error: " + err.message);
        }
      );
    });

    // Cancel / Stop Camera Scanner
    document.getElementById("btn-p2p-cancel-camera")?.addEventListener("click", () => {
      P2PEngine.stopQRScanner();
      const camContainer = document.getElementById("p2p-camera-container");
      if (camContainer) camContainer.style.display = "none";
    });

    // Toggle Laptop / Text Fallback Input
    const toggleTextFallback = () => {
      const container = document.getElementById("p2p-text-fallback-container");
      if (!container) return;
      const isHidden = container.style.display === "none" || !container.style.display;
      container.style.display = isHidden ? "block" : "none";
      if (isHidden && this.currentOfflineSignalCode) {
        const input = document.getElementById("p2p-text-fallback-input");
        if (input) input.value = this.currentOfflineSignalCode;
      }
    };
    document.getElementById("btn-offline-host-text")?.addEventListener("click", toggleTextFallback);
    document.getElementById("btn-offline-join-text")?.addEventListener("click", toggleTextFallback);

    // Copy Code Fallback
    document.getElementById("btn-p2p-copy-code")?.addEventListener("click", () => {
      const input = document.getElementById("p2p-text-fallback-input");
      const val = (input && input.value.trim()) || this.currentOfflineSignalCode;
      if (!val) {
        this.showToast("No code to copy yet!");
        return;
      }
      navigator.clipboard.writeText(val).then(() => {
        this.showToast("Connection code copied to clipboard!");
      }).catch(() => {
        prompt("Copy this code:", val);
      });
    });

    // Apply Code Fallback
    document.getElementById("btn-p2p-apply-text")?.addEventListener("click", async () => {
      const input = document.getElementById("p2p-text-fallback-input");
      const val = input ? input.value.trim() : "";
      if (!val) {
        this.showToast("Please paste the connection code first!");
        return;
      }

      const isOffer = val.startsWith("TABOO_OFFER:") || (!val.startsWith("TABOO_ANSWER:") && P2PEngine.role !== "host");
      const isAnswer = val.startsWith("TABOO_ANSWER:") || (P2PEngine.role === "host");

      try {
        if (isOffer && (!val.startsWith("TABOO_ANSWER:") || P2PEngine.role !== "host")) {
          const answerCode = await P2PEngine.createOfflineAnswer(val);
          this.currentOfflineSignalCode = answerCode;
          if (input) input.value = answerCode;

          const ansCont = document.getElementById("p2p-offline-answer-container");
          const ansQrBox = document.getElementById("p2p-offline-answer-qr");
          if (ansCont && ansQrBox && typeof QRCode !== "undefined") {
            ansCont.style.display = "flex";
            ansQrBox.innerHTML = "";
            new QRCode(ansQrBox, {
              text: answerCode,
              width: 180,
              height: 180,
              colorDark: "#0f172a",
              colorLight: "#ffffff",
              correctLevel: QRCode.CorrectLevel.L
            });
          }
          this.showToast("✓ Offer applied! Answer generated. Send code to Host.");
        } else if (isAnswer) {
          await P2PEngine.applyOfflineAnswer(val);
          this.showToast("🎉 Answer applied! Connecting via offline WebRTC...");
        }
      } catch (err) {
        this.showToast("Error applying code: " + err.message);
      }
    });

    // Resume Session Banner Buttons
    document.getElementById("btn-resume-session")?.addEventListener("click", () => this.restoreSession());
    document.getElementById("btn-discard-session")?.addEventListener("click", () => this.discardActiveSession());

    // Quit Match Button inside Pause Overlay
    document.getElementById("btn-quit-match")?.addEventListener("click", () => this.handleQuitMatch());

    // Window Unload Auto-Save
    window.addEventListener("beforeunload", () => {
      this.saveActiveSession();
    });

    document.getElementById("btn-open-rules")?.addEventListener("click", () => this.showModal("modal-rules"));
    document.getElementById("btn-open-buzzer")?.addEventListener("click", () => this.showModal("modal-buzzer"));
    document.getElementById("btn-open-cards-mgr")?.addEventListener("click", () => this.showModal("modal-custom-cards"));

    // Welcome Screen Buttons
    document.getElementById("btn-nav-play")?.addEventListener("click", () => {
      if (P2PEngine.isConnected && P2PEngine.role === "client") {
        this.showScreen("screen-p2p-lobby");
        return;
      }
      this.renderTeamsSetupList();
      this.renderPlayersSetupList();
      this.showScreen("screen-setup");
    });
    document.getElementById("btn-nav-rules")?.addEventListener("click", () => this.showModal("modal-rules"));
    document.getElementById("btn-nav-custom")?.addEventListener("click", () => this.showModal("modal-custom-cards"));
    document.getElementById("btn-nav-quick-buzzer")?.addEventListener("click", () => this.showModal("modal-buzzer"));

    // Setup Screen: Game Format Toggle (Teams vs Free-For-All)
    document.getElementById("format-pill-teams")?.addEventListener("click", () => {
      document.getElementById("format-pill-teams").classList.add("active");
      document.getElementById("format-pill-ffa")?.classList.remove("active");
      const teamsView = document.getElementById("setup-teams-view");
      const ffaView = document.getElementById("setup-ffa-view");
      const teamsDesc = document.getElementById("format-desc-teams");
      const ffaDesc = document.getElementById("format-desc-ffa");
      if (teamsView) teamsView.style.display = "block";
      if (ffaView) ffaView.style.display = "none";
      if (teamsDesc) teamsDesc.style.display = "block";
      if (ffaDesc) ffaDesc.style.display = "none";
      this.config.gameFormat = "teams";
      this.saveSettings();
    });

    document.getElementById("format-pill-ffa")?.addEventListener("click", () => {
      document.getElementById("format-pill-ffa").classList.add("active");
      document.getElementById("format-pill-teams")?.classList.remove("active");
      const teamsView = document.getElementById("setup-teams-view");
      const ffaView = document.getElementById("setup-ffa-view");
      const teamsDesc = document.getElementById("format-desc-teams");
      const ffaDesc = document.getElementById("format-desc-ffa");
      if (teamsView) teamsView.style.display = "none";
      if (ffaView) ffaView.style.display = "block";
      if (teamsDesc) teamsDesc.style.display = "none";
      if (ffaDesc) ffaDesc.style.display = "block";
      this.config.gameFormat = "ffa";
      this.renderPlayersSetupList();
      this.saveSettings();
    });

    document.getElementById("btn-add-player")?.addEventListener("click", () => this.addPlayer());

    // Gameplay In-Between Word Controls
    document.getElementById("btn-ffa-next-word")?.addEventListener("click", () => this.proceedToNextWord());
    document.getElementById("btn-ffa-cancel-score")?.addEventListener("click", () => this.selectGuesser("none"));
    document.getElementById("btn-word-undo")?.addEventListener("click", () => this.undoLastCardScore());

    // Device 2 Spectator Taboo Buzzer
    document.getElementById("btn-spectator-buzzer")?.addEventListener("click", () => {
      SoundEngine.playBuzzer();
      SoundEngine.vibrate([200, 100, 200]);
      if (P2PEngine.isConnected) {
        P2PEngine.send("CARD_ACTION", { action: "taboo" });
      }
    });

    // Setup Screen Options
    document.getElementById("btn-add-team")?.addEventListener("click", () => this.addTeam());
    
    document.querySelectorAll("[data-time-val]").forEach(pill => {
      pill.addEventListener("click", () => {
        document.querySelectorAll("[data-time-val]").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        this.config.roundDuration = parseInt(pill.dataset.timeVal, 10);
        this.saveSettings();
      });
    });

    document.querySelectorAll("[data-score-val]").forEach(pill => {
      pill.addEventListener("click", () => {
        document.querySelectorAll("[data-score-val]").forEach(p => p.classList.remove("active"));
        pill.classList.add("active");
        const val = pill.dataset.scoreVal;
        if (val === "rounds") {
          this.config.isFixedRounds = true;
          this.config.maxRounds = 3;
        } else {
          this.config.isFixedRounds = false;
          this.config.targetScore = parseInt(val, 10);
        }
        this.saveSettings();
      });
    });

    document.getElementById("btn-start-game")?.addEventListener("click", () => this.startNewGame());
    document.getElementById("btn-setup-back")?.addEventListener("click", () => this.showScreen("screen-welcome"));

    // Handoff Screen
    document.getElementById("btn-start-turn-countdown")?.addEventListener("click", () => this.triggerCountdown());

    // Gameplay Controls
    document.getElementById("btn-action-correct")?.addEventListener("click", () => this.handleCorrect());
    document.getElementById("btn-action-taboo")?.addEventListener("click", () => this.handleTaboo());
    document.getElementById("btn-action-skip")?.addEventListener("click", () => this.handleSkip());
    document.getElementById("btn-action-pause")?.addEventListener("click", () => this.togglePause());
    document.getElementById("btn-resume-game")?.addEventListener("click", () => this.togglePause());

    // In-game quick opponent buzzer
    document.getElementById("btn-ingame-buzzer")?.addEventListener("click", () => {
      SoundEngine.playBuzzer();
    });

    // Review Screen
    document.getElementById("btn-confirm-review")?.addEventListener("click", () => this.confirmRoundScore());

    // Victory Screen
    document.getElementById("btn-play-again-same")?.addEventListener("click", () => this.startNewGame());
    document.getElementById("btn-rematch-setup")?.addEventListener("click", () => {
      this.renderTeamsSetupList();
      this.renderPlayersSetupList();
      this.showScreen("screen-setup");
    });

    // Modals Close
    document.querySelectorAll("[data-close-modal]").forEach(btn => {
      btn.addEventListener("click", () => {
        const modalId = btn.dataset.closeModal;
        this.closeModal(modalId);
      });
    });

    // Giant Buzzer Button
    document.getElementById("giant-buzzer-button")?.addEventListener("click", () => {
      SoundEngine.playBuzzer();
    });

    // Custom Deck Manager Tabs
    document.getElementById("tab-deck-import")?.addEventListener("click", () => this.switchDeckManagerTab("import"));
    document.getElementById("tab-deck-add")?.addEventListener("click", () => this.switchDeckManagerTab("add"));
    document.getElementById("tab-deck-view")?.addEventListener("click", () => this.switchDeckManagerTab("view"));

    // Copy AI Deck Prompt for LLM
    document.getElementById("btn-copy-llm-prompt")?.addEventListener("click", () => {
      const promptText = `You are a Taboo party game master. Generate a high-quality deck of custom Taboo cards in valid JSON format.

JSON Requirements:
- Output ONLY a valid JSON array of card objects (or {"cards": [...]}).
- Each card object must have:
  * "word": string (Target guess word or phrase, UPPERCASE)
  * "taboo": array of 5 distinct forbidden words that cannot be spoken (UPPERCASE)
  * "category": string (Theme or category name, e.g. "Harry Potter", "Marvel", "Inside Jokes")
  * "difficulty": "easy" | "medium" | "hard"

Taboo Guidelines:
1. Provide 5 taboo words that are the most natural, obvious words a player would instinctively use to describe the target word.
2. Do NOT include derivatives or variations of the target word in its taboo list (e.g. if the word is "BAKER", do not include "BAKE" or "BAKERY").
3. Make them fun, lively, and challenging for game night.

Example JSON format:
[
  {
    "word": "ESPRESSO",
    "taboo": ["COFFEE", "SHOT", "CAFFEINE", "DRINK", "MACHINE"],
    "category": "Food & Drink",
    "difficulty": "medium"
  },
  {
    "word": "HOGWARTS",
    "taboo": ["HARRY", "POTTER", "MAGIC", "SCHOOL", "WIZARD"],
    "category": "Harry Potter",
    "difficulty": "easy"
  }
]`;

      navigator.clipboard.writeText(promptText).then(() => {
        this.showToast("📋 AI Prompt copied! Paste into ChatGPT, Gemini, or Claude.");
      }).catch(() => {
        prompt("Copy this prompt for your LLM:", promptText);
      });
    });

    // File Input Import
    document.getElementById("file-import-custom-deck")?.addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        const textarea = document.getElementById("textarea-import-deck");
        if (textarea) textarea.value = evt.target.result;
        this.showToast(`Loaded ${file.name}! Click 'Import Deck to Game' below.`);
      };
      reader.readAsText(file);
    });

    // Submit Import Deck (Textarea / File)
    document.getElementById("btn-submit-import-deck")?.addEventListener("click", () => {
      const textarea = document.getElementById("textarea-import-deck");
      const replaceCheck = document.getElementById("check-replace-deck");
      const content = textarea ? textarea.value.trim() : "";

      if (!content) {
        this.showToast("Please paste JSON or upload a file first!");
        return;
      }

      try {
        const replaceExisting = replaceCheck ? replaceCheck.checked : false;
        const result = CardDB.importCustomCards(content, replaceExisting);
        this.renderCustomCardsList();
        this.renderCategoryChips();
        this.switchDeckManagerTab("view");
        if (textarea) textarea.value = "";
        
        const catMsg = result.categories.length > 0 ? ` in [${result.categories.join(", ")}]` : "";
        this.showToast(`🎉 Imported ${result.count} cards${catMsg}!`);
      } catch (err) {
        alert("Import failed: " + err.message);
      }
    });

    // Custom Card Form Submit
    document.getElementById("form-add-custom-card")?.addEventListener("submit", (e) => this.handleAddCustomCardSubmit(e));

    // Custom Cards Export
    document.getElementById("btn-export-custom-cards")?.addEventListener("click", () => {
      const cards = CardDB.getCustomCards();
      if (cards.length === 0) {
        this.showToast("No custom cards to export!");
        return;
      }
      const json = CardDB.exportCustomCards();
      navigator.clipboard.writeText(json).then(() => {
        this.showToast("Custom deck JSON copied to clipboard!");
      }).catch(() => {
        prompt("Custom deck JSON:", json);
      });
    });

    // Clear All Custom Cards
    document.getElementById("btn-clear-all-custom")?.addEventListener("click", () => {
      const cards = CardDB.getCustomCards();
      if (cards.length === 0) {
        this.showToast("Custom deck is already empty!");
        return;
      }
      if (confirm(`Are you sure you want to delete all ${cards.length} custom cards?`)) {
        CardDB.clearCustomCards();
        this.renderCustomCardsList();
        this.renderCategoryChips();
        this.showToast("Custom deck cleared!");
      }
    });

    // Global Keyboard Shortcuts
    window.addEventListener("keydown", (e) => {
      const activeScreen = document.querySelector(".screen.active");
      if (!activeScreen || activeScreen.id !== "screen-game") return;

      if (e.code === "Space" || e.code === "ArrowRight") {
        e.preventDefault();
        this.handleCorrect();
      } else if (e.code === "KeyB" || e.code === "ArrowDown") {
        e.preventDefault();
        this.handleTaboo();
      } else if (e.code === "KeyS" || e.code === "ArrowLeft") {
        e.preventDefault();
        this.handleSkip();
      } else if (e.code === "KeyP" || e.code === "Escape") {
        e.preventDefault();
        this.togglePause();
      }
    });
  }
};

// Start application when DOM is ready
window.addEventListener("DOMContentLoaded", () => {
  TabooApp.init();
});
