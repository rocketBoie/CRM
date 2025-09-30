<script setup>

const props = defineProps({
  num: Number,
  text: String,
  imge: String,
});
</script>

<template>
  <div class="flex flex-col w-60 border-2 border-dashed border-gray-400 gap-6">
    <div class="flex justify-between p-4 items-center">
      <h1 class="text-4xl">{{ num }}</h1>
      <h1 class="text-5xl object-cover">{{ imge }} </h1>
    </div>
    <div class="p-4 text-base">
      {{ text }}
    </div>
  </div>
</template>
