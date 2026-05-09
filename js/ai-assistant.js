// AI Assistant for data insights
class AIAssistant {
    constructor() {
        this.isEnabled = true;
        this.context = null;
        this.conversationHistory = [];
        this.init();
    }

    init() {
        const enableAi = document.getElementById('enableAi');
        if (enableAi) {
            enableAi.addEventListener('change', (e) => {
                this.isEnabled = e.target.checked;
                if (this.isEnabled) {
                    this.addMessage('bot', 'AI Assistant re-enabled! How can I help you?');
                } else {
                    this.addMessage('bot', 'AI Assistant disabled. Enable it in settings to get data insights.');
                }
            });
        }

        const sendBtn = document.getElementById('sendAiBtn');
        const aiInput = document.getElementById('aiInput');

        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }

        if (aiInput) {
            aiInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendMessage();
            });
        }

        const toggleBtn = document.getElementById('toggleAiBtn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleAssistant());
        }
    }

    setContext(data, fileName) {
        this.context = {
            data: data,
            fileName: fileName,
            rowCount: data?.length || 0,
            columnCount: data && data.length > 0 ? Object.keys(data[0]).length : 0,
            columns: data && data.length > 0 ? Object.keys(data[0]) : []
        };
    }

    sendMessage() {
        const input = document.getElementById('aiInput');
        const message = input.value.trim();

        if (!message) return;

        this.addMessage('user', message);
        input.value = '';

        if (!this.isEnabled) {
            this.addMessage('bot', 'AI Assistant is currently disabled. Please enable it in Settings to get responses.');
            return;
        }

        this.processQuery(message);
    }

    async processQuery(query) {
        const lowerQuery = query.toLowerCase();

        // Pattern matching for common questions
        if (lowerQuery.includes('total rows') || lowerQuery.includes('how many rows')) {
            this.respondWithRowCount();
        }
        else if (lowerQuery.includes('total columns') || lowerQuery.includes('how many columns')) {
            this.respondWithColumnCount();
        }
        else if (lowerQuery.includes('columns') && lowerQuery.includes('available')) {
            this.respondWithColumnsList();
        }
        else if (lowerQuery.includes('summary') || lowerQuery.includes('overview')) {
            this.respondWithDataSummary();
        }
        else if (lowerQuery.includes('chart') || lowerQuery.includes('visualize')) {
            this.respondWithChartSuggestion();
        }
        else if (lowerQuery.includes('help') || lowerQuery.includes('what can you do')) {
            this.respondWithHelp();
        }
        else if (lowerQuery.includes('statistics') || lowerQuery.includes('stats')) {
            this.respondWithStatistics();
        }
        else if (lowerQuery.includes('filter') || lowerQuery.includes('find')) {
            this.respondWithFilterHelp();
        }
        else if (lowerQuery.includes('share') || lowerQuery.includes('export')) {
            this.respondWithShareHelp();
        }
        else {
            this.respondWithGeneral(query);
        }
    }

    respondWithRowCount() {
        if (!this.context || !this.context.data) {
            this.addMessage('bot', 'No data loaded yet. Please upload an Excel file first!');
            return;
        }

        this.addMessage('bot', `Your dataset "${this.context.fileName}" contains ${this.context.rowCount.toLocaleString()} rows of data.`);
    }

    respondWithColumnCount() {
        if (!this.context || !this.context.data) {
            this.addMessage('bot', 'No data loaded yet. Please upload an Excel file first!');
            return;
        }

        this.addMessage('bot', `Your dataset has ${this.context.columnCount} columns: ${this.context.columns.join(', ')}`);
    }

    respondWithColumnsList() {
        if (!this.context || !this.context.data) {
            this.addMessage('bot', 'No data loaded yet. Please upload an Excel file first!');
            return;
        }

        this.addMessage('bot', `Available columns: ${this.context.columns.join(', ')}`);
    }

    respondWithDataSummary() {
        if (!this.context || !this.context.data) {
            this.addMessage('bot', 'No data loaded yet. Please upload an Excel file first!');
            return;
        }

        const columns = this.context.columns;
        const numericColumns = [];

        columns.forEach(col => {
            const isNumeric = this.context.data.every(row => {
                const val = row[col];
                return typeof val === 'number' || !isNaN(parseFloat(val));
            });
            if (isNumeric) numericColumns.push(col);
        });

        let summary = `📊 **Data Overview**\n\n`;
        summary += `• File: ${this.context.fileName}\n`;
        summary += `• Rows: ${this.context.rowCount.toLocaleString()}\n`;
        summary += `• Columns: ${this.context.columnCount}\n`;
        summary += `• Numeric columns: ${numericColumns.length}\n\n`;

        if (numericColumns.length > 0) {
            summary += `📈 **Numeric columns ready for visualization**:\n`;
            numericColumns.forEach(col => {
                const values = this.context.data.map(row => parseFloat(row[col]) || 0);
                const sum = values.reduce((a, b) => a + b, 0);
                const mean = sum / values.length;
                summary += `• ${col}: avg = ${mean.toFixed(2)}\n`;
            });
        }

        this.addMessage('bot', summary);
    }

    respondWithChartSuggestion() {
        if (!this.context || !this.context.data) {
            this.addMessage('bot', 'No data loaded yet. Please upload an Excel file first!');
            return;
        }

        const columns = this.context.columns;
        const numericColumns = [];

        columns.forEach(col => {
            const isNumeric = this.context.data.every(row => {
                const val = row[col];
                return typeof val === 'number' || !isNaN(parseFloat(val));
            });
            if (isNumeric) numericColumns.push(col);
        });

        if (numericColumns.length === 0) {
            this.addMessage('bot', 'Your data has no numeric columns. Try uploading data with numbers for visualization!');
            return;
        }

        let suggestion = `📊 **Chart Recommendations**\n\n`;

        if (numericColumns.length === 1) {
            suggestion += `• **Bar Chart**: Great for comparing values across ${numericColumns[0]}\n`;
            suggestion += `• **Line Chart**: Perfect if your data has a time order\n`;
            suggestion += `• **Pie Chart**: Shows distribution of ${numericColumns[0]} values\n`;
        } else {
            suggestion += `• **Multiple Bar Charts**: Compare different metrics side by side\n`;
            suggestion += `• **Scatter Plot**: See relationships between variables\n`;
            suggestion += `• **Radar Chart**: Compare multiple dimensions at once\n`;
        }

        suggestion += `\n💡 Try switching chart types using the buttons above your charts!`;

        this.addMessage('bot', suggestion);
    }

    respondWithHelp() {
        const help = `🤖 **AI Assistant Help**\n\n` +
            `I can help you with:\n\n` +
            `📊 **Data Questions**\n` +
            `• "How many rows do I have?"\n` +
            `• "Show me all columns"\n` +
            `• "Give me a data summary"\n\n` +
            `📈 **Analysis**\n` +
            `• "What charts should I use?"\n` +
            `• "Show statistics"\n` +
            `• "Find insights in my data"\n\n` +
            `🔧 **Actions**\n` +
            `• "How to share my dashboard?"\n` +
            `• "How to export data?"\n` +
            `• "How to filter data?"\n\n` +
            `Just type your question naturally and I'll help!`;

        this.addMessage('bot', help);
    }

    respondWithStatistics() {
        if (!this.context || !this.context.data) {
            this.addMessage('bot', 'No data loaded yet. Please upload an Excel file first!');
            return;
        }

        const columns = this.context.columns;
        const stats = [];

        columns.forEach(col => {
            const values = this.context.data.map(row => row[col]).filter(v => v !== undefined && v !== null);
            const numericValues = values.filter(v => typeof v === 'number' || !isNaN(parseFloat(v))).map(v => parseFloat(v));

            if (numericValues.length === values.length && numericValues.length > 0) {
                const sum = numericValues.reduce((a, b) => a + b, 0);
                const mean = sum / numericValues.length;
                const min = Math.min(...numericValues);
                const max = Math.max(...numericValues);
                stats.push(`• **${col}**: mean=${mean.toFixed(2)}, min=${min}, max=${max}`);
            } else {
                const unique = new Set(values.map(v => String(v)));
                stats.push(`• **${col}**: ${unique.size} unique values, ${values.length} total entries`);
            }
        });

        this.addMessage('bot', `📊 **Column Statistics**\n\n${stats.join('\n')}`);
    }

    respondWithFilterHelp() {
        this.addMessage('bot', `🔍 **Filtering Data**\n\n` +
            `To filter your data:\n` +
            `1️⃣ Go to the **Analytics** page\n` +
            `2️⃣ Use the search box to find specific values\n` +
            `3️⃣ Use column filters to focus on specific columns\n` +
            `4️⃣ The table will update automatically!\n\n` +
            `💡 You can also sort columns by clicking on the headers.`);
    }

    respondWithShareHelp() {
        this.addMessage('bot', `🔗 **Sharing Your Dashboard**\n\n` +
            `Ways to share:\n\n` +
            `📎 **Share Link**: Click "Copy URL" to get a shareable link\n` +
            `📱 **QR Code**: Generate a QR code for mobile viewing\n` +
            `📄 **Export Options**:\n` +
            `   • PDF - Print-ready dashboard\n` +
            `   • CSV - Raw data export\n` +
            `   • JSON - Developer-friendly format\n\n` +
            `💡 All shares are free and require no login!`);
    }

    respondWithGeneral(query) {
        const responses = [
            `That's an interesting question! To get the best insights from your data, try asking about specific columns, statistics, or visualization tips. Here's what I can help with:`,

            `I'm not sure about that specific query, but I can help you analyze your data, suggest charts, or explain features. Try asking "help" to see what I can do!`,

            `Great question! While I'm specialized in data analysis, I can help you with data exploration, visualization suggestions, and using DataViz Pro features. What would you like to know more about?`
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        this.addMessage('bot', randomResponse + `\n\n🤔 Try asking something like "Give me a data summary" or "What charts should I use?"`);
    }

    addMessage(sender, text) {
        const messagesContainer = document.getElementById('aiMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ${sender}`;

        const icon = sender === 'bot' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';

        messageDiv.innerHTML = `
            ${icon}
            <p style="white-space: pre-line;">${text}</p>
        `;

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        this.conversationHistory.push({ sender, text, timestamp: new Date() });

        // Keep only last 50 messages
        if (this.conversationHistory.length > 50) {
            this.conversationHistory.shift();
        }
    }

    toggleAssistant() {
        const assistant = document.getElementById('aiAssistant');
        const toggleIcon = document.querySelector('#toggleAiBtn i');

        assistant.classList.toggle('minimized');

        if (assistant.classList.contains('minimized')) {
            toggleIcon.className = 'fas fa-chevron-up';
        } else {
            toggleIcon.className = 'fas fa-chevron-down';
        }
    }
}

// Initialize AI Assistant
document.addEventListener('DOMContentLoaded', () => {
    window.aiAssistant = new AIAssistant();

    // Update AI context when data changes
    const updateAIContext = () => {
        if (window.app && window.app.currentData) {
            window.aiAssistant.setContext(window.app.currentData, window.app.currentFileName);
        }
    };

    // Listen for data updates
    const originalSetData = window.app?.renderCharts;
    if (originalSetData) {
        // Will be called when data is loaded
        setTimeout(updateAIContext, 1000);
    }
});