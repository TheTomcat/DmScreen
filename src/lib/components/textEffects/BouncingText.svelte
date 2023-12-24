<script lang="ts">
	export let text: string = '';
</script>

<div class="bouncing">
	{#each text.split('') as character, i}
		<span style="--i:{i}">{@html character === ' ' ? '&nbsp' : character}</span>
	{/each}
</div>

<!-- https://codepen.io/alvarotrigo/pen/xxLvyOG -->
<style>
	.bouncing {
		position: relative;
		-webkit-box-reflect: below -20px linear-gradient(transparent, rgba(0, 0, 0, 0.2));
		font-size: 60px;
	}
	.bouncing span {
		position: relative;
		display: inline-block;
		color: #fff;
		animation: waviy 3s infinite;
		animation-delay: calc(0.1s * var(--i));
	}

	@keyframes waviy {
		0%,
		40%,
		100% {
			transform: translateY(0);
		}
		20% {
			transform: translateY(-20px);
		}
	}
</style>
