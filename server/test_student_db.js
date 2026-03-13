import mongoose from 'mongoose';
import Course from './module/courseModel.js';
import Assignment from './module/assignmentModel.js';
import dataModel from './module/model.js';
import dotenv from 'dotenv';
dotenv.config();

async function checkStudentData() {
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://127.0.0.1/Edu_project');
    
    // 1. Find a student
    const student = await dataModel.findOne({ role: 'student' });
    console.log("Found student:", student ? student.email : 'None');
    if (!student) {
        process.exit();
    }

    // 2. Find enrolled courses
    console.log("Checking courses for student:", student._id);
    const courses = await Course.find({ students: student._id });
    console.log(`Enrolled in ${courses.length} courses`);
    
    if (courses.length > 0) {
        console.log("Sample Course ID:", courses[0]._id);
        console.log("Students array:", courses[0].students);
    }

    // 3. Find assignments
    const courseIds = courses.map(c => c._id);
    const assignments = await Assignment.find({ courseId: { $in: courseIds } }).populate('courseId');
    console.log(`Has ${assignments.length} assignments`);

    if (assignments.length > 0) {
        console.log("Sample Assignment courseId object:", assignments[0].courseId);
    }

    mongoose.disconnect();
}

checkStudentData();
