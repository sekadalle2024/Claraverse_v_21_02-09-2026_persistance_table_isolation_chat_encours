// vite.config.ts
import { defineConfig } from "file:///D:/ClaraVerse-v%20firebase/node_modules/vite/dist/node/index.js";
import react from "file:///D:/ClaraVerse-v%20firebase/node_modules/@vitejs/plugin-react/dist/index.mjs";
import path from "path";
import fs from "file:///D:/ClaraVerse-v%20firebase/node_modules/fs-extra/lib/index.js";
var __vite_injected_original_dirname = "D:\\ClaraVerse-v firebase";
function copyPdfWorker() {
  return {
    name: "copy-pdf-worker",
    buildStart() {
      try {
        const workerSrc = path.resolve(
          __vite_injected_original_dirname,
          "node_modules/pdfjs-dist/build/pdf.worker.min.js"
        );
        const workerDest = path.resolve(
          __vite_injected_original_dirname,
          "public/pdf.worker.min.js"
        );
        if (fs.existsSync(workerSrc)) {
          console.log("Copying PDF.js worker to public directory");
          fs.copySync(workerSrc, workerDest);
        } else {
          console.warn("PDF.js worker source file not found:", workerSrc);
        }
        return Promise.resolve();
      } catch (err) {
        console.error("Error copying PDF.js worker:", err);
        return Promise.resolve();
      }
    }
  };
}
function webContainerHeaders() {
  return {
    name: "webcontainer-headers",
    generateBundle() {
      const netlifyHeaders = `/*
  Cross-Origin-Embedder-Policy: credentialless
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Resource-Policy: cross-origin`;
      const vercelConfig = {
        headers: [
          {
            source: "/(.*)",
            headers: [
              {
                key: "Cross-Origin-Embedder-Policy",
                value: "credentialless"
              },
              {
                key: "Cross-Origin-Opener-Policy",
                value: "same-origin"
              },
              {
                key: "Cross-Origin-Resource-Policy",
                value: "cross-origin"
              }
            ]
          }
        ]
      };
      this.emitFile({
        type: "asset",
        fileName: "_headers",
        source: netlifyHeaders
      });
      this.emitFile({
        type: "asset",
        fileName: "vercel.json",
        source: JSON.stringify(vercelConfig, null, 2)
      });
    }
  };
}
var vite_config_default = defineConfig({
  plugins: [react(), copyPdfWorker(), webContainerHeaders()],
  optimizeDeps: {
    exclude: ["lucide-react"]
  },
  base: process.env.ELECTRON_START_URL ? "/" : "./",
  server: {
    headers: {
      "Cross-Origin-Embedder-Policy": "credentialless",
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Resource-Policy": "cross-origin"
    }
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          pdfjs: ["pdfjs-dist"]
        }
      }
    }
  },
  preview: {
    headers: {
      "Cross-Origin-Embedder-Policy": "credentialless",
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Resource-Policy": "cross-origin"
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src"),
      buffer: "buffer"
    }
  },
  define: {
    global: "globalThis"
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxDbGFyYVZlcnNlLXYgZmlyZWJhc2VcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXENsYXJhVmVyc2UtdiBmaXJlYmFzZVxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovQ2xhcmFWZXJzZS12JTIwZmlyZWJhc2Uvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCBmcyBmcm9tICdmcy1leHRyYSc7XG5pbXBvcnQgdHlwZSB7IFBsdWdpbk9wdGlvbiB9IGZyb20gJ3ZpdGUnO1xuXG4vLyBGdW5jdGlvbiB0byBjb3B5IHRoZSBQREYuanMgd29ya2VyIHRvIHRoZSBwdWJsaWMgZGlyZWN0b3J5XG5mdW5jdGlvbiBjb3B5UGRmV29ya2VyKCk6IFBsdWdpbk9wdGlvbiB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogJ2NvcHktcGRmLXdvcmtlcicsXG4gICAgYnVpbGRTdGFydCgpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHdvcmtlclNyYyA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICBfX2Rpcm5hbWUsXG4gICAgICAgICAgJ25vZGVfbW9kdWxlcy9wZGZqcy1kaXN0L2J1aWxkL3BkZi53b3JrZXIubWluLmpzJ1xuICAgICAgICApO1xuICAgICAgICBjb25zdCB3b3JrZXJEZXN0ID0gcGF0aC5yZXNvbHZlKFxuICAgICAgICAgIF9fZGlybmFtZSxcbiAgICAgICAgICAncHVibGljL3BkZi53b3JrZXIubWluLmpzJ1xuICAgICAgICApO1xuICAgICAgICBcbiAgICAgICAgLy8gU2tpcCBpZiBmaWxlIGFscmVhZHkgZXhpc3RzIGFuZCBzb3VyY2UgZXhpc3RzXG4gICAgICAgIGlmIChmcy5leGlzdHNTeW5jKHdvcmtlclNyYykpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnQ29weWluZyBQREYuanMgd29ya2VyIHRvIHB1YmxpYyBkaXJlY3RvcnknKTtcbiAgICAgICAgICBmcy5jb3B5U3luYyh3b3JrZXJTcmMsIHdvcmtlckRlc3QpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUud2FybignUERGLmpzIHdvcmtlciBzb3VyY2UgZmlsZSBub3QgZm91bmQ6Jywgd29ya2VyU3JjKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgY29weWluZyBQREYuanMgd29ya2VyOicsIGVycik7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG59XG5cbi8vIFBsdWdpbiB0byBhZGQgV2ViQ29udGFpbmVyIGhlYWRlcnMgZm9yIHByb2R1Y3Rpb25cbmZ1bmN0aW9uIHdlYkNvbnRhaW5lckhlYWRlcnMoKTogUGx1Z2luT3B0aW9uIHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnd2ViY29udGFpbmVyLWhlYWRlcnMnLFxuICAgIGdlbmVyYXRlQnVuZGxlKCkge1xuICAgICAgLy8gQ3JlYXRlIF9oZWFkZXJzIGZpbGUgZm9yIE5ldGxpZnlcbiAgICAgIGNvbnN0IG5ldGxpZnlIZWFkZXJzID0gYC8qXG4gIENyb3NzLU9yaWdpbi1FbWJlZGRlci1Qb2xpY3k6IGNyZWRlbnRpYWxsZXNzXG4gIENyb3NzLU9yaWdpbi1PcGVuZXItUG9saWN5OiBzYW1lLW9yaWdpblxuICBDcm9zcy1PcmlnaW4tUmVzb3VyY2UtUG9saWN5OiBjcm9zcy1vcmlnaW5gO1xuICAgICAgXG4gICAgICAvLyBDcmVhdGUgdmVyY2VsLmpzb24gZm9yIFZlcmNlbFxuICAgICAgY29uc3QgdmVyY2VsQ29uZmlnID0ge1xuICAgICAgICBoZWFkZXJzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgc291cmNlOiBcIi8oLiopXCIsXG4gICAgICAgICAgICBoZWFkZXJzOiBbXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBrZXk6IFwiQ3Jvc3MtT3JpZ2luLUVtYmVkZGVyLVBvbGljeVwiLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBcImNyZWRlbnRpYWxsZXNzXCJcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGtleTogXCJDcm9zcy1PcmlnaW4tT3BlbmVyLVBvbGljeVwiLCBcbiAgICAgICAgICAgICAgICB2YWx1ZTogXCJzYW1lLW9yaWdpblwiXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBrZXk6IFwiQ3Jvc3MtT3JpZ2luLVJlc291cmNlLVBvbGljeVwiLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBcImNyb3NzLW9yaWdpblwiXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF1cbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH07XG5cbiAgICAgIHRoaXMuZW1pdEZpbGUoe1xuICAgICAgICB0eXBlOiAnYXNzZXQnLFxuICAgICAgICBmaWxlTmFtZTogJ19oZWFkZXJzJyxcbiAgICAgICAgc291cmNlOiBuZXRsaWZ5SGVhZGVyc1xuICAgICAgfSk7XG5cbiAgICAgIHRoaXMuZW1pdEZpbGUoe1xuICAgICAgICB0eXBlOiAnYXNzZXQnLFxuICAgICAgICBmaWxlTmFtZTogJ3ZlcmNlbC5qc29uJyxcbiAgICAgICAgc291cmNlOiBKU09OLnN0cmluZ2lmeSh2ZXJjZWxDb25maWcsIG51bGwsIDIpXG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbcmVhY3QoKSwgY29weVBkZldvcmtlcigpLCB3ZWJDb250YWluZXJIZWFkZXJzKCldLFxuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBleGNsdWRlOiBbJ2x1Y2lkZS1yZWFjdCddLFxuICB9LFxuICBiYXNlOiBwcm9jZXNzLmVudi5FTEVDVFJPTl9TVEFSVF9VUkwgPyAnLycgOiAnLi8nLFxuICBzZXJ2ZXI6IHtcbiAgICBoZWFkZXJzOiB7XG4gICAgICAnQ3Jvc3MtT3JpZ2luLUVtYmVkZGVyLVBvbGljeSc6ICdjcmVkZW50aWFsbGVzcycsXG4gICAgICAnQ3Jvc3MtT3JpZ2luLU9wZW5lci1Qb2xpY3knOiAnc2FtZS1vcmlnaW4nLFxuICAgICAgJ0Nyb3NzLU9yaWdpbi1SZXNvdXJjZS1Qb2xpY3knOiAnY3Jvc3Mtb3JpZ2luJyxcbiAgICB9LFxuICB9LFxuICBidWlsZDoge1xuICAgIG91dERpcjogJ2Rpc3QnLFxuICAgIGVtcHR5T3V0RGlyOiB0cnVlLFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBtYW51YWxDaHVua3M6IHtcbiAgICAgICAgICB2ZW5kb3I6IFsncmVhY3QnLCAncmVhY3QtZG9tJ10sXG4gICAgICAgICAgcGRmanM6IFsncGRmanMtZGlzdCddXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHByZXZpZXc6IHtcbiAgICBoZWFkZXJzOiB7XG4gICAgICAnQ3Jvc3MtT3JpZ2luLUVtYmVkZGVyLVBvbGljeSc6ICdjcmVkZW50aWFsbGVzcycsXG4gICAgICAnQ3Jvc3MtT3JpZ2luLU9wZW5lci1Qb2xpY3knOiAnc2FtZS1vcmlnaW4nLFxuICAgICAgJ0Nyb3NzLU9yaWdpbi1SZXNvdXJjZS1Qb2xpY3knOiAnY3Jvc3Mtb3JpZ2luJyxcbiAgICB9LFxuICB9LFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjJyksXG4gICAgICBidWZmZXI6ICdidWZmZXInLFxuICAgIH0sXG4gIH0sXG4gIGRlZmluZToge1xuICAgIGdsb2JhbDogJ2dsb2JhbFRoaXMnLFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWdRLFNBQVMsb0JBQW9CO0FBQzdSLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsT0FBTyxRQUFRO0FBSGYsSUFBTSxtQ0FBbUM7QUFPekMsU0FBUyxnQkFBOEI7QUFDckMsU0FBTztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sYUFBYTtBQUNYLFVBQUk7QUFDRixjQUFNLFlBQVksS0FBSztBQUFBLFVBQ3JCO0FBQUEsVUFDQTtBQUFBLFFBQ0Y7QUFDQSxjQUFNLGFBQWEsS0FBSztBQUFBLFVBQ3RCO0FBQUEsVUFDQTtBQUFBLFFBQ0Y7QUFHQSxZQUFJLEdBQUcsV0FBVyxTQUFTLEdBQUc7QUFDNUIsa0JBQVEsSUFBSSwyQ0FBMkM7QUFDdkQsYUFBRyxTQUFTLFdBQVcsVUFBVTtBQUFBLFFBQ25DLE9BQU87QUFDTCxrQkFBUSxLQUFLLHdDQUF3QyxTQUFTO0FBQUEsUUFDaEU7QUFDQSxlQUFPLFFBQVEsUUFBUTtBQUFBLE1BQ3pCLFNBQVMsS0FBSztBQUNaLGdCQUFRLE1BQU0sZ0NBQWdDLEdBQUc7QUFDakQsZUFBTyxRQUFRLFFBQVE7QUFBQSxNQUN6QjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0Y7QUFHQSxTQUFTLHNCQUFvQztBQUMzQyxTQUFPO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixpQkFBaUI7QUFFZixZQUFNLGlCQUFpQjtBQUFBO0FBQUE7QUFBQTtBQU12QixZQUFNLGVBQWU7QUFBQSxRQUNuQixTQUFTO0FBQUEsVUFDUDtBQUFBLFlBQ0UsUUFBUTtBQUFBLFlBQ1IsU0FBUztBQUFBLGNBQ1A7QUFBQSxnQkFDRSxLQUFLO0FBQUEsZ0JBQ0wsT0FBTztBQUFBLGNBQ1Q7QUFBQSxjQUNBO0FBQUEsZ0JBQ0UsS0FBSztBQUFBLGdCQUNMLE9BQU87QUFBQSxjQUNUO0FBQUEsY0FDQTtBQUFBLGdCQUNFLEtBQUs7QUFBQSxnQkFDTCxPQUFPO0FBQUEsY0FDVDtBQUFBLFlBQ0Y7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFFQSxXQUFLLFNBQVM7QUFBQSxRQUNaLE1BQU07QUFBQSxRQUNOLFVBQVU7QUFBQSxRQUNWLFFBQVE7QUFBQSxNQUNWLENBQUM7QUFFRCxXQUFLLFNBQVM7QUFBQSxRQUNaLE1BQU07QUFBQSxRQUNOLFVBQVU7QUFBQSxRQUNWLFFBQVEsS0FBSyxVQUFVLGNBQWMsTUFBTSxDQUFDO0FBQUEsTUFDOUMsQ0FBQztBQUFBLElBQ0g7QUFBQSxFQUNGO0FBQ0Y7QUFHQSxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTLENBQUMsTUFBTSxHQUFHLGNBQWMsR0FBRyxvQkFBb0IsQ0FBQztBQUFBLEVBQ3pELGNBQWM7QUFBQSxJQUNaLFNBQVMsQ0FBQyxjQUFjO0FBQUEsRUFDMUI7QUFBQSxFQUNBLE1BQU0sUUFBUSxJQUFJLHFCQUFxQixNQUFNO0FBQUEsRUFDN0MsUUFBUTtBQUFBLElBQ04sU0FBUztBQUFBLE1BQ1AsZ0NBQWdDO0FBQUEsTUFDaEMsOEJBQThCO0FBQUEsTUFDOUIsZ0NBQWdDO0FBQUEsSUFDbEM7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsSUFDUixhQUFhO0FBQUEsSUFDYixlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixjQUFjO0FBQUEsVUFDWixRQUFRLENBQUMsU0FBUyxXQUFXO0FBQUEsVUFDN0IsT0FBTyxDQUFDLFlBQVk7QUFBQSxRQUN0QjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsU0FBUztBQUFBLE1BQ1AsZ0NBQWdDO0FBQUEsTUFDaEMsOEJBQThCO0FBQUEsTUFDOUIsZ0NBQWdDO0FBQUEsSUFDbEM7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsTUFDcEMsUUFBUTtBQUFBLElBQ1Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixRQUFRO0FBQUEsRUFDVjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
