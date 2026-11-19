const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB using environment variable
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    id: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    zip: { type: String, required: true }
});

const courseSchema = new mongoose.Schema({
    courseId: { type: String, required: true, unique: true },
    courseName: { type: String, required: true }
});

const enrollmentSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true }
});

// Prevent duplicate enrollments for the same student in the same course
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

const Student = mongoose.model('Student', studentSchema);
const Course = mongoose.model('Course', courseSchema);
const Enrollment = mongoose.model('Enrollment', enrollmentSchema);


// Get all students (with optional search query)
app.get('/api/students', async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};
        if (search) {
            query = { $or: [{ name: new RegExp(search, 'i') }, { id: search }] };
        }
        const students = await Student.find(query);
        res.json(students);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add a student
app.post('/api/students', async (req, res) => {
    try {
        const { name, id, phone, zip } = req.body;
        if (!name || !id || !phone || !zip) {
            return res.status(400).json({ error: 'All fields (name, id, phone, zip) are required' });
        }

        const existing = await Student.findOne({ id });
        if (existing) {
            return res.status(400).json({ error: 'Student ID already exists' });
        }

        const newStudent = new Student({ name, id, phone, zip });
        await newStudent.save();
        res.status(201).json({ message: 'Student added successfully', student: newStudent });
    } catch (error) {
        console.error('Error adding student:', error);
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Student ID already exists' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a student and cascade delete their enrollments
app.delete('/api/students/:id', async (req, res) => {
    try {
        const studentId = req.params.id;
        const student = await Student.findByIdAndDelete(studentId);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Cascade delete associated enrollments
        await Enrollment.deleteMany({ student: studentId });

        res.json({ message: 'Student and associated enrollments deleted successfully', student });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Get all courses (with optional search query)
app.get('/api/courses', async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};
        if (search) {
            query = { $or: [{ courseId: new RegExp(search, 'i') }, { courseName: new RegExp(search, 'i') }] };
        }
        const courses = await Course.find(query);
        res.json(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add a course
app.post('/api/courses', async (req, res) => {
    try {
        const { courseId, courseName } = req.body;
        if (!courseId || !courseName) {
            return res.status(400).json({ error: 'Course ID and Course Name are required' });
        }

        const existing = await Course.findOne({ courseId });
        if (existing) {
            return res.status(400).json({ error: 'Course ID already exists' });
        }

        const newCourse = new Course({ courseId, courseName });
        await newCourse.save();
        res.status(201).json({ message: 'Course added successfully', course: newCourse });
    } catch (error) {
        console.error('Error adding course:', error);
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Course ID already exists' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a course and cascade delete its enrollments
app.delete('/api/courses/:id', async (req, res) => {
    try {
        const courseId = req.params.id;
        const course = await Course.findByIdAndDelete(courseId);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        // Cascade delete associated enrollments
        await Enrollment.deleteMany({ course: courseId });

        res.json({ message: 'Course and associated enrollments deleted successfully', course });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Get enrollments
app.get('/api/enrollments', async (req, res) => {
    try {
        const { courseId } = req.query;
        let query = {};
        if (courseId) {
            query.course = courseId;
        }
        const enrollments = await Enrollment.find(query).populate('student').populate('course');
        res.json(enrollments);
    } catch (error) {
        console.error('Error fetching enrollments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add an enrollment
app.post('/api/enrollments', async (req, res) => {
    try {
        const { studentId, courseId } = req.body;
        if (!studentId || !courseId) {
            return res.status(400).json({ error: 'Student ID and Course ID are required' });
        }

        const student = await Student.findById(studentId);
        const course = await Course.findById(courseId);
        if (!student || !course) {
            return res.status(404).json({ error: 'Student or Course not found' });
        }

        const existingEnrollment = await Enrollment.findOne({ student: studentId, course: courseId });
        if (existingEnrollment) {
            return res.status(400).json({ error: 'Student is already enrolled in this course' });
        }

        const newEnrollment = new Enrollment({ student: studentId, course: courseId });
        await newEnrollment.save();

        const populated = await Enrollment.findById(newEnrollment._id).populate('student').populate('course');
        res.status(201).json({ message: 'Enrollment successful', enrollment: populated });
    } catch (error) {
        console.error('Error adding enrollment:', error);
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Student is already enrolled in this course' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete an enrollment
app.delete('/api/enrollments/:id', async (req, res) => {
    try {
        const enrollmentId = req.params.id;
        const enrollment = await Enrollment.findByIdAndDelete(enrollmentId);
        if (!enrollment) {
            return res.status(404).json({ error: 'Enrollment not found' });
        }
        res.json({ message: 'Enrollment deleted successfully', enrollment });
    } catch (error) {
        console.error('Error deleting enrollment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


const frontendDist = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDist));

app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});