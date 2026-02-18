<script lang="ts">
	import './layout.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="/profile.png" type="image/png" />

	<!-- Primary -->
	<title>Dariush Komeili – Computer Science Student</title>
	<meta
		name="description"
		content="Computer Science Student at HHU. Based in Düsseldorf. Interested in XR. Monero fanatic. Privacy-conscious."
	/>
	<meta
		name="keywords"
		content="Dariush, Komeili, HHU, Informatik, Düsseldorf, Heinrich Heine, Computer Science, Student, Python, Backend, AI, Automation, Privacy"
	/>
	<meta name="author" content="Dariush Komeili" />
	<link rel="canonical" href="https://dariush.dev" />

	<!-- Open Graph -->
	<meta property="og:title" content="Dariush Komeili – Computer Science Student" />
	<meta
		property="og:description"
		content="Computer Science Student at HHU. Based in Düsseldorf. Interested in XR. Monero fanatic. Privacy-conscious."
	/>
	<meta property="og:image" content="https://dariush.dev/profile.png" />
	<meta property="og:url" content="https://dariush.dev" />
	<meta property="og:type" content="website" />
	<meta property="og:locale" content="en_US" />
	<meta property="og:site_name" content="dariush.dev" />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="Dariush Komeili – Computer Science Student" />
	<meta
		name="twitter:description"
		content="Computer Science Student at HHU. Based in Düsseldorf. Interested in XR. Monero fanatic. Privacy-conscious."
	/>
	<meta name="twitter:image" content="https://dariush.dev/profile.png" />

	<!-- JSON-LD Structured Data -->
	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: 'Dariush Komeili',
		url: 'https://dariush.dev',
		image: 'https://dariush.dev/profile.png',
		jobTitle: 'Computer Science Student',
		affiliation: {
			'@type': 'CollegeOrUniversity',
			name: 'Heinrich Heine University Düsseldorf'
		},
		address: {
			'@type': 'PostalAddress',
			addressLocality: 'Düsseldorf',
			addressCountry: 'DE'
		},
		sameAs: [
			'https://github.com/devDariush',
			'https://www.linkedin.com/in/dariush-komeili-a44796232',
			'https://bsky.app/profile/dariush.dev',
			'https://fosstodon.org/@camey',
			'https://blog.dariush.dev'
		]
	})}<\/script>`}
</svelte:head>
{@render children()}
