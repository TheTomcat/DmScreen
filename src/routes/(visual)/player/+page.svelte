<script lang="ts">
	import { apiGetCombat, apiGetImageById, apiGetRandomImage } from '$lib/api';
	import { onMount } from 'svelte';
	import type { Combat, Participant } from '../../../app';
	let imageBox: HTMLElement;
	let messageBox: HTMLElement;
	let is_transitioning: boolean = false;
	let message: string = '';
	let mode = 'combat';
	let combat: Combat;

	onMount(() => {
		apiGetCombat(fetch, 1).then((c) => {
			combat = c;
		});
	});

	const preloadImage = (url: string, onload: (e: Event) => {}) => {
		let imageObject = new Image();
		imageObject.src = url;
		imageObject.addEventListener('load', onload);
	};

	const fetchNewImage = (image_id: number | null = null) => {
		const setImageAsBackground = (suppliedImageId: number) => {
			apiGetImageById(fetch, suppliedImageId).then((image) => {
				var imageObject = new Image();
				imageObject.src = image.url; //download the image
				imageObject.addEventListener('load', (e) => {
					//after it's loaded
					//imageBox.classList.add('transitioning'); //swap out the old one
					is_transitioning = true;
					setTimeout(() => {
						imageBox.style.backgroundImage = `url(${image.url})`;
						//imageBox.classList.remove('transitioning');
						is_transitioning = false;
					}, 750); // and 750ms later replace it with the new one
				});
			});
		};
		if (image_id) {
			setImageAsBackground(image_id);
		} else {
			apiGetRandomImage(fetch).then((image) => setImageAsBackground(image.image_id));
		}
	};

	// const fetchNewMessage = (messageId) => {
	//     putMessageInBox = (message) => {
	//         messageBox.innerHTML = message.message;
	//         messageBox.dataset.id = message.message_id;
	//     }

	//     if (messageId) {
	//         req = apiGetMessageById(messageId).then(putMessageInBox);
	//     } else {
	//         req = apiGetRandomMessage().then(putMessageInBox);
	//     }
	// }

	const schedulePageUpdate = (timer = 30000) => {
		setTimeout(() => {
			fetchNewImage();
			schedulePageUpdate(timer);
		}, timer);
	};

	onMount(() => {
		fetchNewImage();
		schedulePageUpdate();
	});

	const getNextPCOnDeck = (combat: Combat, currentParticipantID: number): Participant => {
		return combat.participants[0];
		// let p = combat.participants.find(p => p.is_PC, true)
	};
</script>

<div bind:this={imageBox} id="image" class:transitioning={is_transitioning} />
{#if mode == 'loading'}
	<div class="loader">
		<div class="inner one" />
		<div class="inner two" />
		<div class="inner three" />
	</div>
{/if}
{#if message}
	<div id="fakecontent" bind:this={messageBox}>{@html message}</div>
{/if}
{#if mode == 'combat' && combat}
	<div class="container">
		<div class="overlay combatants">
			<table>
				<thead>
					<th />
					<th>Name</th>
				</thead>
				<tbody>
					{#each combat.participants
						.filter((p) => p.is_visible)
						.toSorted((a, b) => b.initiative - a.initiative) as participant, i (participant.participant_id)}
						<tr>
							<td>{participant.initiative}</td>
							<td>{participant.name}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<div class="overlay name">Text2</div>
		<div class="overlay portrait">Text2</div>
		<div class="overlay upnext">Up Next:</div>
	</div>
{/if}

<style>
	.container {
		position: absolute;
		width: 100%;
		height: 100%;
		display: grid;
		column-gap: var(--size-7);
		row-gap: var(--size-7);
		padding: var(--size-7);
		grid-template-columns: 1fr 2fr;
		grid-template-rows: 1fr 3fr 1fr;
		/* background-color: red; */
	}
	.overlay {
		background-color: rgba(216, 216, 216, 0.4);
		/* opacity: 0.8; */
		align-self: stretch;
		justify-self: stretch;
		border-radius: var(--size-3);
		padding: var(--size-3);
	}
	.combatants {
		grid-area: 1 / 1 / 4 / 2;
		/* background-color: antiquewhite; */
	}
	.portrait {
		grid-area: 2 / 2 / 3 / 3;
	}
	.name {
		grid-area: 1/2/2/3;
	}
	.upnext {
		grid-area: 3/2/4/3;
	}
	.loader {
		position: absolute;
		top: calc(50% - 100px);
		left: calc(50% - 100px);
		width: 100px;
		height: 100px;
		border-radius: 50%;
		perspective: 800px;
	}

	.inner {
		position: absolute;
		box-sizing: border-box;
		width: 100%;
		height: 100%;
		border-radius: 50%;
	}

	.inner.one {
		left: 0%;
		top: 0%;
		animation: rotate-one 1s linear infinite;
		border-bottom: 3px solid #efeffa;
	}

	.inner.two {
		right: 0%;
		top: 0%;
		animation: rotate-two 1s linear infinite;
		border-right: 3px solid #efeffa;
	}

	.inner.three {
		right: 0%;
		bottom: 0%;
		animation: rotate-three 1s linear infinite;
		border-top: 3px solid #efeffa;
	}

	@keyframes rotate-one {
		0% {
			transform: rotateX(35deg) rotateY(-45deg) rotateZ(0deg);
		}

		100% {
			transform: rotateX(35deg) rotateY(-45deg) rotateZ(360deg);
		}
	}

	@keyframes rotate-two {
		0% {
			transform: rotateX(50deg) rotateY(10deg) rotateZ(0deg);
		}

		100% {
			transform: rotateX(50deg) rotateY(10deg) rotateZ(360deg);
		}
	}

	@keyframes rotate-three {
		0% {
			transform: rotateX(35deg) rotateY(55deg) rotateZ(0deg);
		}

		100% {
			transform: rotateX(35deg) rotateY(55deg) rotateZ(360deg);
		}
	}
	@keyframes slowpan {
		0% {
			transform: translate3d(-200px, -200px, 0) scale(1.4);
		}

		50% {
			transform: translate3d(0, 0, 0) scale(1.1);
		}

		100% {
			transform: translate3d(400px, -200px, 0) scale(1.5);
		}
	}
	#image {
		height: 100%;
		width: 100%;

		-webkit-background-size: cover;
		-moz-background-size: cover;
		-o-background-size: cover;
		background-size: cover;
		transform: scale(1.3);
		-webkit-animation: slowpan 50s ease-in-out 0s infinite alternate;
		animation: slowpan 50s ease-in-out 0s infinite alternate;
		position: fixed;
		opacity: 1;
		transition: opacity 1s ease-in-out;
	}

	#image.transitioning {
		opacity: 0;
		transition: opacity 1s ease-in-out;
	}

	#fakecontent {
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
