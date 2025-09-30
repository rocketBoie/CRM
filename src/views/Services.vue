<template>
  <div class="flex min-h-screen">
    <SideBar class="w-64  text-white fixed inset-0 z-10" />

    <div class="flex-1 ml-64 p-6">
      <header class="mb-6">
        <h1 class="text-3xl font-semibold">Employee Dashboard</h1>
      </header>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Cards :text="'Total Employees'" :num="emp.len" :imge="'👨‍👩‍👧‍👦'" />
        <Cards :text="'Present Today'" :num="emp.activeUsersCount" :imge="'👨'" />
        <Cards :text="'Total Absent'" :num="emp.inactiveUsersCount" :imge="'🧑‍🤝‍🧑'" />
        <Cards :text="'On Leave Today'" :num="1" :imge="'🫂'" />
      </div>

      <div class="bg-white p-4 rounded-lg shadow-lg mb-6">
        <h2 class="text-xl font-semibold mb-4">Attendance Trends</h2>
      </div>

      <div class="bg-white p-4 rounded-lg shadow-lg mb-6">
        <h2 class="text-xl font-semibold mb-4">Leave Calendar</h2>
      </div>

      <div class="bg-white p-4 rounded-lg shadow-lg">
        <h2 class="text-xl font-semibold mb-4">Recent Activities</h2>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Cards from '../components/Cards.vue';
import SideBar from '../components/SideBar.vue';
import { employeeStore } from '../stores/store';
const emp = employeeStore()

</script>

<style scoped>

</style>
