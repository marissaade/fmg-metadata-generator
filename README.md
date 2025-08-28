# AI Metadata Generator

A modern, AI-powered tool for generating SEO-optimized metadata with built-in compliance checking and localization support.

## Features

- **AI-Powered Generation**: Generate titles, meta descriptions, and social media copy using advanced AI
- **Compliance Checking**: Automatic detection of prohibited words and phrases
- **Multiple Variations**: Get 3-5 creative options for each metadata type
- **Localization Support**: Identify and adapt U.S.-specific content for Canadian audiences
- **Modern UI**: Clean, responsive interface with real-time feedback
- **Copy to Clipboard**: Easy copying of generated content

## Project Structure

```
metadata-generator/
├── public/                 # Frontend files
│   ├── index.html         # Main HTML interface
│   ├── styles.css         # CSS styles
│   └── script.js          # Frontend JavaScript
├── server/                # Backend files (coming soon)
│   ├── server.js          # Express server
│   ├── ai-service.js      # AI integration
│   └── compliance-checker.js # Compliance checking
├── data/                  # Data files
│   └── prohibited-words.json # Compliance rules
├── package.json           # Project configuration
└── README.md             # This file
```

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone or download this project
2. Navigate to the project directory:
   ```bash
   cd metadata-generator
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Current Status

### ✅ Completed
- Frontend interface with modern design
- Form validation and user interaction
- Sample data generation (simulated)
- Compliance warning system
- Responsive design
- Copy to clipboard functionality

### 🚧 In Progress
- Backend server setup
- AI integration
- Real compliance checking
- Google Docs integration

### 📋 Planned
- User authentication
- Content history
- Advanced localization
- Admin panel for rule management
- API rate limiting
- Performance optimization

## Usage

1. **Select Content Type**: Choose from Article, Video, Email, Social Media, or Landing Page
2. **Paste Content**: Add your content in the text area
3. **Optional Settings**: Specify target audience and tone
4. **Generate**: Click "Generate Metadata" to create options
5. **Review**: Check compliance warnings and select preferred options
6. **Copy**: Use the copy buttons to copy selected metadata

## Compliance Features

The system automatically checks for:
- **Red Words**: Prohibited terms that require immediate review
- **Yellow Words**: Terms that may need compliance review
- **Prohibited Emojis**: Emojis that should be avoided
- **U.S. Specific Terms**: Content that may need localization for Canadian audiences

## Contributing

This is a work in progress. The current version includes a fully functional frontend with simulated backend responses. The next phase will include:

1. Setting up the Express server
2. Integrating with OpenAI API
3. Implementing real compliance checking
4. Adding Google Docs integration

## License

MIT License - see LICENSE file for details

## Support

For questions or issues, please create an issue in the project repository.
