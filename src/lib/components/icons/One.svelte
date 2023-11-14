<script>
	// @ts-ignore

	import Icon from 'lucide-svelte';
	const iconNode = [
		['path', { d: 'M 12 3 12 21' }],
		[
			'path',
			{
				d: 'M 12,3 C 11,4 10.684143,4.2953964 9.5159847,5.1227621 8.3263964,5.9653058 7.75,6.1432225 6.8682864,6.2608696'
			}
		]
	];
</script>

<Icon name="construction" {...$$props} {iconNode}>
	<slot />
</Icon>
