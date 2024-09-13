const conversionTableInput = document.getElementById('conversionTable');
const eFileInput = document.getElementById('eFile');
const dFileInput = document.getElementById('dFile');
const ff1FileInput = document.getElementById('ff1File');
const convertButton = document.getElementById('convertButton');
// ダウンロードボタンと処理中表示要素を取得
const eFileDownloadLink = document.getElementById('eFileDownloadLink');
const eFileProgress = document.getElementById('eFileProgress'); // 新規追加
const dFileDownloadLink = document.getElementById('dFileDownloadLink');
const dFileProgress = document.getElementById('dFileProgress'); // 新規追加
const ff1FileDownloadLink = document.getElementById('ff1FileDownloadLink');
const ff1FileProgress = document.getElementById('ff1FileProgress'); // 新規追加

// 変換されなかったデータを格納するオブジェクトを定義
let unconvertedData = {};

document.getElementById('conversionTable').addEventListener('change', function (e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        const csvData = e.target.result;
        const isValid = validateCSV(csvData);

        if (!isValid) {
            alert('変換表のフォーマットが不正です。');
        }
    }
});

function validateCSV(csvData) {
    const lines = csvData.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === "") continue; // Skip empty lines

        const values = line.split(',');
        if (values.length !== 2) {
            console.error(`Line ${i + 1}: Invalid number of values.`);
            return false;
        }

        const doctorCode = values[0].trim().padStart(4, '0');
        const departmentCode = values[1].trim().padStart(3, '0');

        if (!/^\d{4}$/.test(doctorCode) || !/^\d{3}$/.test(departmentCode)) {
            console.error(`Line ${i + 1}: Invalid format for doctor code or department code.`);
            return false;
        }
    }
    return true;
}

convertButton.addEventListener('click', () => {
    unconvertedData = {};
    const conversionTableFile = conversionTableInput.files[0];
    const eFile = eFileInput.files[0];
    const dFile = dFileInput.files[0];
    const ff1File = ff1FileInput.files[0];

    // ファイル名検証
    if (!validateFileName(eFile, 'E') || !validateFileName(dFile, 'D') || !validateFileName(ff1File, 'FF1')) {
        alert('ファイル名が不正です。Eファイルは"E"、Fファイルは"F"、FF1ファイルは"FF1"から始まるファイル名を選択してください。');
        return;
    }

    if (conversionTableFile && (eFile || dFile || ff1File)) {
        const reader = new FileReader();
        reader.readAsText(conversionTableFile);

        reader.onload = (e) => {
            const conversionTable = {};
            const lines = e.target.result.split('\n');
            lines.forEach(line => {
                const [doctorCode, departmentCode] = line.trim().split(",");
                conversionTable[doctorCode] = departmentCode;
            });

            if (eFile) {
                processFile(eFile, conversionTable, eFileDownloadLink, eFileProgress, convertDataFile); // 引数を追加
            }

            if (dFile) {
                processFile(dFile, conversionTable, dFileDownloadLink, dFileProgress, convertDataFile); // 引数を追加
            }

            if (ff1File && dFile) { // FF1ファイルとDファイル両方が選択されている場合のみ処理
                processFF1File(ff1File, dFile, conversionTable, ff1FileDownloadLink, ff1FileProgress); // 引数を追加
            } else if (ff1File) {
                alert('FF1ファイルを変換するにはDファイルも選択してください。');
            }

        };
    } else {
        alert('変換表とEファイル、Dファイル、またはFF1ファイルを選択してください。');
    }

});

// ファイル名検証関数
function validateFileName(file, prefix) {
    if (file && !file.name.startsWith(prefix)) {
        return false;
    }
    return true;
}

// processFile 関数を修正
function processFile(file, conversionTable, downloadLink, progressElement, convertFunction) {
    // 処理中表示開始
    progressElement.style.display = 'inline-block';

    const fileReader = new FileReader();
    fileReader.readAsText(file, 'shift-jis');

    fileReader.onload = (e) => {
        const fileContent = e.target.result;
        const convertedFileContent = convertFunction(fileContent, conversionTable);

        const convertedFileContentSJIS = Encoding.convert(convertedFileContent, 'SJIS', 'UNICODE');

        const blob = new Blob([convertedFileContentSJIS], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);

        downloadLink.href = url;
        downloadLink.download = file.name;
        downloadLink.style.display = 'inline-block'; // ダウンロードボタンを表示

        // 処理中表示終了
        progressElement.style.display = 'none';

        displayUnconvertedData(unconvertedData);
    };
}

function convertDataFile(dataFileContent, conversionTable) {
    const records = dataFileContent.split('\n');
    const convertedRecords = records.map(record => {
        const fields = record.split('\t');
        if (fields.length >= 21) {
            const doctorCode = fields[20];
            if (conversionTable[doctorCode]) {
                fields[19] = conversionTable[doctorCode];
                return fields.join('\t');
            } else {
                // 変換表にない医師コードを記録
                const originalDepartment = fields[19];
                const key = `${doctorCode},${originalDepartment}`;
                unconvertedData[key] = (unconvertedData[key] || 0) + 1;
            }
        }
        return record;
    });
    return convertedRecords.join('\n');
}

// processFF1File 関数を修正
function processFF1File(ff1File, dFile, conversionTable, downloadLink, progressElement) {
    // 処理中表示開始
    progressElement.style.display = 'inline-block';

    const ff1FileReader = new FileReader();
    ff1FileReader.readAsText(ff1File, 'shift-jis');

    ff1FileReader.onload = (e) => {
        const ff1FileContent = e.target.result;

        const dFileReader = new FileReader();
        dFileReader.readAsText(dFile, 'shift-jis');

        dFileReader.onload = (e) => {
            const dFileContent = e.target.result;
            const convertedFF1FileContent = convertFF1File(ff1FileContent, dFileContent, conversionTable);

            const convertedFileContentSJIS = Encoding.convert(convertedFF1FileContent, {
                to: 'SJIS',
                from: 'UNICODE',
            });

            const blob = new Blob([convertedFileContentSJIS], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);

            downloadLink.href = url;
            downloadLink.download = ff1File.name;
            downloadLink.style.display = 'inline-block'; // ダウンロードボタンを表示

            // 処理中表示終了
            progressElement.style.display = 'none';
        };
    };
}

function convertFF1File(ff1FileContent, dFileContent, conversionTable) {
    const dFileRecords = dFileContent.split('\n');
    const dFileDataMap = {};
    for (const dFileRecord of dFileRecords) {
        const dFileFields = dFileRecord.split('\t');
        if (dFileFields.length >= 21) {
            const dataId = dFileFields[1];
            const admissionDate = dFileFields[3];
            const doctorCode = dFileFields[20];
            const key = dataId + '_' + admissionDate;
            dFileDataMap[key] = doctorCode; // データ識別番号と入院年月日をキーに医師コードを格納
        }
    }

    const ff1FileLines = ff1FileContent.split('\n');
    const convertedFF1FileLines = ff1FileLines.map((line, index) => {
        if (index === 0) {
            return line; // ヘッダー行はそのまま出力
        }
        const fields = line.split('\t');
        if (fields.length >= 10) {
            const dataId = fields[1].padStart(10, '0'); // データ識別番号を10桁に整形
            const admissionDate = fields[2];
            const key = dataId + '_' + admissionDate;
            const doctorCode = dFileDataMap[key];
            if (doctorCode && conversionTable[doctorCode] && fields[5] === 'A000040') {
                fields[9] = conversionTable[doctorCode]; // 診療科区分を書き換え
            }
        }
        return fields.join('\t');
    });
    return convertedFF1FileLines.join('\n');
}

// 変換されなかったデータを表示する関数
function displayUnconvertedData(unconvertedData) {
    const unconvertedDataContainer = document.getElementById('unconvertedData');
    const unconvertedDataContent = unconvertedDataContainer.querySelector('.message-body');
    unconvertedDataContent.innerHTML = ''; // 既存の内容をクリア

    if (Object.keys(unconvertedData).length > 0) {
        // データを件数順にソート
        const sortedData = Object.entries(unconvertedData).sort((a, b) => b[1] - a[1]);

        // テーブルを作成
        const table = document.createElement('table');
        table.classList.add('table', 'is-striped', 'is-fullwidth');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');

        // ヘッダー行を作成
        const headerRow = document.createElement('tr');
        ['医師コード', '診療科区分', '行数'].forEach(headerText => {
            const header = document.createElement('th');
            header.textContent = headerText;
            headerRow.appendChild(header);
        });
        thead.appendChild(headerRow);

        // データ行を作成
        sortedData.forEach(([key, count]) => {
            const [doctorCode, departmentCode] = key.split(',');
            const row = document.createElement('tr');
            [doctorCode, departmentCode, count].forEach(cellText => {
                const cell = document.createElement('td');
                cell.textContent = cellText;
                row.appendChild(cell);
            });
            tbody.appendChild(row);
        });

        // テーブルを完成させて表示
        table.appendChild(thead);
        table.appendChild(tbody);
        unconvertedDataContent.appendChild(table);
        unconvertedDataContainer.style.display = 'block';
    }
}

// ファイル名を表示する関数
function displayFileName(inputElement, fileNameElement) {
    const file = inputElement.files[0];
    fileNameElement.textContent = file ? file.name : '選択されていません';
}

// DOMContentLoadedイベント内で各ファイル入力要素にイベントリスナーを追加
document.addEventListener('DOMContentLoaded', () => {
    const conversionTableInput = document.getElementById('conversionTable');
    const conversionTableFileName = conversionTableInput.closest('.file').querySelector('.file-name');
    conversionTableInput.addEventListener('change', () => {
        displayFileName(conversionTableInput, conversionTableFileName);
    });

    const eFileInput = document.getElementById('eFile');
    const eFileFileName = eFileInput.closest('.file').querySelector('.file-name');
    eFileInput.addEventListener('change', () => {
        displayFileName(eFileInput, eFileFileName);
    });

    const dFileInput = document.getElementById('dFile');
    const dFileFileName = dFileInput.closest('.file').querySelector('.file-name');
    dFileInput.addEventListener('change', () => {
        displayFileName(dFileInput, dFileFileName);
    });

    const ff1FileInput = document.getElementById('ff1File');
    const ff1FileFileName = ff1FileInput.closest('.file').querySelector('.file-name');
    ff1FileInput.addEventListener('change', () => {
        displayFileName(ff1FileInput, ff1FileFileName);
    });
});
