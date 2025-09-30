<script setup>
    import { defineProps } from 'vue';
    const props = defineProps({
        text : String,
    })
</script>

<template>
    <button class="bg-blue-500 text-white px-6 py-3 rounded-md transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 ">
        {{ props.text }}
    </button>
</template>