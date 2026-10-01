import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// De hulpscripts van de Agon-ontwikkelomgeving in index.html (sessie-opname met rrweb, bezoekersteller naar
// designarena.ai, element-picker) horen niet op de gepubliceerde site: bij het bouwen worden ze weggehaald.
const zonderOntwikkelscripts = {
  name: 'zonder-ontwikkelscripts',
  apply: 'build' as const,
  transformIndexHtml(html: string) {
    return html.replace(/[ \t]*<script data-(?:arena-recording|arena-views|element-picker)\b[^>]*>[\s\S]*?<\/script>\s*/g, '');
  },
};

export default defineConfig(async ({ mode, command }) => {
  const plugins = [react(), tailwindcss(), zonderOntwikkelscripts];
  // data-source-loc-attributen (voor de element-picker) alleen tijdens ontwikkeling, niet in de gebouwde site.
  if (command === 'serve') {
    try {
      const pad = './.vite-source-tags.js'; // bestaat alleen lokaal; variabel pad, dus geen typecontrole op de import
      const m = await import(/* @vite-ignore */ pad);
      plugins.push(m.sourceTags());
    } catch {
      /* alleen aanwezig in de Agon-ontwikkelomgeving */
    }
  }

  const env = loadEnv(mode, process.cwd(), ['VITE_', 'NEXT_PUBLIC_']);
  const processEnvDefines: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    processEnvDefines[`process.env.${key}`] = JSON.stringify(value);
  }

  return {
    plugins,
    envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
    define: processEnvDefines,
    server: process.env.PORT ? { port: Number(process.env.PORT), strictPort: true } : undefined,
  };
})
