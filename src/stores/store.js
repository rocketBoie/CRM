import { defineStore } from "pinia";
import employeesData from "../utils/emp";

export const employeeStore = defineStore("employee", {
  state: () => ({
    employees: [...employeesData],
    len: employeesData.length,
  }),
  persist: true,

  getters: {
    activeUsersCount: (state) => {
      return state.employees.filter((emp) => emp.status === "Active").length;
    },
    inactiveUsersCount: (state) => {
      return state.employees.filter((emp) => emp.status === "Inactive").length;
    },
  },

  actions: {
    addUser(newUser) {
      const newId =
        this.employees.length > 0
          ? Math.max(...this.employees.map((e) => e.id)) + 1
          : 1;

      this.employees.push({
        id: newId,
        name: newUser.name,
        email: newUser.email,
        position: newUser.position,
        phone: newUser.phone,
        department: newUser.department,
        status: "Active",
      });
      this.len = this.employees.length;
    },

    toggleStatus(id) {
      const emp = this.employees.find((e) => e.id === id);
      if (emp) emp.status = emp.status === "Active" ? "Inactive" : "Active";
    },

    removeUser(id) {
      this.employees = this.employees.filter((item) => item.id !== id);
      this.len -= 1;
    },
    updateUser(id, values) {
      const emp = this.employees.find((e) => e.id === id);
      if (emp) {
        Object.assign(emp, values);
      }
    },
  },
});
