
import fs from 'fs';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// New regex from model.js
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/;

const testEmails = [
    'test@example.com',
    'invalid-email',
];

const testPasswords = [
    'Password123!',
    'Hidden#123',        // Should be Valid now
    'Hyphen-123',        // Should be Valid now
    'Underscore_123',    // Should be Valid now
    'Dot.123',           // Should be Valid now
    'Space 123!',        // Should be Valid now
    'weak',              // Invalid
];

let output = '';
output += '--- Email Validation Test ---\n';
testEmails.forEach(email => {
    output += `'${email}': ${emailRegex.test(email)}\n`;
});

output += '\n--- Password Validation Test ---\n';
testPasswords.forEach(password => {
    output += `'${password}': ${passwordRegex.test(password)}\n`;
});

fs.writeFileSync('validation_results_new.txt', output);
console.log('Output written to validation_results_new.txt');
