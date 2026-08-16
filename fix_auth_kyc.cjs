const fs = require('fs');

let code = fs.readFileSync('src/components/AuthKycModal.tsx', 'utf8');

// Find the duplicated methods and remove them.
// Wait, my regex was:
// /const handleIdImageChange = \(e: React\.ChangeEvent<HTMLInputElement>\) => \{[\s\S]*?if \(onPlaySound\) onPlaySound\('CLICK'\);\n\s*\}\n\s*\};/m
// It only matched handleIdImageChange, leaving handleIdImageBackChange and handleSelfieImageChange untouched!

code = code.replace(/const handleIdImageBackChange = \(e: React\.ChangeEvent<HTMLInputElement>\) => \{[\s\S]*?if \(onPlaySound\) onPlaySound\('CLICK'\);\n\s*\}\n\s*\};\n\n\s*const handleSelfieImageChange = \(e: React\.ChangeEvent<HTMLInputElement>\) => \{[\s\S]*?if \(onPlaySound\) onPlaySound\('CLICK'\);\n\s*\}\n\s*\};/m, '');

fs.writeFileSync('src/components/AuthKycModal.tsx', code);
