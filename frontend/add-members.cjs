const fs = require('fs');
let code = fs.readFileSync('src/Members.jsx', 'utf-8');
const replacement = `  const [members] = useState([
    { id: 'MEM-001', name: 'John Doe', role: 'RESIDENT', wing: 'A', flat: '101', status: 'ACTIVE' },
    { id: 'MEM-002', name: 'Jane Smith', role: 'WORKER', wing: 'ALL', flat: 'N/A', status: 'ACTIVE' },
    { id: 'MEM-003', name: 'Alice Johnson', role: 'ADMIN', wing: 'ALL', flat: 'N/A', status: 'ACTIVE' },
    { id: 'MEM-004', name: 'Bob Williams', role: 'RESIDENT', wing: 'B', flat: '205', status: 'INACTIVE' },
    { id: 'MEM-005', name: 'Placeholder Member', role: 'RESIDENT', wing: 'A', flat: '102', status: 'ACTIVE' },
    { id: 'MEM-006', name: 'Placeholder Member', role: 'RESIDENT', wing: 'B', flat: '201', status: 'ACTIVE' },
    { id: 'MEM-007', name: 'Placeholder Member', role: 'WORKER', wing: 'ALL', flat: 'N/A', status: 'ACTIVE' },
    { id: 'MEM-008', name: 'Placeholder Member', role: 'RESIDENT', wing: 'C', flat: '304', status: 'INACTIVE' },
    { id: 'MEM-009', name: 'Placeholder Member', role: 'RESIDENT', wing: 'A', flat: '105', status: 'ACTIVE' },
    { id: 'MEM-010', name: 'Placeholder Member', role: 'RESIDENT', wing: 'B', flat: '402', status: 'ACTIVE' },
    { id: 'MEM-011', name: 'Placeholder Member', role: 'WORKER', wing: 'ALL', flat: 'N/A', status: 'INACTIVE' },
    { id: 'MEM-012', name: 'Placeholder Member', role: 'ADMIN', wing: 'ALL', flat: 'N/A', status: 'ACTIVE' },
    { id: 'MEM-013', name: 'Placeholder Member', role: 'RESIDENT', wing: 'C', flat: '101', status: 'ACTIVE' },
    { id: 'MEM-014', name: 'Placeholder Member', role: 'RESIDENT', wing: 'A', flat: '303', status: 'ACTIVE' },
  ]);`;
code = code.replace(/  const \[members\] = useState\(\[[\s\S]*?\]\);/, replacement);
fs.writeFileSync('src/Members.jsx', code);
