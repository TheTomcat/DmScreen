<script lang="ts">
	import { queryParam } from 'sveltekit-search-params';

	const username = queryParam('username');
</script>

Your username is {$username}
<input bind:value={$username} />
