<script lang="ts">
	export let message: string;
</script>

<div class="messagebox">{@html message}</div>

<style>
	.messagebox {
		width: 70%;
		margin: auto;
		opacity: 0.9;
		text-align: center;
		bottom: 130px;
		left: 15%;
		position: absolute;
		color: antiquewhite;
		font-size: 48pt;
		-webkit-text-stroke: 2px #333;
		text-shadow: 3px 3px 0 #333, -1px -1px 0 #333, 1px -1px 0 #333, -1px 1px 0 #333, 1px 1px 0 #333;
		background-color: rgba(216, 216, 216, 0.4);
		border-radius: 10px;
		padding-left: 1rem;
		padding-right: 1rem;
	}
</style>
