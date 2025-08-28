const { model } = require('../config/gemini');

class GeminiService {
    constructor() {
        this.isAvailable = false;
        this.initialized = false;
        this.init();
    }

    async init() {
        await this.checkAvailability();
        this.initialized = true;
    }

    async checkAvailability() {
        try {
            if (process.env.GEMINI_API_KEY) {
                console.log('🔑 Found Gemini API key, testing connection...');
                // Test the API with a simple prompt
                const result = await model.generateContent("Hello");
                this.isAvailable = true;
                console.log('✅ Gemini API is available and working');
            } else {
                console.log('⚠️ Gemini API key not found, using template fallback');
            }
        } catch (error) {
            console.log('❌ Gemini API not available, using template fallback:', error.message);
            this.isAvailable = false;
        }
    }

    async generateMetadata(content, contentType, targetAudience, tone, templateFallback) {
        // Wait for initialization to complete
        while (!this.initialized) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        if (!this.isAvailable) {
            console.log('🔄 Using template fallback');
            return templateFallback();
        }

        console.log('🤖 Using Gemini AI for metadata generation...');
        try {
            const [titles, descriptions, socialCopy] = await Promise.all([
                this.generateTitles(content, contentType, targetAudience, tone),
                this.generateDescriptions(content, contentType, targetAudience, tone),
                this.generateSocialCopy(content, contentType, targetAudience, tone)
            ]);

            console.log('✅ Gemini AI generation completed successfully');
            return {
                titles: titles || [],
                descriptions: descriptions || [],
                socialCopy: socialCopy || []
            };
        } catch (error) {
            console.log('🔄 Gemini generation failed, using template fallback:', error.message);
            return templateFallback();
        }
    }

    async generateTitles(content, contentType, targetAudience, tone) {
        const prompt = this.buildTitlePrompt(content, contentType, targetAudience, tone);
        
        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            // Parse the response to extract titles
            return this.parseTitles(text);
        } catch (error) {
            console.log('Title generation failed:', error.message);
            return null;
        }
    }

    async generateDescriptions(content, contentType, targetAudience, tone) {
        const prompt = this.buildDescriptionPrompt(content, contentType, targetAudience, tone);
        
        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            return this.parseDescriptions(text);
        } catch (error) {
            console.log('Description generation failed:', error.message);
            return null;
        }
    }

    async generateSocialCopy(content, contentType, targetAudience, tone) {
        const prompt = this.buildSocialPrompt(content, contentType, targetAudience, tone);
        
        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            return this.parseSocialCopy(text);
        } catch (error) {
            console.log('Social copy generation failed:', error.message);
            return null;
        }
    }

    buildTitlePrompt(content, contentType, targetAudience, tone) {
        return `You are an expert SEO content strategist. Generate 5 compelling, SEO-optimized titles for the following content.

Content: "${content}"
Content Type: ${contentType}
Target Audience: ${targetAudience || 'professionals'}
Tone: ${tone || 'professional'}

Requirements:
- Each title should be 50-60 characters
- Include the main topic naturally
- Match the specified tone
- Be engaging and click-worthy
- Avoid clickbait or overly promotional language
- Use title case formatting

Please provide exactly 5 titles, one per line, without numbering or bullet points.`;
    }

    buildDescriptionPrompt(content, contentType, targetAudience, tone) {
        return `You are an expert content strategist. Generate 3 compelling meta descriptions for the following content.

Content: "${content}"
Content Type: ${contentType}
Target Audience: ${targetAudience || 'professionals'}
Tone: ${tone || 'professional'}

Requirements:
- Each description should be 150-160 characters
- Include the main topic and key benefits
- Match the specified tone
- Include a call-to-action
- Be engaging and informative
- Avoid promotional language

Please provide exactly 3 descriptions, one per line, without numbering or bullet points.`;
    }

    buildSocialPrompt(content, contentType, targetAudience, tone) {
        return `You are an expert social media strategist. Generate 3 engaging social media posts for the following content.

Content: "${content}"
Content Type: ${contentType}
Target Audience: ${targetAudience || 'professionals'}
Tone: ${tone || 'professional'}

Requirements:
- Each post should be 200-280 characters
- Include relevant emojis (avoid money/gambling emojis like 💰, 🎰, etc.)
- Include 2-3 relevant hashtags
- Match the specified tone
- Be engaging and shareable
- Include a call-to-action

Please provide exactly 3 social posts, one per line, without numbering or bullet points.`;
    }

    parseTitles(text) {
        try {
            const lines = text.trim().split('\n').filter(line => line.trim());
            return lines.slice(0, 5).map(title => title.trim());
        } catch (error) {
            console.log('Failed to parse titles:', error.message);
            return null;
        }
    }

    parseDescriptions(text) {
        try {
            const lines = text.trim().split('\n').filter(line => line.trim());
            return lines.slice(0, 3).map(desc => desc.trim());
        } catch (error) {
            console.log('Failed to parse descriptions:', error.message);
            return null;
        }
    }

    parseSocialCopy(text) {
        try {
            const lines = text.trim().split('\n').filter(line => line.trim());
            return lines.slice(0, 3).map(social => social.trim());
        } catch (error) {
            console.log('Failed to parse social copy:', error.message);
            return null;
        }
    }
}

module.exports = new GeminiService();
