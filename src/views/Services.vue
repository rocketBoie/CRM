<template>
  <div class="flex min-h-screen bg-graylight text-textdark">
    <div class="w-64 fixed inset-y-0 left-0">
      <SideBar />
    </div>

    <div class="flex-1 ml-64 p-8 space-y-8">
      <header
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 class="text-3xl font-bold">{{ title }}</h1>
          <p class="text-sm text-gray-600">{{ subtitle }}</p>
        </div>
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
          <div
            class="h-64 bg-graylight rounded-lg flex items-center justify-center text-gray-500"
          >
            Calendar
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4 text-textdark">
          🕒 Recent Activities
        </h2>
        <ul class="divide-y divide-grayout text-sm">
          <li class="py-3">John checked in at 09:05 AM</li>
          <li class="py-3">Alice marked on leave</li>
          <li class="py-3">HR updated records</li>
        </ul>
      </div>
    </div>

    <Modal ref="modalRef" @added="onUserAdded" />
  </div>
</template>

<script setup>
import { ref } from "vue";

import Cards from "../components/Cards.vue";
import Chart from "./Chart.vue";
import Modal from "../components/Modal.vue";
import Button from "../components/Button.vue";
import { employeeStore } from "../stores/store";
import SideBar from "../components/SideBar.vue";
const emp = employeeStore();
const modalRef = ref(null);

const title = "CRM Dashboard";
const subtitle = "Overview of employees and attendance";

function showAddUserModal() {
  modalRef.value?.open();
}

const leaveCount = 0;
</script>
