<script setup>
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { employeeStore } from "../stores/store";

const route = useRoute();
const store = employeeStore();

const TOTAL_WORKING_DAYS = 30;

const employeeId = route.params.id;

const employee = computed(() =>
  store.employees.find((emp) => emp.id.toString() === employeeId?.toString())
);

function updateAttendance(id, dateStr, status) {
  store.updateAttendance(id, dateStr, status);
}

const selectedMonth = ref(new Date().getMonth());
const selectedYear = ref(new Date().getFullYear());

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
  null,
  "present",
  "half-day",
  "full-day",
  "paid-leave",
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

const today = new Date();

function toggleAttendance(date) {
  if (!employee.value) return;

  const dateStr = formatDateISO(date);
  const currentStatus = employee.value.attendanceData?.[dateStr] ?? null;
  const currentIndex = ATTENDANCE_STATUSES.indexOf(currentStatus);
  const nextIndex = (currentIndex + 1) % ATTENDANCE_STATUSES.length;
  const nextStatus = ATTENDANCE_STATUSES[nextIndex];

  updateAttendance(employee.value.id, dateStr, nextStatus);
}

function getTooltip(date) {
  if (!employee.value) return "Loading...";
  const status = employee.value.attendanceData?.[formatDateISO(date)];
  return status
    ? status
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : "Absent";
}
</script>

<template>
  <div class="mt-10 bg-white p-6 rounded shadow max-w-xl mx-auto">
    <h2 class="text-2xl font-semibold mb-4" v-if="employee">
      Attendance Calendar for {{ employee.name }}
    </h2>
    <h2 v-else class="text-2xl font-semibold mb-4 text-gray-500">
      Loading employee data...
    </h2>

    <label class="block mb-4">
      Select Month:
      <input
        type="month"
        v-model="monthYear"
        class="ml-2 border rounded px-2 py-1"
      />
    </label>

    <div class="grid grid-cols-7 gap-2 text-center mb-2">
      <div
        class="font-bold"
        v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']"
        :key="day"
      >
        {{ day }}
      </div>
    </div>

    <div class="grid grid-cols-7 gap-2 text-center">
      <template
        v-for="n in new Date(selectedYear, selectedMonth, 1).getDay()"
        :key="'empty-' + n"
      >
        <div></div>
      </template>

      <!-- Dates -->
      <template v-for="date in daysInMonth" :key="formatDateISO(date)">
        <button
          type="button"
          class="p-2 border rounded cursor-pointer select-none"
          :class="{
            'bg-green-300':
              employee?.attendanceData?.[formatDateISO(date)] === 'present',
            'bg-yellow-300':
              employee?.attendanceData?.[formatDateISO(date)] === 'half-day',
            'bg-red-300':
              employee?.attendanceData?.[formatDateISO(date)] === 'full-day',
            'bg-blue-300':
              employee?.attendanceData?.[formatDateISO(date)] === 'paid-leave',
            'border-2 border-blue-600':
              date.toDateString() === today.toDateString(),
          }"
          @click="toggleAttendance(date)"
          :title="getTooltip(date)"
          aria-label="Toggle attendance status"
        >
          {{ date.getDate() }}
        </button>
      </template>
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
        <div class="w-4 h-4 border border-gray-400"></div>
        <span>Absent</span>
      </div>
    </div>
  </div>
</template>
