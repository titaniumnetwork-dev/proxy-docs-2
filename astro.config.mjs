import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'Titanium Network // Documentation',
			social: {
				github: 'https://github.com/titaniumnetwork-dev/',
				discord: 'https://discord.gg/unblock',
				youtube: 'https://www.youtube.com/channel/UC6LaREFvs9L72SK1s2PcxNg',
				twitter: 'https://twitter.com/titaniumnetdev'
			},
			customCss: [
				'./src/assets/styles.css'
			],
			sidebar: [
				{
					label: "Home",
					items: [
						"index"
					]

				},
				{
					label: 'Ultraviolet',
					autogenerate: { directory: 'uv'},
				},
				{
					label: 'Rammerhead',
					//
					autogenerate: {directory: "rh"}
				},
				{
					label: 'Scramjet',
					autogenerate: { directory: "scramjet"},
					
				},
				{
					label: 'Aero',
					autogenerate: { directory: "aero"}
				},
				{
					label: 'Protocols',
					autogenerate: { directory: "protocols"}
				},
				{
					label: 'Guides',
					autogenerate: { directory: 'guides' }
				}

			],
		}),
	],
});
