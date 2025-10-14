<script setup>
import { ref, computed, watchEffect } from "vue";
import { employeeStore } from "../stores/store";
import SideBar from "../components/SideBar.vue";
import Calendar from "./Calendar.vue";
import { nextTick } from "vue";
import {
  DxDataGrid,
  DxColumn,
  DxPaging,
  DxSearchPanel,
  DxEditing,
  DxMasterDetail,
} from "devextreme-vue/data-grid";
import "devextreme/dist/css/dx.light.css";

const store = employeeStore();

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
    totalWorkingDays: 0,
  };

  const days = getDaysInMonth(selectedYear.value, selectedMonth.value);

  for (const date of days) {
    const dayOfWeek = date.getDay();
    const dateStr = date.toLocaleDateString("en-CA");

    if (dayOfWeek === 0) {
      stats.offDays++;
      continue; 
    }

    stats.totalWorkingDays++; 

    const status = attendanceData?.[dateStr];

    if (status === "present") stats.totalPresent++;
    else if (status === "half-day") stats.halfDayLeave++;
    else if (status === "full-day") stats.fullDayLeave++;
    else if (status === "paid-leave") stats.paidLeave++;
  }

  return stats;
}

function getAttendancePercentage(stats) {
  const workingDays = stats.totalWorkingDays;
  const presentDays = stats.totalPresent + stats.halfDayLeave * 0.5;

  if (!workingDays || workingDays === 0) return "0.0%";

  const percentage = (presentDays / workingDays) * 100;
  return `${percentage.toFixed(1)}%`;
}

function calculateMonthlySalary(emp, stats) {
  const totalDaysInMonth = getDaysInMonth(
    selectedYear.value,
    selectedMonth.value
  ).length;

  if (totalDaysInMonth === 0) return "0.00";

  const dailySalary = emp.salary / totalDaysInMonth;

  let paidWorkingDays =
    stats.totalPresent + stats.halfDayLeave * 0.5 + stats.paidLeave;

  if (stats.totalPresent > 0 || stats.halfDayLeave > 0 || stats.paidLeave > 0) {
    paidWorkingDays += stats.offDays;
  }

  const totalSalary = paidWorkingDays * dailySalary;
  return totalSalary.toFixed(2);
}

const employeeStats = computed(() => {
  const month = selectedMonth.value;
  const year = selectedYear.value;

  return store.employees.map((emp) => {
    const stats = calculateMonthlyStats(emp.attendanceData);
    const finalSalary = calculateMonthlySalary(emp, stats);

    return {
      ...emp,
      stats,
      attendancePercentage: getAttendancePercentage(stats),
      workingDays: stats.totalWorkingDays,
      paySalary: finalSalary,
    };
  });
});


// const totalOffDays = computed(() => {
//   const daysInMonth = getDaysInMonth(selectedYear.value, selectedMonth.value);
//   return daysInMonth.filter((date) => date.getDay() === 0).length;
// });

watchEffect(() => {
  store.markSundaysAndOffDays(selectedMonth.value, selectedYear.value);
});

function onRowExpanded(e) {
  if (e.expanded) {
    nextTick(() => {
      const visibleRows = e.component.getVisibleRows();
      const rowIndex = visibleRows.findIndex((row) => row.key === e.key);

      if (rowIndex !== -1) {
        const gridRows = document.querySelectorAll(".dx-data-row");
        const targetRow = gridRows[rowIndex];

        if (targetRow) {
          targetRow.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 shadow-md z-10">
      <SideBar class="w-64 h-full" />
    </div>

    <div class="ml-64 p-8">
      <main>
        <h1 class="text-4xl font-extrabold mb-8 text-gray-800">
          Employee Attendance Summary
        </h1>

        <div class="mb-6">
          <label class="font-medium mr-2 text-gray-700">Select Month:</label>
          <input type="month" v-model="monthYear"
            class="border border-gray-300 px-3 py-2 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
        </div>

        <div v-if="store.employees.length === 0" class="text-gray-500 text-center py-10">
          No employee data available.
        </div>
        <div v-else>
          <div class="overflow-x-auto">
            <div class="min-w-full bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
              <DxDataGrid :data-source="employeeStats" key-expr="id" :show-borders="true"
                :row-alternation-enabled="true" @row-expanded="onRowExpanded">
                <DxSearchPanel :visible="true" :width="300" placeholder="Search employee name or ID..." />
                <DxPaging :page-size="12" />

                <DxColumn data-field="id" caption="ID" :width="70" alignment="left" />
                <DxColumn data-field="name" caption="Name" alignment="left" css-class="font-semibold text-blue-800" />
                <DxColumn data-field="stats.totalPresent" caption="Present" :width="100" alignment="center" />
                <DxColumn data-field="stats.halfDayLeave" caption="Half-Day" :width="100" alignment="center" />
                <DxColumn data-field="stats.fullDayLeave" caption="Full-Day" :width="100" alignment="center" />
                <DxColumn data-field="stats.paidLeave" caption="Paid Leave" :width="100" alignment="center" />
                <DxColumn data-field="workingDays" caption="Working Days" :width="120" alignment="center" />
                <DxColumn data-field="attendancePercentage" caption="Attendance %" :width="140"
                  cell-template="percentageTemplate" alignment="center" />
                <DxColumn data-field="paySalary" caption="Salary" :width="120" format="currency" alignment="right" />

                <template #percentageTemplate="{ data }">
                  <span class="font-bold text-green-700">{{ data.value }}</span>
                </template>

                <DxMasterDetail :enabled="true" template="employeeCalendarDetail" />

                <template #employeeCalendarDetail="{ data: { data: emp } }">
                  <div class="p-4 bg-gray-100 border-t border-gray-300">
                    <h3 class="text-2xl font-bold mb-3 text-indigo-700">
                      Attendance Calendar for {{ emp.name }} ({{ monthYear }})
                    </h3>
                    <Calendar :employee-id="emp.id" :initial-month="selectedMonth" :initial-year="selectedYear" />
                  </div>
                </template>
              </DxDataGrid>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
