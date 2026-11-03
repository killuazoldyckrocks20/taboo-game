/**
 * TABOO PARTY GAME - MASTER APPLICATION ENGINE
 * Complete Game State Machine, Turn Cycling, Dispute Resolution & UI Controller
 */

const TabooApp = {
  // Global Game Configuration
  config: {
    roundDuration: 60,
    targetScore: 30,
    isFixedRounds: false,
    maxRounds: 3,
    skipPenalty: 0,
    tabooPenalty: -1,
    skipLimit: 0, // 0 = unlimited
    selectedCategory: "All",
    soundEnabled: true,
    vibrationEnabled: true,
    recordAudio: false
  },

  // Game Match State
  state: {
    teams: [
      { id: 1, name: "Team Orange 🍊", color: "var(--team-orange)", score: 0 },
      { id: 2, name: "Team Blue 🔷", color: "var(--team-blue)", score: 0 }
    ],
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

  init: function() {
    SoundEngine.loadMuteState();
    this.loadSavedSettings();
    this.setupEventListeners();
    this.setupP2PListeners();
    this.renderCategoryChips();
    this.showScreen("screen-welcome");
    this.checkAndDisplayResumeBanner();
    ConfettiEngine.init();
    this.checkUrlForRoomCode();
  },

  // ==========================================
  // NAVIGATION & SCREEN SWITCHING
  // ==========================================
  showScreen: function(screenId) {
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

  startNewGame: function() {
    this.clearActiveSession();
    AudioRecorder.clearAll();
    this.state.roundAudioUrl = null;

    // Reset match scores
    this.state.teams.forEach(t => t.score = 0);
    this.state.currentTeamIdx = 0;
    this.state.roundNumber = 1;
    this.state.isGameOver = false;
    this.state.winner = null;

    // Build and shuffle deck
    this.prepareDeck();

    if (P2PEngine.isConnected && P2PEngine.role === "host") {
      P2PEngine.send("MATCH_START", {
        teams: this.state.teams,
        deck: this.state.deck,
        roundNumber: this.state.roundNumber,
        currentTeamIdx: this.state.currentTeamIdx
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
    const currentTeam = this.state.teams[this.state.currentTeamIdx];
    
    // Update labels
    const banner = document.getElementById("handoff-round-banner");
    if (banner) {
      banner.textContent = `Round ${this.state.roundNumber} • Turn ${this.state.currentTeamIdx + 1} of ${this.state.teams.length}`;
      banner.style.backgroundColor = currentTeam.color;
    }

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
    const currentTeam = this.state.teams[this.state.currentTeamIdx];
    this.state.timeLeft = this.config.roundDuration;
    this.state.isPaused = false;
    this.state.skipsUsedThisTurn = 0;
    this.state.turnCards = [];
    this.state.currentCardVotes = { hostVote: null, peerVote: null };
    this.state.roundAudioUrl = null;

    // Header info
    const teamDot = document.getElementById("active-team-dot");
    if (teamDot) teamDot.style.backgroundColor = currentTeam.color;

    const teamName = document.getElementById("active-team-name");
    if (teamName) teamName.textContent = currentTeam.name;

    this.updateTurnScorePill();
    this.updateSkipButtonLabel();
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
        currentTeamIdx: this.state.currentTeamIdx,
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
    if (this.state.isPaused || !this.activeCard) return;

    SoundEngine.playCorrect();

    let hostVote = "correct";
    let peerVote = "correct";
    if (P2PEngine.isConnected) {
      if (P2PEngine.role === "host") {
        hostVote = "correct";
        peerVote = (this.state.currentCardVotes && this.state.currentCardVotes.peerVote) || "correct";
        P2PEngine.send("CARD_ACTION", { action: "correct" });
      } else {
        peerVote = "correct";
        hostVote = (this.state.currentCardVotes && this.state.currentCardVotes.hostVote) || "correct";
        P2PEngine.send("CARD_ACTION", { action: "correct" });
      }
    }

    this.state.turnCards.push({
      card: this.activeCard,
      status: "correct",
      originalStatus: "correct",
      hostVote: hostVote,
      peerVote: peerVote
    });

    const cardEl = document.getElementById("active-taboo-card");
    if (cardEl) {
      cardEl.classList.add("card-animate-correct");
      setTimeout(() => this.displayNextCard(), 180);
    } else {
      this.displayNextCard();
    }

    this.updateTurnScorePill();
  },

  handleTaboo: function() {
    if (this.state.isPaused || !this.activeCard) return;

    SoundEngine.playBuzzer();

    let hostVote = "taboo";
    let peerVote = "taboo";
    if (P2PEngine.isConnected) {
      if (P2PEngine.role === "host") {
        hostVote = "taboo";
        peerVote = (this.state.currentCardVotes && this.state.currentCardVotes.peerVote) || "taboo";
        P2PEngine.send("CARD_ACTION", { action: "taboo" });
      } else {
        peerVote = "taboo";
        hostVote = (this.state.currentCardVotes && this.state.currentCardVotes.hostVote) || "taboo";
        P2PEngine.send("CARD_ACTION", { action: "taboo" });
      }
    }

    this.state.turnCards.push({
      card: this.activeCard,
      status: "taboo",
      originalStatus: "taboo",
      hostVote: hostVote,
      peerVote: peerVote
    });

    const cardEl = document.getElementById("active-taboo-card");
    if (cardEl) {
      cardEl.classList.add("card-animate-taboo");
      setTimeout(() => this.displayNextCard(), 250);
    } else {
      this.displayNextCard();
    }

    this.updateTurnScorePill();
  },

  handleSkip: function() {
    if (this.state.isPaused || !this.activeCard) return;

    if (this.config.skipLimit > 0 && this.state.skipsUsedThisTurn >= this.config.skipLimit) {
      this.showToast(`Skip limit reached (${this.config.skipLimit} max)!`);
      SoundEngine.vibrate([100]);
      return;
    }

    this.state.skipsUsedThisTurn++;
    SoundEngine.playSkip();

    let hostVote = "skip";
    let peerVote = "skip";
    if (P2PEngine.isConnected) {
      if (P2PEngine.role === "host") {
        hostVote = "skip";
        peerVote = (this.state.currentCardVotes && this.state.currentCardVotes.peerVote) || "skip";
        P2PEngine.send("CARD_ACTION", { action: "skip" });
      } else {
        peerVote = "skip";
        hostVote = (this.state.currentCardVotes && this.state.currentCardVotes.hostVote) || "skip";
        P2PEngine.send("CARD_ACTION", { action: "skip" });
      }
    }

    this.state.turnCards.push({
      card: this.activeCard,
      status: "skip",
      originalStatus: "skip",
      hostVote: hostVote,
      peerVote: peerVote
    });

    this.updateSkipButtonLabel();

    const cardEl = document.getElementById("active-taboo-card");
    if (cardEl) {
      cardEl.classList.add("card-animate-skip");
      setTimeout(() => this.displayNextCard(), 180);
    } else {
      this.displayNextCard();
    }

    this.updateTurnScorePill();
  },

  updateSkipButtonLabel: function() {
    const subLabel = document.getElementById("btn-skip-sub");
    if (!subLabel) return;
    if (this.config.skipLimit > 0) {
      const remaining = Math.max(0, this.config.skipLimit - this.state.skipsUsedThisTurn);
      subLabel.textContent = `${remaining} left`;
    } else {
      subLabel.textContent = this.config.skipPenalty < 0 ? "-1 pt" : "0 pt";
    }
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
      if (this.state.isPaused) return;

      this.state.timeLeft--;
      this.updateTimerDisplay(circle, textEl, circumference);
      this.saveActiveSession();

      if (P2PEngine.isConnected && P2PEngine.role === "host") {
        P2PEngine.send("TIMER_SYNC", { timeLeft: this.state.timeLeft });
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
    const currentTeam = this.state.teams[this.state.currentTeamIdx];
    const headerTitle = document.getElementById("review-team-header");
    if (headerTitle) {
      headerTitle.textContent = `${currentTeam.name}'s Round Review`;
      headerTitle.style.color = currentTeam.color;
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

      const row = document.createElement("div");
      row.className = `review-item ${isDisputed ? 'disputed' : ''}`;
      row.innerHTML = `
        <div class="review-item-info">
          <span class="review-item-word">${item.card.word}</span>
          <span class="review-item-cat">${item.card.category || "General"}</span>
          ${voteBadgeHtml}
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
          this.renderReviewCardsList();
          this.updateReviewScoreSummary();
          this.saveActiveSession();

          if (P2PEngine.isConnected) {
            P2PEngine.send("DISPUTE_UPDATE", { cardIdx: idx, status: newStatus });
          }
        });
      });

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
    const currentTeam = this.state.teams[this.state.currentTeamIdx];
    const turnPoints = this.calculateCurrentTurnScore();
    currentTeam.score += turnPoints;

    AudioRecorder.pause();

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
        // Find highest scoring team
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
  triggerVictory: function(winningTeam) {
    this.state.isGameOver = true;
    this.state.winner = winningTeam;
    this.clearActiveSession();
    AudioRecorder.clearAll();

    const winnerCallout = document.getElementById("victory-winner-team");
    if (winnerCallout) {
      winnerCallout.textContent = `${winningTeam.name} WINS!`;
      winnerCallout.style.color = winningTeam.color;
    }

    const scoreboard = document.getElementById("victory-scoreboard");
    if (scoreboard) {
      scoreboard.innerHTML = "";
      const sorted = [...this.state.teams].sort((a, b) => b.score - a.score);
      sorted.forEach((t, rank) => {
        const row = document.createElement("div");
        row.className = `final-score-row ${t.id === winningTeam.id ? 'winner' : ''}`;
        row.innerHTML = `
          <div class="flex items-center gap-3">
            <span class="font-bold text-slate-400">#${rank + 1}</span>
            <span class="final-team-name" style="color: ${t.color}">${t.name}</span>
          </div>
          <span class="final-team-points">${t.score} pts</span>
        `;
        scoreboard.appendChild(row);
      });
    }

    this.showScreen("screen-victory");
    ConfettiEngine.fire(5000);
    SoundEngine.playVictory();
  },

  // ==========================================
  // CUSTOM CARDS MANAGER
  // ==========================================
  renderCustomCardsList: function() {
    const container = document.getElementById("custom-cards-container");
    if (!container) return;
    const cards = CardDB.getCustomCards();

    if (cards.length === 0) {
      container.innerHTML = `<div class="text-center text-slate-400 py-6 text-sm">No custom cards created yet. Create your first card above!</div>`;
      return;
    }

    container.innerHTML = cards.map(c => `
      <div class="review-item">
        <div class="review-item-info">
          <span class="review-item-word">${c.word}</span>
          <span class="review-item-cat">${c.taboo.join(" • ")}</span>
        </div>
        <button type="button" class="btn-danger-outline py-1 px-3 text-xs" data-delete-id="${c.id}">Delete</button>
      </div>
    `).join("");

    container.querySelectorAll("[data-delete-id]").forEach(btn => {
      btn.addEventListener("click", () => {
        CardDB.deleteCustomCard(btn.dataset.deleteId);
        this.renderCustomCardsList();
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
    this.showToast("Card created and added to deck!");
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

    const skipToggle = document.getElementById("toggle-skip-penalty");
    if (skipToggle) skipToggle.checked = (this.config.skipPenalty < 0);

    const audioToggle = document.getElementById("toggle-record-audio");
    if (audioToggle) audioToggle.checked = Boolean(this.config.recordAudio);

    const muteIcon = document.getElementById("mute-icon");
    if (muteIcon) muteIcon.textContent = SoundEngine.isMuted ? "🔇" : "🔊";
  },

  saveSettings: function() {
    try {
      localStorage.setItem("taboo_game_config", JSON.stringify(this.config));
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
      const startHostBtn = document.getElementById("btn-p2p-host-start");
      if (startHostBtn) startHostBtn.style.display = "block";

      P2PEngine.send("MATCH_CONFIG", {
        config: this.config,
        teams: this.state.teams
      });
    });

    P2PEngine.on("MATCH_CONFIG", (payload) => {
      if (payload.config) Object.assign(this.config, payload.config);
      if (payload.teams) this.state.teams = payload.teams;
      this.showToast("Connected to Team 1's match!");
      const joinStatus = document.getElementById("p2p-join-status");
      if (joinStatus) {
        joinStatus.textContent = "Connected! Waiting for host to start...";
        joinStatus.className = "p2p-status-pill p2p-status-connected";
      }
    });

    P2PEngine.on("MATCH_START", (payload) => {
      this.closeModal("modal-dual-device");
      this.state.teams = payload.teams;
      this.state.deck = payload.deck;
      this.state.roundNumber = payload.roundNumber || 1;
      this.state.currentTeamIdx = payload.currentTeamIdx || 0;
      this.showHandoffScreen();
    });

    P2PEngine.on("TURN_START", (payload) => {
      this.state.currentTeamIdx = payload.currentTeamIdx;
      this.state.roundNumber = payload.roundNumber;
      this.state.timeLeft = payload.timeLeft;
      this.activeCard = payload.activeCard;
      this.state.turnCards = [];
      this.showScreen("screen-game");
      this.renderCard(this.activeCard);
      this.updateTurnScorePill();
      this.updateSkipButtonLabel();
    });

    P2PEngine.on("CARD_DRAW", (payload) => {
      this.activeCard = payload.card;
      this.renderCard(this.activeCard);
    });

    P2PEngine.on("CARD_ACTION", (payload) => {
      if (payload.action === "taboo") {
        SoundEngine.playBuzzer();
        this.showToast("🚨 Opponent buzzed TABOO!");
      } else if (payload.action === "correct") {
        SoundEngine.playCorrect();
      }

      if (P2PEngine.role === "host") {
        this.recordCardVote("peer", payload.action);
      } else {
        this.recordCardVote("host", payload.action);
      }
    });

    P2PEngine.on("TIMER_SYNC", (payload) => {
      if (P2PEngine.role === "client") {
        this.state.timeLeft = payload.timeLeft;
        const circle = document.getElementById("timer-circle-progress");
        const textEl = document.getElementById("timer-display-text");
        const circumference = 2 * Math.PI * 30;
        this.updateTimerDisplay(circle, textEl, circumference);
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
    const qrContainer = document.getElementById("p2p-qrcode-container");

    P2PEngine.initHost().then(roomCode => {
      if (codeEl) codeEl.textContent = roomCode;
      if (qrContainer && typeof QRCode !== "undefined") {
        qrContainer.innerHTML = "";
        const joinUrl = `${window.location.origin}${window.location.pathname}?room=${roomCode}`;
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

  checkUrlForRoomCode: function() {
    const params = new URLSearchParams(window.location.search);
    const room = params.get("room");
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

      const input = document.getElementById("input-p2p-room-code");
      if (input) input.value = room;

      P2PEngine.joinRoom(room).catch(err => {
        this.showToast("Could not join room: " + err.message);
      });
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

    document.getElementById("toggle-skip-penalty")?.addEventListener("change", (e) => {
      this.config.skipPenalty = e.target.checked ? -1 : 0;
      this.saveSettings();
      this.showToast(e.target.checked ? "Skip penalty enabled (-1 pt)" : "Skip penalty disabled (0 pt)");
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
      const code = codeInput ? codeInput.value.trim() : "";
      if (!code) {
        this.showToast("Please enter a room code!");
        return;
      }
      const statusEl = document.getElementById("p2p-join-status");
      if (statusEl) {
        statusEl.textContent = "Connecting to Team 1's phone...";
        statusEl.className = "p2p-status-pill p2p-status-waiting";
      }
      P2PEngine.joinRoom(code).then(() => {
        this.showToast("Connected to Team 1! Waiting for match to start...");
      }).catch(err => {
        if (statusEl) {
          statusEl.textContent = "Failed to connect: " + err.message;
          statusEl.className = "p2p-status-pill p2p-status-disconnected";
        }
      });
    });

    // Copy room invite link
    document.getElementById("btn-copy-room-link")?.addEventListener("click", () => {
      const code = P2PEngine.roomCode;
      if (!code) return;
      const url = `${window.location.origin}${window.location.pathname}?room=${code}`;
      navigator.clipboard.writeText(url).then(() => {
        this.showToast("Invite link copied to clipboard!");
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
      this.renderTeamsSetupList();
      this.showScreen("screen-setup");
    });
    document.getElementById("btn-nav-rules")?.addEventListener("click", () => this.showModal("modal-rules"));
    document.getElementById("btn-nav-custom")?.addEventListener("click", () => this.showModal("modal-custom-cards"));
    document.getElementById("btn-nav-quick-buzzer")?.addEventListener("click", () => this.showModal("modal-buzzer"));

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
    document.getElementById("btn-rematch-setup")?.addEventListener("click", () => this.showScreen("screen-setup"));

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

    // Custom Card Form Submit
    document.getElementById("form-add-custom-card")?.addEventListener("submit", (e) => this.handleAddCustomCardSubmit(e));

    // Custom Cards Export & Import
    document.getElementById("btn-export-custom-cards")?.addEventListener("click", () => {
      const json = CardDB.exportCustomCards();
      navigator.clipboard.writeText(json).then(() => {
        this.showToast("Custom cards JSON copied to clipboard!");
      }).catch(() => {
        alert("Custom cards JSON:\n" + json);
      });
    });

    document.getElementById("btn-import-custom-cards")?.addEventListener("click", () => {
      const input = prompt("Paste custom cards JSON here:");
      if (input) {
        try {
          const count = CardDB.importCustomCards(input);
          this.renderCustomCardsList();
          this.showToast(`Imported ${count} cards successfully!`);
        } catch (e) {
          alert("Invalid JSON format! Please check your data.");
        }
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
