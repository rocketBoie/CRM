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
  const percentage = (presentDays / workingDays) * 100;
  return `${percentage.toFixed(1)}%`;
}

function handleRowClick(e) {
  const emp = e.data;
  if (emp && emp.id) {
    router.push({ name: "EmployeeCalendar", params: { id: emp.id } });
  }
}

function calculateMonthlySalary(emp, stats) {
  const totalDaysInMonth = getDaysInMonth(
    selectedYear.value,
    selectedMonth.value
  ).length;
  if (totalDaysInMonth === 0) return "0.00";

  const dailySalary = emp.salary / totalDaysInMonth;
  let totalPaidDays = 0;

  // 1. Paid Days based on attendance status:
  // Present: 1 day
  // Half-Day: 0.5 day
  // Full-Day Leave: 1 day (Assuming paid)
  // Paid Leave: 1 day
  totalPaidDays += stats.totalPresent;
  totalPaidDays += stats.halfDayLeave * 0.5;
  totalPaidDays += stats.fullDayLeave;
  totalPaidDays += stats.paidLeave;

  // 2. Add Off Days/Sundays. We must be careful not to double count.
  // The 'off-day' status in stats includes Sundays marked by markSundaysAndOffDays
  // and any other custom off days. To correct the double-counting issue in the
  // original logic, we should only count the days that are explicitly marked as
  // 'off-day' in the attendance *if* they are not already covered in the above counts.

  // The most robust way is to calculate salary based on *all* paid days:
  // Paid = Present + 0.5 * HalfDay + FullDayLeave + PaidLeave + OffDay (incl. Sundays)

  // Recalculating based on the assumption that ALL total days are potentially working
  // days and the salary is paid unless it's an unpaid absence (e.g., absent, unpaid-leave).
  // Given the original logic, it seems `fullDayLeave`, `paidLeave`, and `offDays` are all paid,
  // and the original salary calculation explicitly added Sundays, even if they were offDays.

  // Improved Logic (avoids double-counting Sundays if they are already in stats.offDays):
  // Let's count *only* the days that contribute to the monthly salary.
  let paidWorkingDays = stats.totalPresent + stats.halfDayLeave * 0.5;
  paidWorkingDays += stats.fullDayLeave; // Assuming full-day leave is paid
  paidWorkingDays += stats.paidLeave; // Paid leave is paid

  // Add all off-days *from the stats* (which includes Sundays marked by the store)
  paidWorkingDays += stats.offDays;

  // ⚠️ The original logic was:
  // totalSalary += stats.offDays * dailySalary;
  // const sundayCount = daysInMonth.filter((date) => date.getDay() === 0).length;
  // totalSalary += sundayCount * dailySalary;
  // This is where the double counting occurred, as store.markSundaysAndOffDays
  // ensures Sundays are marked as 'off-day' in the attendance data, thus being
  // included in stats.offDays.

  // The correct calculation is just the sum of all paid days:
  const totalSalary = paidWorkingDays * dailySalary;

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
  // Note: This totalOffDays is still potentially misleading if counted across all employees
  // as each employee might have a different set of 'off-days' or the store marks them
  // globally. Since the template doesn't use this, and the salary logic is fixed, we
  // will simplify it to just count the Sundays, as off-days are employee-specific.
  return sundayCount; // A safer, more consistent number for a general counter
});

watchEffect(() => {
  store.markSundaysAndOffDays(selectedMonth.value, selectedYear.value);
});
</script>

<template>
  <div class="flex min-h-screen bg-gray-50">
    <div class="w-64 border-r border-gray-200 bg-white shadow-md">
      <SideBar />
    </div>

    <div class="flex-grow p-8">
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
                  :width="70"
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
