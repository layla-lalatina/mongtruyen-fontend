
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { spawn } from 'child_process'
import fs from 'fs'

function cloudflareTunnelPlugin() {
  let tunnelProcess = null
  let printed = false

  return {
    name: 'vite-plugin-cloudflare-tunnel',
    configureServer(server) {
      server.httpServer?.once('listening', () => {
        // Tự động tìm đường dẫn file thực thi của cloudflared trên Windows
        const possiblePaths = [
          'C:\\Program Files (x86)\\cloudflared\\cloudflared.exe',
          'C:\\Program Files\\cloudflared\\cloudflared.exe',
          'cloudflared',
        ]
        let cloudflaredBin = null
        for (const p of possiblePaths) {
          if (p === 'cloudflared' || fs.existsSync(p)) {
            cloudflaredBin = p
            break
          }
        }
        if (!cloudflaredBin) cloudflaredBin = 'cloudflared'

        try {
          tunnelProcess = spawn(
            cloudflaredBin,
            ['tunnel', '--url', 'http://localhost:5173'],
            { stdio: ['ignore', 'pipe', 'pipe'] }
          )

          const handleOutput = (chunk) => {
            const text = chunk.toString()
            const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/)
            if (match && !printed) {
              printed = true
              const url = match[0]
              console.log(
                `  \x1b[32m➜\x1b[0m  \x1b[1mPublic:\x1b[0m  \x1b[36m${url}/\x1b[0m \x1b[90m(Cloudflare Tunnel - Máy khác mạng khác vào bằng link này)\x1b[0m`
              )
            }
          }

          tunnelProcess.stdout?.on('data', handleOutput)
          tunnelProcess.stderr?.on('data', handleOutput)

          tunnelProcess.on('error', () => {
            // Không làm gián đoạn dev server nếu cloudflared chưa sẵn sàng
          })
        } catch (e) {}
      })

      const cleanup = () => {
        if (tunnelProcess) {
          try {
            tunnelProcess.kill()
          } catch (e) {}
        }
      }
      process.on('exit', cleanup)
      process.on('SIGINT', cleanup)
      process.on('SIGTERM', cleanup)
    },
  }
}

export default defineConfig({
  plugins: [react(), cloudflareTunnelPlugin()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts: 'all',
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/Images': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/public': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: true,
    allowedHosts: 'all',
  },
})
