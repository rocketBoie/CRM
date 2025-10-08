import { defineStore } from "pinia";
import employeesData from "../utils/emp";

export const employeeStore = defineStore("employee", {
  state: () => ({
    employees: employeesData.map((emp) => ({
      ...emp,
      id: Number(emp.id), 
      attendanceData: emp.attendanceData || {},
      paySalary: 0,
      totalPresent: emp.totalPresent || 0,
      halfDayLeave: emp.halfDayLeave || 0,
      fullDayLeave: emp.fullDayLeave || 0,
      paidLeave: emp.paidLeave || 0,
    })),
    offDays: [],
  }),

  persist: true,

  actions: {
    addUser(newUser) {
   
      const numericIds = this.employees
        .map((e) => Number(e.id))
        .filter((id) => !isNaN(id));

     
      const newId = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1;

      this.employees.push({
        id: newId, 
        name: newUser.name || "",
        email: newUser.email || "",
        position: newUser.position || "",
        phone: newUser.phone || "",
        department: newUser.department || "",
        salary: newUser.salary || 0,
        paySalary: 0,
        totalPresent: 0,
        halfDayLeave: 0,
        fullDayLeave: 0,
        paidLeave: 0,
        attendanceData: {},
      });
    },

    removeUser(id) {
      const numericId = Number(id);
      this.employees = this.employees.filter(
        (emp) => Number(emp.id) !== numericId
      );
    },

    updateUser(id, updatedFields) {
      const numericId = Number(id);
      const emp = this.employees.find((e) => Number(e.id) === numericId);
      if (emp) {
        Object.assign(emp, updatedFields);
      }
    },

    updateAttendance(id, dateStr, status, month, year) {
      const numericId = Number(id);
      const emp = this.employees.find((e) => Number(e.id) === numericId);
      if (!emp) return;

      emp.attendanceData = emp.attendanceData || {};
      emp.attendanceData[dateStr] = status;

      this.recalculateSummary(emp);
      this.calculateSalary(emp, month, year);
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
          default:
            break;
        }
      }
    },

    updateLeaveCount(id, leaveType, count) {
      const numericId = Number(id);
      const emp = this.employees.find((e) => Number(e.id) === numericId);
      if (!emp) return;

      if (leaveType === "half") {
        emp.halfDayLeave += count;
      } else if (leaveType === "full") {
        emp.fullDayLeave += count;
      } else if (leaveType === "paid") {
        emp.paidLeave += count;
      }
    },

    calculateSalary(emp, month, year) {
      const totalWorkingDays = this.getWorkingDaysInMonth(month, year);
      if (totalWorkingDays === 0) {
        emp.paySalary = 0;
        return;
      }

      const dailySalary = emp.salary / totalWorkingDays;
      let totalSalary = 0;

      for (const [dateStr, status] of Object.entries(emp.attendanceData)) {
        const date = new Date(dateStr);
        if (date.getMonth() !== month || date.getFullYear() !== year) continue;

        switch (status) {
          case "present":
          case "full-day":
          case "paid-leave":
          case "off-day":
            totalSalary += dailySalary;
            break;
          case "half-day":
            totalSalary += dailySalary / 2;
            break;
        }
      }

      emp.paySalary = parseFloat(totalSalary.toFixed(2));
    },

    getWorkingDaysInMonth(month, year) {
      let workingDays = 0;
      const date = new Date(year, month, 1);
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      for (let day = 1; day <= daysInMonth; day++) {
        date.setDate(day);
        const dayOfWeek = date.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          workingDays++;
        }
      }

      return workingDays;
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
          this.employees.forEach((emp) => {
            this.updateAttendance(emp.id, dateStr, "off-day", month, year);
          });
        }
      }
    },

    formatDateISO(date) {
      return date.toISOString().slice(0, 10);
    },
  },
});
