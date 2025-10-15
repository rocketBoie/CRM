import { defineStore } from "pinia";
import employeesData from "../utils/emp";

export const employeeStore = defineStore("employee", {
  state: () => ({
    employees: employeesData.map((emp) => ({
      ...emp,
      id: Number(emp.id),
      attendanceData: emp.attendanceData || {},
      paySalary: 0,
      // Removed global counters, these will be calculated per month
    })),
    offDays: [],
  }),

  persist: true,

  actions: {
    refreshAttendanceForAll(month, year) {
      this.employees.forEach((emp) => {
        this.applySandwichPolicyGlobal(emp);
        this.recalculateSummary(emp, month, year);
        this.calculateSalary(emp, month, year);
      });
    },

    addUser(newUser) {
      const numericIds = this.employees.map((e) => Number(e.id)).filter((id) => !isNaN(id));
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
        attendanceData: {},
      });
    },

    removeUser(id) {
      const numericId = Number(id);
      this.employees = this.employees.filter((emp) => Number(emp.id) !== numericId);
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

      this.applySandwichPolicyGlobal(emp);
      this.recalculateSummary(emp, month, year);
      this.calculateSalary(emp, month, year);
    },

    applySandwichPolicyGlobal(emp) {
      const leaveStatuses = ["full-day", "absent"];
      const dates = Object.keys(emp.attendanceData).sort();

      for (const dateStr of dates) {
        const currStatus = emp.attendanceData[dateStr];
        if (!currStatus) continue;

        const date = new Date(dateStr);
        const prevDate = new Date(date);
        prevDate.setDate(date.getDate() - 1);
        const prevStr = this.formatDateISO(prevDate);

        const nextDate = new Date(date);
        nextDate.setDate(date.getDate() + 1);
        const nextStr = this.formatDateISO(nextDate);

        const prevStatus = emp.attendanceData[prevStr];
        const nextStatus = emp.attendanceData[nextStr];

        const isHoliday =
          currStatus === "off-day" ||
          this.offDays.includes(dateStr) ||
          date.getDay() === 0;

        if (
          isHoliday &&
          leaveStatuses.includes(prevStatus) &&
          leaveStatuses.includes(nextStatus)
        ) {
          if (currStatus !== "full-day") {
            // Changing off-day -> full-day
            emp.attendanceData[dateStr] = "full-day";
          }
        } else if (
          currStatus === "full-day" &&
          (this.offDays.includes(dateStr) || date.getDay() === 0) &&
          !(leaveStatuses.includes(prevStatus) && leaveStatuses.includes(nextStatus))
        ) {
          // Changing full-day -> off-day
          emp.attendanceData[dateStr] = "off-day";
        }
      }
    },

    recalculateSummary(emp, month, year) {
      // Calculate monthly attendance stats only for the given month and year
      let totalPresent = 0;
      let halfDayLeave = 0;
      let fullDayLeave = 0;
      let paidLeave = 0;

      for (const [dateStr, status] of Object.entries(emp.attendanceData || {})) {
        const date = new Date(dateStr);
        if (date.getMonth() !== month || date.getFullYear() !== year) continue;

        switch (status) {
          case "present":
            totalPresent++;
            break;
          case "half-day":
            halfDayLeave++;
            break;
          case "full-day":
          case "absent":
            fullDayLeave++;
            break;
          case "paid-leave":
            paidLeave++;
            break;
          default:
            break;
        }
      }

      // Store monthly stats on employee in a special property
      emp.monthlyStats = {
        totalPresent,
        halfDayLeave,
        fullDayLeave,
        paidLeave,
      };
    },

    calculateSalary(emp, month, year) {
      const totalWorkingDays = this.getWorkingDaysInMonth(month, year);
      if (totalWorkingDays === 0) {
        emp.paySalary = 0;
        return;
      }

      const dailySalary = emp.salary / totalWorkingDays;
      let totalSalary = 0;

      for (const [dateStr, status] of Object.entries(emp.attendanceData || {})) {
        const date = new Date(dateStr);
        if (date.getMonth() !== month || date.getFullYear() !== year) continue;

        if (status === "off-day") {
          continue;
        }

        switch (status) {
          case "present":
          case "paid-leave":
            totalSalary += dailySalary;
            break;
          case "half-day":
            totalSalary += dailySalary / 2;
            break;
          case "full-day":
          case "absent":
            // No pay
            break;
          default:
            break;
        }
      }

      emp.paySalary = parseFloat(totalSalary.toFixed(2));
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
      const days = new Date(year, month + 1, 0).getDate();
      this.employees.forEach((emp) => {
        for (let day = 1; day <= days; day++) {
          const date = new Date(year, month, day);
          const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1)
            .toString()
            .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;

          if (date.getDay() === 0) {
            if (!emp.attendanceData) emp.attendanceData = {};
            if (
              emp.attendanceData[dateStr] !== "full-day" &&
              emp.attendanceData[dateStr] !== "half-day" &&
              emp.attendanceData[dateStr] !== "paid-leave" &&
              emp.attendanceData[dateStr] !== "absent"
            ) {
              emp.attendanceData[dateStr] = "off-day";
            }
          }
        }
      });
    },

    getWorkingDaysInMonth(month, year) {
      let workingDays = 0;
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay();

        if (dayOfWeek !== 0) {
          workingDays++;
        }
      }

      return workingDays;
    },

    formatDateISO(date) {
      return date.toISOString().slice(0, 10);
    },
  },
});
