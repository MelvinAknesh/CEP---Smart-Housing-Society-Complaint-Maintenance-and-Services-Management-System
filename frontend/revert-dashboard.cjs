const fs = require('fs');
let code = fs.readFileSync('src/Dashboard.jsx', 'utf-8');

// Revert imports
code = code.replace(/\nimport BorderGlow from '\.\/BorderGlow';/, '');

// Revert stat cards
code = code.replace(/<BorderGlow style=\{\{width: '100%'\}\} borderRadius=\{20\} backgroundColor="transparent" colors=\{\['#c084fc', '#f472b6', '#38bdf8'\]\}>\s*<div className="stat-card" style=\{\{margin: 0, border: 'none', boxShadow: 'none'\}\}>([\s\S]*?)<\/div>\s*<\/BorderGlow>/g, '<div className="stat-card">$1</div>');

// Revert data table
code = code.replace(/<BorderGlow style=\{\{width: '100%'\}\} borderRadius=\{24\} backgroundColor="transparent" colors=\{\['#38bdf8', '#c084fc', '#f472b6'\]\}>\s*<div className="data-table-wrapper" style=\{\{margin: 0, border: 'none', boxShadow: 'none'\}\}>([\s\S]*?)<\/div>\s*<\/BorderGlow>/g, '<div className="data-table-wrapper">$1</div>');

fs.writeFileSync('src/Dashboard.jsx', code);
