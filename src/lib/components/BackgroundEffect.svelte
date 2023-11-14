<script lang="ts">
	// https://codepen.io/agoodwin/pen/NMJoER clouds and stars
	// https://codepen.io/keithclark/pen/DjXzBw snowy background
	// https://codepen.io/hylobates-lar/pen/bGEQXgm floating colour orbs
	// https://codepen.io/alphardex/pen/RwrVoeL shooting stars
	// https://codepen.io/mikegolus/pen/Jegvym fireflies
	// https://codepen.io/wikyware-net/pen/mdmOVjy smoke effect
	// https://codepen.io/wikyware-net/pen/MWmQOGa smoke 2
</script>

<div class="container">
	<!-- Quantity should be the same in Sass-->
	{#each Array(15) as _}
		<div class="firefly" />
	{/each}
</div>

<style lang="sass">
// Quantity should be the same in PUG
$quantity: 15

.firefly
  position: fixed
  left: 50%
  top: 50%
  width: 0.4vw
  height: 0.4vw
  margin: -0.2vw 0 0 9.8vw
  animation: ease 200s alternate infinite
  pointer-events: none

  &::before,
  &::after
    content: ''
    position: absolute
    width: 100%
    height: 100%
    border-radius: 50%
    transform-origin: -10vw
  
  &::before
    background: black
    opacity: 0.4
    animation: drift ease alternate infinite
  
  &::after
    background: white
    opacity: 0
    box-shadow: 0 0 0vw 0vw yellow
    animation: drift ease alternate infinite, flash ease infinite

  
// Randomize Fireflies Motion
@for $i from 1 through $quantity
  
  $steps: random(12) + 16
  $rotationSpeed: random(10) + 8s
  
  .firefly:nth-child(#{$i})
    animation-name: move#{$i}

    &::before
      animation-duration: #{$rotationSpeed}

    &::after
      animation-duration: #{$rotationSpeed}, random(6000) + 5000ms
      animation-delay: 0ms, random(8000) + 500ms

  @keyframes move#{$i}
    @for $step from 0 through $steps
      #{$step * calc(100/ $steps)}%
        transform: translateX(random(100) - 50vw) translateY(random(100) - 50vh) scale(calc(random(75) / 100 + .25))

@keyframes drift
  0%
    transform: rotate(0deg)
  100%
    transform: rotate(360deg)

@keyframes flash
  0%, 30%, 100%
    opacity: 0
    box-shadow: 0 0 0vw 0vw yellow
  5%
    opacity: 1
    box-shadow: 0 0 2vw 0.4vw yellow
</style>
