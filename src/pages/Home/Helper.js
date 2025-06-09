import {JSEncrypt} from "jsencrypt";
import JSZip from "jszip";

const analyzeSkinHelper = async (dataUrl) => {
    // Convert data URL to File object
    const base64Data = dataUrl.split(',')[1];
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const selectedFile = new File([byteArray], 'skin_analysis_image.jpg', {
        type: 'image/jpeg',
        lastModified: new Date().getTime()
    });

    if (!selectedFile) {
        return;
    }

    try {
        const client_id = 'ipem1xb2ieTQrXAetOv6ElRWYuGUaw9q';
        const client_secret = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCzDgHkp/QFrort2xs+V4prfib4TYcrOD4dt964pP6WMrzciUOMLrsL9QCAAo6MwRNv0zfREERrtjEnVXM9pX/AfIY2dNKpY4DFW/4EecFpy1oN1TiYfTE60yXtAG4wKi2zxf43MnLUx/ErTH752aT1tWf/DHL9SJm2TTOBe2MbNQIDAQAB';

        let encrypt = new JSEncrypt();
        encrypt.setPublicKey(client_secret);
        let encrypted = encrypt.encrypt(
            `client_id=${client_id}&timestamp=${new Date().getTime()}`
        );

        // Get access token
        let access_token = localStorage.getItem('access_token');
        const timestamp = localStorage.getItem('timestamp');
        if (timestamp && (new Date().getTime() - timestamp > 6400 * 1000)) {
            localStorage.removeItem('access_token');
            access_token = null;
        }
        if (!access_token) {
            const response = await fetch('https://yce-api-01.perfectcorp.com/s2s/v1.0/client/auth', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({client_id: client_id, id_token: encrypted})
            });

            const data = await response.json();
            access_token = data.result.access_token;
            localStorage.setItem('access_token', access_token);
            localStorage.setItem('timestamp', new Date().getTime());
        }

        // Prepare file upload request with actual file info
        const file_upload = {
            "files": [
                {
                    "content_type": selectedFile.type,
                    "file_name": selectedFile.name,
                    "file_size": selectedFile.size
                }
            ]
        };

        const upload_image = await fetch('https://yce-api-01.perfectcorp.com/s2s/v1.1/file/skin-analysis', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${access_token}`
            },
            body: JSON.stringify(file_upload)
        });

        let file_id = null;

        if (upload_image.status === 200) {
            const upload_image_response = await upload_image.json();
            console.log('Skin Analysis Data:', upload_image_response);

            const uploadPromises = upload_image_response.result.files.map(async (file) => {
                const uploadRequest = file.requests[0];
                const url = uploadRequest.url;
                const method = uploadRequest.method;
                const headers = uploadRequest.headers || {};
                file_id = file.file_id;

                if (method === 'PUT') {
                    return await fetch(url, {
                        method: 'PUT',
                        body: selectedFile,
                        headers: {
                            'Content-Type': selectedFile.type,
                            ...headers
                        }
                    });
                }
            });

            const uploadResults = await Promise.all(uploadPromises);
            const allSuccessful = uploadResults.every(result => result.ok);

            if (allSuccessful) {
                console.log(uploadResults);
                localStorage.setItem('upload_image', JSON.stringify(upload_image_response));
                localStorage.setItem('file_id', file_id);
                console.log('Upload successful, analysis data saved');

                // Run an Skin Analysis task

                const skin_analysis_task_required = {
                    "request_id": 0,
                    "payload": {
                        "file_sets": {
                            "src_ids": [file_id]
                        },
                        "actions": [
                            {
                                "id": 0,
                                "params": {},
                                "dst_actions": [
                                    "hd_age_spot",
                                    "hd_wrinkle",
                                    "hd_texture",
                                    "hd_oiliness"
                                ]
                            }
                        ]
                    }
                }

                const skin_analysis_task = await fetch('https://yce-api-01.perfectcorp.com/s2s/v1.0/task/skin-analysis', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${access_token}`
                    },
                    body: JSON.stringify(skin_analysis_task_required)
                });

                if (skin_analysis_task.status === 200) {
                    const skin_analysis_task_response = await skin_analysis_task.json();
                    const task_id = skin_analysis_task_response.result.task_id;
                    console.log('Skin Analysis Task ID:', task_id);
                    localStorage.setItem('task_id', task_id);

                    // Automatically get results after task creation
                    setTimeout(() => getResults(access_token, task_id), 290);
                }

            } else {
                console.error('Upload failed for some files:', uploadResults);
            }
        } else {
            const errorData = await upload_image.json();
            console.error('Upload failed:', errorData);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        console.log('Skin analysis process completed');
    }
}

const getResults = async (token = null, taskId = null) => {
    const access_token = token || localStorage.getItem('access_token');
    const task_id = taskId || localStorage.getItem('task_id');

    if (!access_token || !task_id) {

        return;
    }

    try {
        const encodedTaskId = encodeURIComponent(task_id);
        const response = await fetch(`https://yce-api-01.perfectcorp.com/s2s/v1.0/task/skin-analysis?task_id=${encodedTaskId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });

        if (response.status === 200) {
            const data = await response.json();
            console.log('Skin Analysis Results:', data);
            if (data.result.status === "running") {
                setTimeout(() => getResults(access_token, task_id), 1000);
            }

            localStorage.setItem('skin_analysis_results', JSON.stringify(data.result));

            const results = data.result.results;
            if (results && results.length > 0) {
                const result = results[0];
                const resultData = result.data[0];
                const zipUrl = resultData.url;

                // Automatically download and extract ZIP file
                await downloadAndExtractZip(zipUrl);

            } else {
                console.log();
            }

        } else {
            const errorData = await response.json();
            console.error('Failed to get results:', errorData);
        }
    } catch (error) {
        console.error('Error:', error);

    }
};

const downloadAndExtractZip = async (zipUrl) => {
    try {
        const response = await fetch(zipUrl);
        if (!response.ok) {
            throw new Error('Failed to download ZIP file');
        }

        const arrayBuffer = await response.arrayBuffer();

        const zip = new JSZip();
        const zipContent = await zip.loadAsync(arrayBuffer);

        const extractedFiles = [];
        const fileIndex = []; // Index of all saved files

        // Process each file in the ZIP
        for (const [filename, file] of Object.entries(zipContent.files)) {
            if (!file.dir) {
                const content = await file.async('blob');
                const fileType = filename.toLowerCase().endsWith('.json') ? 'application/json' :
                    filename.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/i) ? 'image/' + filename.split('.').pop() :
                        'application/octet-stream';

                // Convert blob to base64 for localStorage
                const base64Content = await blobToBase64(content);

                const fileData = {
                    name: filename,
                    type: fileType,
                    content: content,
                    url: URL.createObjectURL(content),
                    size: content.size,
                    lastModified: new Date().toISOString()
                };

                extractedFiles.push(fileData);

                // Save each file to localStorage with unique key
                const fileKey = `extracted_file_${sanitizeFilename(filename)}`;
                const fileMetadata = {
                    name: filename,
                    type: fileType,
                    size: content.size,
                    lastModified: fileData.lastModified,
                    contentBase64: base64Content,
                    originalKey: fileKey
                };

                try {
                    localStorage.setItem(fileKey, JSON.stringify(fileMetadata));
                    fileIndex.push({
                        filename: filename,
                        key: fileKey,
                        size: content.size,
                        type: fileType,
                        lastModified: fileData.lastModified
                    });
                    console.log(`✅ Saved file: ${filename} to localStorage`);
                } catch (storageError) {
                    console.warn(`⚠️ Could not save ${filename} to localStorage:`, storageError.message);
                    // Handle quota exceeded or other localStorage errors
                    if (storageError.name === 'QuotaExceededError') {
                        // Try to clear some old files
                        clearOldExtractedFiles();
                        // Retry saving
                        try {
                            localStorage.setItem(fileKey, JSON.stringify(fileMetadata));
                            fileIndex.push({
                                filename: filename,
                                key: fileKey,
                                size: content.size,
                                type: fileType,
                                lastModified: fileData.lastModified
                            });
                        } catch (retryError) {
                            console.error(`❌ Failed to save ${filename} even after cleanup:`, retryError.message);
                        }
                    }
                }
            }
        }

        // Save file index to localStorage
        try {
            localStorage.setItem('extracted_files_index', JSON.stringify({
                files: fileIndex,
                extractedAt: new Date().toISOString(),
                totalFiles: fileIndex.length,
                zipUrl: zipUrl
            }));
        } catch (error) {
            console.warn('Could not save file index to localStorage:', error.message);
        }


        // Process JSON files to extract analysis data
        const jsonFiles = extractedFiles.filter(file => file.type === 'application/json');
        if (jsonFiles.length > 0) {
            const jsonFile = jsonFiles[0];
            const text = await jsonFile.content.text();
            const analysisData = JSON.parse(text);

            // Save analysis results separately
            try {
                localStorage.setItem('analysis_results', JSON.stringify(analysisData));
                localStorage.setItem('analysis_results_metadata', JSON.stringify({
                    savedAt: new Date().toISOString(),
                    sourceFile: jsonFile.name,
                    dataKeys: Object.keys(analysisData)
                }));
            } catch (error) {
                console.warn('Could not save analysis results to localStorage:', error.message);
            }
        }

        return {
            extractedFiles,
            savedCount: fileIndex.length,
            totalFiles: extractedFiles.length,
            fileIndex: fileIndex
        };

    } catch (error) {
        console.error('Error downloading/extracting ZIP:', error);
        return null;
    }
};

const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

const sanitizeFilename = (filename) => {
    return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
};

const base64ToBlob = (base64, type) => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], {type});
};

const getFileFromLocalStorage = (filename) => {
    try {
        const fileKey = `extracted_file_${sanitizeFilename(filename)}`;
        const storedData = localStorage.getItem(fileKey);

        if (!storedData) {
            return null;
        }

        const fileMetadata = JSON.parse(storedData);
        const blob = base64ToBlob(fileMetadata.contentBase64, fileMetadata.type);

        return {
            name: fileMetadata.name,
            type: fileMetadata.type,
            content: blob,
            url: URL.createObjectURL(blob),
            size: fileMetadata.size,
            lastModified: fileMetadata.lastModified
        };
    } catch (error) {
        console.error(`Error retrieving file ${filename} from localStorage:`, error);
        return null;
    }
};

const clearOldExtractedFiles = () => {
    try {
        const keys = Object.keys(localStorage);
        const extractedFileKeys = keys.filter(key => key.startsWith('extracted_file_'));

        // Remove oldest files (you might want to implement smarter logic)
        const keysToRemove = extractedFileKeys.slice(0, Math.floor(extractedFileKeys.length / 2));

        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
        });

        console.log(`Cleared ${keysToRemove.length} old files from localStorage`);
    } catch (error) {
        console.error('Error clearing old files:', error);
    }
};


export default analyzeSkinHelper;