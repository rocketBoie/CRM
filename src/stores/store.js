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

      const oldStatus = emp.attendanceData[dateStr];

      this.reverseSandwichPolicy(emp, dateStr, oldStatus, status);

      emp.attendanceData = emp.attendanceData || {};
      emp.attendanceData[dateStr] = status;

      this.applySandwichPolicy(emp, dateStr, status);

      this.recalculateSummary(emp);
      this.calculateSalary(emp, month, year);
    },

    reverseSandwichPolicy(emp, dateStr, oldStatus, newStatus) {
      const wasLeave =
        oldStatus === "full-day" ||
        oldStatus === "half-day" ||
        oldStatus === "absent";
      const isStillLeave =
        newStatus === "full-day" ||
        newStatus === "half-day" ||
        newStatus === "absent";

      if (!wasLeave || isStillLeave) return;

      const currentDate = new Date(dateStr);

      const shouldBeOffDay = (checkDate) => {
        const dateStr = this.formatDateISO(checkDate);

        return checkDate.getDay() === 0 || this.offDays.includes(dateStr);
      };

      const prevDate = new Date(currentDate);
      prevDate.setDate(currentDate.getDate() - 1);
      const prevDateStr = this.formatDateISO(prevDate);

      if (
        emp.attendanceData[prevDateStr] === "full-day" &&
        shouldBeOffDay(prevDate)
      ) {
        emp.attendanceData[prevDateStr] = "off-day";
      }

      const nextDate = new Date(currentDate);
      nextDate.setDate(currentDate.getDate() + 1);
      const nextDateStr = this.formatDateISO(nextDate);

      if (
        emp.attendanceData[nextDateStr] === "full-day" &&
        shouldBeOffDay(nextDate)
      ) {
        emp.attendanceData[nextDateStr] = "off-day";
      }
    },

    applySandwichPolicy(emp, dateStr, newStatus) {
      const isLeaveOrAbsent =
        newStatus === "full-day" ||
        newStatus === "half-day" ||
        newStatus === "absent";
      if (!isLeaveOrAbsent) return;

      const currentDate = new Date(dateStr);

      const isNonWorkingDay = (checkDateStr) => {
        const status = emp.attendanceData[checkDateStr];

        return status === "off-day" || this.offDays.includes(checkDateStr);
      };

      const prevDate = new Date(currentDate);
      prevDate.setDate(currentDate.getDate() - 1);
      const prevDateStr = this.formatDateISO(prevDate);

      if (isNonWorkingDay(prevDateStr)) {
        const dayBeforePrev = new Date(prevDate);
        dayBeforePrev.setDate(prevDate.getDate() - 1);
        const dayBeforePrevStatus =
          emp.attendanceData[this.formatDateISO(dayBeforePrev)];

        const isPreviousDayALeave =
          dayBeforePrevStatus === "full-day" ||
          dayBeforePrevStatus === "half-day" ||
          dayBeforePrevStatus === "absent";

        if (!isPreviousDayALeave) {
          emp.attendanceData[prevDateStr] = "full-day";
        }
      }

      const nextDate = new Date(currentDate);
      nextDate.setDate(currentDate.getDate() + 1);
      const nextDateStr = this.formatDateISO(nextDate);

      if (isNonWorkingDay(nextDateStr)) {
        const dayAfterNext = new Date(nextDate);
        dayAfterNext.setDate(nextDate.getDate() + 1);
        const dayAfterNextStatus =
          emp.attendanceData[this.formatDateISO(dayAfterNext)];

        const isNextDayALeave =
          dayAfterNextStatus === "full-day" ||
          dayAfterNextStatus === "half-day" ||
          dayAfterNextStatus === "absent";

        if (!isNextDayALeave) {
          emp.attendanceData[nextDateStr] = "full-day";
        }
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
          case "absent":
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
          case "paid-leave":
          case "off-day":
            totalSalary += dailySalary;
            break;
          case "half-day":
            totalSalary += dailySalary / 2;
            break;
          case "full-day":
          case "absent":
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

    formatDateISO(date) {
      return date.toISOString().slice(0, 10);
    },
  },
});
