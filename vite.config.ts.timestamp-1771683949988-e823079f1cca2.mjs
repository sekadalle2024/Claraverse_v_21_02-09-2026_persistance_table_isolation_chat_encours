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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJIOlxcXFxDbGFyYVZlcnNlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJIOlxcXFxDbGFyYVZlcnNlXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9IOi9DbGFyYVZlcnNlL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XG5pbXBvcnQgZnMgZnJvbSAnZnMtZXh0cmEnO1xuaW1wb3J0IHR5cGUgeyBQbHVnaW5PcHRpb24gfSBmcm9tICd2aXRlJztcblxuLy8gRnVuY3Rpb24gdG8gY29weSB0aGUgUERGLmpzIHdvcmtlciB0byB0aGUgcHVibGljIGRpcmVjdG9yeVxuZnVuY3Rpb24gY29weVBkZldvcmtlcigpOiBQbHVnaW5PcHRpb24ge1xuICByZXR1cm4ge1xuICAgIG5hbWU6ICdjb3B5LXBkZi13b3JrZXInLFxuICAgIGJ1aWxkU3RhcnQoKSB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCB3b3JrZXJTcmMgPSBwYXRoLnJlc29sdmUoXG4gICAgICAgICAgX19kaXJuYW1lLFxuICAgICAgICAgICdub2RlX21vZHVsZXMvcGRmanMtZGlzdC9idWlsZC9wZGYud29ya2VyLm1pbi5qcydcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3Qgd29ya2VyRGVzdCA9IHBhdGgucmVzb2x2ZShcbiAgICAgICAgICBfX2Rpcm5hbWUsXG4gICAgICAgICAgJ3B1YmxpYy9wZGYud29ya2VyLm1pbi5qcydcbiAgICAgICAgKTtcbiAgICAgICAgXG4gICAgICAgIC8vIFNraXAgaWYgZmlsZSBhbHJlYWR5IGV4aXN0cyBhbmQgc291cmNlIGV4aXN0c1xuICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyh3b3JrZXJTcmMpKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ0NvcHlpbmcgUERGLmpzIHdvcmtlciB0byBwdWJsaWMgZGlyZWN0b3J5Jyk7XG4gICAgICAgICAgZnMuY29weVN5bmMod29ya2VyU3JjLCB3b3JrZXJEZXN0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oJ1BERi5qcyB3b3JrZXIgc291cmNlIGZpbGUgbm90IGZvdW5kOicsIHdvcmtlclNyYyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGNvcHlpbmcgUERGLmpzIHdvcmtlcjonLCBlcnIpO1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICB9XG4gICAgfVxuICB9O1xufVxuXG4vLyBQbHVnaW4gdG8gYWRkIFdlYkNvbnRhaW5lciBoZWFkZXJzIGZvciBwcm9kdWN0aW9uXG5mdW5jdGlvbiB3ZWJDb250YWluZXJIZWFkZXJzKCk6IFBsdWdpbk9wdGlvbiB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogJ3dlYmNvbnRhaW5lci1oZWFkZXJzJyxcbiAgICBnZW5lcmF0ZUJ1bmRsZSgpIHtcbiAgICAgIC8vIENyZWF0ZSBfaGVhZGVycyBmaWxlIGZvciBOZXRsaWZ5XG4gICAgICBjb25zdCBuZXRsaWZ5SGVhZGVycyA9IGAvKlxuICBDcm9zcy1PcmlnaW4tRW1iZWRkZXItUG9saWN5OiBjcmVkZW50aWFsbGVzc1xuICBDcm9zcy1PcmlnaW4tT3BlbmVyLVBvbGljeTogc2FtZS1vcmlnaW5cbiAgQ3Jvc3MtT3JpZ2luLVJlc291cmNlLVBvbGljeTogY3Jvc3Mtb3JpZ2luYDtcbiAgICAgIFxuICAgICAgLy8gQ3JlYXRlIHZlcmNlbC5qc29uIGZvciBWZXJjZWxcbiAgICAgIGNvbnN0IHZlcmNlbENvbmZpZyA9IHtcbiAgICAgICAgaGVhZGVyczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNvdXJjZTogXCIvKC4qKVwiLFxuICAgICAgICAgICAgaGVhZGVyczogW1xuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAga2V5OiBcIkNyb3NzLU9yaWdpbi1FbWJlZGRlci1Qb2xpY3lcIixcbiAgICAgICAgICAgICAgICB2YWx1ZTogXCJjcmVkZW50aWFsbGVzc1wiXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBrZXk6IFwiQ3Jvc3MtT3JpZ2luLU9wZW5lci1Qb2xpY3lcIiwgXG4gICAgICAgICAgICAgICAgdmFsdWU6IFwic2FtZS1vcmlnaW5cIlxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAga2V5OiBcIkNyb3NzLU9yaWdpbi1SZXNvdXJjZS1Qb2xpY3lcIixcbiAgICAgICAgICAgICAgICB2YWx1ZTogXCJjcm9zcy1vcmlnaW5cIlxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdXG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9O1xuXG4gICAgICB0aGlzLmVtaXRGaWxlKHtcbiAgICAgICAgdHlwZTogJ2Fzc2V0JyxcbiAgICAgICAgZmlsZU5hbWU6ICdfaGVhZGVycycsXG4gICAgICAgIHNvdXJjZTogbmV0bGlmeUhlYWRlcnNcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLmVtaXRGaWxlKHtcbiAgICAgICAgdHlwZTogJ2Fzc2V0JyxcbiAgICAgICAgZmlsZU5hbWU6ICd2ZXJjZWwuanNvbicsXG4gICAgICAgIHNvdXJjZTogSlNPTi5zdHJpbmdpZnkodmVyY2VsQ29uZmlnLCBudWxsLCAyKVxuICAgICAgfSk7XG4gICAgfVxuICB9O1xufVxuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW3JlYWN0KCksIGNvcHlQZGZXb3JrZXIoKSwgd2ViQ29udGFpbmVySGVhZGVycygpXSxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgZXhjbHVkZTogWydsdWNpZGUtcmVhY3QnXSxcbiAgfSxcbiAgYmFzZTogcHJvY2Vzcy5lbnYuRUxFQ1RST05fU1RBUlRfVVJMID8gJy8nIDogJy4vJyxcbiAgc2VydmVyOiB7XG4gICAgaGVhZGVyczoge1xuICAgICAgJ0Nyb3NzLU9yaWdpbi1FbWJlZGRlci1Qb2xpY3knOiAnY3JlZGVudGlhbGxlc3MnLFxuICAgICAgJ0Nyb3NzLU9yaWdpbi1PcGVuZXItUG9saWN5JzogJ3NhbWUtb3JpZ2luJyxcbiAgICAgICdDcm9zcy1PcmlnaW4tUmVzb3VyY2UtUG9saWN5JzogJ2Nyb3NzLW9yaWdpbicsXG4gICAgfSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICBvdXREaXI6ICdkaXN0JyxcbiAgICBlbXB0eU91dERpcjogdHJ1ZSxcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB7XG4gICAgICAgICAgdmVuZG9yOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbSddLFxuICAgICAgICAgIHBkZmpzOiBbJ3BkZmpzLWRpc3QnXVxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICBwcmV2aWV3OiB7XG4gICAgaGVhZGVyczoge1xuICAgICAgJ0Nyb3NzLU9yaWdpbi1FbWJlZGRlci1Qb2xpY3knOiAnY3JlZGVudGlhbGxlc3MnLFxuICAgICAgJ0Nyb3NzLU9yaWdpbi1PcGVuZXItUG9saWN5JzogJ3NhbWUtb3JpZ2luJyxcbiAgICAgICdDcm9zcy1PcmlnaW4tUmVzb3VyY2UtUG9saWN5JzogJ2Nyb3NzLW9yaWdpbicsXG4gICAgfSxcbiAgfSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYycpLFxuICAgICAgYnVmZmVyOiAnYnVmZmVyJyxcbiAgICB9LFxuICB9LFxuICBkZWZpbmU6IHtcbiAgICBnbG9iYWw6ICdnbG9iYWxUaGlzJyxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE2TixTQUFTLG9CQUFvQjtBQUMxUCxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLE9BQU8sUUFBUTtBQUhmLElBQU0sbUNBQW1DO0FBT3pDLFNBQVMsZ0JBQThCO0FBQ3JDLFNBQU87QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLGFBQWE7QUFDWCxVQUFJO0FBQ0YsY0FBTSxZQUFZLEtBQUs7QUFBQSxVQUNyQjtBQUFBLFVBQ0E7QUFBQSxRQUNGO0FBQ0EsY0FBTSxhQUFhLEtBQUs7QUFBQSxVQUN0QjtBQUFBLFVBQ0E7QUFBQSxRQUNGO0FBR0EsWUFBSSxHQUFHLFdBQVcsU0FBUyxHQUFHO0FBQzVCLGtCQUFRLElBQUksMkNBQTJDO0FBQ3ZELGFBQUcsU0FBUyxXQUFXLFVBQVU7QUFBQSxRQUNuQyxPQUFPO0FBQ0wsa0JBQVEsS0FBSyx3Q0FBd0MsU0FBUztBQUFBLFFBQ2hFO0FBQ0EsZUFBTyxRQUFRLFFBQVE7QUFBQSxNQUN6QixTQUFTLEtBQUs7QUFDWixnQkFBUSxNQUFNLGdDQUFnQyxHQUFHO0FBQ2pELGVBQU8sUUFBUSxRQUFRO0FBQUEsTUFDekI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGO0FBR0EsU0FBUyxzQkFBb0M7QUFDM0MsU0FBTztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04saUJBQWlCO0FBRWYsWUFBTSxpQkFBaUI7QUFBQTtBQUFBO0FBQUE7QUFNdkIsWUFBTSxlQUFlO0FBQUEsUUFDbkIsU0FBUztBQUFBLFVBQ1A7QUFBQSxZQUNFLFFBQVE7QUFBQSxZQUNSLFNBQVM7QUFBQSxjQUNQO0FBQUEsZ0JBQ0UsS0FBSztBQUFBLGdCQUNMLE9BQU87QUFBQSxjQUNUO0FBQUEsY0FDQTtBQUFBLGdCQUNFLEtBQUs7QUFBQSxnQkFDTCxPQUFPO0FBQUEsY0FDVDtBQUFBLGNBQ0E7QUFBQSxnQkFDRSxLQUFLO0FBQUEsZ0JBQ0wsT0FBTztBQUFBLGNBQ1Q7QUFBQSxZQUNGO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBRUEsV0FBSyxTQUFTO0FBQUEsUUFDWixNQUFNO0FBQUEsUUFDTixVQUFVO0FBQUEsUUFDVixRQUFRO0FBQUEsTUFDVixDQUFDO0FBRUQsV0FBSyxTQUFTO0FBQUEsUUFDWixNQUFNO0FBQUEsUUFDTixVQUFVO0FBQUEsUUFDVixRQUFRLEtBQUssVUFBVSxjQUFjLE1BQU0sQ0FBQztBQUFBLE1BQzlDLENBQUM7QUFBQSxJQUNIO0FBQUEsRUFDRjtBQUNGO0FBR0EsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLE1BQU0sR0FBRyxjQUFjLEdBQUcsb0JBQW9CLENBQUM7QUFBQSxFQUN6RCxjQUFjO0FBQUEsSUFDWixTQUFTLENBQUMsY0FBYztBQUFBLEVBQzFCO0FBQUEsRUFDQSxNQUFNLFFBQVEsSUFBSSxxQkFBcUIsTUFBTTtBQUFBLEVBQzdDLFFBQVE7QUFBQSxJQUNOLFNBQVM7QUFBQSxNQUNQLGdDQUFnQztBQUFBLE1BQ2hDLDhCQUE4QjtBQUFBLE1BQzlCLGdDQUFnQztBQUFBLElBQ2xDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsYUFBYTtBQUFBLElBQ2IsZUFBZTtBQUFBLE1BQ2IsUUFBUTtBQUFBLFFBQ04sY0FBYztBQUFBLFVBQ1osUUFBUSxDQUFDLFNBQVMsV0FBVztBQUFBLFVBQzdCLE9BQU8sQ0FBQyxZQUFZO0FBQUEsUUFDdEI7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLFNBQVM7QUFBQSxNQUNQLGdDQUFnQztBQUFBLE1BQ2hDLDhCQUE4QjtBQUFBLE1BQzlCLGdDQUFnQztBQUFBLElBQ2xDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLE1BQ3BDLFFBQVE7QUFBQSxJQUNWO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sUUFBUTtBQUFBLEVBQ1Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
