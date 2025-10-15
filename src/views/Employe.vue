<script setup>
import { ref, computed } from "vue";
import SideBar from "../components/SideBar.vue";
import { employeeStore } from "../stores/store";

import DxDataGrid, {
  DxColumn,
  DxEditing,
  DxPaging,
  DxSearchPanel,
  DxRequiredRule,
  DxEmailRule,
  DxRangeRule,
} from "devextreme-vue/data-grid";

const store = employeeStore();

const employeesForGrid = computed(() => {
  return store.employees.map((emp) => ({ ...emp }));
});

function onRowInserted(e) {
  store.addUser(e.data);
}

function onRowUpdated(e) {
  store.updateUser(e.key, e.data);
}

function onRowRemoved(e) {
  store.removeUser(e.key);
}
</script>

<template>
  <div class="flex min-h-screen bg-gray-50 text-gray-800 font-sans">
    <aside class="fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 shadow-md z-20">
      <SideBar class="w-64 h-full" />
    </aside>

    <main class="flex-1 ml-64 p-10 space-y-8">
      <header class="mb-6">
        <h1 class="text-5xl font-extrabold text-indigo-900 drop-shadow-lg tracking-tight">
          Employee CRM Dashboard
        </h1>
        <p class="text-lg text-gray-600 mt-1">Manage all employees, their details, and payroll information in one place.
        </p>
      </header>

      <section class="bg-white border border-gray-200 shadow-xl rounded-lg p-6 overflow-auto">
        <h2 class="text-2xl font-bold text-indigo-800 mb-6">Employee List</h2>

        <DxDataGrid :data-source="employeesForGrid" key-expr="id" :show-borders="true" :row-alternation-enabled="true"
          :remote-operation="true" @row-inserted="onRowInserted" @row-updated="onRowUpdated" @row-removed="onRowRemoved"
          class="min-w-full">
          <DxEditing mode="cell" :allow-updating="true" :allow-deleting="true" :allow-adding="true" />
          <DxSearchPanel :visible="true" :width="350" placeholder="Search employees..." />
          <DxPaging :page-size="10" />
          <DxColumn data-field="id" caption="ID" :allow-editing="false" width="70" />
          <DxColumn data-field="name" caption="Name">
            <DxRequiredRule message="Name is required" />
          </DxColumn>
          <DxColumn data-field="email" caption="Email">
            <DxRequiredRule message="Email is required" />
            <DxEmailRule message="Enter a valid email address" />
          </DxColumn>
          <DxColumn data-field="position" caption="Position">
            <DxRequiredRule message="Position is required" />
          </DxColumn>
          <DxColumn data-field="phone" caption="Phone">
            <DxRequiredRule message="Phone number is required" />
          </DxColumn>
          <DxColumn data-field="department" caption="Department">
            <DxRequiredRule message="Department is required" />
          </DxColumn>
          <DxColumn data-field="salary" caption="Salary" data-type="number" format="currency" width="140"
            alignment="center">
            <DxRequiredRule message="Salary is required" />
            <DxRangeRule :min="15000" :max="5000000" message="Salary must be between 15,000 and 5,000,000" />
          </DxColumn>
        </DxDataGrid>
      </section>
    </main>
  </div>
</template>

<style scoped>
header h1 {
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
}
</style>
