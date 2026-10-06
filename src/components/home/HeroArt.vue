<script setup lang="ts">
// Ilustración del hero: sofá limpio entre burbujas y destellos. Puro SVG, sin fotos.
</script>

<template>
  <svg class="art" viewBox="0 0 420 360" role="img" aria-label="Ilustración de un sofá recién limpio rodeado de burbujas">
    <defs>
      <linearGradient id="art-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#19C3B8" />
        <stop offset="1" stop-color="#0B4F8A" />
      </linearGradient>
      <linearGradient id="art-sofa" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffffff" />
        <stop offset="1" stop-color="#E3F8F6" />
      </linearGradient>
      <radialGradient id="art-bubble" cx="0.35" cy="0.3" r="0.7">
        <stop offset="0" stop-color="#ffffff" stop-opacity="0.95" />
        <stop offset="0.6" stop-color="#ffffff" stop-opacity="0.25" />
        <stop offset="1" stop-color="#19C3B8" stop-opacity="0.35" />
      </radialGradient>
    </defs>
    <path
      d="M64 70C120 10 270 0 340 52s88 160 34 232-208 92-280 40S8 130 64 70Z"
      fill="url(#art-bg)"
    />
    <g class="art__sofa">
      <rect x="92" y="150" width="236" height="78" rx="26" fill="url(#art-sofa)" />
      <rect x="112" y="118" width="196" height="64" rx="22" fill="#fff" />
      <rect x="72" y="168" width="46" height="84" rx="20" fill="#fff" />
      <rect x="302" y="168" width="46" height="84" rx="20" fill="#fff" />
      <rect x="112" y="200" width="196" height="40" rx="16" fill="#E7F0FA" />
      <path d="M210 124v68" stroke="#DFE8F1" stroke-width="3" stroke-linecap="round" />
      <rect x="96" y="250" width="12" height="22" rx="5" fill="#073763" />
      <rect x="312" y="250" width="12" height="22" rx="5" fill="#073763" />
    </g>
    <g class="art__bubbles">
      <circle cx="96" cy="96" r="22" fill="url(#art-bubble)" stroke="#fff" stroke-opacity=".7" />
      <circle cx="340" cy="110" r="16" fill="url(#art-bubble)" stroke="#fff" stroke-opacity=".7" />
      <circle cx="356" cy="250" r="26" fill="url(#art-bubble)" stroke="#fff" stroke-opacity=".7" />
      <circle cx="58" cy="230" r="12" fill="url(#art-bubble)" stroke="#fff" stroke-opacity=".7" />
      <circle cx="250" cy="70" r="10" fill="url(#art-bubble)" stroke="#fff" stroke-opacity=".7" />
    </g>
    <g class="art__sparks" fill="#fff">
      <path d="M150 74l5 13 13 5-13 5-5 13-5-13-13-5 13-5z" />
      <path d="M300 300l4 10 10 4-10 4-4 10-4-10-10-4 10-4z" />
      <path d="M372 170l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" />
    </g>
  </svg>
</template>

<style scoped lang="scss">
.art {
  width: 100%;
  height: auto;
  overflow: visible;

  &__bubbles circle {
    animation: float 6s ease-in-out infinite;
    transform-box: fill-box;

    &:nth-child(2) {
      animation-delay: -1.5s;
    }
    &:nth-child(3) {
      animation-delay: -3s;
    }
    &:nth-child(4) {
      animation-delay: -4.5s;
    }
  }

  &__sparks path {
    animation: twinkle 3s ease-in-out infinite;
    transform-box: fill-box;
    transform-origin: center;

    &:nth-child(2) {
      animation-delay: -1s;
    }
    &:nth-child(3) {
      animation-delay: -2s;
    }
  }
}

@keyframes float {
  50% {
    transform: translateY(-10px);
  }
}

@keyframes twinkle {
  50% {
    transform: scale(0.6);
    opacity: 0.6;
  }
}
</style>
