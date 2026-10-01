const fs = require('fs');
let css = fs.readFileSync('src/index.css', 'utf-8');

const blockStart = '/* ===================== GLOWING BORDER CONTAINERS ===================== */';
const index = css.indexOf(blockStart);

if (index !== -1) {
  css = css.substring(0, index);
  
  const refinedCSS = `
/* ===================== GLOWING BORDER CONTAINERS ===================== */

.stat-card, .data-table-wrapper, .bill-card, .feature-row {
  position: relative;
  background: rgba(255, 255, 255, 0.4) !important;
  backdrop-filter: blur(24px) !important;
  -webkit-backdrop-filter: blur(24px) !important;
  border: 1px solid rgba(255,255,255,0.6) !important;
  border-radius: 24px !important;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
  box-shadow: 0 10px 30px rgba(0,0,0,0.03) !important;
  overflow: visible !important;
  z-index: 1;
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
    #0f172a, /* Deep Slate */
    #cbd5e1, /* Silver/Light Slate */
    #ffffff, /* Bright White */
    #0f172a  /* Deep Slate */
  );
  background-size: 300% 300%;
  -webkit-mask: 
     linear-gradient(#fff 0 0) content-box, 
     linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
          mask-composite: exclude;
  z-index: 10;
  opacity: 0;
  animation: border-flow 6s ease infinite;
  transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
}

.stat-card:hover, .data-table-wrapper:hover, .bill-card:hover, .feature-row:hover {
  transform: translateY(-2px) !important;
  background: rgba(255, 255, 255, 0.55) !important;
  box-shadow: 0 15px 40px rgba(0,0,0,0.06) !important;
  border-color: transparent !important;
}

.stat-card:hover::before, .data-table-wrapper:hover::before, .bill-card:hover::before, .feature-row:hover::before {
  opacity: 1;
}

@keyframes border-flow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
`;

  css += refinedCSS;
  fs.writeFileSync('src/index.css', css);
}
