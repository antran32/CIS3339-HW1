<template>
  <div class="view-container">
    <h2>Enrollment Management</h2>

    <!-- Enroll Form -->
    <form @submit.prevent="addEnrollment" class="form">
      <h3>Enroll Student in Course</h3>
      
      <div class="form-group">
        <label>Select Student:</label>
        <select v-model="form.studentId" required>
          <option disabled value="">-- Choose a Student --</option>
          <option v-for="student in students" :key="student._id" :value="student._id">
            {{ student.name }} (ID: {{ student.id }})
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>Select Course:</label>
        <select v-model="form.courseId" required>
          <option disabled value="">-- Choose a Course --</option>
          <option v-for="course in courses" :key="course._id" :value="course._id">
            {{ course.courseId }} - {{ course.courseName }}
          </option>
        </select>
      </div>

      <button type="submit" class="btn">Enroll Student</button>
    </form>

    <p v-if="message" class="message" :class="messageType">{{ message }}</p>

    <!-- Filter & Enrollment List -->
    <div class="filter-section">
      <h3>Current Enrollments</h3>
      <div class="form-group">
        <label>Filter by Course:</label>
        <select v-model="selectedCourseFilter" @change="fetchEnrollments">
          <option value="">-- All Courses (Show All) --</option>
          <option v-for="course in courses" :key="course._id" :value="course._id">
            {{ course.courseId }} - {{ course.courseName }}
          </option>
        </select>
      </div>
    </div>

    <ul class="list">
      <li v-for="enrollment in enrollments" :key="enrollment._id">
        <span v-if="enrollment.student && enrollment.course">
          <strong>{{ enrollment.student.name }}</strong> is enrolled in <strong>{{ enrollment.course.courseId }}</strong>
        </span>
        <button @click="deleteEnrollment(enrollment._id)" class="btn-delete">Remove</button>
      </li>
      <li v-if="enrollments.length === 0" class="no-results">No active enrollments found for this filter.</li>
    </ul>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'

const form = reactive({ studentId: '', courseId: '' })
const students = ref([])
const courses = ref([])
const enrollments = ref([])
const selectedCourseFilter = ref('')
const message = ref('')
const messageType = ref('')

const fetchInitialData = async () => {
  try {
    const [studRes, courseRes] = await Promise.all([
      fetch('http://localhost:3000/api/students'),
      fetch('http://localhost:3000/api/courses')
    ])
    students.value = await studRes.json()
    courses.value = await courseRes.json()
    await fetchEnrollments()
  } catch (err) {
    console.error('Error loading data:', err)
  }
}

const fetchEnrollments = async () => {
  try {
    const url = selectedCourseFilter.value 
      ? `http://localhost:3000/api/enrollments?courseId=${selectedCourseFilter.value}`
      : 'http://localhost:3000/api/enrollments'

    const res = await fetch(url)
    enrollments.value = await res.json()
  } catch (err) {
    console.error('Error fetching enrollments:', err)
  }
}

const addEnrollment = async () => {
  try {
    message.value = ''
    const res = await fetch('http://localhost:3000/api/enrollments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to enroll')

    message.value = 'Success! Student successfully enrolled.'
    messageType.value = 'success'
    form.studentId = ''
    form.courseId = ''
    fetchEnrollments()
  } catch (err) {
    message.value = `Error: ${err.message}`
    messageType.value = 'error'
  }
}

const deleteEnrollment = async (id) => {
  try {
    const res = await fetch(`http://localhost:3000/api/enrollments/${id}`, {
      method: 'DELETE'
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to delete enrollment')

    message.value = 'Enrollment removed successfully.'
    messageType.value = 'success'
    fetchEnrollments()
  } catch (err) {
    message.value = `Error: ${err.message}`
    messageType.value = 'error'
  }
}

onMounted(fetchInitialData)
</script>

<style scoped>
.view-container { background: white; padding: 2rem; border-radius: 8px; max-width: 600px; margin: 0 auto; }
.form, .filter-section { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; }
.form-group { display: flex; flex-direction: column; text-align: left; }
.form-group select { padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; margin-top: 0.25rem; }
.btn { background-color: #42b983; color: white; padding: 0.75rem; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; }
.message { padding: 0.75rem; border-radius: 4px; font-weight: bold; margin-bottom: 1rem; }
.success { background-color: #e2f0d9; color: #385723; }
.error { background-color: #fce4d6; color: #c65911; }
.filter-section { border-top: 1px solid #eee; padding-top: 1.5rem; text-align: left; }
.list { list-style: none; padding: 0; text-align: left; }
.list li { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid #eee; }
.no-results { color: #888; text-align: center; padding: 1rem; }
.btn-delete { background-color: #ff4d4d; color: white; border: none; padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer; }
.btn-delete:hover { background-color: #cc0000; }
</style>