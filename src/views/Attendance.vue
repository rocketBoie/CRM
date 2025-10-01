<script setup>
import { ref, computed } from "vue";
import SideBar from "../components/SideBar.vue";
import { employeeStore } from "../stores/store";

const store = employeeStore();

const attendance = ref({});

function initializeAttendance() {
  attendance.value = {};
  store.employees.forEach((emp) => {
    attendance.value[emp.id] = "Absent";
  });
}

function toggleAttendance(employeeId) {
  attendance.value[employeeId] =
    attendance.value[employeeId] === "Present" ? "Absent" : "Present";
}

function markAllPresent() {
  store.employees.forEach((emp) => {
    attendance.value[emp.id] = "Present";
  });
}

function resetAttendance() {
  if (confirm("Are you sure you want to reset all attendance to Absent?")) {
    store.employees.forEach((emp) => {
      attendance.value[emp.id] = "Absent";
    });
  }
}

const presentCount = computed(
  () =>
    Object.values(attendance.value).filter((status) => status === "Present")
      .length
);

const absentCount = computed(
  () =>
    Object.values(attendance.value).filter((status) => status === "Absent")
      .length
);

initializeAttendance();
</script>

<template>
  <div class="flex min-h-screen bg-gray-50">
    <aside class="w-64 bg-white shadow-md">
      <SideBar />
    </aside>

    <section class="flex-grow p-10">
      <header class="mb-8">
        <h1 class="text-5xl font-extrabold text-gray-900 mb-2 tracking-tight">
          Employee Attendance
        </h1>
        <p class="text-gray-600 text-lg">
          Track and manage daily attendance records efficiently.
        </p>
      </header>

      <div class="mb-6 flex flex-wrap items-center gap-4">
        <button
          @click="markAllPresent"
          class="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded shadow transition focus:outline-none focus:ring-2 focus:ring-green-500"
          aria-label="Mark all employees as present"
        >
          Mark All Present
        </button>

        <button
          @click="resetAttendance"
          class="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded shadow transition focus:outline-none focus:ring-2 focus:ring-red-500"
          aria-label="Reset all attendance to absent"
        >
          Reset All to Absent
        </button>

        <div class="ml-auto text-gray-700 font-medium">
          <span class="mr-4"
            >Present:
            <span class="text-green-600">{{ presentCount }}</span></span
          >
          <span
            >Absent: <span class="text-red-600">{{ absentCount }}</span></span
          >
        </div>
      </div>

      <div
        class="overflow-x-auto rounded-lg shadow border border-gray-300 bg-white"
      >
        <table
          class="min-w-full divide-y divide-gray-200"
          role="table"
          aria-label="Employee attendance table"
        >
          <thead class="bg-gray-100">
            <tr>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide"
              >
                ID
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide"
              >
                Name
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide"
              >
                Attendance
              </th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="employee in store.employees"
              :key="employee.id"
              class="hover:bg-gray-50 transition"
            >
              <td class="px-6 py-4 text-sm font-medium text-gray-700">
                {{ employee.id }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">
                {{ employee.name }}
              </td>
              <td
                class="px-6 py-4 text-sm font-semibold cursor-pointer select-none"
                :class="
                  attendance[employee.id] === 'Present'
                    ? 'text-green-600'
                    : 'text-red-600'
                "
                @click="toggleAttendance(employee.id)"
                :aria-pressed="attendance[employee.id] === 'Present'"
                role="button"
                tabindex="0"
                @keydown.enter="toggleAttendance(employee.id)"
                title="Click to toggle attendance"
              >
                {{ attendance[employee.id] || "Absent" }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped>
[role="button"]:focus-visible {
  outline: 3px solid #2563eb;
  outline-offset: 2px;
}
</style>
