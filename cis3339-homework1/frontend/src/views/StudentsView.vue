<template>
  <div class="students-container">
    <h2>Student Management</h2>

    <!-- Add Student Form -->
    <form @submit.prevent="addStudent" class="student-form">
      <h3>Add New Student</h3>
      
      <div class="form-group">
        <label>Name:</label>
        <input v-model="form.name" type="text" required placeholder="John Doe" />
      </div>

      <div class="form-group">
        <label>Student ID:</label>
        <input v-model="form.id" type="text" required placeholder="1001" />
      </div>

      <div class="form-group">
        <label>Phone Number:</label>
        <input v-model="form.phone" type="text" required placeholder="555-1234" />
      </div>

      <div class="form-group">
        <label>ZIP Code:</label>
        <input v-model="form.zip" type="text" required placeholder="77001" />
      </div>

      <button type="submit" class="btn-submit">Add Student</button>
    </form>

    <p v-if="message" class="message" :class="messageType">{{ message }}</p>

    <!-- Search Students -->
    <div class="search-section">
      <h3>Existing Students</h3>
      <input 
        v-model="searchQuery" 
        @input="fetchStudents" 
        type="text" 
        placeholder="Search by name or ID..." 
        class="search-input" 
      />
    </div>

    <!-- Student List with Delete -->
    <ul class="student-list">
      <li v-for="student in students" :key="student._id">
        <span><strong>{{ student.name }}</strong> (ID: {{ student.id }}) - {{ student.phone }}</span>
        <button @click="deleteStudent(student._id)" class="btn-delete">Delete</button>
      </li>
      <li v-if="students.length === 0" class="no-results">No students found.</li>
    </ul>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'

const form = reactive({
  name: '',
  id: '',
  phone: '',
  zip: ''
})

const students = ref([])
const searchQuery = ref('')
const message = ref('')
const messageType = ref('')

const fetchStudents = async () => {
  try {
    const url = searchQuery.value 
      ? `http://localhost:3000/api/students?search=${encodeURIComponent(searchQuery.value)}`
      : 'http://localhost:3000/api/students'

    const res = await fetch(url)
    students.value = await res.json()
  } catch (err) {
    console.error('Error fetching students:', err)
  }
}

const addStudent = async () => {
  try {
    message.value = ''
    const response = await fetch('http://localhost:3000/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Failed to add student')

    message.value = `Success! Student ${data.student.name} added.`
    messageType.value = 'success'
    form.name = ''
    form.id = ''
    form.phone = ''
    form.zip = ''
    fetchStudents()
  } catch (err) {
    message.value = `Error: ${err.message}`
    messageType.value = 'error'
  }
}

const deleteStudent = async (id) => {
  try {
    const response = await fetch(`http://localhost:3000/api/students/${id}`, {
      method: 'DELETE'
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Failed to delete student')

    message.value = 'Student deleted successfully.'
    messageType.value = 'success'
    fetchStudents()
  } catch (err) {
    message.value = `Error: ${err.message}`
    messageType.value = 'error'
  }
}

onMounted(fetchStudents)
</script>

<style scoped>
.students-container { background: white; padding: 2rem; border-radius: 8px; max-width: 600px; margin: 0 auto; }
.student-form { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem; }
.form-group { display: flex; flex-direction: column; text-align: left; }
.form-group input, .search-input { padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; margin-top: 0.25rem; }
.search-input { width: 100%; margin-bottom: 1rem; box-sizing: border-box; }
.btn-submit { background-color: #42b983; color: white; padding: 0.75rem; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; }
.search-section { text-align: left; }
.student-list { list-style: none; padding: 0; text-align: left; }
.student-list li { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid #eee; }
.no-results { color: #888; text-align: center; padding: 1rem; }
.btn-delete { background-color: #ff4d4d; color: white; border: none; padding: 0.3rem 0.6rem; border-radius: 4px; cursor: pointer; }
.btn-delete:hover { background-color: #cc0000; }
.message { margin-top: 1rem; padding: 0.75rem; border-radius: 4px; font-weight: bold; }
.success { background-color: #e2f0d9; color: #385723; }
.error { background-color: #fce4d6; color: #c65911; }
</style>