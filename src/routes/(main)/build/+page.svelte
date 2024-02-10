<script lang="ts">
	import CombatBuilder from '$lib/components/new/CombatBuilder/CombatBuilder.svelte';
	import { toast } from 'svelte-sonner';
	const newCombat = (e: CustomEvent<{ combat_id: number }>) => {
		toast(`Combat created successfully: ${e.detail.combat_id}`);
	};
</script>

<CombatBuilder on:newCombat />
