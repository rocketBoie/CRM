import { defineStore } from "pinia";
import employeesData from "../utils/emp"; // Assuming this is the initial data

export const employeeStore = defineStore("employee", {
  state: () => ({
    employees: employeesData.map((emp) => ({
      ...emp,
      attendanceData: emp.attendanceData || {}, // e.g. { "2025-10-06": "present" }
    })),
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

    /**
     * Update attendance status for a specific employee on a specific date
     * @param {Number} id - employee id
     * @param {String} dateStr - date string in "YYYY-MM-DD" format
     * @param {String|null} status - attendance status: "present", "half-day", "full-day", "paid-leave" or null (absent)
     */
    // In your Pinia store actions:
    updateAttendance(id, dateStr, status) {
      const emp = this.employees.find((e) => e.id === id);
      if (emp) {
        if (!emp.attendanceData) {
          emp.attendanceData = {};
        }

        emp.attendanceData[dateStr] = status;

        // Recalculate summary counts for this employee
        // Reset counts
        emp.totalPresent = 0;
        emp.halfDayLeave = 0;
        emp.fullDayLeave = 0;
        emp.paidLeave = 0;

        // Count attendance statuses
        for (const key in emp.attendanceData) {
          switch (emp.attendanceData[key]) {
            case "present":
              emp.totalPresent += 1;
              break;
            case "half-day":
              emp.halfDayLeave += 1;
              break;
            case "full-day":
              emp.fullDayLeave += 1;
              break;
            case "paid-leave":
              emp.paidLeave += 1;
              break;
            // null or absent do nothing
          }
        }
      }
    },

    /**
     * Recalculate totalPresent, halfDayLeave, fullDayLeave, paidLeave from attendanceData
     */
    recalculateSummary(emp) {
      // Reset counts
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

    // Your old updateAttendanceStatus can be removed or repurposed if needed

    updateAttendanceStatus(id, status) {
      // deprecated or for legacy support
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
  },
});
