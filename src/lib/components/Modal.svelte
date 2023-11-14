<script lang="ts">
	export let showModal: boolean; // boolean
	/**
	 * allowCasualDismiss: Allow the modal to be dismissed by clicking outside
	 * showClose: Display a close button
	 */
	export let params = {
		allowCasualDismiss: true,
		showClose: true
	};

	export let dialog: HTMLDialogElement;

	$: if (dialog && showModal) dialog.showModal();
</script>

<div class="modal">
	<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
	<dialog
		bind:this={dialog}
		on:close={() => {
			showModal = false;
			dialog.close();
		}}
		on:click|self={() => {
			if (!params.allowCasualDismiss) return;
			dialog.close();
		}}
	>
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div class="container" on:click|stopPropagation>
			<slot name="header" />
			<div class="content">
				<slot />
			</div>
			<div class="footer">
				{#if params.showClose}<button on:click={() => dialog.close()}>Close</button>{/if}
				<slot name="footer" />
			</div>
		</div>
	</dialog>
</div>

<style>
	.modal {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 500px;
		max-width: 100%;
	}
	dialog {
		/* max-width: 32em; */
		border-radius: var(--radius-2);
		border: none;
		padding: var(--size-5);
	}
	dialog::backdrop {
		background: rgba(0, 0, 0, 0.3);
	}
	dialog > div {
		padding: 1em;
	}
	dialog[open] {
		animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}
	.container {
		display: flex;
		flex-direction: column;
		gap: var(--size-3);
	}
	.footer {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}
	@keyframes zoom {
		from {
			transform: scale(0.95);
		}
		to {
			transform: scale(1);
		}
	}
	dialog[open]::backdrop {
		animation: fade 0.2s ease-out;
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
	button {
		display: block;
	}
</style>
