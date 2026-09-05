const EmergencyModule = {
  timer: null,
  countdown: 5,
  isActive: false,
  
  init() {
    const cancelBtn = document.getElementById('btn-cancel-emergency');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.cancel());
    }
  },
  
  start() {
    this.reset();
    this.isActive = true;
    this.countdown = 5;
    this.updateDisplay();
    this.startCountdown();
    
    if (window.VoiceModule) {
      window.VoiceModule.readAloud('Alerta activada. Se avisará a su familia en 5 segundos. Toque cancelar si fue un error.');
    }
  },
  
  startCountdown() {
    this.updateCircle();
    this.timer = setInterval(() => {
      this.countdown--;
      this.updateDisplay();
      this.updateCircle();
      
      if (this.countdown <= 0) {
        this.triggerAlert();
      }
    }, 1000);
  },
  
  updateDisplay() {
    const countdownEl = document.getElementById('countdown-number');
    const secondsEl = document.getElementById('emergency-seconds');
    
    if (countdownEl) countdownEl.textContent = this.countdown;
    if (secondsEl) secondsEl.textContent = this.countdown;
  },
  
  updateCircle() {
    const circle = document.getElementById('countdown-circle');
    if (!circle) return;
    const circumference = 2 * Math.PI * 54; // radius 54
    const offset = circumference * (1 - this.countdown / 5);
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = offset;
  },
  
  cancel() {
    if (!this.isActive) return;
    
    clearInterval(this.timer);
    this.isActive = false;
    this.countdown = 5;
    
    if (window.showToast) window.showToast('Alerta cancelada', 'info');
    if (window.VoiceModule) {
      window.VoiceModule.readAloud('Alerta cancelada.');
    }
    if (window.navigateTo) window.navigateTo('screen-home');
  },
  
  triggerAlert() {
    clearInterval(this.timer);
    this.isActive = false;
    
    const activeSection = document.getElementById('emergency-active');
    const confirmedSection = document.getElementById('emergency-confirmed');
    
    if (activeSection) activeSection.hidden = true;
    if (confirmedSection) confirmedSection.hidden = false;
    
    if (window.showToast) window.showToast('Su familia ha sido avisada', 'success');
    if (window.VoiceModule) {
      window.VoiceModule.readAloud('Su familia ha sido avisada. Alguien vendrá pronto.');
    }
  },
  
  reset() {
    clearInterval(this.timer);
    this.isActive = false;
    this.countdown = 5;
    
    const activeSection = document.getElementById('emergency-active');
    const confirmedSection = document.getElementById('emergency-confirmed');
    
    if (activeSection) activeSection.hidden = false;
    if (confirmedSection) confirmedSection.hidden = true;
    
    this.updateDisplay();
    this.updateCircle();
  }
};

window.EmergencyModule = EmergencyModule;
