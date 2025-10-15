<script setup>
import { computed, ref, watch } from "vue";
import { employeeStore } from "../stores/store";
const store = employeeStore();

const props = defineProps({
  employeeId: {
    type: [String, Number],
    required: true,
  },
  initialMonth: {
    type: Number,
    required: true,
  },
  initialYear: {
    type: Number,
    required: true,
  },
});

const selectedMonth = ref(props.initialMonth);
const selectedYear = ref(props.initialYear);
const today = new Date();

const employee = computed(() =>
  store.employees.find(
    (emp) => emp.id.toString() === props.employeeId?.toString()
  )
);

watch(
  () => props.initialMonth,
  (newVal) => {
    selectedMonth.value = newVal;
  },
  { immediate: true }
);

watch(
  () => props.initialYear,
  (newVal) => {
    selectedYear.value = newVal;
  },
  { immediate: true }
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
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
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

  if (!employee.value) return;

  if (targetDate > today || date.getDay() === 0) return;

  const dateStr = formatDateISO(date);
  const currentStatus = employee.value.attendanceData?.[dateStr] ?? null;

  let currentIndex = ATTENDANCE_STATUSES.indexOf(currentStatus);
  if (currentIndex === -1) currentIndex = ATTENDANCE_STATUSES.indexOf("absent");

  let nextIndex = (currentIndex + 1) % ATTENDANCE_STATUSES.length;
  let nextStatus = ATTENDANCE_STATUSES[nextIndex];

  if (currentStatus === "off-day") {
    nextStatus = "full-day";
  } else if (currentStatus === "full-day") {
    nextStatus = "off-day";
  }

  while (nextStatus === "off-day" && date.getDay() !== 0) {
    nextIndex = (nextIndex + 1) % ATTENDANCE_STATUSES.length;
    nextStatus = ATTENDANCE_STATUSES[nextIndex];
  }

  updateAttendance(employee.value.id, dateStr, nextStatus);
}

function getTooltip(date) {
  const dateOnly = new Date(date);
  dateOnly.setHours(0, 0, 0, 0);

  if (dateOnly > today) return "Cannot edit future date";
  if (!employee.value) return "Loading...";

  if (date.getDay() === 0) return "Off Day (Sunday)";

  const status = employee.value.attendanceData?.[formatDateISO(date)];

  if (status === "off-day") {
    return "Off Day (Click to convert to Full-Day Leave)";
  }

  if (status === "full-day") {
    return "Full Day Leave (Click to convert to Off Day)";
  }

  return status
    ? status
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : "Absent";
}
</script>

<template>
  <div class="bg-gray-100 p-4 rounded-lg border border-gray-300">
    <div class="bg-white p-6 rounded-lg shadow-inner">
      <label class="block mb-6 text-gray-700 font-medium">
        Select Month:
        <input type="month" v-model="monthYear" class="ml-2 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"/>
      </label>

      <div class="grid grid-cols-7 gap-2 text-center mb-4">
        <div class="font-semibold text-gray-800" v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" key="day">
          {{ day }}
        </div>
      </div>

      <div class="grid grid-cols-7 gap-2 text-center">
        <template v-for="n in new Date(selectedYear, selectedMonth, 1).getDay()" :key="'empty-' + n">
          <div></div>
        </template>

        <template v-for="date in daysInMonth" :key="formatDateISO(date)">
          <button type="button" :disabled="date.getDay() === 0 || date > today" @click="toggleAttendance(date)" :title="getTooltip(date)" aria-label="Toggle attendance status" class="p-4 rounded-lg cursor-pointer select-none transition-all duration-300 ease-in-out h-16 flex flex-col justify-between items-center text-left"
            :class="{
              'bg-green-300 hover:bg-green-400':
                employee?.attendanceData?.[formatDateISO(date)] === 'present',
              'bg-yellow-300 hover:bg-yellow-400':
                employee?.attendanceData?.[formatDateISO(date)] === 'half-day',
              'bg-red-300 hover:bg-red-400':
                employee?.attendanceData?.[formatDateISO(date)] === 'full-day',
              'bg-blue-300 hover:bg-blue-400':
                employee?.attendanceData?.[formatDateISO(date)] ===
                'paid-leave',

              'bg-white hover:bg-gray-200 border border-gray-300':
                !employee?.attendanceData?.[formatDateISO(date)] &&
                date.getDay() !== 0 &&
                date <= today,

              'bg-gray-200 text-gray-500 cursor-not-allowed':
                date.getDay() === 0 || date > today,

              'border-2 border-indigo-600 ring-2 ring-indigo-300':
                date.toDateString() === today.toDateString(),
            }"
          >
            <div class="text-sm font-bold w-full text-right">
              {{ date.getDate() }}
            </div>

            <div v-if="date <= today" class="text-xs mt-1 w-full text-center font-medium">
              <span v-if="date.getDay() === 0">Off Day</span>
              <span v-else-if="employee?.attendanceData?.[formatDateISO(date)] === 'present'">Present</span>
              <span v-else-if="employee?.attendanceData?.[formatDateISO(date)] === 'half-day'">Half-Day</span>
              <span v-else-if="employee?.attendanceData?.[formatDateISO(date)] === 'full-day'">Full-Day Leave</span>
              <span v-else-if="employee?.attendanceData?.[formatDateISO(date)] ==='paid-leave'">Paid Leave</span>
              <span v-else>Absent</span>
            </div>
            <div v-else class="text-xs mt-1 w-full text-center text-gray-400">
              Future
            </div>
          </button>
        </template>
      </div>
      <div class="mt-6 flex flex-wrap gap-4 text-sm justify-center p-3 border-t border-gray-200">
        <div class="flex items-center space-x-1">
          <div class="w-4 h-4 bg-green-300 rounded"></div>
         
          <span>Present</span>
        </div>
        <div class="flex items-center space-x-1">
          <div class="w-4 h-4 bg-yellow-300 rounded"></div>
          <span>Half-Day</span>
        </div>
        <div class="flex items-center space-x-1">
          <div class="w-4 h-4 bg-red-300 rounded"></div>
          <span>Full-Day Leave</span>
        </div>
        <div class="flex items-center space-x-1">
          <div class="w-4 h-4 bg-blue-300 rounded"></div>
          <span>Paid Leave</span>
        </div>
        <div class="flex items-center space-x-1">
          <div class="w-4 h-4 bg-gray-200 rounded border border-gray-400"></div>
          <span>Off Day</span>
        </div>
        <div class="flex items-center space-x-1">
          <div class="w-4 h-4 bg-white rounded border border-gray-400"></div>
          <span>Absent</span>
        </div>
      </div>
    </div>
  </div>
</template>
