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
    <div class="flex min-h-screen">
        <div class="w-64">
            <SideBar />
        </div>

        <div class="flex-grow p-8">
            <main>
                <h1 class="text-4xl font-extrabold mb-6 text-gray-800">
                    Employee Attendance Summary
                </h1>

                <div class="mb-6">
                    <label class="font-semibold mr-2">Select Month:</label>
                    <input type="month" v-model="monthYear" class="border px-2 py-1 rounded" />
                </div>

                <div v-if="store.employees.length === 0" class="text-gray-500 text-center">
                    No employee data available.
                </div>

                <div v-else class="overflow-x-auto shadow-md border border-gray-200 bg-white rounded-lg">
                    <table class="min-w-full w-full divide-y divide-gray-200">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total Present</th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Half-Day Leave</th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Full-Day Leave</th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Paid Leave</th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase"> Working Days</th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase"> Attendance % </th>
                            </tr>
                        </thead>

                        <tbody class="divide-y divide-gray-100">
                            <tr v-for="emp in employeeStats" :key="emp.id" @click="goToEmployeeCalendar(emp)"
                                class="cursor-pointer hover:bg-gray-100">
                                <td class="px-6 py-4 text-sm text-gray-700 font-medium">{{ emp.id }}</td>
                                <td class="px-6 py-4 text-sm text-blue-900 font-semibold">{{ emp.name }}</td>
                                <td class="px-6 py-4 text-sm text-gray-700">{{ emp.stats.totalPresent }}</td>
                                <td class="px-6 py-4 text-sm text-gray-700">{{ emp.stats.halfDayLeave }}</td>
                                <td class="px-6 py-4 text-sm text-gray-700">{{ emp.stats.fullDayLeave }}</td>
                                <td class="px-6 py-4 text-sm text-gray-700">{{ emp.stats.paidLeave }}</td>
                                <td class="px-6 py-4 text-sm text-gray-700">{{ emp.workingDays }}</td>
                                <td class="px-6 py-4 text-sm text-gray-700">{{ emp.attendancePercentage }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    </div>
</template>

<style scoped>
table tr:hover {
    background-color: #f7fafc;
}

table {
    border-collapse: separate;
    border-spacing: 0 10px;
}


input[type="month"] {
    width: 180px;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

thead {
    background-color: #f3f4f6;
}
</style>
