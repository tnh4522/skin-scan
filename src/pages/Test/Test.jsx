import React, { useState } from 'react';
import { JSEncrypt } from "jsencrypt";
import JSZip from "jszip";

function Test({ activeSection = 'test' }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('');
    const [analysisResults, setAnalysisResults] = useState(null);
    const [extractedFiles, setExtractedFiles] = useState([]);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setUploadStatus('Please select an image file');
                return;
            }

            if (file.size > 10 * 1024 * 1024) {
                setUploadStatus('File size must be less than 10MB');
                return;
            }

            setSelectedFile(file);
            setUploadStatus('');
        }
    };

    // Function to download and extract ZIP file
    const downloadAndExtractZip = async (zipUrl) => {
        try {
            setUploadStatus('Downloading results ZIP file...');

            // Download the ZIP file
            const response = await fetch(zipUrl);
            if (!response.ok) {
                throw new Error('Failed to download ZIP file');
            }

            const arrayBuffer = await response.arrayBuffer();

            // Import JSZip dynamically (assuming it's available via CDN)
            setUploadStatus('Extracting ZIP file...');

            // Extract ZIP file
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

            setExtractedFiles(extractedFiles);

            // Process JSON files to extract analysis data
            const jsonFiles = extractedFiles.filter(file => file.type === 'application/json');
            if (jsonFiles.length > 0) {
                const jsonFile = jsonFiles[0];
                const text = await jsonFile.content.text();
                const analysisData = JSON.parse(text);
                setAnalysisResults(analysisData);

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

            setUploadStatus(`✅ ZIP file downloaded, extracted and saved! (${fileIndex.length} files)`);

            return {
                extractedFiles,
                savedCount: fileIndex.length,
                totalFiles: extractedFiles.length,
                fileIndex: fileIndex
            };

        } catch (error) {
            console.error('Error downloading/extracting ZIP:', error);
            setUploadStatus(`❌ Error processing ZIP file: ${error.message}`);
            return null;
        }
    };

// Helper function to convert blob to base64
    const blobToBase64 = (blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

// Helper function to sanitize filename for localStorage key
    const sanitizeFilename = (filename) => {
        return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    };

// Helper function to convert base64 back to blob
    const base64ToBlob = (base64, type) => {
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], {type});
    };

// Function to retrieve a specific file from localStorage
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

// Function to get all extracted files from localStorage
    const getAllExtractedFiles = () => {
        try {
            const indexData = localStorage.getItem('extracted_files_index');
            if (!indexData) {
                return [];
            }

            const index = JSON.parse(indexData);
            const files = [];

            for (const fileInfo of index.files) {
                const file = getFileFromLocalStorage(fileInfo.filename);
                if (file) {
                    files.push(file);
                }
            }

            return files;
        } catch (error) {
            console.error('Error retrieving all files from localStorage:', error);
            return [];
        }
    };

// Function to clear old extracted files (for quota management)
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

// Function to delete a specific file from localStorage
    const deleteFileFromLocalStorage = (filename) => {
        try {
            const fileKey = `extracted_file_${sanitizeFilename(filename)}`;
            localStorage.removeItem(fileKey);

            // Update file index
            const indexData = localStorage.getItem('extracted_files_index');
            if (indexData) {
                const index = JSON.parse(indexData);
                index.files = index.files.filter(file => file.filename !== filename);
                localStorage.setItem('extracted_files_index', JSON.stringify(index));
            }

            return true;
        } catch (error) {
            console.error(`Error deleting file ${filename} from localStorage:`, error);
            return false;
        }
    };

// Function to clear all extracted files
    const clearAllExtractedFiles = () => {
        try {
            const keys = Object.keys(localStorage);
            const extractedKeys = keys.filter(key =>
                key.startsWith('extracted_file_') ||
                key === 'extracted_files_index' ||
                key === 'analysis_results' ||
                key === 'analysis_results_metadata'
            );

            extractedKeys.forEach(key => localStorage.removeItem(key));
            console.log(`Cleared ${extractedKeys.length} items from localStorage`);
            return true;
        } catch (error) {
            console.error('Error clearing extracted files:', error);
            return false;
        }
    };

// Function to get localStorage usage info
    const getStorageInfo = () => {
        try {
            let totalSize = 0;
            let extractedFilesSize = 0;
            let extractedFilesCount = 0;

            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    const itemSize = localStorage.getItem(key).length;
                    totalSize += itemSize;

                    if (key.startsWith('extracted_file_')) {
                        extractedFilesSize += itemSize;
                        extractedFilesCount++;
                    }
                }
            }

            return {
                totalSize: totalSize,
                extractedFilesSize: extractedFilesSize,
                extractedFilesCount: extractedFilesCount,
                totalSizeFormatted: formatBytes(totalSize),
                extractedFilesSizeFormatted: formatBytes(extractedFilesSize)
            };
        } catch (error) {
            console.error('Error getting storage info:', error);
            return null;
        }
    };

// Helper function to format bytes
    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleTestClick = async () => {
        if (!selectedFile) {
            setUploadStatus('Please select an image file first');
            return;
        }

        setIsUploading(true);
        setUploadStatus('Processing...');

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
                setUploadStatus('Getting access token...');
                const response = await fetch('https://yce-api-01.perfectcorp.com/s2s/v1.0/client/auth', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ client_id: client_id, id_token: encrypted })
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

            setUploadStatus('Requesting upload URL...');
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

                setUploadStatus('Uploading image...');

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
                    setUploadStatus('✅ Image uploaded successfully!');
                    console.log(uploadResults);
                    localStorage.setItem('upload_image', JSON.stringify(upload_image_response));
                    localStorage.setItem('file_id', file_id);
                    console.log('Upload successful, analysis data saved');

                    // Run an Skin Analysis task
                    setUploadStatus('Running skin analysis...');

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
                                        "hd_moisture"
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
                        setUploadStatus('✅ Skin analysis task created successfully!');
                        localStorage.setItem('task_id', task_id);

                        // Automatically get results after task creation
                        setTimeout(() => getResults(access_token, task_id), 290);
                    }

                } else {
                    setUploadStatus('❌ Upload failed. Please try again.');
                }
            } else {
                const errorData = await upload_image.json();
                setUploadStatus(`❌ API Error: ${errorData.message || 'Unknown error'}`);
            }

        } catch (error) {
            console.error('Error:', error);
            setUploadStatus(`❌ Error: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    const getResults = async (token = null, taskId = null) => {
        const access_token = token || localStorage.getItem('access_token');
        const task_id = taskId || localStorage.getItem('task_id');

        if (!access_token || !task_id) {
            setUploadStatus('No results available. Please run a skin analysis first.');
            return;
        }

        setUploadStatus('Fetching results...');
        console.log("Task ID:", task_id, "| Length:", task_id.length);

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
                setUploadStatus('✅ Results fetched successfully!');
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
                    setUploadStatus('No results found for the analysis.');
                }

            } else {
                const errorData = await response.json();
                setUploadStatus(`❌ Error fetching results: ${errorData.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error:', error);
            setUploadStatus(`❌ Error: ${error.message}`);
        }
    };

    const downloadFile = (file) => {
        const link = document.createElement('a');
        link.href = file.url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className={`container mx-auto px-4 py-8 ${activeSection === 'test' ? 'block' : 'hidden'}`}>
            <h1 className="text-2xl font-bold mb-6">Skin Analysis Test</h1>
            <p className="mb-6">Upload an image to test the skin analysis API.</p>

            <div className="space-y-4">
                {/* File Upload Input */}
                <div>
                    <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700 mb-2">
                        Select Image File
                    </label>
                    <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        disabled={isUploading}
                    />
                </div>

                {/* File Info */}
                {selectedFile && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                            <strong>Selected:</strong> {selectedFile.name}
                            ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                        <p className="text-sm text-gray-600">
                            <strong>Type:</strong> {selectedFile.type}
                        </p>
                    </div>
                )}

                {/* Upload Button */}
                <button
                    className={`px-6 py-2 rounded font-medium ${
                        isUploading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600'
                    } text-white`}
                    onClick={handleTestClick}
                    disabled={isUploading}
                >
                    {isUploading ? 'Processing...' : 'Upload & Analyze'}
                </button>

                {/* Get Results Button */}
                <button
                    className={`px-6 py-2 rounded font-medium ${
                        isUploading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-green-500 hover:bg-green-600'
                    } text-white`}
                    onClick={() => getResults()}
                    disabled={isUploading}
                >
                    {localStorage.getItem('task_id') ? 'Get Results' : 'No Results Available'}
                </button>

                {/* Status Message */}
                {uploadStatus && (
                    <div className={`p-3 rounded-lg ${
                        uploadStatus.includes('✅')
                            ? 'bg-green-50 text-green-800'
                            : uploadStatus.includes('❌')
                                ? 'bg-red-50 text-red-800'
                                : 'bg-blue-50 text-blue-800'
                    }`}>
                        {uploadStatus}
                    </div>
                )}

                {/* Extracted Files Display */}
                {extractedFiles.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-4">Extracted Files:</h3>
                        <div className="space-y-2">
                            {extractedFiles.map((file, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        {file.type.startsWith('image/') && (
                                            <img
                                                src={file.url}
                                                alt={file.name}
                                                className="w-16 h-16 object-cover rounded"
                                            />
                                        )}
                                        <div>
                                            <p className="font-medium">{file.name}</p>
                                            <p className="text-sm text-gray-500">{file.type}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => downloadFile(file)}
                                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                        Download
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Analysis Results Display */}
                {analysisResults && (
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-4">Analysis Results:</h3>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <pre className="text-sm overflow-auto max-h-96">
                                {JSON.stringify(analysisResults, null, 2)}
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Test;