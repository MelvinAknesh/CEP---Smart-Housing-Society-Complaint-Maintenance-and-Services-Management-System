const fs = require('fs');

const crazyCSS = `
/* ===================== INSANE AURORA CONTAINERS ===================== */

.stat-card, .data-table-wrapper, .bill-card, .feature-row {
  position: relative;
  background: rgba(255, 255, 255, 0.4) !important;
  backdrop-filter: blur(24px) !important;
  -webkit-backdrop-filter: blur(24px) !important;
  border: 1px solid rgba(255,255,255,0.6) !important;
  border-radius: 24px !important;
  transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1) !important;
  box-shadow: 0 10px 30px rgba(0,0,0,0.03) !important;
  overflow: visible !important; /* Let the aura shine outside */
  z-index: 1;
}

/* The Aurora Aura behind the card */
.stat-card::after, .data-table-wrapper::after, .bill-card::after, .feature-row::after {
  content: '';
  position: absolute;
  inset: -15px; /* Huge aura */
  background: linear-gradient(
    135deg,
    #60a5fa,
    #a78bfa,
    #f472b6,
    #38bdf8
  );
  background-size: 300% 300%;
  border-radius: 32px;
  z-index: -1;
  filter: blur(35px);
  opacity: 0;
  animation: aurora-flow 6s ease infinite;
  transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  transform: scale(0.9);
  pointer-events: none;
}

/* The Glowing Inner Border */
.stat-card::before, .data-table-wrapper::before, .bill-card::before, .feature-row::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 24px;
  padding: 2px;
  background: linear-gradient(
    135deg,
    #60a5fa,
    #a78bfa,
    #f472b6,
    #38bdf8
  );
  background-size: 300% 300%;
  -webkit-mask: 
     linear-gradient(#fff 0 0) content-box, 
     linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
          mask-composite: exclude;
  z-index: 10;
  opacity: 0;
  animation: aurora-flow 6s ease infinite;
  transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
}

.stat-card:hover, .data-table-wrapper:hover, .bill-card:hover, .feature-row:hover {
  transform: translateY(-8px) scale(1.02) !important;
  background: rgba(255, 255, 255, 0.65) !important;
  box-shadow: 0 30px 60px rgba(0,0,0,0.08) !important;
  border-color: transparent !important;
}

.stat-card:hover::after, .data-table-wrapper:hover::after, .bill-card:hover::after, .feature-row:hover::after {
  opacity: 0.65;
  transform: scale(1.03) translateY(10px);
}

.stat-card:hover::before, .data-table-wrapper:hover::before, .bill-card:hover::before, .feature-row:hover::before {
  opacity: 1;
}

@keyframes aurora-flow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
`;

fs.appendFileSync('src/index.css', '\n' + crazyCSS);
