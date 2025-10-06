<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { employeeStore } from "../stores/store";
import SideBar from "../components/SideBar.vue";

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
    };

    const days = getDaysInMonth(selectedYear.value, selectedMonth.value);
    for (const date of days) {
        const dateStr = date.toISOString().slice(0, 10);
        const status = attendanceData?.[dateStr];

        if (status === "present") stats.totalPresent++;
        else if (status === "half-day") stats.halfDayLeave++;
        else if (status === "full-day") stats.fullDayLeave++;
        else if (status === "paid-leave") stats.paidLeave++;
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

function goToEmployeeCalendar(emp) {
    router.push({ name: "EmployeeCalendar", params: { id: emp.id } });
}

const employeeStats = computed(() => {
    return store.employees.map(emp => {
        const stats = calculateMonthlyStats(emp.attendanceData);
        return {
            ...emp,
            stats,
            attendancePercentage: getAttendancePercentage(stats),
            workingDays: getDaysInMonth(selectedYear.value, selectedMonth.value).length,
        };
    });
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
                    <input type="month" v-model="monthYear"
                        class="border border-gray-300 px-3 py-2 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>

                <div v-if="store.employees.length === 0" class="text-gray-500 text-center py-10">
                    No employee data available.
                </div>

                <div v-else class="overflow-x-auto">
                    <div class="min-w-full bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-gray-50 sticky top-0 z-10 ">
                                <tr>
                                    <th class="px-6 py-4 text-left text-xl font-bold text-gray-600 uppercase tracking-wider">ID</th>
                                    <th class="px-6 py-4 text-left text-xl font-bold text-gray-600 uppercase tracking-wider">Name</th>
                                    <th class="px-6 py-4 text-left text-xl font-bold text-gray-600 uppercase tracking-wider">Present</th>
                                    <th class="px-6 py-4 text-left text-xl font-bold text-gray-600 uppercase tracking-wider">Half-Day</th>
                                    <th class="px-6 py-4 text-left text-xl font-bold text-gray-600 uppercase tracking-wider">Full-Day</th>
                                    <th class="px-6 py-4 text-left text-xl font-bold text-gray-600 uppercase tracking-wider">Paid Leave</th>
                                    <th class="px-6 py-4 text-left text-xl font-bold text-gray-600 uppercase tracking-wider">Working Days</th>
                                    <th class="px-6 py-4 text-left text-xl font-bold text-gray-600 uppercase tracking-wider">Attendance %</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-100 bg-white">
                                <tr v-for="emp in employeeStats" :key="emp.id" @click="goToEmployeeCalendar(emp)"
                                    class="hover:bg-gray-50 cursor-pointer transition duration-150 ease-in-out">
                                    <td class="px-6 py-4 text-xl font-medium text-gray-700">{{ emp.id }}</td>
                                    <td class="px-6 py-4 text-xl font-semibold text-blue-800">{{ emp.name }}</td>
                                    <td class="px-6 py-4 text-xl text-gray-600">{{ emp.stats.totalPresent }}</td>
                                    <td class="px-6 py-4 text-xl text-gray-600">{{ emp.stats.halfDayLeave }}</td>
                                    <td class="px-6 py-4 text-xl text-gray-600">{{ emp.stats.fullDayLeave }}</td>
                                    <td class="px-6 py-4 text-xl text-gray-600">{{ emp.stats.paidLeave }}</td>
                                    <td class="px-6 py-4 text-xl text-gray-600">{{ emp.workingDays }}</td>
                                    <td class="px-6 py-4 text-xl font-bold text-green-700">{{ emp.attendancePercentage }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    </div>
</template>

<style scoped></style>
