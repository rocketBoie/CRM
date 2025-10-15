<script setup>
import { ref, computed, watchEffect, nextTick } from "vue";
import { useRouter } from 'vue-router'; 
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

function calculateMonthlyStatsWithSandwich(attendanceData) {
  const stats = {
    totalPresent: 0,
    halfDayLeave: 0,
    fullDayLeave: 0,
    paidLeave: 0,
    offDays: 0,
    sandwichLeaveDays: 0,
    totalWorkingDays: 0,
    totalUnpaidLeaveDays: 0,
  };

  const days = getDaysInMonth(selectedYear.value, selectedMonth.value);

  function getStatus(date) {
    const dateStr = date.toLocaleDateString("en-CA");
    const dayOfWeek = date.getDay();

    if (dayOfWeek === 0) return "off"; 
    return attendanceData?.[dateStr] || "absent"; 
  }

  for (const date of days) {
    const status = getStatus(date);

    if (status === "off") {
      stats.offDays++;
      continue;
    }

    stats.totalWorkingDays++;

    if (status === "present") stats.totalPresent++;
    else if (status === "half-day") stats.halfDayLeave++;
    else if (status === "full-day" || status === "absent") {
      stats.fullDayLeave++;
      stats.totalUnpaidLeaveDays++; 
    }
    else if (status === "paid-leave") stats.paidLeave++;
  }
  const leaveStatuses = ["full-day", "half-day", "paid-leave", "absent"];
  for (let i = 0; i < days.length; i++) {
    const date = days[i];
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0) continue; 

    const prevStatus = i > 0 ? getStatus(days[i - 1]) : null;
    const nextStatus = i < days.length - 1 ? getStatus(days[i + 1]) : null;
    const prevIsLeaveOrAbsent = prevStatus && leaveStatuses.includes(prevStatus);
    const nextIsLeaveOrAbsent = nextStatus && leaveStatuses.includes(nextStatus);

    if (prevIsLeaveOrAbsent && nextIsLeaveOrAbsent) {
      stats.sandwichLeaveDays++;
    }
  }

  return stats;
}

function getAttendancePercentage(stats) {
  const paidEquivalentDays = stats.totalPresent + stats.halfDayLeave * 0.5 + stats.paidLeave;

  if (stats.totalWorkingDays === 0) return "0.0%";

  const percentage = (paidEquivalentDays / stats.totalWorkingDays) * 100;
  return `${percentage.toFixed(1)}%`;
}

function calculateMonthlySalary(emp, stats) {
  const totalCalendarDays = getDaysInMonth(
    selectedYear.value,
    selectedMonth.value
  ).length;

  if (totalCalendarDays === 0 || emp.salary === 0) return "0.00";
  const dailySalary = emp.salary / totalCalendarDays; 
  const totalUnpaidLossDays = stats.fullDayLeave + stats.sandwichLeaveDays;
  let totalPaidEquivalentDays = totalCalendarDays 
                                - totalUnpaidLossDays 
                                - (stats.halfDayLeave * 0.5);

  if (totalPaidEquivalentDays < 0) totalPaidEquivalentDays = 0;

  const totalSalary = totalPaidEquivalentDays * dailySalary;
  return totalSalary.toFixed(2);
}


const employeeStats = computed(() => {
  return store.employees.map((emp) => {
    const stats = calculateMonthlyStatsWithSandwich(emp.attendanceData);

    const salary = calculateMonthlySalary(emp, stats);

    return {
      ...emp,
      stats,
      attendancePercentage: getAttendancePercentage(stats),
      workingDays: stats.totalWorkingDays, 
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

function navigateToPayroll(employeeId) {
    const path = `/payroll/${employeeId}/${monthYear.value}`;
    router.push(path);
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
          Employee Attendance & Payroll Summary 📊
        </h1>

        <div class="mb-6 flex items-center space-x-4 bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <label class="font-medium text-lg text-indigo-700">View Data For:</label>
          <input
            type="month"
            v-model="monthYear"
            class="border border-gray-300 px-3 py-2 rounded-md shadow-sm text-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
          />
        </div>

        <div
          v-if="store.employees.length === 0"
          class="text-gray-500 text-center py-10"
        >
          No employee data available. Please add employees to the store.
        </div>
        <div v-else>
          <div class="overflow-x-auto">
            <div
              class="min-w-full bg-white shadow-xl rounded-lg overflow-hidden border border-gray-200"
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
                  caption="Employee Name"
                  alignment="left"
                  css-class="font-semibold text-gray-800"
                />
                <DxColumn
                  data-field="stats.totalPresent"
                  caption="Present"
                  :width="100"
                  alignment="center"
                  css-class="text-green-600"
                />
                <DxColumn
                  data-field="stats.halfDayLeave"
                  caption="Half-Day"
                  :width="100"
                  alignment="center"
                  css-class="text-orange-600"
                />
                <DxColumn
                  data-field="stats.fullDayLeave"
                  caption="Full-Day/Absent"
                  :width="140"
                  alignment="center"
                  css-class="text-red-600"
                />
                <DxColumn
                  data-field="stats.paidLeave"
                  caption="Paid Leave"
                  :width="100"
                  alignment="center"
                  css-class="text-blue-600"
                />
                <DxColumn
                  data-field="workingDays"
                  caption="Work Days"
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
                  caption="Net Salary"
                  :width="150"
                  format="currency"
                  alignment="right"
                  css-class="font-extrabold text-indigo-700 text-lg"
                />
                
                <DxColumn 
                    caption="Payroll Action" 
                    :width="140" 
                    alignment="center" 
                    cell-template="payrollButtonTemplate" 
                />

                <template #percentageTemplate="{ data }">
                  <span class="font-bold" :class="data.value.startsWith('100') ? 'text-green-700' : 'text-orange-700'">{{ data.value }}</span>
                </template>
                
                <template #payrollButtonTemplate="{ data }">
                    <button 
                        @click="navigateToPayroll(data.data.id)"
                        class="px-3 py-1 text-sm bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition duration-150 shadow-md font-medium"
                        title="View Full Payroll Details"
                    >
                        View Payroll 🧾
                    </button>
                </template>


                <DxMasterDetail :enabled="true" template="employeeCalendarDetail" />

                <template #employeeCalendarDetail="{ data: { data: emp } }">
                  <div class="p-6 bg-gray-100 border-t border-gray-300">
                    <h3 class="text-2xl font-bold mb-4 text-indigo-700">
                      Attendance Calendar for {{ emp.name }} ({{ monthYear }})
                    </h3>
                    <Calendar
                      :employee-id="emp.id"
                      :initial-month="selectedMonth"
                      :initial-year="selectedYear"
                    />
                    <div class="mt-4 text-sm text-gray-600">
                        <p class="font-semibold">Calculated Sandwich Days (Unpaid): <span class="text-red-500">{{ emp.stats.sandwichLeaveDays }}</span></p>
                    </div>
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