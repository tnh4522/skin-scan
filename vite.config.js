import {defineConfig} from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        tailwindcss(),
    ],
    server: {
        watch: {
            ignored: ['**/node_modules/**', '**/dist/**']
        },
        build: {
            chunkSizeWarningLimit: 1000
        },
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
