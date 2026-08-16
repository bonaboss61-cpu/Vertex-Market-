const fs = require('fs');

let code = fs.readFileSync('src/components/AuthKycModal.tsx', 'utf8');

const compressFn = `
  const compressImage = (file: File, maxWidth = 1000): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const scale = Math.min(maxWidth / img.width, 1);
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.6)); // 60% quality JPEG
        };
        img.onerror = (e) => reject(e);
      };
      reader.onerror = (e) => reject(e);
    });
  };

  const handleIdImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const base64 = await compressImage(file);
      setKycIdImage(base64);
      if (onPlaySound) onPlaySound('CLICK');
    }
  };
  
  const handleIdImageBackChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const base64 = await compressImage(file);
      setKycIdImageBack(base64);
      if (onPlaySound) onPlaySound('CLICK');
    }
  };

  const handleSelfieImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const base64 = await compressImage(file);
      setKycSelfieImage(base64);
      if (onPlaySound) onPlaySound('CLICK');
    }
  };
`;

code = code.replace(/const handleIdImageChange = \(e: React\.ChangeEvent<HTMLInputElement>\) => \{[\s\S]*?if \(onPlaySound\) onPlaySound\('CLICK'\);\n\s*\}\n\s*\};/m, compressFn);

fs.writeFileSync('src/components/AuthKycModal.tsx', code);
