const MedicineModule = {
  medicines: [
    {
      name: 'Paracetamol 500mg',
      dose: '1 pastilla',
      time: '15:00',
      timeDisplay: '3:00 PM',
      instructions: 'Tomar con agua después de comer'
    },
    {
      name: 'Metformina 850mg',
      dose: '1 pastilla',
      time: '20:00',
      timeDisplay: '8:00 PM',
      instructions: 'Tomar con la cena'
    }
  ],
  currentIndex: 0,
  
  init() {
    this.setupButtons();
  },
  
  onEnter() {
    this.render();
    setTimeout(() => {
      const med = this.getCurrentMedicine();
      if (med && window.VoiceModule) {
        window.VoiceModule.readAloud(
          `Tu próxima medicina es ${med.name}. ` +
          `Debes tomar ${med.dose} a las ${med.timeDisplay}. ` +
          `${med.instructions}.`
        );
      }
    }, 800);
  },
  
  getCurrentMedicine() {
    return this.medicines[this.currentIndex] || null;
  },
  
  render() {
    const med = this.getCurrentMedicine();
    const cardEl = document.getElementById('medicine-card');
    const actionsEl = document.querySelector('.medicine-actions');
    const completedEl = document.getElementById('medicine-completed');
    
    if (!med) {
      if (cardEl) cardEl.hidden = true;
      if (actionsEl) actionsEl.hidden = true;
      if (completedEl) completedEl.hidden = false;
      return;
    }
    
    if (cardEl) cardEl.hidden = false;
    if (actionsEl) actionsEl.hidden = false;
    if (completedEl) completedEl.hidden = true;
    
    const nameEl = document.getElementById('medicine-name');
    const doseEl = document.getElementById('medicine-dose');
    const timeEl = document.getElementById('medicine-time');
    const instEl = document.getElementById('medicine-instructions');
    
    if (nameEl) nameEl.textContent = med.name;
    if (doseEl) doseEl.textContent = med.dose;
    if (timeEl) timeEl.textContent = med.timeDisplay;
    if (instEl) instEl.textContent = med.instructions;
  },
  
  setupButtons() {
    const btnTaken = document.getElementById('btn-medicine-taken');
    const btnLater = document.getElementById('btn-medicine-later');
    const btnListen = document.getElementById('btn-medicine-listen');
    
    if (btnTaken) {
      btnTaken.addEventListener('click', () => this.markTaken());
    }
    
    if (btnLater) {
      btnLater.addEventListener('click', () => this.remindLater());
    }
    
    if (btnListen) {
      btnListen.addEventListener('click', () => {
        const med = this.getCurrentMedicine();
        if (med && window.VoiceModule) {
          window.VoiceModule.readAloud(
            `${med.name}. ${med.dose}. A las ${med.timeDisplay}. ${med.instructions}.`
          );
        }
      });
    }
  },
  
  markTaken() {
    this.currentIndex++;
    showToast('¡Muy bien! Medicina registrada', 'success');
    if (window.VoiceModule) {
      window.VoiceModule.readAloud('Muy bien. Medicina registrada.');
    }
    if (this.currentIndex >= this.medicines.length) {
      this.render(); // Will show completed state
    } else {
      this.render();
    }
  },
  
  remindLater() {
    showToast('Le recordaremos en 15 minutos', 'info');
    if (window.VoiceModule) {
      window.VoiceModule.readAloud('Entendido. Le recordaré en 15 minutos.');
    }
    setTimeout(() => {
      if (window.navigateTo) window.navigateTo('screen-home');
    }, 1500);
  }
};

function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  
  const toast = document.createElement('div');
  // Use BEM class format to match our CSS
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', 'alert');
  toast.textContent = message;
  container.appendChild(toast);
  
  requestAnimationFrame(() => {
    toast.classList.add('visible');
  });
  
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

window.MedicineModule = MedicineModule;
window.showToast = showToast;
