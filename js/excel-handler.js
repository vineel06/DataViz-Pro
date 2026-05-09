// Excel File Handler Extension
class ExcelHandler {
    static async parseExcelFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const result = {};

                    // Parse all sheets
                    workbook.SheetNames.forEach(sheetName => {
                        const worksheet = workbook.Sheets[sheetName];
                        const jsonData = XLSX.utils.sheet_to_json(worksheet);
                        result[sheetName] = jsonData;
                    });

                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }

    static async parseCSVFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const text = e.target.result;
                    const lines = text.split('\n');
                    const headers = lines[0].split(',').map(h => h.trim());
                    const data = [];

                    for (let i = 1; i < lines.length; i++) {
                        if (lines[i].trim()) {
                            const values = lines[i].split(',');
                            const row = {};
                            headers.forEach((header, idx) => {
                                row[header] = values[idx] ? values[idx].trim() : '';
                            });
                            data.push(row);
                        }
                    }

                    resolve({ Sheet1: data });
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    static generateExcelFile(data, fileName) {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
        XLSX.writeFile(workbook, fileName);
    }

    static mergeExcelFiles(files) {
        let mergedData = [];

        files.forEach(fileData => {
            mergedData = mergedData.concat(fileData);
        });

        return mergedData;
    }

    static validateExcelData(data) {
        if (!data || data.length === 0) {
            return { valid: false, message: 'No data found' };
        }

        if (data.length > 100000) {
            return { valid: false, message: 'Dataset too large (max 100,000 rows)' };
        }

        return { valid: true, message: 'Data valid' };
    }
}