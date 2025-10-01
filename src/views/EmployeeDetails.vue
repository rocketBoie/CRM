<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { employeeStore } from "../stores/store";

const route = useRoute();
const router = useRouter();
const store = employeeStore();

const employeeId = Number(route.params.id);
const employee = ref(null);

onMounted(() => {
  employee.value = store.employees.find((e) => e.id === employeeId);
  if (!employee.value) {
    router.push("/");
  }
});
</script>

<template>
  <div v-if="employee" class="max-w-md mx-auto mt-10">
    <div class="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
      <h1 class="text-2xl font-semibold mb-6 text-gray-900">
        Employee Details
      </h1>
      <p class="mb-2">
        <span class="font-semibold text-gray-700">ID:</span> {{ employee.id }}
      </p>
      <p class="mb-2">
        <span class="font-semibold text-gray-700">Name:</span>
        {{ employee.name }}
      </p>
      <p class="mb-2">
        <span class="font-semibold text-gray-700">Email:</span>
        {{ employee.email }}
      </p>
      <p class="mb-2">
        <span class="font-semibold text-gray-700">Position:</span>
        {{ employee.position }}
      </p>
      <p class="mb-2">
        <span class="font-semibold text-gray-700">Phone:</span>
        {{ employee.phone }}
      </p>
      <p class="mb-2">
        <span class="font-semibold text-gray-700">Department:</span>
        {{ employee.department }}
      </p>
      <p class="mb-2">
        <span class="font-semibold text-gray-700">Salary:</span> ${{
          employee.salary.toLocaleString()
        }}
      </p>
    </div>
  </div>
  <div v-else class="flex justify-center items-center h-40">
    <p class="text-gray-500 text-lg">Loading...</p>
  </div>
</template>
