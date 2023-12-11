<div class="container">
	<div class="upper">Ready?</div>
	<div class="lower">Ready?</div>
	<div class="inside">Roll for Initiative!</div>
</div>

<!-- https://codepen.io/alvarotrigo/pen/xxLvyOG -->
<style>
	.container {
		height: 1.15em;
		font-size: 4rem;
		font-family: sans-serif;
		position: relative;
	}

	.container div {
		position: absolute;
		left: 0;
		text-transform: uppercase;
		width: 100%;
		display: block;
		text-align: center;
	}

	.upper {
		top: 0;
		height: 52.5%;
		color: #fff;
		overflow: hidden;
		z-index: 3;
		animation: moveUp 1.5s ease-in-out 1;
		background-color: var(--surface-4);
	}

	.lower {
		bottom: 0;
		height: 100%;
		background: linear-gradient(180deg, #121212 52.5%, #fff 52.5%);
		color: transparent;
		background-clip: text;
		-webkit-background-clip: text;
		z-index: 1;
		animation: moveDown 1.5s ease-in-out 1;
	}

	.inside {
		position: absolute;
		top: 40%;
		transform: translateY(-40%);
		text-align: center;
		z-index: 2;
		font-size: 1rem;
		color: #dc143c;
	}

	@keyframes moveUp {
		0% {
			top: 0;
		}

		50%,
		70%,
		100% {
			top: -45px;
		}
	}

	@keyframes moveDown {
		0% {
			top: 0;
		}

		50%,
		70%,
		100% {
			top: 30px;
		}
	}

	@media (max-width: 424px) {
		.container {
			font-size: 2.5rem;
		}

		.inside {
			font-size: 0.75rem;
		}
	}

	@media (max-width: 320px) {
		.container {
			font-size: 2rem;
		}

		.inside {
			font-size: 0.5rem;
		}
	}
</style>
