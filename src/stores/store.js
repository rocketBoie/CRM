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
      emp.attendanceData[dateStr] = status;
      this.applySandwichPolicy(emp, dateStr, status);

      this.recalculateSummary(emp);
      this.calculateSalary(emp, month, year);
    },

    applySandwichPolicy(emp, dateStr, newStatus) {
      const isLeaveOrAbsent = ["full-day", "half-day", "absent"].includes(
        newStatus
      );
      if (!isLeaveOrAbsent) return;

      const checkAndConvertSandwich = (centerDate) => {
        const prevDate = new Date(centerDate);
        prevDate.setDate(centerDate.getDate() - 1);
        const nextDate = new Date(centerDate);
        nextDate.setDate(centerDate.getDate() + 1);

        const prevDateStr = this.formatDateISO(prevDate);
        const centerDateStr = this.formatDateISO(centerDate);
        const nextDateStr = this.formatDateISO(nextDate);

        const prevStatus = emp.attendanceData[prevDateStr];
        const nextStatus = emp.attendanceData[nextDateStr];
        const centerStatus = emp.attendanceData[centerDateStr];

        const isPrevLeave = ["full-day", "half-day", "absent"].includes(
          prevStatus
        );
        const isNextLeave = ["full-day", "half-day", "absent"].includes(
          nextStatus
        );

        const isCenterOffDay =
          centerStatus === "off-day" || this.offDays.includes(centerDateStr);

        if (isPrevLeave && isNextLeave && isCenterOffDay) {
          emp.attendanceData[centerDateStr] = "full-day";
        }
      };

      const currentDate = new Date(dateStr);

      const centerPrev = new Date(currentDate);
      centerPrev.setDate(centerPrev.getDate() - 1);
      checkAndConvertSandwich(centerPrev);

      const centerNext = new Date(currentDate);
      centerNext.setDate(centerNext.getDate() + 1);
      checkAndConvertSandwich(centerNext);
    },

    reverseSandwichPolicy(emp, dateStr, oldStatus, newStatus) {
      const wasLeave = ["full-day", "half-day", "absent"].includes(oldStatus);
      const isStillLeave = ["full-day", "half-day", "absent"].includes(
        newStatus
      );
      if (!wasLeave || isStillLeave) return;

      const currentDate = new Date(dateStr);

      const checkAndRevertSandwich = (centerDate) => {
        const prevDate = new Date(centerDate);
        prevDate.setDate(centerDate.getDate() - 1);
        const nextDate = new Date(centerDate);
        nextDate.setDate(centerDate.getDate() + 1);

        const prevDateStr = this.formatDateISO(prevDate);
        const centerDateStr = this.formatDateISO(centerDate);
        const nextDateStr = this.formatDateISO(nextDate);

        const prevStatus = emp.attendanceData[prevDateStr];
        const nextStatus = emp.attendanceData[nextDateStr];
        const centerStatus = emp.attendanceData[centerDateStr];

        const isPrevLeave = ["full-day", "half-day", "absent"].includes(
          prevStatus
        );
        const isNextLeave = ["full-day", "half-day", "absent"].includes(
          nextStatus
        );

        const wasSandwich =
          centerStatus === "full-day" &&
          (new Date(centerDate).getDay() === 0 ||
            this.offDays.includes(centerDateStr));

        if (!(isPrevLeave && isNextLeave) && wasSandwich) {
          emp.attendanceData[centerDateStr] = "off-day";
        }
      };

      const centerPrev = new Date(currentDate);
      centerPrev.setDate(centerPrev.getDate() - 1);
      checkAndRevertSandwich(centerPrev);

      const centerNext = new Date(currentDate);
      centerNext.setDate(centerNext.getDate() + 1);
      checkAndRevertSandwich(centerNext);
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
