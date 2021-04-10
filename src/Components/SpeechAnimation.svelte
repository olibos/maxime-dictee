<script lang="ts">
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";

  let wave: SVGElement;
  export let waveColor: string;
  document.addEventListener('start-speak', () => visible = true);
  document.addEventListener('end-speak', () => visible = false);

  let visible = false;
  $:waveColor && wave && wave.style.setProperty("--wave-color", waveColor);
</script>

{#if visible}
  <div class="overlay" transition:fade>
    <svg
      class="wave"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 50 38.05"
      bind:this={wave}
    >
      <title>Audio Wave</title>
      <path
        class="Line_1"
        d="M0.91,15L0.78,15A1,1,0,0,0,0,16v6a1,1,0,1,0,2,0s0,0,0,0V16a1,1,0,0,0-1-1H0.91Z"
      />
      <path
        class="Line_2"
        d="M6.91,9L6.78,9A1,1,0,0,0,6,10V28a1,1,0,1,0,2,0s0,0,0,0V10A1,1,0,0,0,7,9H6.91Z"
      />
      <path
        class="Line_3"
        d="M12.91,0L12.78,0A1,1,0,0,0,12,1V37a1,1,0,1,0,2,0s0,0,0,0V1a1,1,0,0,0-1-1H12.91Z"
      />
      <path
        class="Line_4"
        d="M18.91,10l-0.12,0A1,1,0,0,0,18,11V27a1,1,0,1,0,2,0s0,0,0,0V11a1,1,0,0,0-1-1H18.91Z"
      />
      <path
        class="Line_5"
        d="M24.91,15l-0.12,0A1,1,0,0,0,24,16v6a1,1,0,0,0,2,0s0,0,0,0V16a1,1,0,0,0-1-1H24.91Z"
      />
      <path
        class="Line_6"
        d="M30.91,10l-0.12,0A1,1,0,0,0,30,11V27a1,1,0,1,0,2,0s0,0,0,0V11a1,1,0,0,0-1-1H30.91Z"
      />
      <path
        class="Line_7"
        d="M36.91,0L36.78,0A1,1,0,0,0,36,1V37a1,1,0,1,0,2,0s0,0,0,0V1a1,1,0,0,0-1-1H36.91Z"
      />
      <path
        class="Line_8"
        d="M42.91,9L42.78,9A1,1,0,0,0,42,10V28a1,1,0,1,0,2,0s0,0,0,0V10a1,1,0,0,0-1-1H42.91Z"
      />
      <path
        class="Line_9"
        d="M48.91,15l-0.12,0A1,1,0,0,0,48,16v6a1,1,0,1,0,2,0s0,0,0,0V16a1,1,0,0,0-1-1H48.91Z"
      />
    </svg>
  </div>
{/if}
<style lang="scss">
  .overlay {
    position: fixed;
    display: flex;
    align-items: center;
    justify-content: center;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    background: rgba($color: #000000, $alpha: 0.5);
  }
  .wave {
    height: 70px;
    width: 70px;
    fill: var(--wave-color, white);
  }

  @for $i from 1 through 9 {
    .Line_#{$i} {
      animation: pulse 1s infinite;
      animation-delay: $i * 0.15s;
    }
  }

  @keyframes pulse {
    0% {
      transform: scaleY(1);
      transform-origin: 50% 50%;
    }

    50% {
      transform: scaleY(0.7);
      transform-origin: 50% 50%;
    }

    100% {
      transform: scaleY(1);
      transform-origin: 50% 50%;
    }
  }
</style>
