import { defineStore } from "pinia";
import employeesData from "../utils/emp";

export const employeeStore = defineStore("employee", {
  state: () => ({
    employees: [...employeesData],
    len: employeesData.length,
    attendanceByDay: [
      { date: "2025-09-28", present: 20, absent: 5 },
      { date: "2025-09-29", present: 22, absent: 3 },
      { date: "2025-09-30", present: 25, absent: 2 },
      { date: "2025-10-01", present: 23, absent: 4 },
      { date: "2025-10-02", present: 24, absent: 1 },
      { date: "2025-10-03", present: 26, absent: 0 },
    ],
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
