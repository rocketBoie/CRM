<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { employeeStore } from '../stores/store';
import SideBar from "../components/SideBar.vue";
import MetricCard from "../components/MetricCard.vue"; 

const props = defineProps({
  employeeId: [String, Number],
  monthYear: String,
});

const store = employeeStore();
const router = useRouter();

const [year, month] = props.monthYear.split('-').map(Number); 

const employee = computed(() =>
  store.employees.find(emp => emp.id.toString() === props.employeeId.toString())
);

function getDaysInMonth(year, month) {
  const date = new Date(year, month - 1, 1);
  const days = [];
  while (date.getMonth() === month - 1) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

function monthYearToName(monthYear) {
    if (!monthYear) return '';
    const [y, m] = monthYear.split('-').map(Number);
  
    const date = new Date(y, m - 1); 
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
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
  };

  const days = getDaysInMonth(year, month);

  function getStatus(date) {
    const dateStr = date.toLocaleDateString('en-CA'); 
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
 
    else if (status === "full-day" || status === "absent") stats.fullDayLeave++;
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




function calculateMonthlySalary(emp, stats) {
  const totalCalendarDays = getDaysInMonth(year, month).length;

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

const stats = computed(() => {
  if (!employee.value) return null;
  return calculateMonthlyStatsWithSandwich(employee.value.attendanceData);
});

const salary = computed(() => {
  if (!employee.value || !stats.value) return '0.00';
  return calculateMonthlySalary(employee.value, stats.value);
});

const totalPaidEquivalentDays = computed(() => {
    if (!employee.value || !stats.value) return 0;
    return (getDaysInMonth(year, month).length - stats.value.fullDayLeave - stats.value.sandwichLeaveDays - (stats.value.halfDayLeave * 0.5)).toFixed(1);
});

const dailySalaryRate = computed(() => {
    if (!employee.value) return 0;
    return (employee.value.salary / getDaysInMonth(year, month).length).toFixed(2);
});

function goBack() {
  router.back();
}

function formatCurrency(amount) {
  return amount ? parseFloat(amount).toFixed(2) : '0.00';
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div
      class="fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 shadow-md z-10"
    >
      <SideBar class="w-64 h-full" />
    </div>

    <div class="ml-64 p-6 md:p-8 lg:p-12">
      <div class="max-w-4xl mx-auto">
        <button
          @click="goBack"
          class="mb-6 flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 transition duration-150 font-semibold"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          <span>Back to Attendance Summary</span>
        </button>

        <div v-if="!employee" class="text-center bg-white p-10 rounded-xl shadow-md text-red-600 font-medium">
          Employee with ID {{ props.employeeId }} not found.
        </div>

        <div v-else-if="!stats" class="text-center bg-white p-10 rounded-xl shadow-md text-gray-600 font-medium">
          Loading payroll data...
        </div>

        <div v-else class="bg-white p-6 md:p-8 rounded-2xl shadow-2xl">
          
          <header class="mb-8 pb-4 border-b border-gray-200">
            <h2 class="text-3xl font-extrabold text-gray-900 leading-tight">
              Payroll Details for {{ employee.name }} 
              <span class="text-xl font-medium text-indigo-600">({{ employee.position }})</span>
            </h2>
            <p class="text-lg font-medium text-gray-500 mt-1">
              Payroll Period: <span class="text-indigo-700 font-bold">{{ monthYearToName(props.monthYear) }}</span>
            </p>
          </header>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-y-3 mb-8 text-sm border-b pb-4">
            <p class="text-gray-700"><strong>Employee ID:</strong> <span class="font-semibold">{{ employee.id }}</span></p>
            <p class="text-gray-700"><strong>Base Salary (Monthly):</strong> <span class="font-semibold text-gray-800">${{ formatCurrency(employee.salary) }}</span></p>
            <p class="text-gray-700"><strong>Total Calendar Days:</strong> <span class="font-semibold">{{ getDaysInMonth(year, month).length }}</span></p>
          </div>

          <h3 class="text-xl font-bold text-gray-800 mb-4 mt-8">Attendance Metrics</h3>
          
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            
            <MetricCard title="Present Days" :value="stats.totalPresent" color="green" icon="check" />
            <MetricCard title="Paid Leave" :value="stats.paidLeave" color="blue" icon="briefcase" />
            <MetricCard title="Half Day (0.5x)" :value="stats.halfDayLeave" color="indigo" icon="half" />
            
            <MetricCard title="Full Leave/Absent" :value="stats.fullDayLeave" color="red" icon="x" />
            <MetricCard title="Total Off Days" :value="stats.offDays" color="gray" icon="calendar" />
            <MetricCard title="Sandwich Days" :value="stats.sandwichLeaveDays" color="orange" icon="alert" />
          </div>

          <div class="mt-8 pt-4 border-t border-gray-200">
            <h3 class="text-xl font-bold text-gray-800 mb-3">Salary Calculation Breakdown</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 bg-gray-50 p-4 rounded-lg">
                <p><strong>Total Paid Equivalent Days:</strong> 
                    <span class="font-bold text-blue-700">
                        {{ totalPaidEquivalentDays }}
                    </span>
                </p>
                <p><strong>Daily Salary Rate:</strong> 
                    <span class="font-bold text-blue-700">
                        ${{ dailySalaryRate }}
                    </span>
                </p>
                <p class="md:col-span-2">
                    <span class="font-medium">Calculation: </span>
                    Total Calendar Days ({{ getDaysInMonth(year, month).length }}) 
                    - Full-Day Losses ({{ stats.fullDayLeave + stats.sandwichLeaveDays }}) 
                    - Half-Day Losses ({{ stats.halfDayLeave * 0.5 }}) 
                    = <span class="font-bold text-blue-700">{{ totalPaidEquivalentDays }}</span> Paid Equivalent Days
                </p>
            </div>
          </div>
          
          <div class="mt-8 p-6 bg-indigo-50 border-l-4 border-indigo-600 rounded-lg shadow-lg flex justify-between items-center">
            <div>
              <p class="text-xl font-medium text-indigo-700 uppercase tracking-wider">NET MONTHLY PAYOUT</p>
              <p class="text-5xl font-extrabold text-indigo-900 mt-1">${{ salary }}</p>
            </div>
            <p class="text-sm text-indigo-600 max-w-xs text-right">
                This amount is derived by multiplying the Daily Salary Rate by the Total Paid Equivalent Days.
            </p>
          </div>
          
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shadow-2xl {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
</style>