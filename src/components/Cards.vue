<template>
  <div
    class="bg-white rounded-lg shadow p-5 flex items-center gap-4 border border-grayout hover:border-primary transition"
  >
    <div class="text-3xl">{{ icon }}</div>
    <div>
      <div class="text-sm text-gray-500">{{ label }}</div>
      <div class="text-2xl font-semibold text-textdark">{{ value }}</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: String,
  label: String,
  value: [String, Number],
});
</script>
