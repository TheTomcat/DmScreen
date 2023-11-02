<script lang="ts">
	export let value: string;
	export let callback: (v: string) => Promise<{}>;
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
		callback(value).catch(() => {
			value = prevText;
		});
	};
</script>

<div
	role="textbox"
	tabindex="0"
	contenteditable
	bind:this={element}
	on:focus={() => (prevText = value)}
	on:blur={attemptCallback}
	on:keydown={handleKeypress}
	bind:innerText={value}
/>
