const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
  cloud_name: 'YOUR_CLOUD_NAME', 
  api_key: 'YOUR_API_KEY', 
  api_secret: 'YOUR_API_SECRET'
});

const uploadsDir = path.join(__dirname, 'uploads');

function getCloudinaryResources(nextCursor = null) {
  return new Promise((resolve, reject) => {
    cloudinary.api.resources(
      {
        type: 'upload', // Filtrar por arquivos enviados (imagens, vídeos, etc.)
        prefix: 'uploads/', // Especifica o caminho do bucket
        max_results: 500, // Máximo de 500 resultados por requisição (pode ser ajustado)
        next_cursor: nextCursor // Paginação se houver mais de 500 arquivos
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );
  });
}



// Função para comparar e remover arquivos duplicados
async function compareAndRemoveDuplicates() {
  try {
    let allCloudinaryResources = [];
    let nextCursor = null;

    // Buscar todos os recursos no Cloudinary (com paginação)
    do {
      const result = await getCloudinaryResources(nextCursor);
      allCloudinaryResources = allCloudinaryResources.concat(result.resources);
      nextCursor = result.next_cursor;
    } while (nextCursor);

    // Pegar os nomes dos arquivos no Cloudinary (sem a extensão)
    const cloudinaryFiles = allCloudinaryResources.map(resource => path.parse(resource.public_id).name);

    // Ler arquivos da pasta local
    fs.readdir(uploadsDir, (err, localFiles) => {
      if (err) {
        console.error('Erro ao ler a pasta local:', err);
        return;
      }

      // Comparar arquivos
      localFiles.forEach(file => {
        const localFileName = path.parse(file).name; // Nome sem a extensão

        if (cloudinaryFiles.includes(localFileName)) {
          // Arquivo já está no Cloudinary, então pode ser removido localmente
          const filePath = path.join(uploadsDir, file);
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error(`Erro ao remover o arquivo: ${filePath}`, err);
            } else {
              console.log(`Arquivo removido: ${filePath}`);
            }
          });
        }
      });
    });
  } catch (error) {
    console.error('Erro ao comparar e remover duplicados:', error);
  }
}

// Executar a função
compareAndRemoveDuplicates();
