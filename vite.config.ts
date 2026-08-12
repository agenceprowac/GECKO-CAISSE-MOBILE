import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import 'dotenv/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'local-api-middleware',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url && req.url.startsWith('/api/')) {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const apiName = url.pathname.replace(/^\/api\//, '');
            
            const filePath = path.resolve(process.cwd(), `api/${apiName}.ts`);
            
            try {
              // Charger dynamiquement le fichier API TypeScript avec Vite
              const module = await server.ssrLoadModule(filePath);
              const handler = module.default;
              
              if (typeof handler === 'function') {
                // Émulation simple de VercelRequest (body, query)
                let body = {};
                if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
                  body = await new Promise((resolve) => {
                    let data = '';
                    req.on('data', chunk => { data += chunk; });
                    req.on('end', () => {
                      try {
                        resolve(JSON.parse(data));
                      } catch {
                        resolve({});
                      }
                    });
                  });
                }
                
                const query = Object.fromEntries(url.searchParams.entries());
                const vercelReq = Object.assign(req, { body, query });
                
                // Émulation simple de VercelResponse (status, json)
                const vercelRes = Object.assign(res, {
                  status(statusCode: number) {
                    res.statusCode = statusCode;
                    return vercelRes;
                  },
                  json(data: any) {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(data));
                    return vercelRes;
                  }
                });
                
                await handler(vercelReq, vercelRes);
              } else {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Endpoint API non trouvé.' }));
              }
            } catch (err: any) {
              console.error(`Erreur API locale (${apiName}):`, err);
              try {
                const fs = await import('fs');
                fs.writeFileSync(
                  path.resolve(process.cwd(), 'api_error.log'),
                  `[${new Date().toISOString()}] Erreur sur /api/${apiName}:\n${err.message}\n${err.stack}\n\n`,
                  { flag: 'a' }
                );
              } catch (fsErr) {
                console.error("Impossible d'écrire dans api_error.log:", fsErr);
              }
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Erreur Interne du Serveur API.', details: err.message, stack: err.stack }));
            }
            return;
          }
          next();
        });
      }
    }
  ],
  server: {
    host: '127.0.0.1',
    port: 3000
  }
})

