<template>
  <button
    class="bg-primary text-white px-6 py-3 rounded-md transition transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
  >
    <slot />
  </button>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: "button",
  },
});
</script>
