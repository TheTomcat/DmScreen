import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		proxy: {
			'/api': {
				target: 'http://localhost:8000',
				changeOrigin: true,
				// toProxy: true,
				// headers: { 'Accept-Type': 'application/json' },
				rewrite: (path) => {
					return path.slice(4)
				}
			},
			'/live': {
				target: 'ws://localhost:8000/',
				ws: true,
				changeOrigin: true,
				// rewrite: (path) => {
				// 	return path.slice(5)
				// }
			}
		}
	}
});
