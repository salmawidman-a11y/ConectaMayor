const VoiceModule = {
  recognition: null,
  synthesis: window.speechSynthesis,
  isListening: false,
  
  init() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Web Speech API not supported');
      this.hideVoiceUI();
      return;
    }
    
    this.recognition = new SpeechRecognition();
    this.recognition.lang = 'es-MX';
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;
    
    this.setupUI();
    this.setupEventListeners();
  },

  hideVoiceUI() {
    const voiceMenuBtn = document.getElementById('btn-voice-menu');
    if (voiceMenuBtn) voiceMenuBtn.style.display = 'none';
  },

  setupUI() {
    this.modal = document.getElementById('voice-modal');
    this.triggerBtn = document.getElementById('btn-voice-menu');
    this.closeBtn = document.getElementById('btn-voice-close');
    
    // States
    this.stateListening = document.getElementById('voice-listening');
    this.stateConfirm = document.getElementById('voice-confirm');
    this.stateError = document.getElementById('voice-error');
    
    // Elements
    this.transcriptText = document.getElementById('voice-transcript');
    this.commandText = document.getElementById('voice-command-text');
    this.errorMsg = document.getElementById('voice-error-msg');
    
    // Action buttons
    this.btnYes = document.getElementById('btn-voice-yes');
    this.btnNo = document.getElementById('btn-voice-no');
    this.btnRetry = document.getElementById('btn-voice-retry');

    // Attach click events
    if (this.triggerBtn) this.triggerBtn.addEventListener('click', () => this.startListening());
    if (this.closeBtn) this.closeBtn.addEventListener('click', () => this.closeModal());
    
    if (this.btnNo) this.btnNo.addEventListener('click', () => this.closeModal());
    if (this.btnRetry) this.btnRetry.addEventListener('click', () => this.startListening());
  },
  
  setupEventListeners() {
    this.recognition.onstart = () => {
      this.isListening = true;
      this.showListeningState();
    };
    
    this.recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      
      if (this.transcriptText) {
        this.transcriptText.textContent = `"${finalTranscript || interimTranscript}"`;
      }
      
      if (finalTranscript) {
        this.processCommand(finalTranscript);
      }
    };
    
    this.recognition.onerror = (event) => {
      this.isListening = false;
      let message = "Hubo una interrupción. Puede intentarlo nuevamente.";
      if (event.error === 'no-speech') {
        message = "No logramos escucharle. Toque intentar de nuevo.";
      } else if (event.error === 'not-allowed') {
        message = "Por favor permita el acceso al micrófono en su navegador.";
      }
      this.showErrorState(message);
    };
    
    this.recognition.onend = () => {
      this.isListening = false;
      if (this.triggerBtn) this.triggerBtn.classList.remove('listening');
    };
  },
  
  startListening() {
    if (this.isListening || !this.recognition) return;
    try {
      this.recognition.start();
    } catch (e) {
      console.error('Error starting recognition:', e);
    }
  },

  stopListening() {
    if (!this.recognition) return;
    try {
      this.recognition.stop();
    } catch (e) {}
    this.isListening = false;
  },

  showListeningState() {
    if (this.modal) {
      this.modal.hidden = false;
      this.modal.setAttribute('aria-hidden', 'false');
    }
    
    this.stateListening.hidden = false;
    this.stateConfirm.hidden = true;
    this.stateError.hidden = true;
    this.transcriptText.textContent = '"..."';
  },

  showConfirmState(commandText, actionCallback) {
    this.stopListening();
    this.stateListening.hidden = true;
    this.stateConfirm.hidden = false;
    this.stateError.hidden = true;
    
    this.commandText.textContent = commandText;
    this.readAloud("¿Desea " + commandText + "?");

    // Clear old events by replacing the button
    const newBtnYes = this.btnYes.cloneNode(true);
    this.btnYes.parentNode.replaceChild(newBtnYes, this.btnYes);
    this.btnYes = newBtnYes;

    this.btnYes.addEventListener('click', () => {
      this.closeModal();
      actionCallback();
    });
  },

  showErrorState(message) {
    this.stopListening();
    this.stateListening.hidden = true;
    this.stateConfirm.hidden = true;
    this.stateError.hidden = false;
    
    if (this.errorMsg) this.errorMsg.textContent = message;
    this.readAloud(message);
  },

  closeModal() {
    this.stopListening();
    if (this.modal) {
      this.modal.hidden = true;
      this.modal.setAttribute('aria-hidden', 'true');
    }
    this.synthesis.cancel(); // Stop speaking if they close
  },
  
  processCommand(transcript) {
    const normalized = this.normalizeSpanish(transcript);
    
    if (normalized.match(/llama[r|me]?\s+a|marca[r]?\s+a|comunica[r]?\s+con/i)) {
      this.showConfirmState("Llamar a un familiar", () => {
        if (window.navigateTo) window.navigateTo('screen-communication');
      });
    } else if (normalized.match(/emergencia|ayuda|socorro|auxilio/i)) {
      this.closeModal();
      if (window.navigateTo) window.navigateTo('screen-emergency');
    } else if (normalized.match(/medicina[s]?|pastilla[s]?|medicamento[s]?/i)) {
      this.showConfirmState("Ver mis medicinas", () => {
        if (window.navigateTo) window.navigateTo('screen-medicines');
      });
    } else if (normalized.match(/inicio|principal|menú|menu/i)) {
      this.showConfirmState("Ir al inicio", () => {
        if (window.navigateTo) window.navigateTo('screen-home');
      });
    } else {
      // Generic request
      this.showConfirmState("Pedir: " + transcript, () => {
        if (window.showToast) window.showToast("Solicitud enviada con éxito.", "success");
      });
    }
  },
  
  normalizeSpanish(text) {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  },
  
  speak(text) {
    if (!this.synthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-MX';
    utterance.rate = 0.85; // slower for clarity
    utterance.pitch = 1;
    this.synthesis.cancel();
    this.synthesis.speak(utterance);
  },
  
  readAloud(text) {
    this.speak(text);
  }
};

window.VoiceModule = VoiceModule;
