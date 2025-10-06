<script setup>
import { ref, computed } from "vue";
import SideBar from "../components/SideBar.vue";
import { employeeStore } from "../stores/store";

const store = employeeStore();

const showAddForm = ref(false);
const searchQuery = ref("");

const newUser = ref({
  name: "",
  email: "",
  position: "",
  phone: "",
  department: "",
  salary: 0,
});

const editingId = ref(null);
const editingUser = ref(null);

function addUser() {
  if (!newUser.value.name.trim()) {
    alert("Name is required");
    return;
  }
  store.addUser(newUser.value);
  newUser.value = {
    name: "",
    email: "",
    position: "",
    phone: "",
    department: "",
    salary: 0,
  };
  showAddForm.value = false;
}

function editUser(emp) {
  editingId.value = emp.id;
  editingUser.value = { ...emp };
}

function saveUser() {
  if (!editingUser.value.name.trim()) {
    alert("Name is required");
    return;
  }
  store.updateUser(editingId.value, editingUser.value);
  editingId.value = null;
  editingUser.value = null;
}

function cancelEdit() {
  editingId.value = null;
  editingUser.value = null;
}

function deleteUser(id) {
  if (confirm("Are you sure to delete this employee?")) {
    store.removeUser(id);
  }
}

const filteredEmployees = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  if (!query) return store.employees;
  return store.employees.filter(emp => {
    return (
      emp.name.toLowerCase().includes(query) ||
      emp.email.toLowerCase().includes(query) ||
      emp.position.toLowerCase().includes(query) ||
      (emp.department && emp.department.toLowerCase().includes(query))
    );
  });
});
</script>

<template>
  <div class="flex min-h-screen bg-gradient-to-br from-indigo-50 to-white text-gray-800 font-sans">
    <aside class="w-64 bg-white border-r border-indigo-100 shadow-md">
      <SideBar />
    </aside>

    <main class="flex-grow p-10 space-y-8 ">
      <header class="">
        <h1 class="text-5xl font-bold text-indigo-900 drop-shadow-lg tracking-tight">
          Employee CRM
        </h1>
        <p class="text-lg text-indigo-500 mt-2">
          Manage employee records professionally and efficiently.
        </p>
      </header>

      <section class="bg-white border border-indigo-200 p-6 overflow-auto">
        <h2 class="text-2xl font-semibold text-indigo-800 mb-4">
          Employee List
        </h2>

        <div class="flex w-full h-full justify-between items-center">
          <input v-model="searchQuery" type="text" placeholder="Search employees..."
          class="mb-6 p-2 border border-gray-300 rounded w-full max-w-md" />

        <button @click="showAddForm = !showAddForm"
          class="mb-4 bg-indigo-600 text-white rounded px-4 py-2 hover:bg-indigo-700">
          {{ showAddForm ? "Hide Add Employee Form" : "Add New Employee" }}
        </button>
        </div>
        

        <form v-if="showAddForm" @submit.prevent="addUser" class="mb-6 grid grid-cols-6 gap-4">
          <input v-model="newUser.name" placeholder="Name" required class="border rounded p-2 col-span-1" />
          <input v-model="newUser.email" placeholder="Email" class="border rounded p-2 col-span-1" />
          <input v-model="newUser.position" placeholder="Position" class="border rounded p-2 col-span-1" />
          <input v-model="newUser.phone" placeholder="Phone" class="border rounded p-2 col-span-1" />
          <input v-model="newUser.department" placeholder="Department" class="border rounded p-2 col-span-1" />
          <input v-model.number="newUser.salary" type="number" placeholder="Salary"
            class="border rounded p-2 col-span-1" />
          <button type="submit" class="bg-indigo-600 text-white rounded px-4 py-2 col-span-1 hover:bg-indigo-700">
            Add Employee
          </button>
        </form>

        <table class="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr class="bg-indigo-100">
              <th class="border border-gray-300 px-3 py-2">ID</th>
              <th class="border border-gray-300 px-3 py-2">Name</th>
              <th class="border border-gray-300 px-3 py-2">Email</th>
              <th class="border border-gray-300 px-3 py-2">Position</th>
              <th class="border border-gray-300 px-3 py-2">Phone</th>
              <th class="border border-gray-300 px-3 py-2">Department</th>
              <th class="border border-gray-300 px-3 py-2">Salary</th>
              <th class="border border-gray-300 px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="emp in filteredEmployees" :key="emp.id" class="hover:bg-indigo-50">
              <td class="border border-gray-300 px-3 py-2">{{ emp.id }}</td>

              <td class="border border-gray-300 px-3 py-2" v-if="editingId !== emp.id">
                {{ emp.name }}
              </td>
              <td class="border border-gray-300 px-3 py-2" v-else>
                <input v-model="editingUser.name" class="border rounded p-1 w-full" />
              </td>

              <td class="border border-gray-300 px-3 py-2" v-if="editingId !== emp.id">
                {{ emp.email }}
              </td>
              <td class="border border-gray-300 px-3 py-2" v-else>
                <input v-model="editingUser.email" class="border rounded p-1 w-full" />
              </td>

              <td class="border border-gray-300 px-3 py-2" v-if="editingId !== emp.id">
                {{ emp.position }}
              </td>
              <td class="border border-gray-300 px-3 py-2" v-else>
                <input v-model="editingUser.position" class="border rounded p-1 w-full" />
              </td>

              <td class="border border-gray-300 px-3 py-2" v-if="editingId !== emp.id">
                {{ emp.phone }}
              </td>
              <td class="border border-gray-300 px-3 py-2" v-else>
                <input v-model="editingUser.phone" class="border rounded p-1 w-full" />
              </td>

              <td class="border border-gray-300 px-3 py-2" v-if="editingId !== emp.id">
                {{ emp.department }}
              </td>
              <td class="border border-gray-300 px-3 py-2" v-else>
                <input v-model="editingUser.department" class="border rounded p-1 w-full" />
              </td>

              <td class="border border-gray-300 px-3 py-2" v-if="editingId !== emp.id">
                {{ emp.salary }}
              </td>
              <td class="border border-gray-300 px-3 py-2" v-else>
                <input type="number" v-model.number="editingUser.salary" class="border rounded p-1 w-full" />
              </td>

              <td class="border border-gray-300 px-3 py-2 whitespace-nowrap">
                <template v-if="editingId === emp.id">
                  <button @click="saveUser" class="text-green-600 hover:text-green-900 mr-2 font-semibold" title="Save">
                    Save
                  </button>
                  <button @click="cancelEdit" class="text-red-600 hover:text-red-900 font-semibold" title="Cancel">
                    Cancel
                  </button>
                </template>

                <template v-else>
                  <button @click="editUser(emp)" class="text-blue-600 hover:text-blue-900 mr-2 font-semibold"
                    title="Edit">
                    Edit
                  </button>
                  <button @click="deleteUser(emp.id)" class="text-red-600 hover:text-red-900 font-semibold"
                    title="Delete">
                    Delete
                  </button>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </main>
  </div>
</template>
