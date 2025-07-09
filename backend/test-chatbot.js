const axios = require('axios');

async function testChatbot() {
  try {
    console.log('Testing chatbot endpoint...');
    
    const response = await axios.post('http://localhost:8000/api/ats/chatbot', {
      messages: [
        { role: 'user', content: 'Hello, can you help me with resume writing?' }
      ]
    });
    
    console.log('✅ Chatbot test successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ Chatbot test failed:');
    console.error('Status:', error.response?.status);
    console.error('Error:', error.response?.data || error.message);
  }
}

testChatbot(); 