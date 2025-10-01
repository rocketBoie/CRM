<script setup>
import { ref } from "vue";
import SideBar from "../components/SideBar.vue";
import Modal from "../components/Modal.vue";
import { employeeStore } from "../stores/store";
import Button from "../components/Button.vue";
const store = employeeStore();
const modalRef = ref(null);

function showAddUserModal() {
  modalRef.value?.open();
}

function toggleStatus(employee) {
  store.toggleStatus(employee.id);
}

function edit(employee) {
  modalRef.value?.open(employee);
}
</script>
<template>
  <div class="flex min-h-screen">
    <div class="w-64">
      <SideBar />
    </div>
    <div class="flex-grow p-8">
      <main>
        <h1 class="text-4xl font-extrabold mb-6 text-gray-800">Employee CRM</h1>
        <Button
          @click="showAddUserModal"
          :text="'Add User'"
          class="px-4 py-2 bg-blue-600 text-white rounded mb-4 cursor-pointer"
        >
        </Button>

        <div class="overflow-x-auto shadow-md border border-gray-200 bg-white">
          <table class="min-w-full w-full divide-y divide-gray-200">
            <thead class="bg-gray-100">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase"
                >
                  ID
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase"
                >
                  Name
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase"
                >
                  Email
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase"
                >
                  Position
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase"
                >
                  Phone
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase"
                >
                  Department
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase"
                >
                  Status
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase"
                >
                  Actions
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase"
                >
                  Edit
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="employee in store.employees" :key="employee.id">
                <td class="px-6 py-4 text-sm text-gray-700 font-medium">
                  {{ employee.id }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                  {{ employee.name }}
                </td>
                <td
                  class="px-6 py-4 text-sm text-blue-600 hover:underline cursor-pointer"
                >
                  {{ employee.email }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-700">
                  {{ employee.position }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-700">
                  {{ employee.phone }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-700">
                  {{ employee.department }}
                </td>
                <td
                  class="px-6 py-4 text-sm font-semibold cursor-pointer"
                  :class="
                    employee.status === 'Active'
                      ? 'text-green-600'
                      : 'text-red-600'
                  "
                  @click="toggleStatus(employee)"
                >
                  {{ employee.status }}
                </td>
                <td
                  class="px-6 py-4 text-sm text-gray-700 cursor-pointer"
                  @click="store.removeUser(employee.id)"
                >
                  Remove
                </td>
                <td
                  class="px-6 py-4 text-sm text-gray-700 cursor-pointer"
                  @click="edit(employee)"
                >
                  Edit
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <Modal ref="modalRef" />
      </main>
    </div>
  </div>
</template>
