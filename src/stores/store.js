import { defineStore } from "pinia";
import employeesData from "../utils/emp";

export const employeeStore = defineStore("employee", {
  state: () => ({
    employees: employeesData.map((emp) => ({
      ...emp,
      attendanceData: emp.attendanceData || {},
      paySalary: 0,
    })),
    len: employeesData.length,
    offDays: [],
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
        paySalary: 0,
        totalPresent: 0,
        halfDayLeave: 0,
        fullDayLeave: 0,
        paidLeave: 0,
        attendanceData: {},
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

    updateAttendance(id, dateStr, status, month, year) {
      const emp = this.employees.find((e) => e.id === id);
      if (emp) {
        if (!emp.attendanceData) {
          emp.attendanceData = {};
        }
        emp.attendanceData[dateStr] = status;
        this.recalculateSummary(emp);
        this.calculateSalary(emp, month, year);
      }
    },

    recalculateSummary(emp) {
      emp.totalPresent = 0;
      emp.halfDayLeave = 0;
      emp.fullDayLeave = 0;
      emp.paidLeave = 0;
      for (const status of Object.values(emp.attendanceData)) {
        switch (status) {
          case "present":
            emp.totalPresent++;
            break;
          case "half-day":
            emp.halfDayLeave++;
            break;
          case "full-day":
            emp.fullDayLeave++;
            break;
          case "paid-leave":
            emp.paidLeave++;
            break;
          case "off-day":
            break;
          default:
            break;
        }
      }
    },

    updateLeaveCount(id, leaveType, count) {
      const emp = this.employees.find((e) => e.id === id);
      if (emp) {
        if (leaveType === "half") {
          emp.halfDayLeave += count;
        } else if (leaveType === "full") {
          emp.fullDayLeave += count;
        } else if (leaveType === "paid") {
          emp.paidLeave += count;
        }
      }
    },

    calculateSalary(emp, month, year) {
      const totalWorkingDays = this.getWorkingDaysInMonth(month, year);
      if (totalWorkingDays === 0) {
        emp.paySalary = 0;
        return;
      }
      const dailySalary = emp.salary / totalWorkingDays;
      let salary = 0;
      for (const dateStr in emp.attendanceData) {
        const status = emp.attendanceData[dateStr];
        const date = new Date(dateStr);
        if (date.getDay() === 0) {
          salary += dailySalary;
        } else {
          if (status === "present") {
            salary += dailySalary;
          } else if (status === "half-day") {
            salary += dailySalary / 2;
          } else if (status === "full-day") {
            salary += dailySalary;
          } else if (status === "paid-leave") {
            salary += dailySalary;
          } else if (status === "off-day") {
            salary += dailySalary;
          } 
        }
      }
      emp.paySalary = Math.max(0, salary);
      emp.paySalary = parseFloat(emp.paySalary.toFixed(2));
    },
    
    getWorkingDaysInMonth(month, year) {
      const date = new Date(year, month, 1);
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const workingDays = [];

      for (let day = 1; day <= daysInMonth; day++) {
        date.setDate(day);
        if (date.getDay() !== 0 && date.getDay() !== 6) {
          workingDays.push(date);
        }
      }
      return workingDays.length;
    },

    updateSalaries(month, year) {
      this.employees.forEach((emp) => {
        this.calculateSalary(emp, month, year);
      });
    },

    addOffDay(dateStr) {
      if (!this.offDays.includes(dateStr)) {
        this.offDays.push(dateStr);
      }
    },

    removeOffDay(dateStr) {
      this.offDays = this.offDays.filter((date) => date !== dateStr);
    },

    markSundaysAndOffDays(month, year) {
      const date = new Date(year, month, 1);
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      for (let day = 1; day <= daysInMonth; day++) {
        date.setDate(day);
        const dateStr = this.formatDateISO(date);
        if (date.getDay() === 0 || this.offDays.includes(dateStr)) {
          this.updateAttendance(0, dateStr, "off-day", month, year);
        }
      }
    },

    formatDateISO(date) {
      return date.toISOString().slice(0, 10);
    },
  },
});
