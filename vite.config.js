import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
    server: {
        allowedHosts: [
            'included-sheepdog-slowly.ngrok-free.app',
        ],
        host: true,
        strictPort: true,
        port: 5173,
        proxy: {
            '/ngrok': {
                target: 'https://included-sheepdog-slowly.ngrok-free.app',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/ngrok/, ''),
                configure: (proxy) => {
                    proxy.on('proxyReq', (proxyReq) => {
                        proxyReq.setHeader('ngrok-skip-browser-warning', 'true');
                    });
                },
            },
        },
    },
})
