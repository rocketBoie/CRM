<script setup>
import SideBar from "../components/SideBar.vue";
import { employeeStore } from "../stores/store";

const store = employeeStore();

const TOTAL_WORKING_DAYS = 30;


function getAttendancePercentage(emp) {
    if (!emp.totalPresent && !emp.halfDayLeave) return "0%";

    const presentDays = emp.totalPresent + (emp.halfDayLeave * 0.5);
    const percentage = (presentDays / TOTAL_WORKING_DAYS) * 100;
    return `${percentage.toFixed(1)}%`;
}
</script>

<template>
    <div class="flex min-h-screen">
        <div class="w-64">
            <SideBar />
        </div>

        <div class="flex-grow p-8">
            <main>
                <h1 class="text-4xl font-extrabold mb-6 text-gray-800">Employee Attendance Summary</h1>

                <div v-if="store.employees.length === 0" class="text-gray-500 text-center">
                    No employee data available.
                </div>

                <div v-else class="overflow-x-auto shadow-md border border-gray-200 bg-white">
                    <table class="min-w-full w-full divide-y divide-gray-200">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total
                                    Present</th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Half-Day
                                    Leave</th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Full-Day
                                    Leave</th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Paid Leave
                                </th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Working
                                    Days</th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Attendance
                                    %</th>
                            </tr>
                        </thead>

                        <tbody class="divide-y divide-gray-100">
                            <tr v-for="emp in store.employees" :key="emp.id">
                                <td class="px-6 py-4 text-sm text-gray-700 font-medium">{{ emp.id }}</td>
                                <td class="px-6 py-4 text-sm text-gray-900">{{ emp.name }}</td>
                                <td class="px-6 py-4 text-sm text-gray-700">{{ emp.totalPresent ?? 0 }}</td>
                                <td class="px-6 py-4 text-sm text-gray-700">{{ emp.halfDayLeave ?? 0 }}</td>
                                <td class="px-6 py-4 text-sm text-gray-700">{{ emp.fullDayLeave ?? 0 }}</td>
                                <td class="px-6 py-4 text-sm text-gray-700">{{ emp.paidLeave ?? 0 }}</td>
                                <td class="px-6 py-4 text-sm text-gray-700">{{ TOTAL_WORKING_DAYS }}</td>
                                <td class="px-6 py-4 text-sm text-gray-700">{{ getAttendancePercentage(emp) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    </div>
</template>

<style scoped></style>
