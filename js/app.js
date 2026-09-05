// app.js - Main Application Logic (Mockup Mode)

document.addEventListener('DOMContentLoaded', () => {
  // Navigation
  const navButtons = document.querySelectorAll('[data-screen]');
  navButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-screen');
      navigateTo(targetId);
    });
  });

  // Voice Simulation
  const voiceBtn = document.getElementById('btn-voice-sim');
  if (voiceBtn) {
    voiceBtn.addEventListener('click', () => {
      const modal = document.getElementById('voice-sim-modal');
      if (modal) modal.hidden = false;
      
      // Auto close simulation after 3 seconds for demo purposes
      setTimeout(() => {
        if (!modal.hidden) {
          modal.hidden = true;
          showSimulationToast("Comando recibido");
        }
      }, 3000);
    });
  }

  // Update Clock initially
  updateClock();
  setInterval(updateClock, 1000);
});

function navigateTo(screenId) {
  // Hide all screens
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  
  // Show target
  const target = document.getElementById(screenId);
  if (target) {
    target.classList.add('active');
    
    // Reset emergency if navigating to it
    if (screenId === 'screen-emergency') {
      startEmergency();
    }
  }
}

function updateClock() {
  const clockEl = document.getElementById('clock');
  const dateEl = document.getElementById('date');
  
  if (!clockEl || !dateEl) return;
  
  const now = new Date();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  hours = hours % 12;
  hours = hours ? hours : 12; 
  
  clockEl.innerHTML = `${hours}:${minutes} <span class="am-pm">${ampm}</span>`;
}

function showSimulationToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  
  toast.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

// Emergency Logic
let emergencyTimer;
function startEmergency() {
  clearInterval(emergencyTimer);
  let countdown = 5;
  const numEl = document.getElementById('sos-countdown');
  const circle = document.getElementById('sos-circle');
  
  // Circumference of r=72 is ~452.39
  const circumference = 2 * Math.PI * 72;
  if(circle) {
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = 0;
  }
  
  if (numEl) numEl.textContent = countdown;
  
  emergencyTimer = setInterval(() => {
    countdown--;
    if (numEl) numEl.textContent = countdown;
    
    if (circle) {
      const offset = circumference - (countdown / 5) * circumference;
      circle.style.strokeDashoffset = -offset; // Animate backwards
    }
    
    if (countdown <= 0) {
      clearInterval(emergencyTimer);
      showSimulationToast('¡Alerta enviada a familia!');
      setTimeout(() => {
        navigateTo('screen-home');
      }, 2000);
    }
  }, 1000);
}

const cancelSosBtn = document.getElementById('btn-cancel-sos');
if (cancelSosBtn) {
  cancelSosBtn.addEventListener('click', () => {
    clearInterval(emergencyTimer);
    showSimulationToast('Alerta cancelada');
    navigateTo('screen-home');
  });
}

// Make globally available for inline onclicks
window.showSimulationToast = showSimulationToast;
