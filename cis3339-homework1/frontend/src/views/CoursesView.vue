<template>
  <div class="view-container">
    <h2>Course Management</h2>

    <!-- Add Course Form -->
    <form @submit.prevent="addCourse" class="form">
      <h3>Add New Course</h3>
      <div class="form-group">
        <label>Course ID:</label>
        <input v-model="form.courseId" type="text" required placeholder="CIS 3339" />
      </div>
      <div class="form-group">
        <label>Course Name:</label>
        <input v-model="form.courseName" type="text" required placeholder="Enterprise Applications Development" />
      </div>
      <button type="submit" class="btn">Add Course</button>
    </form>

    <p v-if="message" class="message" :class="messageType">{{ message }}</p>

    <!-- Search Courses -->
    <div class="search-section">
      <h3>Existing Courses</h3>
      <input 
        v-model="searchQuery" 
        @input="fetchCourses" 
        type="text" 
        placeholder="Search by Course ID or Name..." 
        class="search-input" 
      />
    </div>

    <!-- Course List with Delete -->
    <ul class="list">
      <li v-for="course in courses" :key="course._id">
        <span><strong>{{ course.courseId }}</strong>: {{ course.courseName }}</span>
        <button @click="deleteCourse(course._id)" class="btn-delete">Delete</button>
      </li>
      <li v-if="courses.length === 0" class="no-results">No courses found.</li>
    </ul>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'

const form = reactive({ courseId: '', courseName: '' })
const courses = ref([])
const searchQuery = ref('')
const message = ref('')
const messageType = ref('')

const fetchCourses = async () => {
  try {
    const url = searchQuery.value 
      ? `http://localhost:3000/api/courses?search=${encodeURIComponent(searchQuery.value)}`
      : 'http://localhost:3000/api/courses'
      
    const res = await fetch(url)
    courses.value = await res.json()
  } catch (err) {
    console.error('Error fetching courses:', err)
  }
}

const addCourse = async () => {
  try {
    message.value = ''
    const res = await fetch('http://localhost:3000/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to add course')

    message.value = `Success! Course ${data.course.courseId} added.`
    messageType.value = 'success'
    form.courseId = ''
    form.courseName = ''
    fetchCourses()
  } catch (err) {
    message.value = `Error: ${err.message}`
    messageType.value = 'error'
  }
}

const deleteCourse = async (id) => {
  try {
    const res = await fetch(`http://localhost:3000/api/courses/${id}`, {
      method: 'DELETE'
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to delete course')

    message.value = 'Course and associated enrollments deleted successfully.'
    messageType.value = 'success'
    fetchCourses()
  } catch (err) {
    message.value = `Error: ${err.message}`
    messageType.value = 'error'
  }
}

onMounted(fetchCourses)
</script>

<style scoped>
.view-container { background: white; padding: 2rem; border-radius: 8px; max-width: 600px; margin: 0 auto; }
.form { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; }
.form-group { display: flex; flex-direction: column; text-align: left; }
.form-group input, .search-input { padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; margin-top: 0.25rem; }
.search-input { width: 100%; margin-bottom: 1rem; box-sizing: border-box; }
.btn { background-color: #42b983; color: white; padding: 0.75rem; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; }
.message { padding: 0.75rem; border-radius: 4px; font-weight: bold; margin-bottom: 1rem; }
.success { background-color: #e2f0d9; color: #385723; }
.error { background-color: #fce4d6; color: #c65911; }
.search-section { text-align: left; }
.list { list-style: none; padding: 0; text-align: left; }
.list li { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid #eee; }
.no-results { color: #888; text-align: center; padding: 1rem; }
.btn-delete { background-color: #ff4d4d; color: white; border: none; padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer; }
.btn-delete:hover { background-color: #cc0000; }
</style>