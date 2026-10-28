import sanitizeHtml from 'sanitize-html';

/** Clean rendered Markdown and persisted HTML before inserting it into the page. */
export function sanitizeTerminalHtml(html: string): string {
	return sanitizeHtml(html, {
		allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img', 'form', 'input', 'button'],
		allowedAttributes: {
			...sanitizeHtml.defaults.allowedAttributes,
			a: ['href', 'title', 'target', 'rel'],
			img: ['src', 'alt', 'style'],
			form: ['method', 'action', 'class'],
			input: ['type', 'name', 'value'],
			button: ['type', 'class', 'title']
		},
		allowedStyles: {
			img: {
				'max-width': [/^100%$/],
				'max-height': [/^300px$/],
				display: [/^block$/],
				'margin-top': [/^0\.5rem$/]
			}
		},
		allowedSchemes: [...sanitizeHtml.defaults.allowedSchemes, 'monero'],
		allowedSchemesAppliedToAttributes: ['href', 'src', 'cite', 'action'],
		allowProtocolRelative: false,
		transformTags: {
			a: sanitizeHtml.simpleTransform('a', {
				target: '_blank',
				rel: 'external noopener noreferrer'
			}),
			form: sanitizeHtml.simpleTransform('form', {
				method: 'POST',
				action: '?/execute'
			}),
			input: sanitizeHtml.simpleTransform('input', { type: 'hidden' })
		}
	});
}
