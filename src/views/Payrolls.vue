<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
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
    return new Date(y, m - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
}

function calculateMonthlyStatsWithSandwich(attendanceData) {
    const stats = { totalPresent: 0, halfDayLeave: 0, fullDayLeave: 0, paidLeave: 0, offDays: 0, sandwichLeaveDays: 0, totalWorkingDays: 0 };
    const days = getDaysInMonth(year, month);

    function getStatus(date) {
        const dateStr = date.toLocaleDateString('en-CA');
        return date.getDay() === 0 ? 'off' : attendanceData?.[dateStr] || 'absent';
    }

    for (const date of days) {
        const status = getStatus(date);
        if (status === 'off') { stats.offDays++; continue; }
        stats.totalWorkingDays++;
        if (status === 'present') stats.totalPresent++;
        else if (status === 'half-day') stats.halfDayLeave++;
        else if (status === 'full-day' || status === 'absent') stats.fullDayLeave++;
        else if (status === 'paid-leave') stats.paidLeave++;
    }

    const leaveStatuses = ["full-day", "half-day", "paid-leave", "absent"];
    for (let i = 0; i < days.length; i++) {
        const dayOfWeek = days[i].getDay();
        if (dayOfWeek !== 0) continue;
        const prevStatus = i > 0 ? getStatus(days[i - 1]) : null;
        const nextStatus = i < days.length - 1 ? getStatus(days[i + 1]) : null;
        if (prevStatus && nextStatus && leaveStatuses.includes(prevStatus) && leaveStatuses.includes(nextStatus)) stats.sandwichLeaveDays++;
    }
    return stats;
}

function calculateMonthlySalary(emp, stats) {
    const totalCalendarDays = getDaysInMonth(year, month).length;
    if (!totalCalendarDays || !emp.salary) return "0.00";
    const dailySalary = emp.salary / totalCalendarDays;
    let totalPaidDays = totalCalendarDays - stats.fullDayLeave - stats.sandwichLeaveDays - (stats.halfDayLeave * 0.5);
    totalPaidDays = Math.max(totalPaidDays, 0);
    return (totalPaidDays * dailySalary).toFixed(2);
}

const stats = computed(() => employee.value ? calculateMonthlyStatsWithSandwich(employee.value.attendanceData) : null);
const salary = computed(() => employee.value && stats.value ? calculateMonthlySalary(employee.value, stats.value) : '0.00');
const totalPaidEquivalentDays = computed(() => stats.value ? (getDaysInMonth(year, month).length - stats.value.fullDayLeave - stats.value.sandwichLeaveDays - (stats.value.halfDayLeave * 0.5)).toFixed(1) : 0);
const dailySalaryRate = computed(() => employee.value ? (employee.value.salary / getDaysInMonth(year, month).length).toFixed(2) : 0);

function goBack() { router.back(); }
function formatCurrency(amount) { return amount ? parseFloat(amount).toFixed(2) : '0.00'; }


function payNow() {
    if (!employee.value) return;
    alert(`Payroll of $${salary.value} for ${employee.value.name} has been processed!`);
}
</script>

<template>
    <div class="min-h-screen flex bg-gray-100 font-sans">

        <aside class="fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 shadow-lg z-20">
            <SideBar class="w-64 h-full" />
        </aside>

        <div class="flex-1 ml-64 p-8 md:p-12 space-y-8">
            <button @click="goBack"
                class="flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 font-semibold transition">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Attendance Summary</span>
            </button>

            <div v-if="!employee" class="bg-white p-10 rounded-lg shadow-md text-red-600 text-center font-medium">
                Employee with ID {{ props.employeeId }} not found.
            </div>

            <div v-else-if="!stats" class="bg-white p-10 rounded-lg shadow-md text-gray-600 text-center font-medium">
                Loading payroll data...
            </div>

            <div v-else class="bg-white  shadow-2xl p-8 space-y-6">
                <header class="border-b border-gray-200 pb-4">
                    <h2 class="text-3xl font-extrabold text-gray-900">
                        Payroll for {{ employee.name }}
                        <span class="text-xl font-medium text-indigo-600">({{ employee.position }})</span>
                    </h2>
                    <p class="text-gray-500 mt-1 text-lg">
                        Period: <span class="text-indigo-700 font-semibold">{{ monthYearToName(props.monthYear)}}</span>
                    </p>
                </header>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-200 pb-4 text-gray-700 text-sm">
                    <p><strong>ID:</strong> {{ employee.id }}</p>
                    <p><strong>Base Salary:</strong> ${{ formatCurrency(employee.salary) }}</p>
                    <p><strong>Calendar Days:</strong> {{ getDaysInMonth(year, month).length }}</p>
                </div>

                <h3 class="text-xl font-bold text-gray-800 mt-6">Attendance Metrics</h3>
                <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-2">
                    <MetricCard title="Present Days" :value="stats.totalPresent" color="green" icon="check" />
                    <MetricCard title="Paid Leave" :value="stats.paidLeave" color="blue" icon="briefcase" />
                    <MetricCard title="Half Day (0.5x)" :value="stats.halfDayLeave" color="indigo" icon="half" />
                    <MetricCard title="Full Leave/Absent" :value="stats.fullDayLeave" color="red" icon="x" />
                    <MetricCard title="Off Days" :value="stats.offDays" color="gray" icon="calendar" />
                    <MetricCard title="Sandwich Days" :value="stats.sandwichLeaveDays" color="orange" icon="alert" />
                </div>

                <div
                    class="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                    <p><strong>Total Paid Days:</strong> <span class="font-bold text-blue-700">{{totalPaidEquivalentDays }}</span></p>
                    <p><strong>Daily Rate:</strong> <span class="font-bold text-blue-700">${{ dailySalaryRate }}</span>
                    </p>
                    <p class="md:col-span-2">
                        <strong>Calculation:</strong> Calendar Days ({{ getDaysInMonth(year, month).length }})
                        - Full-Day Losses ({{ stats.fullDayLeave + stats.sandwichLeaveDays }})
                        - Half-Day Losses ({{ stats.halfDayLeave * 0.5 }})
                        = <span class="font-bold text-blue-700">{{ totalPaidEquivalentDays }}</span> Paid Days
                    </p>
                </div>

                <div
                    class="mt-8 p-6 bg-indigo-50 border-l-4 border-indigo-600 rounded-lg shadow flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                    <div>
                        <p class="text-xl font-medium text-indigo-700 uppercase tracking-wide">Net Monthly Payout</p>
                        <p class="text-5xl font-extrabold text-indigo-900 mt-1">${{ salary }}</p>
                    </div>
                    <div
                        class="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-4">
                        <p class="text-sm text-indigo-600 max-w-xs text-left md:text-right">
                            Calculated as Daily Salary × Total Paid Days
                        </p>
                        <button @click="payNow"
                            class="px-6 py-3 cursor-pointer bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow transition duration-150">
                            Pay Now 💵
                        </button>
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
