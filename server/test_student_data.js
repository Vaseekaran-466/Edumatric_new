import axios from 'axios';

async function testStudentData() {
    try {
        console.log("Logging in as student...");
        const loginRes = await axios.post('http://localhost:5173/api/datasedu/login', {
            email: 'student@example.com', // guess a student email or we can create one
            password: 'password123'
        });
        
        const cookie = loginRes.headers['set-cookie'];
        console.log("Login successful, getting data...");

        const courseRes = await axios.get('http://localhost:5173/api/datasedu/courses', {
            headers: { Cookie: cookie }
        });
        console.log("Courses count:", courseRes.data.courses.length);
        if (courseRes.data.courses.length > 0) {
            console.log("Course 0 ID:", courseRes.data.courses[0]._id);
            console.log("Course 0 Students:", courseRes.data.courses[0].students);
        }

        const assignRes = await axios.get('http://localhost:5173/api/datasedu/assignments', {
            headers: { Cookie: cookie }
        });
        console.log("Assignments count:", assignRes.data.assignments.length);
        if (assignRes.data.assignments.length > 0) {
            console.log("Assign 0 ID:", assignRes.data.assignments[0]._id);
            console.log("Assign 0 CourseId:", assignRes.data.assignments[0].courseId);
        }

    } catch (err) {
        console.error("Error:", err.response ? err.response.data : err.message);
    }
}

testStudentData();
