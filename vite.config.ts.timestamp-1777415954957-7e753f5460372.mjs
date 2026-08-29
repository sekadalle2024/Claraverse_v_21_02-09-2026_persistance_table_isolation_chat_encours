// vite.config.ts
import { defineConfig } from "file:///H:/ClaraVerse/node_modules/vite/dist/node/index.js";
import react from "file:///H:/ClaraVerse/node_modules/@vitejs/plugin-react/dist/index.mjs";
import path from "path";
import fs from "file:///H:/ClaraVerse/node_modules/fs-extra/lib/index.js";
var __vite_injected_original_dirname = "H:\\ClaraVerse";
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
    exclude: ["lucide-react"],
    entries: ["index.html"]
    // Scanner uniquement index.html, pas les fichiers de test
  },
  base: "/",
  // Force absolute paths for Zeabur deployment
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJIOlxcXFxDbGFyYVZlcnNlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJIOlxcXFxDbGFyYVZlcnNlXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9IOi9DbGFyYVZlcnNlL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgZnMgZnJvbSAnZnMtZXh0cmEnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW5PcHRpb24gfSBmcm9tICd2aXRlJztcblxuLy8gRnVuY3Rpb24gdG8gY29weSB0aGUgUERGLmpzIHdvcmtlciB0byB0aGUgcHVibGljIGRpcmVjdG9yeVxuZnVuY3Rpb24gY29weVBkZldvcmtlcigpOiBQbHVnaW5PcHRpb24ge1xuICByZXR1cm4ge1xuICAgIG5hbWU6ICdjb3B5LXBkZi13b3JrZXInLFxuICAgIGJ1aWxkU3RhcnQoKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCB3b3JrZXJTcmMgPSBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgX19kaXJuYW1lLFxuICAgICAgICAgICdub2RlX21vZHVsZXMvcGRmanMtZGlzdC9idWlsZC9wZGYud29ya2VyLm1pbi5qcydcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3Qgd29ya2VyRGVzdCA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICBfX2Rpcm5hbWUsXG4gICAgICAgICAgJ3B1YmxpYy9wZGYud29ya2VyLm1pbi5qcydcbiAgICAgICAgKTtcbiAgICAgICAgXG4gICAgICAgIC8vIFNraXAgaWYgZmlsZSBhbHJlYWR5IGV4aXN0cyBhbmQgc291cmNlIGV4aXN0c1xuICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyh3b3JrZXJTcmMpKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ0NvcHlpbmcgUERGLmpzIHdvcmtlciB0byBwdWJsaWMgZGlyZWN0b3J5Jyk7XG4gICAgICAgICAgZnMuY29weVN5bmMod29ya2VyU3JjLCB3b3JrZXJEZXN0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oJ1BERi5qcyB3b3JrZXIgc291cmNlIGZpbGUgbm90IGZvdW5kOicsIHdvcmtlclNyYyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGNvcHlpbmcgUERGLmpzIHdvcmtlcjonLCBlcnIpO1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICB9XG4gICAgfVxuICB9O1xufVxuXG4vLyBQbHVnaW4gdG8gYWRkIFdlYkNvbnRhaW5lciBoZWFkZXJzIGZvciBwcm9kdWN0aW9uXG5mdW5jdGlvbiB3ZWJDb250YWluZXJIZWFkZXJzKCk6IFBsdWdpbk9wdGlvbiB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogJ3dlYmNvbnRhaW5lci1oZWFkZXJzJyxcbiAgICBnZW5lcmF0ZUJ1bmRsZSgpIHtcbiAgICAgIC8vIENyZWF0ZSBfaGVhZGVycyBmaWxlIGZvciBOZXRsaWZ5XG4gICAgICBjb25zdCBuZXRsaWZ5SGVhZGVycyA9IGAvKlxuICBDcm9zcy1PcmlnaW4tRW1iZWRkZXItUG9saWN5OiBjcmVkZW50aWFsbGVzc1xuICBDcm9zcy1PcmlnaW4tT3BlbmVyLVBvbGljeTogc2FtZS1vcmlnaW5cbiAgQ3Jvc3MtT3JpZ2luLVJlc291cmNlLVBvbGljeTogY3Jvc3Mtb3JpZ2luYDtcbiAgICAgIFxuICAgICAgLy8gQ3JlYXRlIHZlcmNlbC5qc29uIGZvciBWZXJjZWxcbiAgICAgIGNvbnN0IHZlcmNlbENvbmZpZyA9IHtcbiAgICAgICAgaGVhZGVyczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNvdXJjZTogXCIvKC4qKVwiLFxuICAgICAgICAgICAgaGVhZGVyczogW1xuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAga2V5OiBcIkNyb3NzLU9yaWdpbi1FbWJlZGRlci1Qb2xpY3lcIixcbiAgICAgICAgICAgICAgICB2YWx1ZTogXCJjcmVkZW50aWFsbGVzc1wiXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBrZXk6IFwiQ3Jvc3MtT3JpZ2luLU9wZW5lci1Qb2xpY3lcIiwgXG4gICAgICAgICAgICAgICAgdmFsdWU6IFwic2FtZS1vcmlnaW5cIlxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAga2V5OiBcIkNyb3NzLU9yaWdpbi1SZXNvdXJjZS1Qb2xpY3lcIixcbiAgICAgICAgICAgICAgICB2YWx1ZTogXCJjcm9zcy1vcmlnaW5cIlxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdXG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9O1xuXG4gICAgICB0aGlzLmVtaXRGaWxlKHtcbiAgICAgICAgdHlwZTogJ2Fzc2V0JyxcbiAgICAgICAgZmlsZU5hbWU6ICdfaGVhZGVycycsXG4gICAgICAgIHNvdXJjZTogbmV0bGlmeUhlYWRlcnNcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLmVtaXRGaWxlKHtcbiAgICAgICAgdHlwZTogJ2Fzc2V0JyxcbiAgICAgICAgZmlsZU5hbWU6ICd2ZXJjZWwuanNvbicsXG4gICAgICAgIHNvdXJjZTogSlNPTi5zdHJpbmdpZnkodmVyY2VsQ29uZmlnLCBudWxsLCAyKVxuICAgICAgfSk7XG4gICAgfVxuICB9O1xufVxuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW3JlYWN0KCksIGNvcHlQZGZXb3JrZXIoKSwgd2ViQ29udGFpbmVySGVhZGVycygpXSxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgZXhjbHVkZTogWydsdWNpZGUtcmVhY3QnXSxcbiAgICBlbnRyaWVzOiBbJ2luZGV4Lmh0bWwnXSwgLy8gU2Nhbm5lciB1bmlxdWVtZW50IGluZGV4Lmh0bWwsIHBhcyBsZXMgZmljaGllcnMgZGUgdGVzdFxuICB9LFxuICBiYXNlOiAnLycsIC8vIEZvcmNlIGFic29sdXRlIHBhdGhzIGZvciBaZWFidXIgZGVwbG95bWVudFxuICBzZXJ2ZXI6IHtcbiAgICBoZWFkZXJzOiB7XG4gICAgICAnQ3Jvc3MtT3JpZ2luLUVtYmVkZGVyLVBvbGljeSc6ICdjcmVkZW50aWFsbGVzcycsXG4gICAgICAnQ3Jvc3MtT3JpZ2luLU9wZW5lci1Qb2xpY3knOiAnc2FtZS1vcmlnaW4nLFxuICAgICAgJ0Nyb3NzLU9yaWdpbi1SZXNvdXJjZS1Qb2xpY3knOiAnY3Jvc3Mtb3JpZ2luJyxcbiAgICB9LFxuICB9LFxuICBidWlsZDoge1xuICAgIG91dERpcjogJ2Rpc3QnLFxuICAgIGVtcHR5T3V0RGlyOiB0cnVlLFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBtYW51YWxDaHVua3M6IHtcbiAgICAgICAgICB2ZW5kb3I6IFsncmVhY3QnLCAncmVhY3QtZG9tJ10sXG4gICAgICAgICAgcGRmanM6IFsncGRmanMtZGlzdCddXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHByZXZpZXc6IHtcbiAgICBoZWFkZXJzOiB7XG4gICAgICAnQ3Jvc3MtT3JpZ2luLUVtYmVkZGVyLVBvbGljeSc6ICdjcmVkZW50aWFsbGVzcycsXG4gICAgICAnQ3Jvc3MtT3JpZ2luLU9wZW5lci1Qb2xpY3knOiAnc2FtZS1vcmlnaW4nLFxuICAgICAgJ0Nyb3NzLU9yaWdpbi1SZXNvdXJjZS1Qb2xpY3knOiAnY3Jvc3Mtb3JpZ2luJyxcbiAgICB9LFxuICB9LFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjJyksXG4gICAgICBidWZmZXI6ICdidWZmZXInLFxuICAgIH0sXG4gIH0sXG4gIGRlZmluZToge1xuICAgIGdsb2JhbDogJ2dsb2JhbFRoaXMnLFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTZOLFNBQVMsb0JBQW9CO0FBQzFQLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsT0FBTyxRQUFRO0FBSGYsSUFBTSxtQ0FBbUM7QUFPekMsU0FBUyxnQkFBOEI7QUFDckMsU0FBTztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sYUFBYTtBQUNYLFVBQUk7QUFDRixjQUFNLFlBQVksS0FBSztBQUFBLFVBQ3JCO0FBQUEsVUFDQTtBQUFBLFFBQ0Y7QUFDQSxjQUFNLGFBQWEsS0FBSztBQUFBLFVBQ3RCO0FBQUEsVUFDQTtBQUFBLFFBQ0Y7QUFHQSxZQUFJLEdBQUcsV0FBVyxTQUFTLEdBQUc7QUFDNUIsa0JBQVEsSUFBSSwyQ0FBMkM7QUFDdkQsYUFBRyxTQUFTLFdBQVcsVUFBVTtBQUFBLFFBQ25DLE9BQU87QUFDTCxrQkFBUSxLQUFLLHdDQUF3QyxTQUFTO0FBQUEsUUFDaEU7QUFDQSxlQUFPLFFBQVEsUUFBUTtBQUFBLE1BQ3pCLFNBQVMsS0FBSztBQUNaLGdCQUFRLE1BQU0sZ0NBQWdDLEdBQUc7QUFDakQsZUFBTyxRQUFRLFFBQVE7QUFBQSxNQUN6QjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0Y7QUFHQSxTQUFTLHNCQUFvQztBQUMzQyxTQUFPO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixpQkFBaUI7QUFFZixZQUFNLGlCQUFpQjtBQUFBO0FBQUE7QUFBQTtBQU12QixZQUFNLGVBQWU7QUFBQSxRQUNuQixTQUFTO0FBQUEsVUFDUDtBQUFBLFlBQ0UsUUFBUTtBQUFBLFlBQ1IsU0FBUztBQUFBLGNBQ1A7QUFBQSxnQkFDRSxLQUFLO0FBQUEsZ0JBQ0wsT0FBTztBQUFBLGNBQ1Q7QUFBQSxjQUNBO0FBQUEsZ0JBQ0UsS0FBSztBQUFBLGdCQUNMLE9BQU87QUFBQSxjQUNUO0FBQUEsY0FDQTtBQUFBLGdCQUNFLEtBQUs7QUFBQSxnQkFDTCxPQUFPO0FBQUEsY0FDVDtBQUFBLFlBQ0Y7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFFQSxXQUFLLFNBQVM7QUFBQSxRQUNaLE1BQU07QUFBQSxRQUNOLFVBQVU7QUFBQSxRQUNWLFFBQVE7QUFBQSxNQUNWLENBQUM7QUFFRCxXQUFLLFNBQVM7QUFBQSxRQUNaLE1BQU07QUFBQSxRQUNOLFVBQVU7QUFBQSxRQUNWLFFBQVEsS0FBSyxVQUFVLGNBQWMsTUFBTSxDQUFDO0FBQUEsTUFDOUMsQ0FBQztBQUFBLElBQ0g7QUFBQSxFQUNGO0FBQ0Y7QUFHQSxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTLENBQUMsTUFBTSxHQUFHLGNBQWMsR0FBRyxvQkFBb0IsQ0FBQztBQUFBLEVBQ3pELGNBQWM7QUFBQSxJQUNaLFNBQVMsQ0FBQyxjQUFjO0FBQUEsSUFDeEIsU0FBUyxDQUFDLFlBQVk7QUFBQTtBQUFBLEVBQ3hCO0FBQUEsRUFDQSxNQUFNO0FBQUE7QUFBQSxFQUNOLFFBQVE7QUFBQSxJQUNOLFNBQVM7QUFBQSxNQUNQLGdDQUFnQztBQUFBLE1BQ2hDLDhCQUE4QjtBQUFBLE1BQzlCLGdDQUFnQztBQUFBLElBQ2xDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsYUFBYTtBQUFBLElBQ2IsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ04sY0FBYztBQUFBLFVBQ1osUUFBUSxDQUFDLFNBQVMsV0FBVztBQUFBLFVBQzdCLE9BQU8sQ0FBQyxZQUFZO0FBQUEsUUFDdEI7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLFNBQVM7QUFBQSxNQUNQLGdDQUFnQztBQUFBLE1BQ2hDLDhCQUE4QjtBQUFBLE1BQzlCLGdDQUFnQztBQUFBLElBQ2xDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLE1BQ3BDLFFBQVE7QUFBQSxJQUNWO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sUUFBUTtBQUFBLEVBQ1Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
