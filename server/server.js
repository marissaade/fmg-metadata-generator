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
    const commonWords = new Set(['the', 'and', 'for', 'with', 'that', 'this', 'have', 'will', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'just', 'into', 'than', 'more', 'other', 'about', 'many', 'then', 'them', 'these', 'so', 'people', 'can', 'said', 'each', 'which', 'she', 'do', 'how', 'their', 'if', 'up', 'out', 'many', 'then', 'them', 'would', 'write', 'go', 'see', 'number', 'no', 'way', 'could', 'my', 'than', 'first', 'water', 'been', 'call', 'who', 'oil', 'sit', 'now', 'find', 'down', 'day', 'did', 'get', 'come', 'made', 'may', 'part']);
    
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
        ]
    };
    
    let templates = allTemplates[contentType] || allTemplates['article'];
    
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
        ]
    };
    
    let templates = allTemplates[contentType] || allTemplates['article'];
    
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
        ]
    };
    
    let templates = allTemplates[contentType] || allTemplates['article'];
    
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
