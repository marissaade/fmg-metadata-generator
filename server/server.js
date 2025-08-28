const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Add cache-busting headers
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Helper function to extract key topics from content
function extractKeyTopics(content, maxTopics = 5) {
    // Clean and normalize the content
    const cleanContent = content.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    
    // Split into words and filter out common words and short words
    const commonWords = new Set(['the', 'and', 'for', 'with', 'that', 'this', 'have', 'will', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'just', 'into', 'than', 'more', 'other', 'about', 'many', 'then', 'them', 'these', 'so', 'people', 'can', 'said', 'each', 'which', 'she', 'do', 'how', 'their', 'if', 'up', 'out', 'many', 'then', 'them', 'would', 'write', 'go', 'see', 'number', 'no', 'way', 'could', 'my', 'than', 'first', 'water', 'been', 'call', 'who', 'oil', 'sit', 'now', 'find', 'down', 'day', 'did', 'get', 'come', 'made', 'may', 'part', 'billion', 'million', 'dollars', 'year', 'years', 'continue', 'continues', 'continuing', 'remains', 'remain', 'reflecting', 'reflects', 'impact', 'strong', 'financial', 'markets', 'individuals', 'corporations', 'generosity', 'economy', 'force', 'major', 'key', 'part']);
    
    const words = cleanContent
        .split(/\s+/)
        .filter(word => word.length > 3 && !commonWords.has(word));
    
    const wordCount = {};
    words.forEach(word => {
        wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    let topics = Object.entries(wordCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, maxTopics)
        .map(([word]) => word);
    
    // Ensure we have valid topics, fallback to meaningful defaults
    if (topics.length === 0) {
        topics = ['content', 'information', 'strategies'];
    } else if (topics.length === 1) {
        topics.push('strategies', 'success');
    } else if (topics.length === 2) {
        topics.push('success');
    }
    
    return topics;
}

// Helper function to ensure complete words
function ensureCompleteWord(word) {
    if (!word || word.length < 3) return 'content';
    // If word ends with common incomplete endings, replace with complete word
    if (word.endsWith('for')) return word.replace(/for$/, 'marketing');
    if (word.endsWith('ing')) return word; // Keep -ing words
    if (word.endsWith('ed')) return word; // Keep -ed words
    if (word.endsWith('er')) return word; // Keep -er words
    return word;
}

// Helper function to intelligently detect content type based on content
function detectContentType(content, userSelectedType) {
    const lowerContent = content.toLowerCase();
    
    // Keywords that indicate specific content types
    const keywords = {
        'charitable': ['charitable', 'donation', 'donations', 'giving', 'philanthropy', 'nonprofit', 'charity', 'fundraising'],
        'financial': ['financial', 'investment', 'investing', 'money', 'finance', 'economic', 'economy', 'market', 'markets'],
        'business': ['business', 'company', 'corporate', 'enterprise', 'startup', 'entrepreneur'],
        'technology': ['technology', 'tech', 'software', 'app', 'digital', 'online', 'web', 'internet'],
        'health': ['health', 'medical', 'wellness', 'fitness', 'nutrition', 'healthcare'],
        'education': ['education', 'learning', 'teaching', 'school', 'university', 'course', 'training']
    };
    
    // Count keyword matches for each type
    const scores = {};
    Object.keys(keywords).forEach(type => {
        scores[type] = keywords[type].filter(keyword => lowerContent.includes(keyword)).length;
    });
    
    // Find the type with the highest score
    const detectedType = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    
    // If we have a strong signal for a specific type, use it
    if (scores[detectedType] >= 2) {
        return detectedType;
    }
    
    // Otherwise, use the user's selection but with some intelligence
    return userSelectedType;
}

// Helper function to format hashtags properly
function formatHashtags(text) {
    return text.replace(/#(\w+)/g, (match, hashtag) => {
        // If it's a single word, capitalize it
        if (!hashtag.includes('_') && !hashtag.match(/[A-Z]/)) {
            return `#${hashtag.charAt(0).toUpperCase() + hashtag.slice(1)}`;
        }
        // If it's multiple words or already has caps, convert to title case
        return `#${hashtag.replace(/([A-Z])/g, ' $1').trim().split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join('')}`;
    });
}

// Helper function to generate titles
function generateTitles(content, contentType, targetAudience, tone) {
    const topics = extractKeyTopics(content, 3);
    const mainTopic = ensureCompleteWord(topics[0]) || 'content';
    const secondaryTopic = ensureCompleteWord(topics[1]) || 'strategies';
    const thirdTopic = ensureCompleteWord(topics[2]) || 'success';
    
    // Detect the actual content type based on the content
    const detectedType = detectContentType(content, contentType);
    
    // Extensive template library with audience targeting
    const allTemplates = {
        'article': [
            // Guide-style titles
            `The Complete Guide to ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)}`,
            `The Ultimate ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Guide for ${targetAudience}`,
            `${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)}: What Every ${targetAudience} Needs to Know`,
            `How to Master ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} in 2024`,
            `The Definitive Guide to ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)}`,
            
            // Problem-solving titles
            `Solving ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Challenges: A ${targetAudience} Guide`,
            `Common ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Mistakes and How to Avoid Them`,
            `The ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Roadmap: From Beginner to Expert`,
            
            // Benefit-focused titles
            `Unlock the Power of ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)}`,
            `${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Strategies That Actually Work`,
            `Transform Your ${secondaryTopic} with ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)}`,
            
            // Industry-specific titles
            `${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Best Practices for ${targetAudience}`,
            `The Future of ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)}: Trends and Insights`,
            `${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Fundamentals Every ${targetAudience} Should Master`
        ],
        'blog': [
            // Engaging blog titles
            `Why ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Matters More Than Ever`,
            `The Hidden Truth About ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)}`,
            `${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)}: Tips and Tricks You'll Love`,
            `Discover the Power of ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)}`,
            `${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)}: Everything You've Been Missing`,
            
            // Story-driven titles
            `How ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Changed My Business`,
            `The Real Story Behind ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Success`,
            `What I Learned About ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} the Hard Way`,
            
            // Curiosity-driven titles
            `The ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Secret Nobody Talks About`,
            `Is ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Worth Your Time? Here's the Truth`,
            `${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)}: The Good, the Bad, and the Ugly`,
            
            // Action-oriented titles
            `Ready to Level Up Your ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)}?`,
            `${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)}: Your Action Plan for Success`,
            `Stop Struggling with ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} - Try This Instead`
        ],
        'product': [
            // Product-focused titles
            `Transform Your ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Experience`,
            `The Future of ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} is Here`,
            `Revolutionary ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Solutions`,
            `Upgrade Your ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Today`,
            `Premium ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} for Modern Needs`,
            
            // Feature-focused titles
            `Introducing the Next Generation of ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)}`,
            `${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Made Simple: Powerful Features, Easy Use`,
            `The ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Tool You've Been Waiting For`,
            
            // Benefit-focused titles
            `Save Time and Money with Smart ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)}`,
            `Boost Your ${secondaryTopic} with Advanced ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)}`,
            `Professional ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} at an Affordable Price`,
            
            // Comparison titles
            `Why Choose Our ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Over the Competition`,
            `The ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Difference: Quality You Can Trust`,
            `Built for ${targetAudience}: The ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Solution`
        ],
        'service': [
            // Service-focused titles
            `Professional ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Services`,
            `Expert ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Solutions`,
            `Trusted ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Partners`,
            `Quality ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Guaranteed`,
            `Your ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Success Partner`,
            
            // Specialized service titles
            `Custom ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Solutions for ${targetAudience}`,
            `Full-Service ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Support`,
            `Dedicated ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Team at Your Service`,
            
            // Value-focused titles
            `Get More Value from Your ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Investment`,
            `Streamline Your ${secondaryTopic} with Professional ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)}`,
            `Expert ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Consultation and Implementation`,
            
            // Industry-specific titles
            `${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Services Tailored for ${targetAudience}`,
            `Proven ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Methods for Business Growth`,
            `Reliable ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Support When You Need It Most`
        ],
        'video': [
            // Video-focused titles
            `The Ultimate ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Video Guide`,
            `Watch: Complete ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Tutorial`,
            `${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)}: Everything You Need to Know (Video)`,
            `Master ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} in This Comprehensive Video`,
            `Video Guide: ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Best Practices`,
            
            // Educational video titles
            `Learn ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Step-by-Step (Video Tutorial)`,
            `Video Tutorial: ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} for ${targetAudience}`,
            `Complete ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Video Course`,
            
            // Engaging video titles
            `Must-Watch: ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Video Guide`,
            `Video: The Truth About ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)}`,
            `${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Secrets Revealed (Video)`,
            
            // Action-oriented video titles
            `Transform Your ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} with This Video`,
            `Video: ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Strategies That Work`,
            `Watch and Learn: ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Masterclass`
        ],
        'email': [
            // Email-focused titles
            `Email Marketing: ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Best Practices`,
            `The Complete ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Email Guide`,
            `Email Strategy: ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} for ${targetAudience}`,
            `Master Email ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} in 2024`,
            `Email Marketing ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} That Converts`,
            
            // Email campaign titles
            `Email Campaign: ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Success Strategies`,
            `Email Templates for ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)}`,
            `Email Automation: ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Workflows`,
            
            // Email engagement titles
            `Boost Email Engagement with ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)}`,
            `Email Subject Lines: ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} That Get Opens`,
            `Email Content: ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Best Practices`,
            
            // Email ROI titles
            `Email ROI: ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Strategies That Work`,
            `Email Marketing ROI: ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} for Growth`,
            `Email Success: ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Case Studies`
        ],
        'social': [
            // Social media-focused titles
            `Social Media ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Strategy`,
            `The Complete ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Social Media Guide`,
            `Social Media Marketing: ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Best Practices`,
            `Master Social Media ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} in 2024`,
            `Social Media ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} for ${targetAudience}`,
            
            // Platform-specific titles
            `Instagram ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Strategy`,
            `Facebook ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Guide`,
            `LinkedIn ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Best Practices`,
            
            // Social engagement titles
            `Boost Social Media Engagement with ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)}`,
            `Social Media Content: ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} That Gets Shares`,
            `Social Media Growth: ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Strategies`,
            
            // Social ROI titles
            `Social Media ROI: ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} That Converts`,
            `Social Media Success: ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Case Studies`,
            `Social Media Marketing: ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} for Business Growth`
        ],
        'landing': [
            // Landing page-focused titles
            `Landing Page ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Optimization`,
            `The Complete ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Landing Page Guide`,
            `Landing Page Design: ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Best Practices`,
            `Master Landing Page ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} in 2024`,
            `Landing Page ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} for ${targetAudience}`,
            
            // Conversion-focused titles
            `Landing Page Conversion: ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Strategies`,
            `High-Converting Landing Page ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)}`,
            `Landing Page Optimization: ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Techniques`,
            
            // Design-focused titles
            `Landing Page Design: ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Principles`,
            `Landing Page UX: ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Best Practices`,
            `Landing Page Copy: ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} That Converts`,
            
            // Performance titles
            `Landing Page Performance: ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Optimization`,
            `Landing Page ROI: ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Strategies`,
            `Landing Page Success: ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Case Studies`
        ],
        'charitable': [
            // Charitable giving-focused titles
            `The Impact of ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)}: A Complete Guide`,
            `Understanding ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} in 2024`,
            `${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)}: Trends and Insights for ${targetAudience}`,
            `The Future of ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)}: What You Need to Know`,
            `${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Statistics and Analysis`,
            
            // Impact-focused titles
            `How ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} is Changing the World`,
            `The Power of ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)}: Real Impact Stories`,
            `${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)}: Making a Difference in 2024`,
            
            // Educational titles
            `Everything You Need to Know About ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)}`,
            `${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)}: A Comprehensive Overview`,
            `The Complete Guide to ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)}`,
            
            // Trend-focused titles
            `${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Trends in 2024: What's New`,
            `The State of ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)}: Current Landscape`,
            `${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)}: Key Insights and Opportunities`
        ],
        'financial': [
            // Financial-focused titles
            `${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)}: Financial Insights and Analysis`,
            `The Economics of ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)}`,
            `${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)}: Market Trends and Opportunities`,
            `Financial Impact of ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} in 2024`,
            `${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)}: Investment and Growth Strategies`,
            
            // Market-focused titles
            `${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)} Market Analysis: What You Need to Know`,
            `The Financial Landscape of ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)}`,
            `${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)}: Economic Trends and Forecasts`,
            
            // Strategy-focused titles
            `${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)}: Strategic Financial Planning`,
            `Maximizing Returns in ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)}`,
            `${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)}: Financial Best Practices`,
            
            // Growth-focused titles
            `${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)}: Growth Opportunities and Strategies`,
            `The Financial Future of ${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)}`,
            `${mainTopic.charAt(0).toUpperCase() + mainTopic.slice(1)}: Investment Insights for ${targetAudience}`
        ]
    };
    
    let templates = allTemplates[detectedType] || allTemplates[contentType] || allTemplates['article'];
    
    // Randomly select 5 unique templates
    const shuffled = templates.sort(() => 0.5 - Math.random());
    templates = shuffled.slice(0, 5);
    
    // Apply tone-specific modifications
    switch(tone) {
        case 'professional':
            templates = templates.map(title => 
                title.replace(/!/g, '.')
                     .replace(/🔥|🚀|✨|💡|🎯/g, '')
                     .replace(/Complete Guide/g, 'Comprehensive Guide')
                     .replace(/Ultimate/g, 'Definitive')
                     .replace(/Master/g, 'Excel in')
                     .replace(/Tips and Tricks/g, 'Proven Strategies')
                     .replace(/Awesome|Amazing/g, 'Exceptional')
                     .replace(/Level Up/g, 'Optimize')
            );
            break;
        case 'casual':
            templates = templates.map(title => 
                title.replace(/Professional|Expert|Trusted|Quality/g, 'Awesome')
                     .replace(/Revolutionary|Premium/g, 'Amazing')
                     .replace(/Transform|Upgrade/g, 'Level Up')
                     .replace(/Complete Guide/g, 'Complete Guide')
                     .replace(/Ultimate/g, 'Best')
                     .replace(/Master/g, 'Get Good at')
                     .replace(/Comprehensive/g, 'Complete')
                     .replace(/Essential/g, 'Important')
                     .replace(/Definitive/g, 'Best')
                     .replace(/Excel in/g, 'Get Good at')
            );
            break;
        case 'friendly':
            templates = templates.map(title => 
                title.replace(/Professional|Expert/g, 'Friendly')
                     .replace(/Revolutionary/g, 'Game-Changing')
                     .replace(/Transform/g, 'Improve')
                     .replace(/Complete Guide/g, 'Friendly Guide to')
                     .replace(/Ultimate/g, 'Best')
                     .replace(/Master/g, 'Learn')
                     .replace(/Comprehensive/g, 'Complete')
                     .replace(/Definitive/g, 'Best')
                     .replace(/Excel in/g, 'Learn')
            );
            break;
        case 'authoritative':
            templates = templates.map(title => 
                title.replace(/Tips and Tricks/g, 'Proven Strategies')
                     .replace(/Everything You've Been Missing/g, 'Critical Insights')
                     .replace(/What You Need to Know/g, 'Essential Knowledge')
                     .replace(/Complete Guide/g, 'Expert Guide to')
                     .replace(/Ultimate/g, 'Definitive')
                     .replace(/Master/g, 'Master')
                     .replace(/Comprehensive/g, 'Comprehensive')
                     .replace(/Essential/g, 'Essential')
                     .replace(/Get Good at/g, 'Master')
                     .replace(/Learn/g, 'Master')
            );
            break;
    }
    
    return templates;
}

// Helper function to generate descriptions
function generateDescriptions(content, contentType, targetAudience, tone) {
    const topics = extractKeyTopics(content, 2);
    const mainTopic = ensureCompleteWord(topics[0]) || 'content';
    const secondaryTopic = ensureCompleteWord(topics[1]) || 'information';
    
    // Detect the actual content type based on the content
    const detectedType = detectContentType(content, contentType);
    
    // Ensure targetAudience is valid
    const validAudience = targetAudience && targetAudience.trim() ? targetAudience.trim() : 'professionals';
    
    // Extensive description templates with audience targeting
    const allTemplates = {
        'article': [
            // Educational descriptions
            `Discover everything you need to know about ${mainTopic} and ${secondaryTopic}. Expert insights, practical tips, and actionable strategies to help you succeed.`,
            `Learn the essential strategies for mastering ${mainTopic}. From beginner basics to advanced techniques, this comprehensive guide covers it all.`,
            `Explore the latest trends and best practices in ${mainTopic}. Get expert advice and real-world examples to improve your results.`,
            
            // Problem-solving descriptions
            `Struggling with ${mainTopic}? This comprehensive guide breaks down complex concepts into simple, actionable steps for ${validAudience}.`,
            `Master ${mainTopic} with proven methodologies and industry best practices. Perfect for ${validAudience} looking to enhance their skills.`,
            `Transform your understanding of ${mainTopic} with expert analysis, case studies, and practical implementation strategies.`,
            
            // Benefit-focused descriptions
            `Unlock the full potential of ${mainTopic} with our detailed guide. Learn proven techniques that deliver measurable results for ${validAudience}.`,
            `Navigate the complexities of ${mainTopic} with confidence. This resource provides the knowledge and tools you need to excel.`,
            `Elevate your ${mainTopic} expertise with comprehensive coverage of fundamentals, advanced techniques, and emerging trends.`
        ],
        'blog': [
            // Engaging blog descriptions
            `Uncover the secrets of ${mainTopic} that most people miss. Practical advice, real stories, and actionable tips to transform your approach.`,
            `Dive deep into ${mainTopic} with insights that will change how you think about ${secondaryTopic}. Expert analysis and practical takeaways.`,
            `Discover why ${mainTopic} is crucial for success and how to implement it effectively. Real-world examples and proven strategies.`,
            
            // Story-driven descriptions
            `Follow the journey of ${mainTopic} success through real stories and lessons learned. Practical insights for ${validAudience} at every level.`,
            `Get behind-the-scenes access to ${mainTopic} strategies that actually work. No fluff, just proven methods and honest advice.`,
            `Learn from the mistakes and triumphs of ${mainTopic} implementation. Real experiences shared to help you avoid common pitfalls.`,
            
            // Curiosity-driven descriptions
            `Challenge everything you thought you knew about ${mainTopic}. Fresh perspectives and unconventional approaches for modern ${validAudience}.`,
            `Explore the controversial side of ${mainTopic} and discover what really works versus what's just hype.`,
            `Question traditional ${mainTopic} methods and discover innovative approaches that deliver better results.`
        ],
        'product': [
            // Product-focused descriptions
            `Experience the next generation of ${mainTopic} technology. Innovative features, superior performance, and unmatched reliability for modern needs.`,
            `Transform your workflow with our advanced ${mainTopic} solution. Designed for professionals who demand excellence and efficiency.`,
            `Upgrade to premium ${mainTopic} quality with cutting-edge features and intuitive design. Built for performance and user satisfaction.`,
            
            // Feature-focused descriptions
            `Streamline your ${mainTopic} processes with intelligent automation and powerful analytics. Built specifically for ${validAudience}.`,
            `Maximize your ${mainTopic} ROI with our comprehensive suite of tools and features. Everything you need in one integrated platform.`,
            `Accelerate your ${mainTopic} success with proven technology that scales with your business.`,
            
            // Value-focused descriptions
            `Reduce costs and increase efficiency with our smart ${mainTopic} solution. Designed to deliver measurable results for ${validAudience}.`,
            `Get more done with less effort using our intuitive ${mainTopic} platform. Powerful features wrapped in a user-friendly interface.`,
            `Invest in your future with our reliable ${mainTopic} technology. Built to grow with your business and adapt to changing needs.`
        ],
        'service': [
            // Service-focused descriptions
            `Professional ${mainTopic} services tailored to your specific needs. Expert consultation, reliable delivery, and ongoing support for your success.`,
            `Trust our experienced team for all your ${mainTopic} requirements. Quality service, competitive pricing, and guaranteed satisfaction.`,
            `Partner with industry leaders in ${mainTopic} solutions. Comprehensive services, expert guidance, and proven results for your business.`,
            
            // Specialized service descriptions
            `Custom ${mainTopic} solutions designed specifically for ${targetAudience}. Personalized approach, expert execution, and measurable outcomes.`,
            `Full-service ${mainTopic} support from strategy to implementation. Our dedicated team handles every aspect of your project.`,
            `End-to-end ${mainTopic} services that take you from concept to completion. Professional expertise at every step of the process.`,
            
            // Value-focused descriptions
            `Maximize your ${mainTopic} investment with our proven methodologies and experienced team. Results-driven approach for ${targetAudience}.`,
            `Optimize your ${mainTopic} performance with data-driven insights and strategic guidance. Expert analysis and actionable recommendations.`,
            `Scale your ${mainTopic} capabilities with our comprehensive support services. From consultation to ongoing optimization.`
        ],
        'video': [
            // Video-focused descriptions
            `Watch our comprehensive ${mainTopic} video guide. Learn step-by-step techniques and best practices for ${validAudience}.`,
            `Master ${mainTopic} through our detailed video tutorial. Perfect for ${validAudience} looking to enhance their skills visually.`,
            `Discover ${mainTopic} strategies through engaging video content. Real examples and practical demonstrations for immediate application.`,
            
            // Educational video descriptions
            `Learn ${mainTopic} fundamentals through our video course. From basics to advanced techniques, all explained with clear visual examples.`,
            `Visual learning at its best: our ${mainTopic} video series breaks down complex concepts into easy-to-follow tutorials.`,
            `Transform your understanding of ${mainTopic} with our comprehensive video library. Expert instruction for ${validAudience}.`
        ],
        'email': [
            // Email-focused descriptions
            `Master email marketing ${mainTopic} with our comprehensive guide. Learn proven strategies that drive engagement and conversions for ${validAudience}.`,
            `Discover email ${mainTopic} best practices that actually work. From subject lines to content optimization, everything you need to know.`,
            `Transform your email campaigns with ${mainTopic} strategies. Expert guidance for ${validAudience} looking to improve email performance.`,
            
            // Email campaign descriptions
            `Learn email ${mainTopic} techniques that boost open rates and click-through rates. Practical strategies for ${validAudience}.`,
            `Master email automation ${mainTopic} workflows. Streamline your email marketing and improve results with proven methodologies.`,
            `Optimize your email ${mainTopic} for maximum ROI. Data-driven strategies and best practices for modern email marketing.`
        ],
        'social': [
            // Social media-focused descriptions
            `Master social media ${mainTopic} strategies that drive engagement and growth. Expert guidance for ${validAudience} in the digital age.`,
            `Discover social media ${mainTopic} best practices that actually work. From content creation to audience engagement, everything you need to know.`,
            `Transform your social media presence with ${mainTopic} techniques. Proven strategies for ${validAudience} looking to grow their online reach.`,
            
            // Platform-specific descriptions
            `Learn platform-specific ${mainTopic} strategies for Instagram, Facebook, LinkedIn, and more. Tailored approaches for ${validAudience}.`,
            `Master social media ${mainTopic} across all major platforms. Comprehensive strategies that work for every social media channel.`,
            `Optimize your social media ${mainTopic} for maximum engagement and conversions. Data-driven approaches for modern social media marketing.`
        ],
        'landing': [
            // Landing page-focused descriptions
            `Master landing page ${mainTopic} optimization techniques. Learn proven strategies that convert visitors into customers for ${validAudience}.`,
            `Discover landing page ${mainTopic} best practices that drive conversions. From design to copy optimization, everything you need to know.`,
            `Transform your landing page performance with ${mainTopic} strategies. Expert guidance for ${validAudience} looking to improve conversion rates.`,
            
            // Conversion-focused descriptions
            `Learn landing page ${mainTopic} techniques that boost conversion rates. Practical strategies for ${validAudience} in competitive markets.`,
            `Master landing page ${mainTopic} for maximum ROI. Data-driven optimization strategies and best practices for modern landing pages.`,
            `Optimize your landing page ${mainTopic} for better user experience and higher conversions. Proven methodologies for ${validAudience}.`
        ],
        'charitable': [
            // Charitable giving-focused descriptions
            `Discover the latest trends and insights in ${mainTopic}. Learn about the impact of charitable giving and how it's shaping our communities.`,
            `Explore the world of ${mainTopic} and understand its significance in today's society. Expert analysis and real-world impact stories.`,
            `Learn about the power of ${mainTopic} and how it's making a difference. Comprehensive coverage of trends, statistics, and success stories.`,
            
            // Impact-focused descriptions
            `Understand the real impact of ${mainTopic} on communities and individuals. Data-driven insights and compelling stories of change.`,
            `Discover how ${mainTopic} is transforming lives and communities. Expert analysis of trends, challenges, and opportunities.`,
            `Explore the significance of ${mainTopic} in modern society. Learn about its economic and social impact on our world.`,
            
            // Educational descriptions
            `Get comprehensive insights into ${mainTopic} and its role in society. Expert analysis, statistics, and real-world examples.`,
            `Master the fundamentals of ${mainTopic} with our detailed guide. From basic concepts to advanced strategies and impact measurement.`,
            `Transform your understanding of ${mainTopic} with expert analysis, case studies, and practical insights for ${validAudience}.`
        ],
        'financial': [
            // Financial-focused descriptions
            `Discover the financial implications of ${mainTopic} and its impact on the economy. Expert analysis and market insights for ${validAudience}.`,
            `Learn about the economic aspects of ${mainTopic} and how it affects financial markets and investment opportunities.`,
            `Explore the financial landscape of ${mainTopic} with comprehensive analysis of trends, opportunities, and market dynamics.`,
            
            // Market-focused descriptions
            `Understand the market dynamics of ${mainTopic} and its financial impact. Expert insights for investors and financial professionals.`,
            `Get detailed analysis of ${mainTopic} from a financial perspective. Market trends, investment opportunities, and economic impact.`,
                         `Master the financial aspects of ${mainTopic} with expert guidance and comprehensive market analysis for ${validAudience}.`
        ]
    };
    
    let templates = allTemplates[detectedType] || allTemplates[contentType] || allTemplates['article'];
    
    // Randomly select 3 unique templates
    const shuffled = templates.sort(() => 0.5 - Math.random());
    templates = shuffled.slice(0, 3);
    
    // Apply tone-specific modifications
    switch(tone) {
        case 'professional':
            templates = templates.map(desc => 
                desc.replace(/awesome|amazing|incredible/gi, 'exceptional')
                    .replace(/transform/gi, 'optimize')
                    .replace(/secrets/gi, 'insights')
                    .replace(/struggling/gi, 'facing challenges with')
                    .replace(/unlock/gi, 'access')
            );
            break;
        case 'casual':
            templates = templates.map(desc => 
                desc.replace(/Professional/gi, 'Awesome')
                    .replace(/Expert/gi, 'Pro')
                    .replace(/comprehensive/gi, 'complete')
                    .replace(/strategies/gi, 'tips')
                    .replace(/optimize/gi, 'level up')
                    .replace(/exceptional/gi, 'amazing')
                    .replace(/insights/gi, 'secrets')
            );
            break;
        case 'friendly':
            templates = templates.map(desc => 
                desc.replace(/Professional/gi, 'Friendly')
                    .replace(/Expert/gi, 'Helpful')
                    .replace(/secrets/gi, 'tips')
                    .replace(/transform/gi, 'improve')
                    .replace(/struggling/gi, 'having trouble with')
                    .replace(/unlock/gi, 'discover')
            );
            break;
        case 'authoritative':
            templates = templates.map(desc => 
                desc.replace(/tips/gi, 'proven strategies')
                    .replace(/helpful/gi, 'expert')
                    .replace(/improve/gi, 'optimize')
                    .replace(/secrets/gi, 'critical insights')
                    .replace(/having trouble/gi, 'facing challenges')
                    .replace(/discover/gi, 'access')
            );
            break;
    }
    
    return templates;
}

// Helper function to generate social copy
function generateSocialCopy(content, contentType, targetAudience, tone) {
    const topics = extractKeyTopics(content, 2);
    const mainTopic = ensureCompleteWord(topics[0]) || 'content';
    const secondaryTopic = ensureCompleteWord(topics[1]) || 'strategies';
    
    // Detect the actual content type based on the content
    const detectedType = detectContentType(content, contentType);
    
    // Ensure targetAudience is valid
    const validAudience = targetAudience && targetAudience.trim() ? targetAudience.trim() : 'professionals';
    
    // Extensive social copy templates with audience targeting
    const allTemplates = {
        'article': [
            // Educational social posts
            `📚 Just published: The ultimate guide to ${mainTopic}! Whether you're a beginner or expert, this comprehensive article has something for everyone. #${mainTopic} #ContentMarketing`,
            `🎯 Want to master ${mainTopic}? Our latest article breaks down everything you need to know, from basics to advanced strategies. Check it out! #${mainTopic}`,
            `💡 New insights on ${mainTopic}! Discover proven strategies and expert tips that will transform your approach. Don't miss this! #${mainTopic} #Tips`,
            
            // Problem-solving social posts
            `🔍 Struggling with ${mainTopic}? Our new article reveals the most common mistakes and how to avoid them. Essential reading for ${validAudience}! #${mainTopic} #Tips`,
            `📖 Just released: The complete ${mainTopic} roadmap from beginner to expert. Perfect for ${validAudience} looking to level up their skills! #${mainTopic} #Learning`,
            `🎓 New article alert! Master ${mainTopic} with our step-by-step guide. From fundamentals to advanced techniques, we've got you covered. #${mainTopic} #Education`,
            
            // Benefit-focused social posts
            `🚀 Transform your ${mainTopic} results with our latest article! Real strategies that actually work, backed by expert analysis. #${mainTopic} #Results`,
            `💪 Ready to excel in ${mainTopic}? Our comprehensive guide shows you exactly how to implement proven strategies for success. #${mainTopic} #Success`,
            `📈 Boost your ${mainTopic} performance with our expert insights. Learn from industry leaders and avoid common pitfalls. #${mainTopic} #Performance`
        ],
        'blog': [
            // Engaging blog social posts
            `🔥 Hot off the press: The truth about ${mainTopic} that nobody talks about! Real insights, practical advice, and actionable takeaways. #${mainTopic} #Blog`,
            `🚀 Just dropped: Everything you need to know about ${mainTopic}! From beginner tips to expert strategies, we've got you covered. #${mainTopic} #Learning`,
            `✨ New blog alert! Discover the secrets of ${mainTopic} and how to implement them effectively. Your success starts here! #${mainTopic} #Success`,
            
            // Story-driven social posts
            `📖 The real story behind ${mainTopic} success! Learn from real experiences and avoid the mistakes others have made. #${mainTopic} #Stories`,
            `🎭 What I learned about ${mainTopic} the hard way - and how you can avoid the same pitfalls. Honest insights from the trenches! #${mainTopic} #Lessons`,
            `🔍 Behind the scenes: How ${mainTopic} changed my business and what you can learn from it. Real results, real stories. #${mainTopic} #BehindTheScenes`,
            
            // Curiosity-driven social posts
            `🤔 Is ${mainTopic} worth your time? Here's the honest truth that most people won't tell you. #${mainTopic} #Truth`,
            `💭 The ${mainTopic} secret nobody talks about - and why it matters for ${validAudience}. You won't believe what we discovered! #${mainTopic} #Secrets`,
            `❓ Question everything you thought you knew about ${mainTopic}. Fresh perspectives that challenge conventional wisdom. #${mainTopic} #Perspectives`
        ],
        'product': [
            // Product-focused social posts
            `🆕 Introducing our revolutionary ${mainTopic} solution! Experience the future of technology with cutting-edge features and unmatched performance. #${mainTopic} #Innovation`,
            `⚡ Transform your workflow with our advanced ${mainTopic} platform! Designed for professionals who demand excellence. #${mainTopic} #Productivity`,
            `🎉 Game-changing ${mainTopic} technology is here! Upgrade your experience with premium features and intuitive design. #${mainTopic} #Technology`,
            
            // Feature-focused social posts
            `🔧 The ${mainTopic} tool you've been waiting for is finally here! Powerful features, easy use, designed for ${targetAudience}. #${mainTopic} #Tools`,
            `⚙️ Streamline your ${mainTopic} processes with intelligent automation. Built specifically for modern business needs. #${mainTopic} #Automation`,
            `📊 Maximize your ${mainTopic} ROI with our comprehensive suite. Everything you need in one integrated platform. #${mainTopic} #ROI`,
            
            // Value-focused social posts
            `💰 Save time and money with smart ${mainTopic} solutions. Designed to deliver measurable results for ${targetAudience}. #${mainTopic} #Savings`,
            `🎯 Get more done with less effort using our intuitive ${mainTopic} platform. Powerful features wrapped in a user-friendly interface. #${mainTopic} #Efficiency`,
            `🏆 Why choose our ${mainTopic} over the competition? Quality you can trust, backed by proven results. #${mainTopic} #Quality`
        ],
        'service': [
            // Service-focused social posts
            `🛠️ Professional ${mainTopic} services that deliver results! Expert consultation, reliable delivery, and ongoing support. #${mainTopic} #Services`,
            `🤝 Trust our experienced team for all your ${mainTopic} needs! Quality service, competitive pricing, guaranteed satisfaction. #${mainTopic} #Professional`,
            `💼 Partner with industry leaders in ${mainTopic} solutions! Comprehensive services and proven results for your business. #${mainTopic} #Partnership`,
            
            // Specialized service social posts
            `🎯 Custom ${mainTopic} solutions designed specifically for ${targetAudience}. Personalized approach, expert execution, measurable outcomes. #${mainTopic} #Custom`,
            `🔧 Full-service ${mainTopic} support from strategy to implementation. Our dedicated team handles every aspect of your project. #${mainTopic} #FullService`,
            `📋 End-to-end ${mainTopic} services that take you from concept to completion. Professional expertise at every step. #${mainTopic} #EndToEnd`,
            
            // Value-focused social posts
            `📈 Maximize your ${mainTopic} investment with our proven methodologies. Results-driven approach for ${targetAudience}. #${mainTopic} #Investment`,
            `📊 Optimize your ${mainTopic} performance with data-driven insights. Expert analysis and actionable recommendations. #${mainTopic} #Optimization`,
            `🚀 Scale your ${mainTopic} capabilities with our comprehensive support. From consultation to ongoing optimization. #${mainTopic} #Scaling`
        ],
        'video': [
            // Video-focused social posts
            `🎥 New video alert! Master ${mainTopic} with our comprehensive tutorial. Step-by-step guidance for ${validAudience}! #${mainTopic} #Video`,
            `📹 Just uploaded: The complete ${mainTopic} video guide! Learn everything you need to know with clear visual examples. #${mainTopic} #Tutorial`,
            `🎬 Watch and learn: ${mainTopic} strategies that actually work! Real examples and practical demonstrations. #${mainTopic} #Learning`,
            
            // Educational video social posts
            `📚 Visual learning at its best! Our ${mainTopic} video series breaks down complex concepts into easy-to-follow tutorials. #${mainTopic} #Education`,
            `🎓 From beginner to expert: Master ${mainTopic} through our comprehensive video course. Perfect for ${validAudience}! #${mainTopic} #Course`,
            `💡 Transform your understanding of ${mainTopic} with our video library. Expert instruction with visual examples. #${mainTopic} #Expertise`,
            
            // Engaging video social posts
            `🔥 Must-watch: The truth about ${mainTopic} revealed in our latest video! Real insights you won't find anywhere else. #${mainTopic} #Insights`,
            `✨ Video tutorial: ${mainTopic} secrets that will change how you approach everything! Don't miss this one. #${mainTopic} #Secrets`,
            `🚀 Level up your ${mainTopic} skills with our video masterclass! Professional techniques made simple. #${mainTopic} #Masterclass`
        ],
        'email': [
            // Email-focused social posts
            `📧 Email marketing mastery: ${mainTopic} strategies that drive engagement and conversions! Essential for ${validAudience}. #${mainTopic} #EmailMarketing`,
            `📨 Discover email ${mainTopic} best practices that actually work! From subject lines to content optimization. #${mainTopic} #Email`,
            `📬 Transform your email campaigns with ${mainTopic} techniques! Expert guidance for better performance. #${mainTopic} #Campaigns`,
            
            // Email campaign social posts
            `📊 Boost your email ${mainTopic} performance! Learn techniques that increase open rates and click-through rates. #${mainTopic} #EmailROI`,
            `⚡ Master email automation ${mainTopic} workflows! Streamline your email marketing for better results. #${mainTopic} #Automation`,
            `🎯 Optimize your email ${mainTopic} for maximum ROI! Data-driven strategies for modern email marketing. #${mainTopic} #Optimization`,
            
            // Email engagement social posts
            `📈 Email engagement secrets: ${mainTopic} strategies that get your emails opened and clicked! #${mainTopic} #Engagement`,
            `💌 Email subject line mastery: ${mainTopic} techniques that boost open rates! #${mainTopic} #SubjectLines`,
            `📋 Email content optimization: ${mainTopic} best practices for higher conversions! #${mainTopic} #Content`
        ],
        'social': [
            // Social media-focused social posts
            `📱 Social media mastery: ${mainTopic} strategies that drive engagement and growth! Essential for ${validAudience}. #${mainTopic} #SocialMedia`,
            `📲 Discover social media ${mainTopic} best practices that actually work! From content creation to audience engagement. #${mainTopic} #Social`,
            `📸 Transform your social media presence with ${mainTopic} techniques! Proven strategies for growth. #${mainTopic} #Growth`,
            
            // Platform-specific social posts
            `📷 Instagram ${mainTopic} strategies that get results! Platform-specific techniques for better engagement. #${mainTopic} #Instagram`,
            `📘 Facebook ${mainTopic} guide: Best practices for maximum reach and engagement! #${mainTopic} #Facebook`,
            `💼 LinkedIn ${mainTopic} strategies for professional networking! Tailored approaches for business growth. #${mainTopic} #LinkedIn`,
            
            // Social engagement social posts
            `🔥 Boost your social media engagement with ${mainTopic}! Proven techniques that get your content shared. #${mainTopic} #Engagement`,
            `📈 Social media growth: ${mainTopic} strategies that expand your reach! #${mainTopic} #Growth`,
            `🎯 Social media ROI: ${mainTopic} techniques that convert followers into customers! #${mainTopic} #ROI`
        ],
        'landing': [
            // Landing page-focused social posts
            `🎯 Landing page mastery: ${mainTopic} optimization techniques that convert visitors into customers! #${mainTopic} #LandingPage`,
            `📄 Discover landing page ${mainTopic} best practices that drive conversions! From design to copy optimization. #${mainTopic} #Landing`,
            `🚀 Transform your landing page performance with ${mainTopic} strategies! Expert guidance for better conversions. #${mainTopic} #Performance`,
            
            // Conversion-focused social posts
            `💰 Boost your conversion rates with ${mainTopic} landing page techniques! Practical strategies for ${validAudience}. #${mainTopic} #Conversions`,
            `📊 Landing page ROI: ${mainTopic} optimization strategies for maximum returns! #${mainTopic} #ROI`,
            `🎨 Landing page design: ${mainTopic} principles that improve user experience and conversions! #${mainTopic} #Design`,
            
            // Performance social posts
            `⚡ Landing page performance: ${mainTopic} optimization techniques that work! #${mainTopic} #Performance`,
            `📈 Landing page success: ${mainTopic} case studies and proven strategies! #${mainTopic} #Success`,
            `🎯 High-converting landing pages: ${mainTopic} strategies that get results! #${mainTopic} #Results`
        ],
        'charitable': [
            // Charitable giving-focused social posts
            `💝 New insights on ${mainTopic}! Discover the impact of charitable giving and how it's changing lives. #${mainTopic} #CharitableGiving`,
            `📊 Just published: The latest statistics on ${mainTopic} and its impact on communities. Essential reading! #${mainTopic} #Impact`,
            `🎯 Understanding ${mainTopic}: How charitable giving is making a difference in 2024. #${mainTopic} #Philanthropy`,
            
            // Impact-focused social posts
            `🌟 The power of ${mainTopic}: Real stories of how charitable giving transforms communities. #${mainTopic} #Stories`,
            `📈 Discover the trends in ${mainTopic} and how they're shaping the future of philanthropy. #${mainTopic} #Trends`,
            `💡 Learn about the significance of ${mainTopic} in today's society. Expert analysis and insights. #${mainTopic} #Insights`,
            
            // Educational social posts
            `📚 Everything you need to know about ${mainTopic}: A comprehensive guide to charitable giving. #${mainTopic} #Guide`,
            `🎓 Master the fundamentals of ${mainTopic} with our detailed analysis. From basics to advanced insights. #${mainTopic} #Education`,
            `🔍 Explore the world of ${mainTopic} and understand its role in modern philanthropy. #${mainTopic} #Philanthropy`
        ],
        'financial': [
            // Financial-focused social posts
            `💰 New analysis: The financial impact of ${mainTopic} on the economy. Expert insights for investors. #${mainTopic} #Finance`,
            `📊 Just released: Economic analysis of ${mainTopic} and its market implications. #${mainTopic} #Economics`,
            `🎯 Understanding the financial landscape of ${mainTopic}: Market trends and opportunities. #${mainTopic} #Markets`,
            
            // Market-focused social posts
            `📈 Discover the market dynamics of ${mainTopic} and investment opportunities. #${mainTopic} #Investment`,
            `💼 Financial insights on ${mainTopic}: How it affects markets and economic growth. #${mainTopic} #Growth`,
            `📋 Expert analysis of ${mainTopic} from a financial perspective. Market trends and forecasts. #${mainTopic} #Analysis`
        ]
    };
    
    let templates = allTemplates[detectedType] || allTemplates[contentType] || allTemplates['article'];
    
    // Randomly select 3 unique templates
    const shuffled = templates.sort(() => 0.5 - Math.random());
    templates = shuffled.slice(0, 3);
    
    // Apply tone-specific modifications
    switch(tone) {
        case 'professional':
            templates = templates.map(social => 
                social.replace(/🔥|🚀|✨|🎉/g, '📊')
                     .replace(/Hot off the press/g, 'New publication')
                     .replace(/Just dropped/g, 'Recently published')
                     .replace(/Game-changing/g, 'Innovative')
                     .replace(/revolutionary/g, 'advanced')
                     .replace(/secrets/g, 'insights')
                     .replace(/ultimate guide/g, 'comprehensive guide')
                     .replace(/Don't miss this!/g, 'Essential reading.')
                     .replace(/Check it out!/g, 'Learn more.')
                     .replace(/Struggling/g, 'Facing challenges with')
                     .replace(/Ready to excel/g, 'Excel in')
                     .replace(/Boost your/g, 'Enhance your')
            );
            break;
        case 'casual':
            templates = templates.map(social => 
                social.replace(/📊/g, '🔥')
                     .replace(/Professional/gi, 'Awesome')
                     .replace(/Expert/gi, 'Pro')
                     .replace(/comprehensive/gi, 'complete')
                     .replace(/strategies/gi, 'tips')
                     .replace(/insights/gi, 'secrets')
                     .replace(/New publication/g, 'Hot off the press')
                     .replace(/Recently published/g, 'Just dropped')
                     .replace(/Innovative/g, 'Game-changing')
                     .replace(/advanced/g, 'revolutionary')
                     .replace(/Facing challenges with/g, 'Struggling with')
                     .replace(/Excel in/g, 'Get good at')
                     .replace(/Enhance your/g, 'Boost your')
            );
            break;
        case 'friendly':
            templates = templates.map(social => 
                social.replace(/Professional/gi, 'Friendly')
                     .replace(/Expert/gi, 'Helpful')
                     .replace(/secrets/gi, 'tips')
                     .replace(/revolutionary/gi, 'amazing')
                     .replace(/Game-changing/gi, 'Helpful')
                     .replace(/Struggling/g, 'Having trouble with')
                     .replace(/Ready to excel/g, 'Ready to learn')
                     .replace(/Boost your/g, 'Improve your')
                     .replace(/Transform your/g, 'Improve your')
            );
            break;
        case 'authoritative':
            templates = templates.map(social => 
                social.replace(/tips/gi, 'proven strategies')
                     .replace(/helpful/gi, 'expert')
                     .replace(/secrets/gi, 'critical insights')
                     .replace(/amazing/gi, 'exceptional')
                     .replace(/awesome/gi, 'professional')
                     .replace(/Having trouble with/g, 'Facing challenges with')
                     .replace(/Ready to learn/g, 'Ready to master')
                     .replace(/Improve your/g, 'Optimize your')
                     .replace(/Get good at/g, 'Master')
            );
            break;
    }
    
    // Format hashtags properly
    templates = templates.map(social => formatHashtags(social));
    
    return templates;
}

// API endpoint for metadata generation
app.post('/api/generate', async (req, res) => {
    try {
        const { contentType, content, targetAudience, tone } = req.body;
        
        // Generate realistic metadata based on content analysis
        const result = {
            titles: generateTitles(content, contentType, targetAudience, tone),
            descriptions: generateDescriptions(content, contentType, targetAudience, tone),
            socialCopy: generateSocialCopy(content, contentType, targetAudience, tone),
            warnings: []
        };
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 800));
        
        res.json(result);
    } catch (error) {
        console.error('Error generating metadata:', error);
        res.status(500).json({ error: 'Failed to generate metadata' });
    }
});

// API endpoint for compliance checking
app.post('/api/compliance/check', async (req, res) => {
    try {
        const { content } = req.body;
        
        // Load prohibited words
        const prohibitedWords = require('../data/prohibited-words.json');
        const warnings = [];
        
        // Check for red words
        const redWordsFound = prohibitedWords.red_words.filter(word => 
            content.toLowerCase().includes(word.toLowerCase())
        );
        
        if (redWordsFound.length > 0) {
            warnings.push(`Red words found: ${redWordsFound.join(', ')}`);
        }
        
        // Check for yellow words
        const yellowWordsFound = prohibitedWords.yellow_words.filter(word => 
            content.toLowerCase().includes(word.toLowerCase())
        );
        
        if (yellowWordsFound.length > 0) {
            warnings.push(`Yellow words found: ${yellowWordsFound.join(', ')}`);
        }
        
        // Check for US-specific terms
        const usTermsFound = prohibitedWords.us_specific_terms.filter(term => 
            content.toLowerCase().includes(term.toLowerCase())
        );
        
        if (usTermsFound.length > 0) {
            warnings.push(`US-specific terms found: ${usTermsFound.join(', ')}`);
        }
        
        res.json({ warnings });
    } catch (error) {
        console.error('Error checking compliance:', error);
        res.status(500).json({ error: 'Failed to check compliance' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📁 Serving files from: ${path.join(__dirname, '../public')}`);
});
