const fs = require('fs');
const path = require('path');

const files = [
  'src/app/dashboard/page.tsx',
  'src/app/skills/page.tsx',
  'src/app/skills/[id]/page.tsx',
  'src/app/roadmap/page.tsx',
  'src/app/career-center/page.tsx',
  'src/app/projects/page.tsx',
  'src/app/assessments/page.tsx',
  'src/app/profile/page.tsx',
  'src/app/admin/page.tsx',
  'src/app/onboarding/page.tsx',
  'src/app/login/page.tsx',
  'src/app/register/page.tsx'
];

files.forEach(file => {
  const filePath = path.join('c:/Users/amitr/OneDrive/Desktop/CAREERPILOT AI/frontend', file);
  if (!fs.existsSync(filePath)) {
    console.log('Skipping ' + filePath);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace import axios from 'axios'
  content = content.replace(/import\s+axios\s+from\s+['"]axios['"];?(\r?\n)?/g, '');

  let relPath = '../../lib/api';
  if (file.includes('[id]')) relPath = '../../../lib/api';
  
  if (!content.includes('import api from')) {
    content = content.replace(/(import\s+[^;]+;\r?\n)/, match => match + `import api from '${relPath}';\n`);
  }

  // Find the exact block for getAuthHeaders and delete it.
  const headerStr1 = `const getAuthHeaders = () => {
  if (typeof window !== 'undefined') {
    const savedUser = localStorage.getItem('cp_session');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        return { Authorization: \`Bearer \${parsed.accessToken}\` };
      } catch (e) {
        return {};
      }
    }
  }
  return {};
};`;

  const headerStr2 = `const getAuthHeaders = () => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('cp_session');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          return { Authorization: \`Bearer \${parsed.accessToken}\` };
        } catch (e) {
          return {};
        }
      }
    }
    return {};
  };`;

  content = content.replace(headerStr1, '');
  content = content.replace(headerStr2, '');
  
  // A generic fallback regex for other variations
  content = content.replace(/const\s+getAuthHeaders\s*=\s*\(\)\s*=>\s*\{[\s\S]*?return\s*\{\};\s*\n?\}\n?;\n?/g, '');

  // Remove { headers: getAuthHeaders() } from axios calls
  content = content.replace(/axios\./g, 'api.');
  content = content.replace(/,\s*\{\s*headers:\s*getAuthHeaders\(\)\s*\}\s*\)/g, ')');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated ' + file);
});
