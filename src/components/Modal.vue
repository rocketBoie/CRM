<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-lg w-full max-w-md p-6 relative">
      <button class="absolute top-2 right-2 text-gray-600" @click="close">
        ✕
      </button>
      <h2 class="text-xl font-semibold mb-4 text-textdark">
        {{ editingUser ? "Edit User" : "Add New User" }}
      </h2>

      <Form
        @submit="onSubmit"
        :validation-schema="schema"
        :initial-values="initialValues"
        v-slot="{ errors, meta }"
      >
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-textdark">Name</label>
            <Field
              name="name"
              type="text"
              class="w-full border-grayout border p-2 rounded focus:border-primary"
            />
            <span class="text-red-600 text-sm">{{ errors.name }}</span>
          </div>
          <div>
            <label class="block text-sm font-medium text-textdark">Email</label>
            <Field
              name="email"
              type="email"
              class="w-full border-grayout border p-2 rounded focus:border-primary"
            />
            <span class="text-red-600 text-sm">{{ errors.email }}</span>
          </div>
          <div>
            <label class="block text-sm font-medium text-textdark"
              >Position</label
            >
            <Field
              name="position"
              type="text"
              class="w-full border-grayout border p-2 rounded focus:border-primary"
            />
            <span class="text-red-600 text-sm">{{ errors.position }}</span>
          </div>
          <div>
            <label class="block text-sm font-medium text-textdark">Phone</label>
            <Field
              name="phone"
              type="text"
              class="w-full border-grayout border p-2 rounded focus:border-primary"
            />
            <span class="text-red-600 text-sm">{{ errors.phone }}</span>
          </div>
          <div>
            <label class="block text-sm font-medium text-textdark"
              >Department</label
            >
            <Field
              name="department"
              type="text"
              class="w-full border-grayout border p-2 rounded focus:border-primary"
            />
            <span class="text-red-600 text-sm">{{ errors.department }}</span>
          </div>
        </div>

        <div class="mt-6 flex justify-end space-x-3">
          <Button
            @click="close"
            class="px-4 py-2 bg-red-500 text-gray-800 rounded hover:bg-red-500 transition"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            :disabled="meta.submitting"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {{ editingUser ? "Update" : "Add" }}
          </Button>
        </div>
      </Form>
    </div>
  </div>
</template>

<script setup>
import { defineComponent, ref, watch } from "vue";
import { Form, Field } from "vee-validate";
import * as yup from "yup";
import { employeeStore } from "../stores/store";
import Button from "./Button.vue";
const store = employeeStore();
const emit = defineEmits(["added", "close"]);
const props = defineComponent({
  Button: Button,
});
const isOpen = ref(false);
const editingUser = ref(null);

const schema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup
    .string()
    .email("Must be valid email")
    .required("Email is required"),
  position: yup.string().required("Position is required"),
  phone: yup.string().required("Phone is required"),
  department: yup.string().required("Department is required"),
});

const initialValues = ref({
  name: "",
  email: "",
  position: "",
  phone: "",
  department: "",
});

watch(editingUser, (user) => {
  if (user) {
    initialValues.value = {
      name: user.name,
      email: user.email,
      position: user.position,
      phone: user.phone,
      department: user.department,
    };
  } else {
    initialValues.value = {
      name: "",
      email: "",
      position: "",
      phone: "",
      department: "",
    };
  }
});

function open(user = null) {
  editingUser.value = user;
  isOpen.value = true;
}

function close() {
  isOpen.value = false;
  editingUser.value = null;
}

function onSubmit(values) {
  if (editingUser.value) {
    store.updateUser(editingUser.value.id, values);
  } else {
    store.addUser(values);
  }
  close();
  emit("added");
}

defineExpose({
  open,
  close,
});
</script>
