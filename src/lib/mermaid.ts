import type { MermaidConfig } from 'mermaid';

type MermaidApi = (typeof import('mermaid'))['default'];

const config = {
	startOnLoad: false,
	securityLevel: 'strict',
	theme: 'base',
	themeVariables: {
		background: '#24273a',
		primaryColor: '#363a4f',
		primaryBorderColor: '#8aadf4',
		primaryTextColor: '#cad3f5',
		lineColor: '#b8c0e0',
		secondaryColor: '#494d64',
		tertiaryColor: '#1e2030'
	}
} satisfies MermaidConfig;

let mermaidPromise: Promise<MermaidApi> | undefined;
let renderQueue = Promise.resolve();

async function getMermaid() {
	mermaidPromise ??= import('mermaid').then(({ default: mermaid }) => {
		mermaid.initialize(config);
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
