<script setup>
import { ref } from "vue";
import SideBar from "../components/SideBar.vue";
import { employeeStore } from "../stores/store";
import { RouterLink } from "vue-router";

import DxDataGrid from "devextreme-vue/data-grid";
import { DxColumn, DxEditing, DxButton } from "devextreme-vue/data-grid";
import "devextreme/dist/css/dx.light.css";

const store = employeeStore();
const dataSource = ref(store.employees);

function onRowInserted(e) {
  store.addEmployee(e.data);
}

function onRowUpdated(e) {
  store.updateEmployee(e.data);
}

function onRowRemoved(e) {
  store.removeUser(e.data.id);
}
</script>

<template>
  <div
    class="flex min-h-screen bg-gradient-to-br from-indigo-50 to-white text-gray-800 font-sans"
  >
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
        <p class="text-lg text-indigo-500 mt-2">
          Manage employee records professionally and efficiently.
        </p>
      </header>

      <section
        class="bg-white rounded-2xl shadow-xl border border-indigo-200 p-6 overflow-hidden"
      >
        <h2 class="text-2xl font-semibold text-indigo-800 mb-4">
          Employee List
        </h2>

        <div class="w-full h-[600px]">
          <DxDataGrid
            :data-source="dataSource"
            show-borders
            :column-auto-width="true"
            :allow-column-resizing="true"
            :word-wrap-enabled="true"
            row-alternation-enabled
            class="rounded-xl overflow-hidden"
            height="600"
            @row-inserted="onRowInserted"
            @row-updated="onRowUpdated"
            @row-removed="onRowRemoved"
          >
            <DxEditing
              mode="popup"
              :allow-adding="true"
              :allow-updating="true"
              :allow-deleting="true"
            />

            <DxColumn
              data-field="id"
              caption="ID"
              width="70"
              :allow-editing="false"
            />

            <DxColumn data-field="name" caption="Name">
              <template #cellTemplate="{ data }">
                <RouterLink
                  :to="`/employee/${data.id}`"
                  class="text-indigo-600 hover:underline font-medium"
                >
                  {{ data.name }}
                </RouterLink>
              </template>
            </DxColumn>

            <DxColumn data-field="email" caption="Email" />
            <DxColumn data-field="position" caption="Position" />
            <DxColumn data-field="phone" caption="Phone" />
            <DxColumn data-field="department" caption="Department" />
            <DxColumn
              data-field="salary"
              caption="Salary"
              format="currency"
              editor-type="dxNumberBox"
            />

            <DxColumn type="buttons" width="120">
              <DxButton name="edit" />
              <DxButton name="delete" />
            </DxColumn>
          </DxDataGrid>
        </div>
      </section>
    </main>
  </div>
</template>
