// Web Worker for heavy data processing
self.addEventListener('message', function(e) {
    const { type, data, options } = e.data;

    switch(type) {
        case 'PROCESS_LARGE_DATASET':
            processLargeDataset(data, options);
            break;
        case 'AGGREGATE_DATA':
            aggregateData(data, options);
            break;
        case 'CALCULATE_STATS':
            calculateStatistics(data);
            break;
        default:
            self.postMessage({ error: 'Unknown operation type' });
    }
});

function processLargeDataset(data, options) {
    try {
        const chunkSize = options.chunkSize || 10000;
        const results = [];

        for (let i = 0; i < data.length; i += chunkSize) {
            const chunk = data.slice(i, i + chunkSize);
            const processed = chunk.map(row => {
                // Process each row
                const newRow = {};
                Object.entries(row).forEach(([key, value]) => {
                    if (typeof value === 'string' && !isNaN(parseFloat(value))) {
                        newRow[key] = parseFloat(value);
                    } else {
                        newRow[key] = value;
                    }
                });
                return newRow;
            });
            results.push(...processed);

            // Report progress
            self.postMessage({
                type: 'progress',
                progress: Math.min(100, Math.floor((i + chunk.length) / data.length * 100))
            });
        }

        self.postMessage({ type: 'complete', data: results });
    } catch (error) {
        self.postMessage({ type: 'error', error: error.message });
    }
}

function aggregateData(data, options) {
    try {
        const groupBy = options.groupBy;
        const aggregations = options.aggregations;
        const result = {};

        data.forEach(row => {
            const key = row[groupBy];
            if (!result[key]) {
                result[key] = { count: 0, sums: {}, values: {} };
            }

            result[key].count++;

            aggregations.forEach(agg => {
                const value = parseFloat(row[agg.column]);
                if (!isNaN(value)) {
                    if (!result[key].sums[agg.column]) {
                        result[key].sums[agg.column] = 0;
                        result[key].values[agg.column] = [];
                    }
                    result[key].sums[agg.column] += value;
                    result[key].values[agg.column].push(value);
                }
            });
        });

        // Calculate final aggregates
        const finalResult = [];
        Object.entries(result).forEach(([key, value]) => {
            const entry = { [groupBy]: key, count: value.count };

            aggregations.forEach(agg => {
                const sum = value.sums[agg.column] || 0;
                const vals = value.values[agg.column] || [];

                switch(agg.type) {
                    case 'sum':
                        entry[`sum_${agg.column}`] = sum;
                        break;
                    case 'avg':
                        entry[`avg_${agg.column}`] = sum / (value.count || 1);
                        break;
                    case 'min':
                        entry[`min_${agg.column}`] = Math.min(...vals);
                        break;
                    case 'max':
                        entry[`max_${agg.column}`] = Math.max(...vals);
                        break;
                }
            });

            finalResult.push(entry);
        });

        self.postMessage({ type: 'complete', data: finalResult });
    } catch (error) {
        self.postMessage({ type: 'error', error: error.message });
    }
}

function calculateStatistics(data) {
    try {
        if (!data || data.length === 0) {
            self.postMessage({ type: 'complete', data: {} });
            return;
        }

        const columns = Object.keys(data[0]);
        const statistics = {};

        columns.forEach(col => {
            const values = data.map(row => parseFloat(row[col])).filter(v => !isNaN(v));

            if (values.length > 0) {
                const sum = values.reduce((a, b) => a + b, 0);
                const mean = sum / values.length;
                const sorted = values.sort((a, b) => a - b);
                const median = sorted[Math.floor(sorted.length / 2)];
                const mode = getMode(values);
                const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
                const stdDev = Math.sqrt(variance);

                statistics[col] = {
                    count: values.length,
                    sum: sum,
                    mean: mean,
                    median: median,
                    mode: mode,
                    min: Math.min(...values),
                    max: Math.max(...values),
                    variance: variance,
                    stdDev: stdDev,
                    range: Math.max(...values) - Math.min(...values)
                };
            }
        });

        self.postMessage({ type: 'complete', data: statistics });
    } catch (error) {
        self.postMessage({ type: 'error', error: error.message });
    }
}

function getMode(arr) {
    const frequency = {};
    let maxFreq = 0;
    let mode = null;

    arr.forEach(val => {
        frequency[val] = (frequency[val] || 0) + 1;
        if (frequency[val] > maxFreq) {
            maxFreq = frequency[val];
            mode = val;
        }
    });

    return mode;
}