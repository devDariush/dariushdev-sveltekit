<script lang="ts">
	import './layout.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="/profile.webp" type="image/png" />

	<!-- Primary -->
	<title>Dariush Komeili – Computer Science Student</title>
	<meta
		name="description"
		content="Software Developer. Based in Düsseldorf. Interested in XR. Monero fanatic. Privacy-conscious."
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
		content="Software Developer. Based in Düsseldorf. Interested in XR. Monero fanatic. Privacy-conscious."
	/>
	<meta property="og:image" content="https://dariush.dev/profile.webp" />
	<meta property="og:url" content="https://dariush.dev" />
	<meta property="og:type" content="website" />
	<meta property="og:locale" content="en_US" />
	<meta property="og:site_name" content="dariush.dev" />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="Dariush Komeili – Computer Science Student" />
	<meta
		name="twitter:description"
		content="Software Developer. Based in Düsseldorf. Interested in XR. Monero fanatic. Privacy-conscious."
	/>
	<meta name="twitter:image" content="https://dariush.dev/profile.webp" />
</svelte:head>
{@render children()}
