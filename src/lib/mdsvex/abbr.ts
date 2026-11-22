// mdsvex parse plugins for `*[TERM]: Definition` abbreviations
import type { ParsePlugin, PluginContext } from 'mdsvex'

interface Scratch {
	defs?: Map<string, string>
	re?: RegExp
}

const definition = /^\*\[([^\]]+)\]:\s*(.+)$/
const scratch = (ctx: PluginContext) => ctx.scratch as Scratch

const collect: ParsePlugin = {
	name: 'abbr',
	sequential: true,
	paragraph: {
		parse(node, ctx) {
			const m = definition.exec(node.text_content)
			if (!m) return
			const s = scratch(ctx)
			s.defs ??= new Map()
			s.defs.set(m[1], m[2])
			node.remove()
		},
	},
}

const wrap: ParsePlugin = {
	name: 'abbr',
	sequential: true,
	text(run, ctx) {
		const s = scratch(ctx)
		const defs = s.defs
		if (!defs) return
		// longest terms first (they are more specific than shorter prefixes)
		s.re ??= new RegExp(
			`(?<!\\w)(${[...defs.keys()]
				.sort((a, b) => b.length - a.length)
				.map(RegExp.escape)
				.join('|')})(?!\\w)`,
			'g',
		)
		for (const m of run.text.matchAll(s.re)) {
			const abbr = run.replace(m.index, m.index + m[0].length, 'html', {
				tag: 'abbr',
				attributes: { title: defs.get(m[0]) ?? '' },
			})
			abbr.append('text', m[0])
		}
	},
}

export const abbr = [collect, wrap]
