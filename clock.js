const ClockModule = {
  init() {
    this.clockEl = document.getElementById('clock');
    this.dateEl = document.getElementById('date');
    this.batteryEl = document.getElementById('battery-level');
    this.update();
    setInterval(() => this.update(), 1000);
    this.initBattery();
  },
  
  update() {
    const now = new Date();
    
    // Format time as HH:MM (24h format, large)
    if (this.clockEl) {
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      this.clockEl.textContent = `${hours}:${minutes}`;
    }
    
    // Format date in Spanish: "Sábado 5 de Septiembre de 2026"
    if (this.dateEl) {
      const dayNames = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
      const monthNames = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
      
      const dayName = dayNames[now.getDay()];
      const day = now.getDate();
      const monthName = monthNames[now.getMonth()];
      const year = now.getFullYear();
      
      this.dateEl.textContent = `${dayName} ${day} de ${monthName} de ${year}`;
    }
  },
  
  async initBattery() {
    if (navigator.getBattery && this.batteryEl) {
      try {
        const battery = await navigator.getBattery();
        const updateBatteryLevel = () => {
          this.batteryEl.textContent = `${Math.round(battery.level * 100)}%`;
        };
        updateBatteryLevel();
        battery.addEventListener('levelchange', updateBatteryLevel);
      } catch (e) {
        console.error('Error accessing battery status:', e);
        this.batteryEl.textContent = "--%";
      }
    } else if (this.batteryEl) {
      this.batteryEl.textContent = "--%";
    }
  }
};

window.ClockModule = ClockModule;
