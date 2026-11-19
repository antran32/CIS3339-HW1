import { createRouter, createWebHistory } from 'vue-router'
import StudentsView from '../views/StudentsView.vue'
import CoursesView from '../views/CoursesView.vue'
import EnrollmentsView from '../views/EnrollmentsView.vue'

const routes = [
  { path: '/', redirect: '/students' },
  { path: '/students', name: 'Students', component: StudentsView },
  { path: '/courses', name: 'Courses', component: CoursesView },
  { path: '/enrollments', name: 'Enrollments', component: EnrollmentsView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router