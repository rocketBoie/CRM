<template>
  <div class="w-full h-full">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { Bar } from "vue-chartjs";
import { toRefs, watch } from "vue";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

const props = defineProps({
  attendanceData: {
    type: Array,
    required: true,
  },
});

const { attendanceData } = toRefs(props);

const makeChartData = () => ({
  labels: attendanceData.value.map((item) =>
    new Date(item.date).toLocaleDateString("en-US", { weekday: "short" })
  ),
  datasets: [
    {
      label: "Present",
      data: attendanceData.value.map((item) => item.present),
      backgroundColor: "#5a6acf",
    },
    {
      label: "Absent",
      data: attendanceData.value.map((item) => item.absent),
      backgroundColor: "#e11d48",
    },
  ],
});

const chartData = makeChartData();

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
    },
  },
};


watch(attendanceData, () => {
  const newData = makeChartData();
  chartData.labels = newData.labels;
  chartData.datasets = newData.datasets;
});
</script>
