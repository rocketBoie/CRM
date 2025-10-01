<script setup>
import { ref } from "vue";
import SideBar from "../components/SideBar.vue";
import { employeeStore } from "../stores/store";

const store = employeeStore()

const attendance = ref({})

function initializeAttendance() {
  attendance.value = {}
  store.employees.forEach(emp => {
    attendance.value[emp.id] = 'Absent'
  })
}

function toggleAttendance(employeeId) {
  attendance.value[employeeId] = attendance.value[employeeId] === 'Present' ? 'Absent' : 'Present'
}

function markAllPresent() {
  store.employees.forEach(emp => {
    attendance.value[emp.id] = 'Present'
  })
}

function resetAttendance() {
  store.employees.forEach(emp => {
    attendance.value[emp.id] = 'Absent'
  })
}

initializeAttendance()
</script>

<template>
  <div class="flex min-h-screen">
    <div class="w-64">
      <SideBar />
    </div>
    <div class="flex-grow p-8">
      <main>
        <h1 class="text-4xl font-extrabold mb-6 text-gray-800">Employee Attendance</h1>

        <div class="mb-4 space-x-4">
          <button @click="markAllPresent" class="px-4 py-2 bg-green-600 text-white rounded cursor-pointer">
            Mark All Present
          </button>
          <button @click="resetAttendance" class="px-4 py-2 bg-red-600 text-white rounded cursor-pointer">
            Reset All to Absent
          </button>
        </div>

        <div class="overflow-x-auto shadow-md border border-gray-200 bg-white">
          <table class="min-w-full w-full divide-y divide-gray-200">
            <thead class="bg-gray-100">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Attendance</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="employee in store.employees" :key="employee.id">
                <td class="px-6 py-4 text-sm text-gray-700 font-medium">{{ employee.id }}</td>
                <td class="px-6 py-4 text-sm text-gray-900">{{ employee.name }}</td>
                <td
                  class="px-6 py-4 text-sm font-semibold cursor-pointer select-none"
                  :class="attendance[employee.id] === 'Present' ? 'text-green-600' : 'text-red-600'"
                  @click="toggleAttendance(employee.id)"
                  title="Click to toggle attendance"
                >
                  {{ attendance[employee.id] || 'Absent' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  </div>
  </template>
