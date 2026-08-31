import type { MermaidConfig } from 'mermaid';

type MermaidApi = (typeof import('mermaid'))['default'];

function token(name: string) {
	return getComputedStyle(document.documentElement)
		.getPropertyValue(`--catppuccin-color-${name}`)
		.trim();
}

function createConfig(): MermaidConfig {
	return {
		startOnLoad: false,
		securityLevel: 'strict',
		theme: 'base',
		themeVariables: {
			background: token('base'),
			primaryColor: token('surface0'),
			primaryBorderColor: token('blue'),
			primaryTextColor: token('text'),
			lineColor: token('subtext1'),
			secondaryColor: token('surface1'),
			tertiaryColor: token('mantle'),
			clusterBkg: token('mantle'),
			clusterBorder: token('surface1'),
			titleColor: token('text'),
			edgeLabelBackground: token('base'),
			errorBkgColor: token('surface0'),
			errorTextColor: token('red')
		}
	};
}

let mermaidPromise: Promise<MermaidApi> | undefined;
let renderQueue = Promise.resolve();

async function getMermaid() {
	mermaidPromise ??= import('mermaid').then(({ default: mermaid }) => {
		mermaid.initialize(createConfig());
		return mermaid;
	});

	return mermaidPromise;
}

function enqueue<T>(work: () => Promise<T>) {
	const job = renderQueue.then(work);
	renderQueue = job.then(
		() => undefined,
		() => undefined
	);

	return job;
}

export async function renderMermaidPair(source: string, id: string) {
	return enqueue(async () => {
		const mermaid = await getMermaid();
		const preview = await mermaid.render(`${id}-preview`, source);
		const viewer = await mermaid.render(`${id}-viewer`, source);

		return { previewSvg: preview.svg, viewerSvg: viewer.svg };
	});
}
