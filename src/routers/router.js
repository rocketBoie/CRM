import { createRouter, createWebHistory } from "vue-router";
import Main from "../views/Main.vue";
import Services from "../views/Services.vue";
import Employe from "../views/Employe.vue";
import Attendance from "../views/Attendance.vue";
import Leaves from "../views/Leaves.vue";
import Payrolls from "../views/Payrolls.vue";
import Holidays from "../views/Holidays.vue";

const routes = [
  { path: "/", name: "Main", component: Main },
  { path: "/services", name: "Services", component: Services },
  { path: "/employee", name: "Employe", component: Employe },
  { path: "/attendance", name: "Attendance", component: Attendance },
  { path: "/leaves", name: "leaves", component: Leaves },
  { path: "/holidays", name: "Holiday", component: Holidays },
  { path: '/payroll/:employeeId/:monthYear', name: 'Payrolls', component: Payrolls,  props: true, }
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
