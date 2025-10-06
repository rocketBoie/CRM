<template>
  <aside class="sidebar h-full border-r">
    <nav class="flex flex-col space-y-4 p-6">
      <div class="title mb-6">CRM</div>

      <RouterLink
        v-for="item in menuItems"
        :key="item.name"
        :to="item.link"
        :class="['menu-item', { active: route.path === item.link }]"
      >
        <span class="icon" aria-hidden="true" v-html="item.icon" />
        <span class="label">{{ item.label }}</span>
      </RouterLink>
    </nav>
  </aside>
</template>

<script setup>
import { useRoute } from "vue-router";
import { onMounted } from "vue";
import { initFlowbite } from "flowbite";

const route = useRoute();

onMounted(() => {
  initFlowbite();
});

const menuItems = [
  {
    name: "Dashboard",
    label: "Dashboard",
    link: "/services",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h4v11H3zM10 4h4v17h-4zM17 7h4v14h-4z" />
           </svg>`,
  },
  {
    name: "Employees",
    label: "Employees",
    link: "/employee",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a4 4 0 00-5-4M12 4a4 4 0 110 8 4 4 0 010-8zm0 12a9 9 0 00-9 9h18a9 9 0 00-9-9z" />
           </svg>`,
  },
  {
    name: "Attendance",
    label: "Attendance",
    link: "/attendance",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
           </svg>`,
  },
  {
    name: "Payroll",
    label: "Payroll",
    link: "/payroll",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3v4m0-10v-2m0 2h6m-6 0H6" />
           </svg>`,
  },
  {
    name: "Leaves",
    label: "Leaves",
    link: "/leaves",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
           </svg>`,
  },
  
  {
    name: "Holidays",
    label: "Holidays",
    link: "/holidays",
    icon: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4h14V3M4 7h16v14H4z" />
           </svg>`,
  },
];
</script>

<style scoped>
*{
  color : white
}
.sidebar {
  background: linear-gradient(180deg, #5a6acf 0%, #3f4eb8 100%);
  border-color: #c1c1c1;
  border-right-width: 1px;
  color: #f0f0f5;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #f0f0f5;
  letter-spacing: 0.05em;
  user-select: none;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #d0d0df;
  font-weight: 400;
  text-decoration: none;
  transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out;
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
}

.menu-item:hover {
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.1);
}

.menu-item.active {
  font-weight: 600;
  color: #e3e3ff;
  background-color: rgba(255, 255, 255, 0.15);
}

.icon {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  stroke-width: 2;
}
</style>
