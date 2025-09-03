const bcrypt = require('bcrypt');
const User = require('./Models/Usermodel');
const mongoose = require('mongoose');
require('./Config/DBconfig');

async function testSpecificPassword() {
  try {
    console.log('Testing specific password issue...');
    
    // Test the exact password from the log
    const candidatePassword = 'securePassword123';
    const storedHash = '$2b$10$qdYeyLYWa2an3oTzkx1XM.YuUzosWlp2Yem3NtH8UNTmRpD6.q14u';
    
    console.log('Candidate password:', candidatePassword);
    console.log('Stored hash:', storedHash);
    
    const directComparison = await bcrypt.compare(candidatePassword, storedHash);
    console.log('Direct bcrypt comparison result:', directComparison);
    
    // Test with some common variations
    const variations = [
      'securePassword123',
      'SecurePassword123',
      'securepassword123',
      'SECUREPASSWORD123',
      ' securePassword123',
      'securePassword123 ',
      'securePassword123\n',
      'securePassword123\r\n'
    ];
    
    console.log('\nTesting password variations:');
    for (const variation of variations) {
      const result = await bcrypt.compare(variation, storedHash);
      console.log(`'${variation.replace(/\n/g, '\\n').replace(/\r/g, '\\r')}': ${result}`);
    }
    
    // Let's also test what this hash was originally created from
    console.log('\nTesting reverse - what passwords could create this hash:');
    const testPasswords = [
      'password123',
      'admin123',
      'test123',
      'officer123',
      'police123',
      '123456',
      'password',
      'admin'
    ];
    
    for (const testPwd of testPasswords) {
      const result = await bcrypt.compare(testPwd, storedHash);
      if (result) {
        console.log(`MATCH FOUND: '${testPwd}' matches the stored hash!`);
      }
    }
    
  } catch (error) {
    console.error('Test error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testSpecificPassword();