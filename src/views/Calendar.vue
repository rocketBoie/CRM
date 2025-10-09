<script setup>
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { employeeStore } from "../stores/store";
import SideBar from "../components/SideBar.vue";

const route = useRoute();
const router = useRouter();
const store = employeeStore();

const employeeId = route.params.id;

const selectedMonth = ref(new Date().getMonth());
const selectedYear = ref(new Date().getFullYear());
const today = new Date();

const employee = computed(() =>
  store.employees.find((emp) => emp.id.toString() === employeeId?.toString())
);

function updateAttendance(id, dateStr, status) {
  store.updateAttendance(id, dateStr, status);
}

const monthYear = computed({
  get() {
    return `${selectedYear.value}-${(selectedMonth.value + 1)
      .toString()
      .padStart(2, "0")}`;
  },
  set(value) {
    const [year, month] = value.split("-");
    selectedYear.value = parseInt(year);
    selectedMonth.value = parseInt(month) - 1;
  },
});

const ATTENDANCE_STATUSES = [
  "present",
  "half-day",
  "full-day",
  "paid-leave",
  "absent",
  "off-day",
];

function formatDateISO(date) {
  return date.toISOString().slice(0, 10);
}

const daysInMonth = computed(() => {
  const date = new Date(selectedYear.value, selectedMonth.value, 1);
  const dates = [];
  while (date.getMonth() === selectedMonth.value) {
    dates.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return dates;
});

today.setHours(0, 0, 0, 0);
function toggleAttendance(date) {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  if (targetDate > today || !employee.value || date.getDay() === 0) return;

  const dateStr = formatDateISO(date);
  const currentStatus = employee.value.attendanceData?.[dateStr] ?? null;
  const currentIndex = ATTENDANCE_STATUSES.indexOf(currentStatus);
  const nextIndex = (currentIndex + 1) % ATTENDANCE_STATUSES.length;
  const nextStatus = ATTENDANCE_STATUSES[nextIndex];
  updateAttendance(employee.value.id, dateStr, nextStatus);
}

function getTooltip(date) {
  const dateOnly = new Date(date);
  dateOnly.setHours(0, 0, 0, 0);

  if (dateOnly > today) return "Cannot edit future date";
  if (!employee.value) return "Loading...";
  if (date.getDay() === 0) return "Off Day";

  const status = employee.value.attendanceData?.[formatDateISO(date)];

  return status
    ? status
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
    : "Absent";
}

function goBack() {
  router.go(-1);
}
</script>

<template>
  <div class="flex min-h-screen bg-gradient-to-br from-indigo-50 to-white">
    <div class="w-64">
      <SideBar />
    </div>

    <div class="flex-grow p-8">
      <div class="bg-white p-6 rounded-lg shadow-lg">
        <h2 class="text-3xl font-semibold text-indigo-900 mb-6" v-if="employee">
          <button @click="goBack" class="cursor-pointer">&larr;</button>
          Attendance Calendar for {{ employee.name }}
        </h2>
        <h2 v-else class="text-3xl font-semibold text-gray-500 mb-6">
          Loading employee data...
        </h2>

        <label class="block mb-6 text-gray-700 font-medium">
          Select Month:
          <input type="month" v-model="monthYear"
            class="ml-2 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500" />
        </label>

        <div class="grid grid-cols-7 gap-2 text-center mb-4">
          <div class="font-semibold text-gray-800" v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']"
            :key="day">
            {{ day }}
          </div>
        </div>

        <div class="grid grid-cols-7 gap-2 text-center">
          <template v-for="n in new Date(selectedYear, selectedMonth, 1).getDay()" :key="'empty-' + n">
            <div></div>
          </template>

          <template v-for="date in daysInMonth" :key="formatDateISO(date)">
            <button type="button" :disabled="date.getDay() === 0 || date > today"
              class="p-4 rounded-lg cursor-pointer select-none transition-all duration-300 ease-in-out" :class="{
                'bg-green-300':
                  employee?.attendanceData?.[formatDateISO(date)] === 'present',
                'bg-yellow-300':
                  employee?.attendanceData?.[formatDateISO(date)] ===
                  'half-day',
                'bg-red-300':
                  employee?.attendanceData?.[formatDateISO(date)] ===
                  'full-day',
                'bg-blue-300':
                  employee?.attendanceData?.[formatDateISO(date)] ===
                  'paid-leave',
                'bg-gray-500': date.getDay() === 0,
                'bg-white hover:bg-gray-500':
                  !employee?.attendanceData?.[formatDateISO(date)] &&
                  date.getDay() !== 0,
                'border-2 border-indigo-600':
                  date.toDateString() === today.toDateString(),
                'disabled-day': date.getDay() === 0 || date > today,
              }" @click="toggleAttendance(date)" :title="getTooltip(date)" aria-label="Toggle attendance status">
              <div class="text-lg font-semibold">
                {{ date.getDate() }}
              </div>

              <div v-if="date <= today" class="text-xs mt-1">
                <span v-if="date.getDay() === 0">Off Day</span>
                <span v-else-if="
                  employee?.attendanceData?.[formatDateISO(date)] ===
                  'present'
                ">Present</span>
                <span v-else-if="
                  employee?.attendanceData?.[formatDateISO(date)] ===
                  'half-day'
                ">Half-Day</span>
                <span v-else-if="
                  employee?.attendanceData?.[formatDateISO(date)] ===
                  'full-day'
                ">Full-Day Leave</span>
                <span v-else-if="
                  employee?.attendanceData?.[formatDateISO(date)] ===
                  'paid-leave'
                ">Paid Leave</span>
                <span v-else-if="
                  employee?.attendanceData?.[formatDateISO(date)] ===
                  'off-day'
                ">Off Day</span>
                <span v-else>Absent</span>
              </div>
            </button>
          </template>
        </div>

        <div class="mt-6 text-center">
          <router-link :to="'/payroll'"
            class="bg-blue-600 text-white px-6 py-3 rounded shadow-lg hover:bg-blue-700 focus:outline-none">
            Pay Now
          </router-link>
        </div>

        <div class="mt-6 flex flex-wrap gap-4 text-sm justify-center">
          <div class="flex items-center space-x-1">
            <div class="w-4 h-4 bg-green-300 border border-gray-400"></div>
            <span>Present</span>
          </div>
          <div class="flex items-center space-x-1">
            <div class="w-4 h-4 bg-yellow-300 border border-gray-400"></div>
            <span>Half-Day</span>
          </div>
          <div class="flex items-center space-x-1">
            <div class="w-4 h-4 bg-red-300 border border-gray-400"></div>
            <span>Full-Day Leave</span>
          </div>
          <div class="flex items-center space-x-1">
            <div class="w-4 h-4 bg-blue-300 border border-gray-400"></div>
            <span>Paid Leave</span>
          </div>
          <div class="flex items-center space-x-1">
            <div class="w-4 h-4 bg-gray-200 border border-gray-400"></div>
            <span>Off Day</span>
          </div>
          <div class="flex items-center space-x-1">
            <div class="w-4 h-4 border border-gray-400"></div>
            <span>Absent</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.disabled-day {
  background-color: #f0f0f0 !important;
  color: #aaa;
  cursor: not-allowed;
}

.bg-gray-200 {
  background-color: #e0e0e0;
}
</style>
