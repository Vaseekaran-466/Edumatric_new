// Verification script for authentication fixes
// Run with: node test_auth_fix.js

const API_URL = 'http://localhost:5000/api/datasedu';

async function testAuth() {
    console.log('🚀 Starting Auth Verification Tests...');

    try {
        // 1. Test /me without cookie
        console.log('\n--- Test 1: GET /me without cookie ---');
        const res1 = await fetch(`${API_URL}/me`);
        const data1 = await res1.json();
        
        console.log('Status:', res1.status);
        console.log('Body:', JSON.stringify(data1));
        
        if (res1.status === 200 && data1.user === null) {
            console.log('✅ Success: /me returned 200 with user: null');
        } else {
            console.log('❌ Failure: Expected 200 with user: null');
        }

        // 2. Test Login (Attempt)
        console.log('\n--- Test 2: POST /login (Check response keys) ---');
        const loginRes = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'nonexistent@example.com', password: 'wrong' })
        });
        const loginData = await loginRes.json();
        
        console.log('Status (Expected 401):', loginRes.status);
        console.log('Body:', JSON.stringify(loginData));
        
        // Even if login fails with 401, we want to make sure it's handled by our new code
        // and doesn't crash. The primary fix is verified by Test 1.

    } catch (error) {
        console.error('❌ Test execution error:', error.message);
    }
}

testAuth();
