<script setup>
import { ref } from "vue";

const msg = ref("Employee Management System");
const wel = ref("Welcome to the Company Employee Portal!");
const des = ref(
  "Streamline your workforce, manage performance, and foster employee growth."
);

import Button from "../components/Button.vue";
import NavBar from "../components/NavBar.vue";

const handleRoute = () => {
  console.log("Button clicked! Navigating or performing an action.");
};
</script>

<template>
  <div>
    <NavBar />
    <div
      class="bg-cover bg-center h-screen relative flex flex-col justify-center items-center px-6"
      style="background-image: url('/cpc.jpg')"
    >
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-100"
      ></div>

      <h1
        class="text-center text-white text-4xl sm:text-6xl lg:text-8xl font-extrabold relative z-10 mb-6 sm:mb-8 lg:mb-12 animate-zoomIn"
      >
        {{ msg }}
      </h1>

      <div class="relative z-10 p-4 sm:p-6 lg:p-8 text-center">
        <h1
          class="text-white text-3xl sm:text-4xl lg:text-5xl font-bold animate-bounceIn delay-1000"
        >
          {{ wel }}
        </h1>

        <p
          class="text-white text-lg sm:text-xl lg:text-2xl mt-4 sm:mt-6 lg:mt-8 animate-bounceIn delay-2000"
        >
          {{ des }}
        </p>

        <h1 class="text-white mt-6 sm:mt-9 text-3xl">Get Started Now ⬇️</h1>

        <Button
          @click="handleRoute"
          :text="'Get Started Now'"
          aria-label="Start employee management"
          class="cursor-pointer mt-8 px-8 py-4 bg-blue-600 text-white text-lg sm:text-xl font-semibold rounded-lg shadow-xl hover:scale-110 active:scale-90 transform transition-all duration-300"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes zoomIn {
  0% {
    opacity: 0;
    transform: scale(0.6);
  }

  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: translateY(-30px);
  }

  50% {
    opacity: 1;
    transform: translateY(15px);
  }

  100% {
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

.animate-zoomIn {
  animation: zoomIn 1.2s ease-out forwards;
}

.animate-bounceIn {
  animation: bounceIn 1s ease-out forwards;
}

.animate-fadeIn {
  animation: fadeIn 1s ease-out forwards;
}

.delay-1000 {
  animation-delay: 1s;
}

.delay-2000 {
  animation-delay: 2s;
}

.delay-3000 {
  animation-delay: 3s;
}

h1,
p {
  text-shadow: 2px 2px 20px rgba(0, 0, 0, 0.9);
}
</style>
