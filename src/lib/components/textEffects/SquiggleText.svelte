<script lang="ts">
	//https://codepen.io/lbebber/pen/KwGEQv
	export let text: string = '';
</script>

<div class="container">
	<div class="test">
		{text}
	</div>
</div>

<svg xmlns="http://www.w3.org/2000/svg" version="1.1">
	<defs>
		<filter id="squiggly-0">
			<feTurbulence id="turbulence" baseFrequency="0.02" numOctaves="3" result="noise" seed="0" />
			<feDisplacementMap id="displacement" in="SourceGraphic" in2="noise" scale="6" />
		</filter>
		<filter id="squiggly-1">
			<feTurbulence id="turbulence" baseFrequency="0.02" numOctaves="3" result="noise" seed="1" />
			<feDisplacementMap in="SourceGraphic" in2="noise" scale="8" />
		</filter>

		<filter id="squiggly-2">
			<feTurbulence id="turbulence" baseFrequency="0.02" numOctaves="3" result="noise" seed="2" />
			<feDisplacementMap in="SourceGraphic" in2="noise" scale="6" />
		</filter>
		<filter id="squiggly-3">
			<feTurbulence id="turbulence" baseFrequency="0.02" numOctaves="3" result="noise" seed="3" />
			<feDisplacementMap in="SourceGraphic" in2="noise" scale="8" />
		</filter>

		<filter id="squiggly-4">
			<feTurbulence id="turbulence" baseFrequency="0.02" numOctaves="3" result="noise" seed="4" />
			<feDisplacementMap in="SourceGraphic" in2="noise" scale="6" />
		</filter>
	</defs>
</svg>

<style>
	@import url('https://fonts.googleapis.com/css?family=Amatic+SC:400,700');
	body {
		font-family: 'Amatic SC', sans-serif;
		font-size: 100px;
	}
	.test {
		-webkit-animation: squiggly-anim 0.34s linear infinite;
		animation: squiggly-anim 0.34s linear infinite;
	}
	body {
		line-height: 100vh;
		background: #111;
		color: #fff;
	}
	.container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 100%;
	}
	.test {
		display: inline-block;
		vertical-align: middle;
		width: 100%;
		outline: none;
		text-align: center;
		line-height: 1;
	}
	.small {
		font-size: 0.5em;
	}
	.smaller {
		font-size: 0.4em;
	}
	p {
		margin: 0;
	}
	@-webkit-keyframes squiggly-anim {
		0% {
			filter: url('#squiggly-0');
		}
		25% {
			filter: url('#squiggly-1');
		}
		50% {
			filter: url('#squiggly-2');
		}
		75% {
			filter: url('#squiggly-3');
		}
		100% {
			filter: url('#squiggly-4');
		}
	}
	@keyframes squiggly-anim {
		0% {
			filter: url('#squiggly-0');
		}
		25% {
			filter: url('#squiggly-1');
		}
		50% {
			filter: url('#squiggly-2');
		}
		75% {
			filter: url('#squiggly-3');
		}
		100% {
			filter: url('#squiggly-4');
		}
	}
</style>
