/** @type {import('next').NextConfig} */
import fs from 'fs';
import path from 'path';

const nextConfig = {
  reactStrictMode: true,

  webpack: (config, { isServer }) => {
    if (isServer) {
      // Função para listar as rotas
      const listRoutes = (directory, baseUrl = '/') => {
        const routes = [];
        const files = fs.readdirSync(directory);

        files.forEach(file => {
          const fullPath = path.join(directory, file);
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory()) {
            // Recurse into subdirectories
            routes.push(...listRoutes(fullPath, path.join(baseUrl, file)));
          } else if (file.endsWith('.js') && file !== '_app.js' && file !== '_document.js') {
            // Remove file extension and map the route
            const route = file === 'index.js' ? baseUrl : path.join(baseUrl, file.replace('.js', ''));
            routes.push(route);
          }
        });

        return routes;
      };

      // Alterando o caminho para apontar para o diretório src/pages
      if (!global.listedRoutes) {
        const routes = listRoutes(path.join(process.cwd(), 'src', 'pages'));
        console.log('=== Aplicação Carregada com Rotas ===');
        routes.forEach(route => {
          // Gerando link clicável no console
          const clickableLink = `http://localhost:3000${route}`;
          console.log('\x1b[4m%s\x1b[0m', clickableLink);  // Links clicáveis no terminal
        });
        console.log('=====================================');

        // Marcar que as rotas já foram listadas para evitar duplicação
        global.listedRoutes = true;
      }
    }

    return config;
  },
};

export default nextConfig;
