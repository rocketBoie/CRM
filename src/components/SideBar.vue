<template>
  <aside class="bg-white h-full border-r border-grayout">
    <nav class="flex flex-col space-y-4 p-6">
      <div class="text-2xl font-bold text-primary mb-6">CRM</div>
      <RouterLink
        v-for="item in menuItems"
        :key="item.name"
        :to="item.link"
        class="text-textdark hover:text-primary"
        :class="{ 'font-semibold': route.name === item.name }"
      >
        {{ item.label }}
      </RouterLink>
    </nav>
  </aside>
</template>

<script setup>
import { useRoute } from "vue-router";
const route = useRoute();
import { initFlowbite } from "flowbite";
import { onMounted } from "vue";
onMounted(() => {
  initFlowbite();
});
const menuItems = [
  { name: "Dashboard", label: "Dashboard", link: "/" },
  { name: "Employees", label: "Employees", link: "/employee" },
  { name: "Attendance", label: "Attendance", link: "/attendance" },
  { name: "Leaves", label: "Leaves", link: "/leaves" },
  { name: "Payroll", label: "Payroll", link: "/payroll" },
  { name: "Holidays", label: "Holidays", link: "/holidays" },
];
</script>
