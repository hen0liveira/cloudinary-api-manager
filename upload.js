const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
  cloud_name: 'YOUR_CLOUD_NAME', 
  api_key: 'YOUR_API_KEY', 
  api_secret: 'YOUR_API_SECRET'
});

// Caminho para sua pasta /uploads
const uploadsDir = path.join(__dirname, 'uploads');

// Função para fazer upload de uma imagem
function uploadToCloudinary(filePath, fileName) {
  return cloudinary.uploader.upload(filePath,{
    public_id: `uploads/${fileName}`,  // Isso garante que o nome seja mantido
    use_filename: true,               // Usa o nome original do arquivo
    unique_filename: false,           // Não gera um nome único automaticamente
    overwrite: false,                   // Sobrescreve o arquivo se já existir com o mesmo nome
  })
    .then((result) => {
      console.log('Upload successful: ', result.secure_url);
    })
    .catch((error) => {
      console.error('Error uploading: ', error);
    });
}

// Ler arquivos da pasta uploads
fs.readdir(uploadsDir, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err);
    return;
  }

  files.forEach(file => {
    const filePath = path.join(uploadsDir, file);
    const fileName = path.parse(file).name;
    uploadToCloudinary(filePath, fileName);
  });
});
