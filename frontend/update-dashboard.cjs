const fs = require('fs');

function processFile(path) {
  let code = fs.readFileSync(path, 'utf-8');

  if (!code.includes('BorderGlow')) {
    code = code.replace(/import \{ .* \} from 'lucide-react';/, match => match + '\nimport BorderGlow from \'./BorderGlow\';');
  }

  const chunks = code.split('<div className="stat-card">');
  if (chunks.length > 1) {
    for (let i = 1; i < chunks.length; i++) {
      // Find the closing div for stat-card (which is followed by </FadeInSection>)
      chunks[i] = chunks[i].replace(/<\/div>\s*<\/FadeInSection>/, '</div>\n          </BorderGlow>\n        </FadeInSection>');
    }
    
    code = chunks.join('<BorderGlow className="stat-glow-wrapper" borderRadius={20} backgroundColor="rgba(255, 255, 255, 0.55)" colors={[\'#c084fc\', \'#f472b6\', \'#38bdf8\']}>\n            <div className="stat-card" style={{ border: \'none\', background: \'transparent\', backdropFilter: \'none\', boxShadow: \'none\', padding: \'1.5rem\' }}>');
  }

  // Also replace data-table-wrapper
  const tableChunks = code.split('<div className="data-table-wrapper">');
  if (tableChunks.length > 1) {
    for (let i = 1; i < tableChunks.length; i++) {
      tableChunks[i] = tableChunks[i].replace(/<\/div>\s*<\/FadeInSection>/, '</div>\n        </BorderGlow>\n      </FadeInSection>');
    }
    
    code = tableChunks.join('<BorderGlow className="data-table-glow-wrapper" borderRadius={20} backgroundColor="rgba(255, 255, 255, 0.55)" colors={[\'#38bdf8\', \'#c084fc\', \'#f472b6\']}>\n          <div className="data-table-wrapper" style={{ border: \'none\', background: \'transparent\', backdropFilter: \'none\', boxShadow: \'none\', margin: 0 }}>');
  }

  fs.writeFileSync(path, code);
}

processFile('frontend/src/Dashboard.jsx');
