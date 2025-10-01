<template>
  <div class="flex min-h-screen bg-graylight text-textdark">
    <div class="w-64 fixed inset-y-0 left-0">
      <SideBar />
    </div>

    <div class="flex-1 ml-64 p-6">
      <header class="mb-6">
        <h1 class="text-3xl font-semibold">Employee Dashboard</h1>
      </header>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Cards icon="👨‍👩‍👧‍👦" label="Total Employees" :value="emp.len" />
        <Cards icon="👨" label="Present Today" :value="emp.activeUsersCount" />
        <Cards icon="🧑‍🤝‍🧑" label="Total Absent" :value="emp.inactiveUsersCount" />
        <Cards icon="🫂" label="On Leave Today" :value="leaveCount" />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4 text-textdark">
            📈 Attendance Trends
          </h2>
          <div class="h-64">
            <Chart :attendanceData="emp.attendanceByDay" />
          </div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-4 text-textdark">
            📅 Leave Calendar
          </h2>
          <div class="h-64 bg-graylight rounded-lg flex items-center justify-center text-gray-500">
            Calendar
          </div>
        </div>
      </div>

      <div class="bg-white p-4 rounded-lg shadow-lg">
        <h2 class="text-xl font-semibold mb-4">Recent Activities</h2>
      </div>
    </div>

    <Modal ref="modalRef" @added="onUserAdded" />
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
