<script lang="ts">
	import { toast } from 'svelte-sonner';
	import DataTable from '$lib/components/datatables/combats/data-table.svelte';
	const newCombat = (e: CustomEvent<{ combat_id: number }>) => {
		toast(`Created new combat at ${e.detail.combat_id}`);
	};
</script>

<div class="container mx-auto py-10">
	<DataTable on:newCombat />
</div>
