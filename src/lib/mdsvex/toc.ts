// mdsvex parse plugin to keep <code> in the TOC links and add smart punctuation.
import type { NodeView, ParsePlugin } from 'mdsvex'

export interface HeadingPart {
	code: boolean
	text: string
}

declare module 'mdsvex/compile' {
	interface PluginData {
		tocParts?: { headings: { id: string; parts: HeadingPart[] }[] }
	}
}

// the toc text comes from the source, before smart_punctuation runs, let's apply it again (simplified version)
const smarten = (s: string) =>
	s
		.replace(/(\w)'(\w)/g, '$1’$2')
		.replace(/"([^"]*)"/g, '“$1”')
		.replace(/\.\.\./g, '…')
		.replace(/---/g, '—')
		.replace(/--/g, '–')

const collectParts = (node: NodeView, out: HeadingPart[] = []) => {
	for (let c = node.first_child; c; c = c.next) {
		if (c.type === 'code_span') {
			out.push({ code: true, text: c.text_content })
		} else if (c.first_child) {
			collectParts(c, out)
		} else if (c.text_content) {
			const last = out.at(-1)
			if (last && !last.code) last.text += c.text_content
			else out.push({ code: false, text: c.text_content })
		}
	}
	return out
}

export const tocParts: ParsePlugin = {
	name: 'tocParts',
	sequential: true,
	heading: {
		parse(node, ctx) {
			const id = node.attrs.id
			if (typeof id !== 'string') return
			const parts = collectParts(node).map((p) => (p.code ? p : { code: false, text: smarten(p.text) }))
			ctx.add('headings', { id, parts })
		},
	},
}
