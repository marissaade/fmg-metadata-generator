require('dotenv').config();
const geminiService = require('./server/services/geminiService');

async function testGemini() {
    console.log('🧪 Testing Gemini Integration...');
    console.log('API Key present:', !!process.env.GEMINI_API_KEY);
    
    const testContent = "Charitable giving and philanthropy continue to be major forces for good.";
    
    const templateFallback = () => {
        console.log('🔄 Template fallback used');
        return {
            titles: ['Test Title'],
            descriptions: ['Test Description'],
            socialCopy: ['Test Social']
        };
    };
    
    try {
        const result = await geminiService.generateMetadata(
            testContent,
            'article',
            'professionals',
            'professional',
            templateFallback
        );
        
        console.log('📊 Result:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testGemini();
