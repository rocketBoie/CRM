<script setup>
import { ref, computed, watchEffect, nextTick } from "vue";
import { employeeStore } from "../stores/store";
import SideBar from "../components/SideBar.vue";
import Calendar from "./Calendar.vue";
import {
  DxDataGrid,
  DxColumn,
  DxPaging,
  DxSearchPanel,
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

// Sandwich-aware calculation of monthly attendance stats
function calculateMonthlyStatsWithSandwich(attendanceData) {
  const stats = {
    totalPresent: 0,
    halfDayLeave: 0,
    fullDayLeave: 0,
    paidLeave: 0,
    offDays: 0,
    sandwichLeaveDays: 0,
    totalWorkingDays: 0,
  };

  const days = getDaysInMonth(selectedYear.value, selectedMonth.value);

  // Helper to get status for date or "off" if Sunday
  function getStatus(date) {
    const dateStr = date.toLocaleDateString("en-CA");
    const dayOfWeek = date.getDay();

    if (dayOfWeek === 0) return "off"; // Sunday is off day
    return attendanceData?.[dateStr] || "absent"; // default absent if missing
  }

  // First pass: count working days and attendance types
  for (const date of days) {
    const status = getStatus(date);

    if (status === "off") {
      stats.offDays++;
      continue;
    }

    stats.totalWorkingDays++;

    if (status === "present") stats.totalPresent++;
    else if (status === "half-day") stats.halfDayLeave++;
    else if (status === "full-day") stats.fullDayLeave++;
    else if (status === "paid-leave") stats.paidLeave++;
  }

  // Second pass: detect sandwich off days (off days between leave/absent)
  for (let i = 0; i < days.length; i++) {
    const date = days[i];
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0) continue; // only Sundays off

    const prevStatus = i > 0 ? getStatus(days[i - 1]) : null;
    const nextStatus = i < days.length - 1 ? getStatus(days[i + 1]) : null;

    // Check if both sides are leave or absent (not present or paid leave)
    const prevIsLeaveOrAbsent =
      prevStatus &&
      ["full-day", "half-day", "paid-leave", "absent"].includes(prevStatus);
    const nextIsLeaveOrAbsent =
      nextStatus &&
      ["full-day", "half-day", "paid-leave", "absent"].includes(nextStatus);

    if (prevIsLeaveOrAbsent && nextIsLeaveOrAbsent) {
      stats.sandwichLeaveDays++;
    }
  }

  return stats;
}

// Attendance percentage calculation from stats
function getAttendancePercentage(stats, workingDays) {
  const presentDays = stats.totalPresent + stats.halfDayLeave * 0.5;

  if (!workingDays || workingDays === 0) return "0.0%";

  const percentage = (presentDays / workingDays) * 100;
  return `${percentage.toFixed(1)}%`;
}

// Monthly salary calculation considering sandwich policy
function calculateMonthlySalary(emp, stats) {
  const totalDaysInMonth = getDaysInMonth(
    selectedYear.value,
    selectedMonth.value
  ).length;

  if (totalDaysInMonth === 0) return "0.00";

  const dailySalary = emp.salary / totalDaysInMonth;

  let paidWorkingDays =
    stats.totalPresent + stats.halfDayLeave * 0.5 + stats.paidLeave;

  // Count only off days NOT marked as sandwich leave
  const nonSandwichOffDays = stats.offDays - stats.sandwichLeaveDays;

  if (paidWorkingDays > 0) {
    paidWorkingDays += nonSandwichOffDays;
  }

  // Deduct sandwich leave days (unpaid)
  paidWorkingDays -= stats.sandwichLeaveDays;

  if (paidWorkingDays < 0) paidWorkingDays = 0;

  const totalSalary = paidWorkingDays * dailySalary;
  return totalSalary.toFixed(2);
}

const employeeStats = computed(() => {
  const month = selectedMonth.value;
  const year = selectedYear.value;
  const totalWorkingDays = store.getWorkingDaysInMonth(month, year);

  return store.employees.map((emp) => {
    const stats = calculateMonthlyStatsWithSandwich(emp.attendanceData);

    const salary = calculateMonthlySalary(emp, stats);

    return {
      ...emp,
      stats,
      attendancePercentage: getAttendancePercentage(stats, totalWorkingDays),
      workingDays: totalWorkingDays,
      paySalary: Number(salary),
    };
  });
});

watchEffect(() => {
  store.markSundaysAndOffDays(selectedMonth.value, selectedYear.value);
  store.refreshAttendanceForAll(selectedMonth.value, selectedYear.value);
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
    <div
      class="fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 shadow-md z-10"
    >
      <SideBar class="w-64 h-full" />
    </div>

    <div class="ml-64 p-8">
      <main>
        <h1 class="text-4xl font-extrabold mb-8 text-gray-800">
          Employee Attendance Summary
        </h1>

        <div class="mb-6">
          <label class="font-medium mr-2 text-gray-700">Select Month:</label>
          <input
            type="month"
            v-model="monthYear"
            class="border border-gray-300 px-3 py-2 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                @row-expanded="onRowExpanded"
              >
                <DxSearchPanel
                  :visible="true"
                  :width="300"
                  placeholder="Search employee name or ID..."
                />
                <DxPaging :page-size="12" />

                <DxColumn
                  data-field="id"
                  caption="ID"
                  :width="70"
                  alignment="left"
                />
                <DxColumn
                  data-field="name"
                  caption="Name"
                  alignment="left"
                  css-class="font-semibold text-blue-800"
                />
                <DxColumn
                  data-field="stats.totalPresent"
                  caption="Present"
                  :width="100"
                  alignment="center"
                />
                <DxColumn
                  data-field="stats.halfDayLeave"
                  caption="Half-Day"
                  :width="100"
                  alignment="center"
                />
                <DxColumn
                  data-field="stats.fullDayLeave"
                  caption="Full-Day"
                  :width="100"
                  alignment="center"
                />
                <DxColumn
                  data-field="stats.paidLeave"
                  caption="Paid Leave"
                  :width="100"
                  alignment="center"
                />
                <DxColumn
                  data-field="workingDays"
                  caption="Working Days"
                  :width="120"
                  alignment="center"
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

                <DxMasterDetail :enabled="true" template="employeeCalendarDetail" />

                <template #employeeCalendarDetail="{ data: { data: emp } }">
                  <div class="p-4 bg-gray-100 border-t border-gray-300">
                    <h3 class="text-2xl font-bold mb-3 text-indigo-700">
                      Attendance Calendar for {{ emp.name }} ({{ monthYear }})
                    </h3>
                    <Calendar
                      :employee-id="emp.id"
                      :initial-month="selectedMonth"
                      :initial-year="selectedYear"
                    />
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
