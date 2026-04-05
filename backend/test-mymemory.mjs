import axios from 'axios';

const MYMEMORY_API_URL = 'https://api.mymemory.translated.net/get';

async function test() {
  try {
    console.log('Testing MyMemory API...');
    const response = await axios.get(MYMEMORY_API_URL, {
      params: {
        q: 'This is a test post',
        langpair: 'en|es',
      }
    });

    console.log('Status:', response.status);
    console.log('Type of response.data:', typeof response.data);
    console.log('Response.data:', JSON.stringify(response.data, null, 2));
    
    const translatedText = response.data?.responseData?.translatedText;
    console.log('Extracted translatedText:', translatedText);
    console.log('Type:', typeof translatedText);
    
    if (translatedText && typeof translatedText === 'string') {
      console.log('✅ SUCCESS - translatedText is a valid string');
    } else {
      console.log('❌ FAIL - translatedText is not valid');
    }
  } catch (err) {
    console.error('Error:', err.message);
    console.error('Full error:', err);
  }
}

test();
