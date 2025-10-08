<script setup>
import { ref, computed } from "vue";
import SideBar from "../components/SideBar.vue";
import { employeeStore } from "../stores/store";

import DxDataGrid, {
  DxColumn,
  DxEditing,
  DxPaging,
  DxSearchPanel,
  DxFilterRow,
  DxHeaderFilter,
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
  <div class="flex min-h-screen text-gray-800 font-sans">
    <aside class="w-64 bg-white border-r border-indigo-100 shadow-md">
      <SideBar />
    </aside>

    <main class="flex-grow p-10 space-y-8">
      <header>
        <h1
          class="text-5xl font-bold text-indigo-900 drop-shadow-lg tracking-tight"
        >
          Employee CRM
        </h1>
      </header>

      <section
        class="bg-white border border-indigo-200 p-6 overflow-auto rounded-lg shadow-lg"
      >
        <h2 class="text-2xl font-semibold text-indigo-800 mb-4">
          Employee List
        </h2>

        <DxDataGrid
          :data-source="employeesForGrid"
          :show-borders="true"
          :row-alternation-enabled="true"
          key-expr="id"
          @row-inserted="onRowInserted"
          @row-updated="onRowUpdated"
          @row-removed="onRowRemoved"
          class="shadow-md rounded-lg"
          :search-expr="['name', 'email', 'position']"
        >
          <DxEditing
            mode="cell"
            :allow-updating="true"
            :allow-deleting="true"
            :allow-adding="true"
          />

          <DxSearchPanel
            :visible="true"
            :width="250"
            placeholder="Search employees..."
          />
          <DxFilterRow :visible="true" />
          <DxHeaderFilter :visible="true" />
          <DxPaging :page-size="10" />

          <DxColumn
            data-field="id"
            caption="ID"
            :allow-editing="false"
            width="70"
          />
          <DxColumn data-field="name" caption="Name" />
          <DxColumn data-field="email" caption="Email" />
          <DxColumn data-field="position" caption="Position" />
          <DxColumn data-field="phone" caption="Phone" />
          <DxColumn data-field="department" caption="Department" />
          <DxColumn
            data-field="salary"
            caption="Salary"
            data-type="number"
            format="currency"
            width="120"
          />
        </DxDataGrid>
      </section>
    </main>
  </div>
</template>
