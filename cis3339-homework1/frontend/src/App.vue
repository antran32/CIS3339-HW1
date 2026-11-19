<template>
  <div id="app">
    <header class="navbar">
      <h1>Student Management System</h1>
      <nav>
        <router-link to="/students">Students</router-link>
        <router-link to="/courses">Courses</router-link>
        <router-link to="/enrollments">Enrollments</router-link>
      </nav>
    </header>

    <main class="container">
      <router-view />
    </main>
  </div>
</template>

<script setup>
</script>

<style>
body {
  font-family: Arial, sans-serif;
  margin: 0;
  background-color: #f4f7f6;
}
.navbar {
  background-color: #2c3e50;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.navbar nav a {
  color: white;
  margin-left: 20px;
  text-decoration: none;
  font-weight: bold;
}
.navbar nav a.router-link-active {
  border-bottom: 2px solid #42b983;
}
.container {
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
}
</style>