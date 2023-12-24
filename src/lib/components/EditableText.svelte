<script lang="ts">
	export let value: string;
	export let callback: (v: string) => Promise<any>;
	let element: HTMLElement;
	let prevText: string = '';

	const handleKeypress = (e: KeyboardEvent) => {
		if (e.key == 'Enter') {
			e.preventDefault();
			element.blur();
		} else if (e.key == 'Escape') {
			e.preventDefault();
			value = prevText;
			element.blur();
		}
	};

	const attemptCallback = () => {
		if (value == prevText) return;
		callback(value).catch(() => {
			value = prevText;
		});
	};
</script>

<div
	role="textbox"
	tabindex="0"
	contenteditable
	class="editable"
	bind:this={element}
	on:focus={() => (prevText = value)}
	on:blur={attemptCallback}
	on:keydown={handleKeypress}
	bind:innerText={value}
	spellcheck="false"
/>

<style>
	.editable {
		display: inline;
		border-bottom: 1px dashed #aaa;
	}
	.editable:hover {
		border: 1px solid red;
		border-radius: var(--radius-2);
		box-sizing: border-box;
	}
</style>
