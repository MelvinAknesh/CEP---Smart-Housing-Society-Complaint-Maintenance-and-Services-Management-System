const fs = require('fs');
let code = fs.readFileSync('src/Dashboard.jsx', 'utf-8');

if (!code.includes('BorderGlow')) {
  code = code.replace(/import \{.*\} from 'lucide-react';/, match => match + '\nimport BorderGlow from \'./BorderGlow\';');
}

code = code.replace(/<div className=\"stat-card\">([\s\S]*?)<\/div>\s*<\/FadeInSection>/g, 
  '<BorderGlow style={{width: \'100%\'}} borderRadius={20} backgroundColor=\"transparent\" colors={[\'#c084fc\', \'#f472b6\', \'#38bdf8\']}>\n  <div className=\"stat-card\" style={{margin: 0, border: \'none\', boxShadow: \'none\'}}>$1</div>\n</BorderGlow>\n</FadeInSection>'
);

code = code.replace(/<div className=\"data-table-wrapper\">([\s\S]*?)<\/div>\s*<\/FadeInSection>/g, 
  '<BorderGlow style={{width: \'100%\'}} borderRadius={24} backgroundColor=\"transparent\" colors={[\'#38bdf8\', \'#c084fc\', \'#f472b6\']}>\n  <div className=\"data-table-wrapper\" style={{margin: 0, border: \'none\', boxShadow: \'none\'}}>$1</div>\n</BorderGlow>\n</FadeInSection>'
);

fs.writeFileSync('src/Dashboard.jsx', code);
