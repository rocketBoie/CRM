<script setup>
import { ref, computed, watchEffect } from "vue";
import { useRouter } from "vue-router";
import { employeeStore } from "../stores/store";
import SideBar from "../components/SideBar.vue";

import {
  DxDataGrid,
  DxColumn,
  DxPaging,
  DxSearchPanel,
} from "devextreme-vue/data-grid";
import "devextreme/dist/css/dx.light.css";

const store = employeeStore();
const router = useRouter();

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

function getDaysInMonth(year, month) {
  const date = new Date(year, month, 1);
  const days = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

function calculateMonthlyStats(attendanceData) {
  const stats = {
    totalPresent: 0,
    halfDayLeave: 0,
    fullDayLeave: 0,
    paidLeave: 0,
    offDays: 0,
  };

  const days = getDaysInMonth(selectedYear.value, selectedMonth.value);
  for (const date of days) {
    const dateStr = date.toISOString().slice(0, 10);
    const status = attendanceData?.[dateStr];
    if (status === "present") stats.totalPresent++;
    else if (status === "half-day") stats.halfDayLeave++;
    else if (status === "full-day") stats.fullDayLeave++;
    else if (status === "paid-leave") stats.paidLeave++;
    else if (status === "off-day") stats.offDays++;
  }

  return stats;
}

function getAttendancePercentage(stats) {
  const workingDays = getDaysInMonth(
    selectedYear.value,
    selectedMonth.value
  ).length;
  const presentDays = stats.totalPresent + stats.halfDayLeave * 0.5;
  return `${((presentDays / workingDays) * 100).toFixed(1)}%`;
}

function handleRowClick(e) {
  const emp = e.data;
  if (emp && emp.id) {
    router.push({ name: "EmployeeCalendar", params: { id: emp.id } });
  }
}

function calculateMonthlySalary(emp, stats) {
  const totalWorkingDays = getDaysInMonth(
    selectedYear.value,
    selectedMonth.value
  ).length;
  const dailySalary = emp.salary / totalWorkingDays;
  if (totalWorkingDays === 0) return "0.00";

  let totalSalary = 0;
  totalSalary += stats.totalPresent * dailySalary;
  totalSalary += stats.halfDayLeave * (dailySalary / 2);
  totalSalary += stats.fullDayLeave * dailySalary;
  totalSalary += stats.paidLeave * dailySalary;
  totalSalary += stats.offDays * dailySalary;

  const daysInMonth = getDaysInMonth(selectedYear.value, selectedMonth.value);
  const sundayCount = daysInMonth.filter((date) => date.getDay() === 0).length;
  totalSalary += sundayCount * dailySalary;

  return totalSalary.toFixed(2);
}

const employeeStats = computed(() => {
  return store.employees.map((emp) => {
    const stats = calculateMonthlyStats(emp.attendanceData);
    const finalSalary = calculateMonthlySalary(emp, stats);

    return {
      ...emp,
      stats,
      attendancePercentage: getAttendancePercentage(stats),
      workingDays: getDaysInMonth(selectedYear.value, selectedMonth.value)
        .length,
      paySalary: finalSalary,
    };
  });
});

const totalOffDays = computed(() => {
  let totalOff = 0;
  store.employees.forEach((emp) => {
    const stats = calculateMonthlyStats(emp.attendanceData);
    totalOff += stats.offDays;
  });
  const daysInMonth = getDaysInMonth(selectedYear.value, selectedMonth.value);
  const sundayCount = daysInMonth.filter((date) => date.getDay() === 0).length;
  totalOff += sundayCount;

  return totalOff;
});

watchEffect(() => {
  store.markSundaysAndOffDays(selectedMonth.value, selectedYear.value);
});
</script>

<template>
  <div class="flex min-h-screen bg-gray-100">
    <div class="w-64 border-r border-gray-200 bg-white shadow-md">
      <SideBar />
    </div>

    <div class="flex-grow p-8">
      <main>
        <h1 class="text-4xl font-extrabold mb-6 text-gray-800">
          Employee Attendance Summary
        </h1>

        <div class="mb-6 flex items-center">
          <label class="font-medium mr-4 text-gray-700">Select Month:</label>
          <input
            type="month"
            v-model="monthYear"
            class="border border-gray-300 px-4 py-2 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div
          v-if="store.employees.length === 0"
          class="text-gray-500 text-center py-10"
        >
          No employee data available.
        </div>

        <div v-else>
          <div class="overflow-x-auto">
            <div
              class="min-w-full bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200"
            >
              <DxDataGrid
                :data-source="employeeStats"
                key-expr="id"
                :show-borders="true"
                :row-alternation-enabled="true"
                :hover-state-enabled="true"
                @row-click="handleRowClick"
              >
                <DxSearchPanel
                  :visible="true"
                  :width="280"
                  placeholder="Search employee name or ID..."
                />

                <DxPaging :page-size="10" />

                <DxColumn
                  data-field="id"
                  caption="ID"
                  :width="80"
                  alignment="left"
                />
                <DxColumn
                  data-field="name"
                  caption="Name"
                  alignment="left"
                  css-class="cursor-pointer font-semibold text-blue-800"
                />
                <DxColumn
                  data-field="stats.totalPresent"
                  caption="Present"
                  :width="100"
                />
                <DxColumn
                  data-field="stats.halfDayLeave"
                  caption="Half-Day"
                  :width="100"
                />
                <DxColumn
                  data-field="stats.fullDayLeave"
                  caption="Full-Day"
                  :width="100"
                />
                <DxColumn
                  data-field="stats.paidLeave"
                  caption="Paid Leave"
                  :width="100"
                />
                <DxColumn
                  data-field="workingDays"
                  caption="Total Days"
                  :width="120"
                />
                <DxColumn
                  data-field="attendancePercentage"
                  caption="Attendance %"
                  :width="140"
                  cell-template="percentageTemplate"
                  alignment="center"
                />
                <DxColumn
                  data-field="paySalary"
                  caption="Salary"
                  :width="120"
                  format="currency"
                  alignment="right"
                />

                <template #percentageTemplate="{ data }">
                  <span class="font-bold text-green-700">{{ data.value }}</span>
                </template>
              </DxDataGrid>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
