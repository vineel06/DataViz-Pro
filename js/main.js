// DataViz Pro - Main Application (Fixed Version)
class DataVizPro {
    constructor() {
        this.currentData = null;
        this.currentFileName = null;
        this.charts = [];
        this.currentChartType = 'bar';
        this.currentPage = 'dashboard';
        this.currentPageNum = 1;
        this.rowsPerPage = 20;
        this.filteredData = null;

        this.init();
    }

    init() {
        this.bindEvents();
        this.loadStoredData();
        this.initTheme();
        this.updateStorageInfo();
        this.setupPerformanceMonitoring();
        this.initNeonEffects();

        this.showNotification('✨ Welcome to DataViz Pro! Upload an Excel file to get started.', 'success');
    }

    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const page = item.dataset.page;
                this.switchPage(page);
            });
        });

        // Upload
        const uploadZone = document.getElementById('uploadZone');
        const fileInput = document.getElementById('fileInput');
        const browseBtn = document.getElementById('browseBtn');

        uploadZone.addEventListener('click', () => fileInput.click());
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = '#7c3aed';
            uploadZone.style.transform = 'scale(1.02)';
        });
        uploadZone.addEventListener('dragleave', () => {
            uploadZone.style.borderColor = 'rgba(124, 58, 237, 0.5)';
            uploadZone.style.transform = 'scale(1)';
        });
        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            const files = Array.from(e.dataTransfer.files);
            this.handleFiles(files);
            uploadZone.style.transform = 'scale(1)';
        });

        browseBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            this.handleFiles(files);
            fileInput.value = '';
        });

        // Chart type selection - All 12 types
        document.querySelectorAll('.chart-type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.chart-type-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentChartType = btn.dataset.chartType;
                if (this.currentData) {
                    this.renderCharts(this.currentData);
                    this.showNotification(`Switched to ${this.currentChartType} charts 📊`, 'info');
                }
            });
        });

        // Sample data
        document.getElementById('sampleDataBtn')?.addEventListener('click', () => this.loadSampleData());

        // Clear all
        document.getElementById('clearAllBtn')?.addEventListener('click', () => this.clearAllData());

        // Refresh charts
        document.getElementById('refreshChartsBtn')?.addEventListener('click', () => {
            if (this.currentData) {
                this.renderCharts(this.currentData);
                this.showNotification('Charts refreshed! 🔄', 'success');
            }
        });

        // Export
        document.getElementById('exportAllChartsBtn')?.addEventListener('click', () => this.exportAllCharts());
        document.getElementById('exportPdfBtn')?.addEventListener('click', () => this.exportToPDF());
        document.getElementById('exportCsvBtn')?.addEventListener('click', () => this.exportToCSV());
        document.getElementById('exportJsonBtn')?.addEventListener('click', () => this.exportToJSON());
        document.getElementById('exportAllDataBtn')?.addEventListener('click', () => this.exportAllSavedData());

        // Share - Fixed
        document.getElementById('generateShareUrlBtn')?.addEventListener('click', () => this.generateShareUrl());
        document.getElementById('copyUrlBtn')?.addEventListener('click', () => this.copyShareUrl());
        document.getElementById('generateQrBtn')?.addEventListener('click', () => this.generateQRCode());

        // Settings - Fixed Dark Mode
        const settingsDarkMode = document.getElementById('settingsDarkMode');
        const themeSwitch = document.getElementById('themeSwitch');

        if (settingsDarkMode) {
            settingsDarkMode.addEventListener('change', (e) => {
                this.toggleTheme(!e.target.checked);
                if (themeSwitch) themeSwitch.checked = !e.target.checked;
            });
        }

        if (themeSwitch) {
            themeSwitch.addEventListener('change', (e) => {
                this.toggleTheme(e.target.checked);
                if (settingsDarkMode) settingsDarkMode.checked = !e.target.checked;
            });
        }

        document.getElementById('autoSave')?.addEventListener('change', (e) => this.saveSetting('autoSave', e.target.checked));
        document.getElementById('showGridLines')?.addEventListener('change', (e) => this.saveSetting('showGridLines', e.target.checked));
        document.getElementById('neonEffects')?.addEventListener('change', (e) => this.toggleNeonEffects(e.target.checked));
        document.getElementById('defaultChartType')?.addEventListener('change', (e) => {
            this.saveSetting('defaultChartType', e.target.value);
            this.currentChartType = e.target.value;
        });
        document.getElementById('clearStorageBtn')?.addEventListener('click', () => this.clearLocalStorage());

        // Table pagination
        document.getElementById('prevPageBtn')?.addEventListener('click', () => this.changePage(-1));
        document.getElementById('nextPageBtn')?.addEventListener('click', () => this.changePage(1));

        // Table search
        document.getElementById('tableSearch')?.addEventListener('input', (e) => this.filterDataTable(e.target.value));
        document.getElementById('columnFilter')?.addEventListener('change', (e) => this.filterDataTable(null, e.target.value));

        // Donate
        document.getElementById('donateBtn')?.addEventListener('click', () => {
            window.open('https://buymeacoffee.com/datavizpro', '_blank');
            this.showNotification('Thank you for your support! ❤️', 'success');
        });

        // Mobile menu
        document.getElementById('mobileMenuBtn')?.addEventListener('click', () => {
            document.querySelector('.sidebar').classList.toggle('open');
        });

        // AI Assistant
        const enableAi = document.getElementById('enableAi');
        if (enableAi) {
            enableAi.addEventListener('change', (e) => {
                this.aiEnabled = e.target.checked;
                if (this.aiEnabled) {
                    this.addAIMessage('bot', 'AI Assistant re-enabled! Ask me about your data 📊');
                } else {
                    this.addAIMessage('bot', 'AI Assistant disabled. Enable in settings to get insights.');
                }
            });
        }

        const sendBtn = document.getElementById('sendAiBtn');
        const aiInput = document.getElementById('aiInput');

        if (sendBtn) sendBtn.addEventListener('click', () => this.sendAIMessage());
        if (aiInput) aiInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendAIMessage();
        });

        const toggleBtn = document.getElementById('toggleAiBtn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                document.getElementById('aiAssistant').classList.toggle('minimized');
            });
        }
    }

    handleFiles(files) {
        const excelFiles = files.filter(f => f.name.match(/\.(xlsx|xls|csv)$/i));

        if (excelFiles.length === 0) {
            this.showNotification('Please upload valid Excel or CSV files', 'error');
            return;
        }

        excelFiles.forEach(file => {
            this.processExcelFile(file);
        });
    }

    async processExcelFile(file) {
        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet);

                if (jsonData.length === 0) {
                    this.showNotification(`${file.name} is empty`, 'error');
                    return;
                }

                this.currentData = jsonData;
                this.currentFileName = file.name;
                this.filteredData = jsonData;

                this.addToFileList(file.name);

                if (this.settings?.autoSave) {
                    this.saveToLocalStorage(file.name, jsonData);
                }

                this.updateStats(jsonData);
                this.renderCharts(jsonData);
                this.renderDataTable(jsonData);
                this.updateColumnFilter(jsonData);
                this.updateColumnStatistics(jsonData);

                this.showNotification(`✅ ${file.name} loaded successfully!`, 'success');
                this.updateMemoryUsage();

            } catch (error) {
                console.error('Error:', error);
                this.showNotification(`Error processing ${file.name}`, 'error');
            }
        };

        reader.readAsArrayBuffer(file);
    }

    renderCharts(data) {
        const chartsGrid = document.getElementById('chartsGrid');
        if (!data || data.length === 0) {
            chartsGrid.innerHTML = `<div class="empty-state"><i class="fas fa-chart-line"></i><p>Upload an Excel file to see charts</p></div>`;
            return;
        }

        const columns = Object.keys(data[0]);
        const numericColumns = [];

        columns.forEach(col => {
            const isNumeric = data.slice(0, 100).every(row => {
                const val = row[col];
                return val === undefined || val === null || typeof val === 'number' || !isNaN(parseFloat(val));
            });
            if (isNumeric) numericColumns.push(col);
        });

        if (numericColumns.length === 0) {
            chartsGrid.innerHTML = `<div class="empty-state"><i class="fas fa-chart-line"></i><p>No numeric columns found for visualization</p></div>`;
            return;
        }

        this.charts.forEach(chart => {
            if (chart && chart.destroy) chart.destroy();
        });
        this.charts = [];

        chartsGrid.innerHTML = '';

        numericColumns.forEach((col, index) => {
            const chartCard = document.createElement('div');
            chartCard.className = 'chart-card';
            chartCard.style.animationDelay = `${index * 0.1}s`;
            chartCard.innerHTML = `
                <div class="chart-header">
                    <div class="chart-title">
                        <i class="fas fa-chart-line"></i> ${col}
                    </div>
                    <div class="chart-actions">
                        <button class="download-chart-btn" data-column="${col}" title="Download Chart">
                            <i class="fas fa-download"></i>
                        </button>
                    </div>
                </div>
                <canvas id="chart_${index}" class="chart-canvas"></canvas>
            `;
            chartsGrid.appendChild(chartCard);

            const ctx = document.getElementById(`chart_${index}`).getContext('2d');

            const labels = data.slice(0, 30).map((_, i) => `${i + 1}`);
            const values = data.slice(0, 30).map(row => {
                const val = row[col];
                return typeof val === 'number' ? val : (parseFloat(val) || 0);
            });

            let chartConfig = this.getChartConfig(this.currentChartType, labels, values, col);
            const chart = new Chart(ctx, chartConfig);
            this.charts.push(chart);

            chartCard.querySelector('.download-chart-btn').addEventListener('click', () => {
                this.downloadChartAsImage(chartCard, col);
            });
        });

        document.getElementById('totalCharts').textContent = numericColumns.length;
    }

    getChartConfig(type, labels, values, title) {
        const speed = parseInt(document.getElementById('animationSpeed')?.value || 500);

        const baseOptions = {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: speed,
                easing: 'easeInOutQuart'
            },
            plugins: {
                legend: {
                    labels: {
                        color: document.body.classList.contains('light-mode') ? '#1a1a2e' : '#c084fc',
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    backgroundColor: '#1a1a2e',
                    titleColor: '#c084fc',
                    bodyColor: '#e0e0e0',
                    borderColor: '#7c3aed',
                    borderWidth: 1
                }
            }
        };

        const colorPalette = [
            'rgba(14, 165, 233, 0.8)',
            'rgba(124, 58, 237, 0.8)',
            'rgba(236, 72, 153, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(168, 85, 247, 0.8)'
        ];

        switch(type) {
            case 'bar':
                return {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: title,
                            data: values,
                            backgroundColor: 'rgba(14, 165, 233, 0.7)',
                            borderColor: 'rgba(14, 165, 233, 1)',
                            borderWidth: 2,
                            borderRadius: 8,
                            hoverBackgroundColor: 'rgba(14, 165, 233, 0.9)'
                        }]
                    },
                    options: {
                        ...baseOptions,
                        scales: {
                            y: {
                                grid: { color: 'rgba(124, 58, 237, 0.1)' },
                                ticks: { color: document.body.classList.contains('light-mode') ? '#666' : '#e0e0e0' }
                            },
                            x: {
                                grid: { display: false },
                                ticks: { color: document.body.classList.contains('light-mode') ? '#666' : '#e0e0e0' }
                            }
                        }
                    }
                };

            case 'line':
                return {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: title,
                            data: values,
                            borderColor: 'rgba(14, 165, 233, 1)',
                            backgroundColor: 'rgba(14, 165, 233, 0.1)',
                            borderWidth: 3,
                            tension: 0.4,
                            fill: true,
                            pointBackgroundColor: '#7c3aed',
                            pointBorderColor: '#fff',
                            pointRadius: 4,
                            pointHoverRadius: 6
                        }]
                    },
                    options: {
                        ...baseOptions,
                        scales: {
                            y: { grid: { color: 'rgba(124, 58, 237, 0.1)' }, ticks: { color: '#e0e0e0' } },
                            x: { ticks: { color: '#e0e0e0' } }
                        }
                    }
                };

            case 'pie':
                return {
                    type: 'pie',
                    data: {
                        labels: labels.slice(0, 10),
                        datasets: [{
                            data: values.slice(0, 10),
                            backgroundColor: colorPalette,
                            borderWidth: 2,
                            borderColor: '#1a1a2e'
                        }]
                    },
                    options: {
                        ...baseOptions,
                        plugins: {
                            ...baseOptions.plugins,
                            legend: { position: 'right', labels: { color: '#c084fc' } }
                        }
                    }
                };

            case 'doughnut':
                return {
                    type: 'doughnut',
                    data: {
                        labels: labels.slice(0, 10),
                        datasets: [{
                            data: values.slice(0, 10),
                            backgroundColor: colorPalette,
                            borderWidth: 2,
                            borderColor: '#1a1a2e',
                            cutout: '60%'
                        }]
                    },
                    options: baseOptions
                };

            case 'polarArea':
                return {
                    type: 'polarArea',
                    data: {
                        labels: labels.slice(0, 10),
                        datasets: [{
                            data: values.slice(0, 10),
                            backgroundColor: colorPalette,
                            borderWidth: 2
                        }]
                    },
                    options: baseOptions
                };

            case 'radar':
                return {
                    type: 'radar',
                    data: {
                        labels: labels.slice(0, 10),
                        datasets: [{
                            label: title,
                            data: values.slice(0, 10),
                            borderColor: 'rgba(14, 165, 233, 1)',
                            backgroundColor: 'rgba(14, 165, 233, 0.2)',
                            borderWidth: 2,
                            pointBackgroundColor: '#7c3aed'
                        }]
                    },
                    options: {
                        ...baseOptions,
                        scales: {
                            r: {
                                ticks: { color: '#c084fc' },
                                grid: { color: 'rgba(124, 58, 237, 0.2)' },
                                angleLines: { color: 'rgba(124, 58, 237, 0.2)' }
                            }
                        }
                    }
                };

            case 'scatter':
                return {
                    type: 'scatter',
                    data: {
                        datasets: [{
                            label: title,
                            data: values.map((val, idx) => ({ x: idx, y: val })),
                            backgroundColor: 'rgba(14, 165, 233, 0.7)',
                            pointRadius: 6,
                            pointHoverRadius: 8
                        }]
                    },
                    options: {
                        ...baseOptions,
                        scales: {
                            x: {
                                title: { display: true, text: 'Index', color: '#c084fc' },
                                ticks: { color: '#e0e0e0' }
                            },
                            y: {
                                title: { display: true, text: title, color: '#c084fc' },
                                ticks: { color: '#e0e0e0' }
                            }
                        }
                    }
                };

            case 'bubble':
                return {
                    type: 'bubble',
                    data: {
                        datasets: [{
                            label: title,
                            data: values.map((val, idx) => ({ x: idx, y: val, r: Math.abs(val / 10) + 5 })),
                            backgroundColor: 'rgba(14, 165, 233, 0.6)'
                        }]
                    },
                    options: baseOptions
                };

            case 'horizontalBar':
                return {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: title,
                            data: values,
                            backgroundColor: 'rgba(124, 58, 237, 0.7)',
                            borderColor: 'rgba(124, 58, 237, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        ...baseOptions,
                        indexAxis: 'y',
                        scales: {
                            y: { ticks: { color: '#e0e0e0' } },
                            x: { ticks: { color: '#e0e0e0' } }
                        }
                    }
                };

            case 'area':
                return {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: title,
                            data: values,
                            borderColor: 'rgba(14, 165, 233, 1)',
                            backgroundColor: 'rgba(14, 165, 233, 0.4)',
                            fill: true,
                            tension: 0.3
                        }]
                    },
                    options: baseOptions
                };

            case 'candlestick':
                // Custom candlestick-like bar chart
                return {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: title,
                            data: values,
                            backgroundColor: values.map(v => v >= 0 ? 'rgba(34, 197, 94, 0.7)' : 'rgba(239, 68, 68, 0.7)'),
                            borderColor: values.map(v => v >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'),
                            borderWidth: 1
                        }]
                    },
                    options: baseOptions
                };

            case 'heatmap':
                return {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: title,
                            data: values,
                            backgroundColor: values.map(v => {
                                const intensity = Math.min(255, Math.abs(v) / Math.max(...values) * 255);
                                return `rgba(124, 58, 237, ${0.3 + intensity / 255 * 0.5})`;
                            }),
                            borderWidth: 0
                        }]
                    },
                    options: baseOptions
                };

            default:
                return this.getChartConfig('bar', labels, values, title);
        }
    }

    updateStats(data) {
        if (!data || data.length === 0) return;
        document.getElementById('totalRows').textContent = data.length.toLocaleString();
        document.getElementById('totalCols').textContent = Object.keys(data[0]).length;
    }

    renderDataTable(data) {
        if (!data || data.length === 0) return;

        const displayData = this.filteredData || data;
        const start = (this.currentPageNum - 1) * this.rowsPerPage;
        const end = start + this.rowsPerPage;
        const pageData = displayData.slice(start, end);
        const columns = Object.keys(data[0]);

        const thead = document.getElementById('tableHead');
        thead.innerHTML = `<table>${columns.map(col => `<th>${col}</th>`).join('')}</tr>`;

        const tbody = document.getElementById('tableBody');
        tbody.innerHTML = pageData.map(row => `
            <tr>
                ${columns.map(col => `<td>${row[col] !== undefined && row[col] !== null ? String(row[col]).substring(0, 50) : '-'}</td>`).join('')}
            </tr>
        `).join('');

        const totalPages = Math.ceil(displayData.length / this.rowsPerPage);
        document.getElementById('pageInfo').textContent = `Page ${this.currentPageNum} of ${totalPages}`;

        const prevBtn = document.getElementById('prevPageBtn');
        const nextBtn = document.getElementById('nextPageBtn');
        if (prevBtn) prevBtn.disabled = this.currentPageNum === 1;
        if (nextBtn) nextBtn.disabled = this.currentPageNum === totalPages;
    }

    filterDataTable(searchText, column) {
        if (!this.currentData) return;

        let filteredData = [...this.currentData];

        if (searchText && searchText.trim()) {
            const search = searchText.toLowerCase();
            filteredData = filteredData.filter(row => {
                return Object.values(row).some(val =>
                    String(val).toLowerCase().includes(search)
                );
            });
        }

        this.filteredData = filteredData;
        this.currentPageNum = 1;
        this.renderDataTable(this.currentData);
        this.showNotification(`Found ${filteredData.length} matching rows`, 'info');
    }

    updateColumnFilter(data) {
        if (!data || data.length === 0) return;
        const columns = Object.keys(data[0]);
        const filterSelect = document.getElementById('columnFilter');
        if (filterSelect) {
            filterSelect.innerHTML = '<option value="">All Columns</option>' +
                columns.map(col => `<option value="${col}">${col}</option>`).join('');
        }
    }

    updateColumnStatistics(data) {
        if (!data || data.length === 0) return;

        const columns = Object.keys(data[0]);
        const statsContainer = document.getElementById('statisticsContent');
        if (!statsContainer) return;

        statsContainer.innerHTML = '';

        columns.forEach(col => {
            const values = data.map(row => row[col]).filter(v => v !== undefined && v !== null);
            const numericValues = values.filter(v => typeof v === 'number' || !isNaN(parseFloat(v))).map(v => parseFloat(v));

            const statDiv = document.createElement('div');
            statDiv.className = 'stat-item';

            if (numericValues.length === values.length && numericValues.length > 0) {
                const sum = numericValues.reduce((a, b) => a + b, 0);
                const mean = sum / numericValues.length;
                const min = Math.min(...numericValues);
                const max = Math.max(...numericValues);
                const median = numericValues.sort((a,b) => a-b)[Math.floor(numericValues.length/2)];

                statDiv.innerHTML = `
                    <div class="stat-name">📊 ${col}</div>
                    <div class="stat-detail">Mean: ${mean.toFixed(2)} | Median: ${median.toFixed(2)}</div>
                    <div class="stat-detail">Min: ${min.toFixed(2)} | Max: ${max.toFixed(2)}</div>
                    <div class="stat-detail">Count: ${numericValues.length.toLocaleString()}</div>
                `;
            } else {
                const unique = new Set(values.map(v => String(v)));
                statDiv.innerHTML = `
                    <div class="stat-name">📝 ${col}</div>
                    <div class="stat-detail">Unique values: ${unique.size.toLocaleString()}</div>
                    <div class="stat-detail">Total entries: ${values.length.toLocaleString()}</div>
                `;
            }

            statsContainer.appendChild(statDiv);
        });
    }

    addToFileList(fileName) {
        const fileList = document.getElementById('fileList');
        const existingFile = Array.from(fileList.children).find(
            child => child.querySelector('.file-name')?.textContent === fileName
        );

        if (existingFile) return;

        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <i class="fas fa-file-excel"></i>
            <span class="file-name">${fileName}</span>
            <button class="file-remove" data-file="${fileName}">
                <i class="fas fa-times"></i>
            </button>
        `;

        fileItem.querySelector('.file-remove').addEventListener('click', () => {
            fileItem.remove();
            if (this.currentFileName === fileName) {
                this.currentData = null;
                this.currentFileName = null;
                this.filteredData = null;
                document.getElementById('chartsGrid').innerHTML = '<div class="empty-state"><i class="fas fa-chart-line"></i><p>No data loaded</p></div>';
                this.updateStats({});
            }
        });

        fileList.appendChild(fileItem);
    }

    loadSampleData() {
        const sampleData = [
            { Month: 'Jan', Sales: 12000, Expenses: 8000, Profit: 4000, Growth: 5.2 },
            { Month: 'Feb', Sales: 15000, Expenses: 9000, Profit: 6000, Growth: 6.8 },
            { Month: 'Mar', Sales: 18000, Expenses: 10000, Profit: 8000, Growth: 7.5 },
            { Month: 'Apr', Sales: 14000, Expenses: 8500, Profit: 5500, Growth: 4.9 },
            { Month: 'May', Sales: 22000, Expenses: 12000, Profit: 10000, Growth: 8.2 },
            { Month: 'Jun', Sales: 25000, Expenses: 13000, Profit: 12000, Growth: 9.1 },
            { Month: 'Jul', Sales: 28000, Expenses: 15000, Profit: 13000, Growth: 10.5 },
            { Month: 'Aug', Sales: 26000, Expenses: 14000, Profit: 12000, Growth: 9.8 },
            { Month: 'Sep', Sales: 23000, Expenses: 12500, Profit: 10500, Growth: 8.7 },
            { Month: 'Oct', Sales: 21000, Expenses: 11000, Profit: 10000, Growth: 7.9 },
            { Month: 'Nov', Sales: 19000, Expenses: 10500, Profit: 8500, Growth: 7.2 },
            { Month: 'Dec', Sales: 24000, Expenses: 13000, Profit: 11000, Growth: 8.9 }
        ];

        this.currentData = sampleData;
        this.currentFileName = 'sample_data.xlsx';
        this.filteredData = sampleData;

        this.addToFileList('sample_data.xlsx');
        this.updateStats(sampleData);
        this.renderCharts(sampleData);
        this.renderDataTable(sampleData);
        this.updateColumnFilter(sampleData);
        this.updateColumnStatistics(sampleData);

        this.showNotification('📊 Sample data loaded successfully!', 'success');
    }

    clearAllData() {
        this.currentData = null;
        this.currentFileName = null;
        this.filteredData = null;
        document.getElementById('fileList').innerHTML = '';
        document.getElementById('chartsGrid').innerHTML = '<div class="empty-state"><i class="fas fa-chart-line"></i><p>Upload an Excel file to see charts</p></div>';
        document.getElementById('tableHead').innerHTML = '';
        document.getElementById('tableBody').innerHTML = '';
        this.updateStats({});
        document.getElementById('totalCharts').textContent = '0';
        this.showNotification('🗑️ All data cleared', 'info');
    }

    switchPage(page) {
        this.currentPage = page;

        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === page) {
                item.classList.add('active');
            }
        });

        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(`${page}Page`).classList.add('active');

        const titles = {
            dashboard: 'Dashboard',
            analytics: 'Analytics',
            files: 'My Files',
            share: 'Share',
            settings: 'Settings'
        };
        document.getElementById('pageTitle').textContent = titles[page] || 'Dashboard';

        if (page === 'analytics' && this.currentData) {
            this.updateColumnStatistics(this.currentData);
        }
        if (page === 'files') {
            this.loadSavedFilesList();
        }
    }

    changePage(delta) {
        const displayData = this.filteredData || this.currentData;
        if (!displayData) return;

        const totalPages = Math.ceil(displayData.length / this.rowsPerPage);
        const newPage = this.currentPageNum + delta;

        if (newPage >= 1 && newPage <= totalPages) {
            this.currentPageNum = newPage;
            this.renderDataTable(this.currentData);
        }
    }

    generateShareUrl() {
        if (!this.currentData) {
            this.showNotification('No data to share. Please load data first!', 'error');
            return;
        }

        try {
            const dataStr = JSON.stringify(this.currentData);
            const compressed = LZString.compressToEncodedURIComponent(dataStr);
            const url = new URL(window.location.href);
            url.searchParams.set('data', compressed);
            const shareUrl = url.toString();

            const shareUrlInput = document.getElementById('shareUrl');
            if (shareUrlInput) {
                shareUrlInput.value = shareUrl;
                this.showNotification('Share URL generated! Click copy to share.', 'success');
            }
        } catch (error) {
            console.error('Share URL error:', error);
            this.showNotification('Data too large for URL. Use JSON export instead.', 'error');
        }
    }

    copyShareUrl() {
        const shareUrlInput = document.getElementById('shareUrl');
        if (!shareUrlInput || !shareUrlInput.value) {
            this.showNotification('Generate a share URL first!', 'error');
            return;
        }

        navigator.clipboard.writeText(shareUrlInput.value);
        this.showNotification('URL copied to clipboard! 🔗', 'success');
    }

    generateQRCode() {
        const shareUrlInput = document.getElementById('shareUrl');
        if (!shareUrlInput || !shareUrlInput.value) {
            this.showNotification('Generate a share URL first!', 'error');
            return;
        }

        const qrContainer = document.getElementById('qrCodeContainer');
        qrContainer.style.display = 'flex';
        qrContainer.innerHTML = '';

        new QRCode(qrContainer, {
            text: shareUrlInput.value,
            width: 200,
            height: 200,
            colorDark: '#7c3aed',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });

        this.showNotification('QR Code generated! Scan to share 📱', 'success');
    }

    downloadChartAsImage(chartCard, title) {
        const canvas = chartCard.querySelector('canvas');
        const link = document.createElement('a');
        link.download = `chart_${title}.png`;
        link.href = canvas.toDataURL();
        link.click();
        this.showNotification('Chart downloaded! 💾', 'success');
    }

    exportAllCharts() {
        if (this.charts.length === 0) {
            this.showNotification('No charts to export', 'error');
            return;
        }

        this.charts.forEach((chart, index) => {
            setTimeout(() => {
                const link = document.createElement('a');
                link.download = `chart_${index + 1}.png`;
                link.href = chart.canvas.toDataURL();
                link.click();
            }, index * 200);
        });

        this.showNotification(`Exporting ${this.charts.length} charts... 📸`, 'success');
    }

    async exportToPDF() {
        const element = document.getElementById('dashboardPage');
        const opt = {
            margin: [0.5, 0.5, 0.5, 0.5],
            filename: 'dataviz_dashboard.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
        };

        try {
            await html2pdf().set(opt).from(element).save();
            this.showNotification('PDF exported! 📄', 'success');
        } catch (error) {
            console.error('PDF error:', error);
            this.showNotification('Error exporting PDF', 'error');
        }
    }

    exportToCSV() {
        if (!this.currentData) {
            this.showNotification('No data to export', 'error');
            return;
        }

        const columns = Object.keys(this.currentData[0]);
        const csvRows = [columns.join(',')];

        for (const row of this.currentData) {
            const values = columns.map(col => {
                const val = row[col];
                const strVal = String(val || '');
                return strVal.includes(',') ? `"${strVal}"` : strVal;
            });
            csvRows.push(values.join(','));
        }

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        saveAs(blob, 'data_export.csv');
        this.showNotification('CSV exported! 📊', 'success');
    }

    exportToJSON() {
        if (!this.currentData) {
            this.showNotification('No data to export', 'error');
            return;
        }

        const blob = new Blob([JSON.stringify(this.currentData, null, 2)], { type: 'application/json' });
        saveAs(blob, 'data_export.json');
        this.showNotification('JSON exported! 💾', 'success');
    }

    exportAllSavedData() {
        const allData = localStorage.getItem('dataviz_files');
        if (!allData) {
            this.showNotification('No saved data found', 'error');
            return;
        }

        const blob = new Blob([allData], { type: 'application/json' });
        saveAs(blob, 'dataviz_backup.json');
        this.showNotification('Backup exported! 💿', 'success');
    }

    saveToLocalStorage(fileName, data) {
        const savedFiles = JSON.parse(localStorage.getItem('dataviz_files') || '{}');
        savedFiles[fileName] = {
            data: data,
            timestamp: new Date().toISOString(),
            size: JSON.stringify(data).length
        };
        localStorage.setItem('dataviz_files', JSON.stringify(savedFiles));
        this.updateStorageInfo();
    }

    loadStoredData() {
        const savedFiles = JSON.parse(localStorage.getItem('dataviz_files') || '{}');
        const fileNames = Object.keys(savedFiles);

        if (fileNames.length > 0 && !this.currentData) {
            const latestFile = fileNames[0];
            this.currentData = savedFiles[latestFile].data;
            this.currentFileName = latestFile;
            this.filteredData = this.currentData;
            this.updateStats(this.currentData);
            this.renderCharts(this.currentData);
            this.renderDataTable(this.currentData);

            fileNames.forEach(name => this.addToFileList(name));
        }
    }

    loadSavedFilesList() {
        const savedFiles = JSON.parse(localStorage.getItem('dataviz_files') || '{}');
        const container = document.getElementById('savedFilesList');

        if (!container) return;

        if (Object.keys(savedFiles).length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-database"></i><p>No saved files found</p></div>';
            return;
        }

        container.innerHTML = Object.entries(savedFiles).map(([name, info]) => `
            <div class="file-item">
                <i class="fas fa-file-excel"></i>
                <div class="file-info" style="flex:1">
                    <div class="file-name">${name}</div>
                    <div class="file-date" style="font-size:11px;color:#888">${new Date(info.timestamp).toLocaleString()}</div>
                </div>
                <button class="load-file-btn btn-secondary" data-file="${name}" style="padding:6px 12px">Load</button>
                <button class="delete-file-btn danger-btn" data-file="${name}" style="padding:6px 12px;margin:0">Del</button>
            </div>
        `).join('');

        document.querySelectorAll('.load-file-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const fileName = btn.dataset.file;
                const savedFiles = JSON.parse(localStorage.getItem('dataviz_files') || '{}');
                if (savedFiles[fileName]) {
                    this.currentData = savedFiles[fileName].data;
                    this.currentFileName = fileName;
                    this.filteredData = this.currentData;
                    this.updateStats(this.currentData);
                    this.renderCharts(this.currentData);
                    this.renderDataTable(this.currentData);
                    this.switchPage('dashboard');
                    this.showNotification(`Loaded ${fileName} 📁`, 'success');
                }
            });
        });

        document.querySelectorAll('.delete-file-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const fileName = btn.dataset.file;
                const savedFiles = JSON.parse(localStorage.getItem('dataviz_files') || '{}');
                delete savedFiles[fileName];
                localStorage.setItem('dataviz_files', JSON.stringify(savedFiles));
                this.loadSavedFilesList();
                this.updateStorageInfo();
                this.showNotification(`Deleted ${fileName} 🗑️`, 'info');
            });
        });
    }

    clearLocalStorage() {
        if (confirm('⚠️ Are you sure you want to clear all saved data? This cannot be undone.')) {
            localStorage.removeItem('dataviz_files');
            localStorage.removeItem('dataviz_settings');
            this.loadSavedFilesList();
            this.updateStorageInfo();
            this.showNotification('All saved data cleared 🗑️', 'info');
        }
    }

    updateStorageInfo() {
        let totalSize = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            totalSize += (value?.length || 0);
        }
        const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
        document.getElementById('storageUsed').textContent = `${sizeInMB} MB`;
    }

    updateMemoryUsage() {
        if (performance.memory) {
            const usedMB = (performance.memory.usedJSHeapSize / (1024 * 1024)).toFixed(2);
            document.getElementById('memoryUsage').textContent = `${usedMB} MB`;
        } else {
            document.getElementById('memoryUsage').textContent = 'N/A';
        }
    }

    setupPerformanceMonitoring() {
        setInterval(() => this.updateMemoryUsage(), 5000);
    }

    initTheme() {
        const savedSettings = localStorage.getItem('dataviz_settings');
        let isDarkMode = true;

        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            isDarkMode = settings.darkMode !== false;
        }

        const themeSwitch = document.getElementById('themeSwitch');
        const settingsDarkMode = document.getElementById('settingsDarkMode');

        if (!isDarkMode) {
            document.body.classList.add('light-mode');
            if (themeSwitch) themeSwitch.checked = true;
            if (settingsDarkMode) settingsDarkMode.checked = false;
        } else {
            document.body.classList.remove('light-mode');
            if (themeSwitch) themeSwitch.checked = false;
            if (settingsDarkMode) settingsDarkMode.checked = true;
        }
    }

    toggleTheme(isLightMode) {
        if (isLightMode) {
            document.body.classList.add('light-mode');
            this.saveSetting('darkMode', false);
        } else {
            document.body.classList.remove('light-mode');
            this.saveSetting('darkMode', true);
        }

        if (this.currentData) {
            this.renderCharts(this.currentData);
        }

        this.showNotification(isLightMode ? 'Light mode activated ☀️' : 'Dark mode activated 🌙', 'info');
    }

    initNeonEffects() {
        const savedSettings = localStorage.getItem('dataviz_settings');
        let neonEnabled = true;

        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            neonEnabled = settings.neonEffects !== false;
        }

        const neonSwitch = document.getElementById('neonEffects');
        if (neonSwitch) {
            neonSwitch.checked = neonEnabled;
            if (!neonEnabled) this.toggleNeonEffects(false);
        }
    }

    toggleNeonEffects(enabled) {
        this.saveSetting('neonEffects', enabled);
        if (!enabled) {
            document.querySelectorAll('.neon-glow, .neon-border').forEach(el => {
                el.style.animation = 'none';
                el.style.boxShadow = 'none';
            });
        } else {
            document.querySelectorAll('.neon-glow, .neon-border').forEach(el => {
                el.style.animation = '';
                el.style.boxShadow = '';
            });
        }
    }

    saveSetting(key, value) {
        const settings = JSON.parse(localStorage.getItem('dataviz_settings') || '{}');
        settings[key] = value;
        localStorage.setItem('dataviz_settings', JSON.stringify(settings));
    }

    // AI Assistant Methods
    aiEnabled = true;

    sendAIMessage() {
        const input = document.getElementById('aiInput');
        const message = input.value.trim();

        if (!message) return;

        this.addAIMessage('user', message);
        input.value = '';

        if (!this.aiEnabled) {
            this.addAIMessage('bot', 'AI Assistant is disabled. Enable it in Settings to get insights.');
            return;
        }

        this.processAIQuery(message);
    }

    processAIQuery(query) {
        const lowerQuery = query.toLowerCase();

        setTimeout(() => {
            if (lowerQuery.includes('statistics') || lowerQuery.includes('stats')) {
                this.aiRespondWithStats();
            } else if (lowerQuery.includes('chart') || lowerQuery.includes('visualize')) {
                this.aiRespondWithChartSuggestion();
            } else if (lowerQuery.includes('rows') || lowerQuery.includes('how many')) {
                this.aiRespondWithRowCount();
            } else if (lowerQuery.includes('columns')) {
                this.aiRespondWithColumns();
            } else if (lowerQuery.includes('summary') || lowerQuery.includes('overview')) {
                this.aiRespondWithSummary();
            } else if (lowerQuery.includes('help')) {
                this.aiRespondWithHelp();
            } else {
                this.aiRespondWithGeneral();
            }
        }, 300);
    }

    aiRespondWithStats() {
        if (!this.currentData) {
            this.addAIMessage('bot', 'No data loaded yet! Please upload an Excel file first.');
            return;
        }

        const columns = Object.keys(this.currentData[0]);
        const numericCols = columns.filter(col => {
            return this.currentData.slice(0, 50).some(row => typeof row[col] === 'number');
        });

        let response = `📊 **Data Statistics**\n\n`;
        response += `• Total Rows: ${this.currentData.length.toLocaleString()}\n`;
        response += `• Total Columns: ${columns.length}\n`;
        response += `• Numeric Columns: ${numericCols.length}\n`;
        response += `• File: ${this.currentFileName}\n\n`;

        if (numericCols.length > 0) {
            response += `📈 **Top Numeric Columns**:\n`;
            numericCols.slice(0, 3).forEach(col => {
                const values = this.currentData.map(r => parseFloat(r[col])).filter(v => !isNaN(v));
                const avg = values.reduce((a,b) => a+b, 0) / values.length;
                response += `• ${col}: avg = ${avg.toFixed(2)}\n`;
            });
        }

        this.addAIMessage('bot', response);
    }

    aiRespondWithChartSuggestion() {
        if (!this.currentData) {
            this.addAIMessage('bot', 'Upload data first, then I can suggest charts!');
            return;
        }

        const response = `📊 **Chart Recommendations**\n\n` +
            `Based on your data:\n\n` +
            `📈 **Bar Chart** - Best for comparing categories\n` +
            `📉 **Line Chart** - Perfect for trends over time\n` +
            `🥧 **Pie/Doughnut** - Shows composition/distribution\n` +
            `🎯 **Radar Chart** - Compare multiple metrics\n` +
            `💎 **Scatter Plot** - Find correlations\n\n` +
            `💡 Try the chart selector above your dashboard to switch between ${document.querySelectorAll('.chart-type-btn').length} chart types!`;

        this.addAIMessage('bot', response);
    }

    aiRespondWithRowCount() {
        if (!this.currentData) {
            this.addAIMessage('bot', 'No data loaded. Upload an Excel file to analyze!');
            return;
        }
        this.addAIMessage('bot', `📊 Your dataset "${this.currentFileName}" contains **${this.currentData.length.toLocaleString()} rows** of data.`);
    }

    aiRespondWithColumns() {
        if (!this.currentData) {
            this.addAIMessage('bot', 'No data loaded. Upload a file first!');
            return;
        }
        const columns = Object.keys(this.currentData[0]);
        this.addAIMessage('bot', `📋 Your data has **${columns.length} columns**:\n\n${columns.join(', ')}`);
    }

    aiRespondWithSummary() {
        if (!this.currentData) {
            this.addAIMessage('bot', 'No data to summarize. Upload a file!');
            return;
        }

        const columns = Object.keys(this.currentData[0]);
        const sampleRow = this.currentData[0];

        let response = `📋 **Data Summary**\n\n`;
        response += `File: ${this.currentFileName}\n`;
        response += `Rows: ${this.currentData.length.toLocaleString()}\n`;
        response += `Columns: ${columns.length}\n\n`;
        response += `**Sample Row**:\n`;
        Object.entries(sampleRow).slice(0, 5).forEach(([key, val]) => {
            response += `• ${key}: ${String(val).substring(0, 30)}\n`;
        });

        this.addAIMessage('bot', response);
    }

    aiRespondWithHelp() {
        const response = `🤖 **AI Assistant Help**\n\n` +
            `Ask me things like:\n\n` +
            `📊 "Show me statistics"\n` +
            `📈 "What charts should I use?"\n` +
            `📋 "Summarize my data"\n` +
            `🔢 "How many rows?"\n` +
            `📑 "List all columns"\n\n` +
            `I can help analyze your data and suggest visualizations!`;

        this.addAIMessage('bot', response);
    }

    aiRespondWithGeneral() {
        const responses = [
            `I can help analyze your data! Try asking "Show me statistics" or "What charts should I use?"`,
            `Need insights? Ask me about your data's statistics, rows, columns, or chart recommendations!`,
            `I'm here to help! Try questions like "Summarize my data" or "How many rows do I have?"`
        ];
        this.addAIMessage('bot', responses[Math.floor(Math.random() * responses.length)]);
    }

    addAIMessage(sender, text) {
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

        if (messagesContainer.children.length > 50) {
            messagesContainer.removeChild(messagesContainer.children[0]);
        }
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        container.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.app = new DataVizPro();
});