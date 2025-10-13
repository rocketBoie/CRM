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
  DxItem,
  DxToolbar,
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
    <aside
      class="fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-indigo-100 shadow-md z-20"
    >
      <SideBar class="w-64" />
    </aside>

    <main class="flex-grow p-10 space-y-8 ml-64 overflow-auto">
      <header>
        <h1
          class="text-5xl font-bold text-indigo-900 drop-shadow-lg tracking-tight"
        >
          Employee CRM
        </h1>
      </header>

      <section
        class="bg-white border border-indigo-200 p-6 overflow-auto shadow-lg"
      >
        <h2 class="text-2xl font-semibold text-indigo-800 mb-4">
          Employee List
        </h2>

        <DxDataGrid
          :data-source="employeesForGrid"
          :show-borders="true"
          :row-alternation-enabled="true"
          :remote-operation="true"
          key-expr="id"
          @row-inserted="onRowInserted"
          @row-updated="onRowUpdated"
          @row-removed="onRowRemoved"
          class="shadow-md min-w-full"
          :search-expr="['name', 'email', 'position']"
        >
          <DxEditing
            mode="cell"
            :allow-updating="true"
            :allow-deleting="true"
            :allow-adding="true"
          />
          <!-- Toolbar and search panel -->
          <!-- <DxToolbar class="mt-6">
            <DxItem name="searchPanel" location="before" />
          </DxToolbar> -->
          <DxSearchPanel
            :visible="true"
            :width="350"
            placeholder="Search employees..."
          />
          <!-- <DxFilterRow :visible="true" /> -->
          <!-- <DxHeaderFilter :visible="true" /> -->
          <DxPaging :page-size="12" />
          <DxColumn
            data-field="id"
            caption="ID"
            :allow-editing="false"
            width="70"
          />
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
          <DxColumn
            data-field="salary"
            caption="Salary"
            data-type="number"
            format="currency"
            width="120"
            alignment="center"
          >
            <DxRequiredRule message="Salary is required" />
            <DxRangeRule
              :min="15000"
              :max="5000000"
              message="Salary must be between 15,000 and 100,000"
            />
          </DxColumn>
        </DxDataGrid>
      </section>
    </main>
  </div>
</template>

<style scoped></style>
