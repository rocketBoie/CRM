<template>
    <div 
      :class="cardClasses(color)" 
      class="p-4 rounded-lg shadow-md transition duration-200 transform hover:scale-[1.03] cursor-default"
    >
      <p class="text-xs font-medium uppercase tracking-wider text-white opacity-80">{{ title }}</p>
      <div class="flex items-center justify-between">
        <p class="text-3xl font-bold text-white mt-1">{{ value || 0 }}</p>
        <svg :class="iconClasses(color)" class="w-8 h-8 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" v-html="getIconPath(icon)"></svg>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  
  const props = defineProps({
    title: String,
    value: [Number, String],
    color: String,
    icon: String,
  });
  
  const cardClasses = computed(() => (color) => {
    const colors = {
      green: 'bg-green-600 border-l-4 border-green-700',
      blue: 'bg-blue-600 border-l-4 border-blue-700',
      indigo: 'bg-indigo-600 border-l-4 border-indigo-700',
      red: 'bg-red-600 border-l-4 border-red-700',
      gray: 'bg-gray-600 border-l-4 border-gray-700',
      orange: 'bg-yellow-600 border-l-4 border-yellow-700',
    };
    return colors[color] || 'bg-gray-500';
  });
  
  const iconClasses = computed(() => (color) => {
    const colors = {
      green: 'text-green-200',
      blue: 'text-blue-200',
      indigo: 'text-indigo-200',
      red: 'text-red-200',
      gray: 'text-gray-200',
      orange: 'text-yellow-200',
    };
    return colors[color] || 'text-gray-200';
  });
  
  const getIconPath = (icon) => {
    const icons = {
      check: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>',
      briefcase: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.518 23.518 0 0112 15c-3.18 0-6.236-.613-9-1.745M16 4h2a2 2 0 012 2v1h-2v3h-2V7h-2V4h-2V7h-2V4h-2V7h-2V6a2 2 0 012-2h2m4 0V2h2v2m-4 0h-2"></path>',
      half: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>',
      x: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>',
      calendar: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>',
      alert: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.332 16c-.77 1.333.192 3 1.732 3z"></path>',
    };
    return icons[icon] || '';
  };
  
  </script>