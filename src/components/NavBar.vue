<template>
    <nav class="fixed top-0 left-0 w-full bg-transparent text-white p-6 z-20">
        <div class="flex justify-around items-center font-semibold">
            <div class="text-4xl font-bold"> <router-link to="/" class="hover:text-white-400 ">cRm</router-link> </div>
            <ul class="flex space-x-6 text-2xl">
                <li><router-link to="/" class="hover:text-blue-400">Home</router-link></li>
                <li><router-link to="/services" class="hover:text-blue-400">Dashboard</router-link></li>
                <li><router-link to="/about" class="hover:text-blue-400">About</router-link></li>
                <li><router-link to="/login" class="hover:text-blue-400">Login</router-link></li>
            </ul>
        </div>
    </nav>
</template>