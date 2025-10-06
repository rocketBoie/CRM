import { defineStore } from "pinia";
import employeesData from "../utils/emp"; // Assuming this is the initial data

export const employeeStore = defineStore("employee", {
  state: () => ({
    employees: [...employeesData],
    len: employeesData.length,
  }),
  persist: true,
  
  onMounted() {
    alert("Employees data loaded.");
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
        salary: newUser.salary,
        totalPresent: 0, 
        halfDayLeave: 0, 
        fullDayLeave: 0, 
        paidLeave: 0, 
      });
      this.len = this.employees.length;
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

    updateAttendanceStatus(id, status) {
      const emp = this.employees.find((e) => e.id === id);
      if (emp) {
        switch (status) {
          case 'Present':
            emp.totalPresent += 1; 
            break;
          case 'Half-Day':
            emp.halfDayLeave += 1; 
            break;
          case 'Leave':
            emp.fullDayLeave += 1; 
            break;
          case 'Absent':
            break;
          default:
            break;
        }
      }
    },

    updateLeaveCount(id, leaveType, count) {
      const emp = this.employees.find((e) => e.id === id);
      if (emp) {
        if (leaveType === 'half') {
          emp.halfDayLeave += count;
        } else if (leaveType === 'full') {
          emp.fullDayLeave += count;
        } else if (leaveType === 'paid') {
          emp.paidLeave += count;
        }
      }
    },
  },
});
