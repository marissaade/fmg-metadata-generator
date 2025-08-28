// DOM elements
const form = document.getElementById('metadataForm');
const contentTypeSelect = document.getElementById('contentType');
const contentTextarea = document.getElementById('content');
const targetAudienceInput = document.getElementById('targetAudience');
const toneSelect = document.getElementById('tone');
const generateBtn = document.getElementById('generateBtn');
const charCountSpan = document.getElementById('charCount');
const resultsDiv = document.getElementById('results');
const titlesDiv = document.getElementById('titles');
const descriptionsDiv = document.getElementById('descriptions');
const socialCopyDiv = document.getElementById('socialCopy');
const complianceWarningsDiv = document.getElementById('complianceWarnings');
const warningsListDiv = document.getElementById('warningsList');

// Character counter
contentTextarea.addEventListener('input', function() {
    const count = this.value.length;
    charCountSpan.textContent = count.toLocaleString();
});

// Form submission
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Show loading state
    setLoadingState(true);
    
    // Get form data
    const formData = {
        contentType: contentTypeSelect.value,
        content: contentTextarea.value,
        targetAudience: targetAudienceInput.value,
        tone: toneSelect.value
    };
    
    try {
        // Call the API to generate metadata
        const result = await generateMetadata(formData);
        
        // Display results
        displayResults(result);
        
        // Show results section
        resultsDiv.style.display = 'block';
        
        // Scroll to results
        resultsDiv.scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('Error generating metadata:', error);
        alert('Error generating metadata. Please try again.');
    } finally {
        setLoadingState(false);
    }
});

// Loading state management
function setLoadingState(isLoading) {
    const btnText = generateBtn.querySelector('.btn-text');
    const btnLoading = generateBtn.querySelector('.btn-loading');
    
    if (isLoading) {
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';
        generateBtn.disabled = true;
    } else {
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
        generateBtn.disabled = false;
    }
}

// Generate metadata using the API
async function generateMetadata(formData) {
    try {
        console.log('Sending request with data:', formData);
        
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Received response:', data);
        
        // Also check compliance
        const complianceResponse = await fetch('/api/compliance/check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content: formData.content })
        });
        
        if (complianceResponse.ok) {
            const complianceData = await complianceResponse.json();
            data.warnings = [...(data.warnings || []), ...complianceData.warnings];
        }
        
        return data;
    } catch (error) {
        console.error('Error calling API:', error);
        throw error;
    }
}

// Display results
function displayResults(data) {
    // Clear previous results
    titlesDiv.innerHTML = '';
    descriptionsDiv.innerHTML = '';
    socialCopyDiv.innerHTML = '';
    
    // Display titles
    data.titles.forEach((title, index) => {
        const option = createMetadataOption(title, `title-${index}`);
        titlesDiv.appendChild(option);
    });
    
    // Display descriptions
    data.descriptions.forEach((description, index) => {
        const option = createMetadataOption(description, `description-${index}`);
        descriptionsDiv.appendChild(option);
    });
    
    // Display social copy
    data.socialCopy.forEach((copy, index) => {
        const option = createMetadataOption(copy, `social-${index}`);
        socialCopyDiv.appendChild(option);
    });
    
    // Display compliance warnings
    if (data.warnings && data.warnings.length > 0) {
        warningsListDiv.innerHTML = '';
        data.warnings.forEach(warning => {
            const warningItem = document.createElement('div');
            warningItem.className = 'warning-item';
            warningItem.textContent = warning;
            warningsListDiv.appendChild(warningItem);
        });
        complianceWarningsDiv.style.display = 'block';
    } else {
        complianceWarningsDiv.style.display = 'none';
    }
}

// Create metadata option element
function createMetadataOption(text, id) {
    const option = document.createElement('div');
    option.className = 'metadata-option';
    option.dataset.id = id;
    
    option.innerHTML = `
        <div class="metadata-text">${text}</div>
        <div class="metadata-actions">
            <button class="copy-btn" onclick="copyToClipboard('${text.replace(/'/g, "\\'")}')">
                Copy
            </button>
            <button class="regenerate-btn" onclick="regenerateOption('${id}')">
                Regenerate
            </button>
        </div>
    `;
    
    // Add click handler for selection
    option.addEventListener('click', function(e) {
        if (!e.target.classList.contains('copy-btn') && !e.target.classList.contains('regenerate-btn')) {
            // Remove selection from other options in the same section
            const parent = this.parentElement;
            parent.querySelectorAll('.metadata-option').forEach(opt => {
                opt.classList.remove('selected');
            });
            // Add selection to this option
            this.classList.add('selected');
        }
    });
    
    return option;
}

// Copy to clipboard function
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Find the button that was clicked
        const buttons = document.querySelectorAll('.copy-btn');
        buttons.forEach(btn => {
            if (btn.textContent === 'Copy') {
                btn.textContent = 'Copied!';
                btn.classList.add('copied');
                setTimeout(() => {
                    btn.textContent = 'Copy';
                    btn.classList.remove('copied');
                }, 2000);
            }
        });
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy to clipboard');
    });
}

// Regenerate option function
function regenerateOption(id) {
    // This will be implemented when we have the backend
    console.log('Regenerating option:', id);
    alert('Regenerate functionality will be implemented with the backend integration');
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Metadata Generator initialized');
    
    // Add some sample content for testing
    contentTextarea.value = `Social Security has been a fact of retirement life ever since it was established in 1935. We all think we know how it works, but how much do you really know? Here are nine things that might surprise you.

The Social Security trust fund is huge. It was $2.8 trillion at the end of 2023. Most workers are eligible for Social Security benefits, but not all. For example, until 1984, federal government employees were part of the Civil Service Retirement System and were not covered by Social Security.

You don't have to work long to be eligible. If you were born in 1929 or later, you need to work for 10 or more years to be eligible for benefits. Benefits are based on an individual's average earnings during a lifetime of work under the Social Security system.`;
    
    // Update character count
    charCountSpan.textContent = contentTextarea.value.length.toLocaleString();
});
