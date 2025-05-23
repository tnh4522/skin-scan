import React, {useState, useRef, useEffect} from 'react';
import * as faceapi from 'face-api.js';
import {Button, Modal} from "antd";
import { ExclamationCircleFilled } from '@ant-design/icons';

/**
 * Home component – allows the user to enter age & gender, then start an AI‑powered skin scan.
 * Modified version with vertical camera frame and photo upload functionality.
 */
function Home({ activeSection, setActiveSection }) {
    /* ------------------------------------------------------------------
     *  State & references
     * ----------------------------------------------------------------*/
    const [isModalOpen, setIsModalOpen] = useState(false);
    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleOk = () => {
        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };
    const [mediaStream, setMediaStream] = useState(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [faceDetected, setFaceDetected] = useState(false);
    const [uploadedImage, setUploadedImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const [age, setAge] = useState('');           // User‑supplied age
    const [gender, setGender] = useState('');     // "male" | "female" | "other"

    // Add state for camera dimensions
    const [dimensions, setDimensions] = useState({width: 0, height: 0});

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const videoContainerRef = useRef(null);
    const fileInputRef = useRef(null);

    /* ------------------------------------------------------------------
     *  Helpers
     * ----------------------------------------------------------------*/
    const userInfoComplete = age !== '' && gender !== '';

    /* ------------------------------------------------------------------
     *  Side‑effects – camera stream handling
     * ----------------------------------------------------------------*/
    useEffect(() => {
        if (videoRef.current && mediaStream) {
            videoRef.current.srcObject = mediaStream;
            videoRef.current.play();
        }
    }, [mediaStream]);

    useEffect(() => () => {
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
        }
    }, [mediaStream]);

    useEffect(() => {
        if (activeSection !== 'home' && mediaStream) {
            stopCamera();
        }
    }, [activeSection, mediaStream]);

    /* ------------------------------------------------------------------
     *  Set up vertical camera dimensions on stream start
     * ----------------------------------------------------------------*/
    useEffect(() => {
        if (videoRef.current && mediaStream) {
            const handleVideoMetadata = () => {
                const videoWidth = videoRef.current.videoWidth;
                const videoHeight = videoRef.current.videoHeight;

                // Force portrait mode (vertical) dimensions
                // We'll use a 3:4 aspect ratio for portrait mode
                const containerWidth = videoContainerRef.current.clientWidth;
                const targetHeight = containerWidth * (4 / 3);

                setDimensions({
                    width: containerWidth,
                    height: targetHeight
                });
            };

            videoRef.current.addEventListener('loadedmetadata', handleVideoMetadata);

            return () => {
                if (videoRef.current) {
                    videoRef.current.removeEventListener('loadedmetadata', handleVideoMetadata);
                }
            };
        }
    }, [mediaStream]);

    /* ------------------------------------------------------------------
     *  Load face‑api models once on mount
     * ----------------------------------------------------------------*/
    useEffect(() => {
        const loadModels = async () => {
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
                faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
                faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
                faceapi.nets.faceExpressionNet.loadFromUri('/models'),
            ]);
            console.log('Face‑API models loaded');
        };
        loadModels();
    }, []);

    /* ------------------------------------------------------------------
     *  Camera control
     * ----------------------------------------------------------------*/
    const startCamera = async () => {
        if (!userInfoComplete) {
            alert('Vui lòng nhập Độ tuổi & Giới tính trước khi bắt đầu.');
            return;
        }
        try {
            // Clear uploaded image when starting camera
            setUploadedImage(null);
            showModal();

            // Attempt to request portrait orientation for mobile devices
            if (window.screen && window.screen.orientation) {
                try {
                    await window.screen.orientation.lock('portrait');
                } catch (orientationError) {
                    console.log('Orientation lock not supported or denied');
                }
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    aspectRatio: {ideal: 0.75} // 3:4 aspect ratio (portrait)
                }
            });

            setMediaStream(stream);
            setIsCameraOpen(true);

            if (videoRef.current) {
                videoRef.current.onloadedmetadata = () => detectFaces();
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Please allow camera access to proceed.');
        }
    };

    const stopCamera = () => {
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            setMediaStream(null);
            setIsCameraOpen(false);

            // Release orientation lock if it was set
            if (window.screen && window.screen.orientation && window.screen.orientation.unlock) {
                window.screen.orientation.unlock();
            }
        }
    };

    /* ------------------------------------------------------------------
     *  Face detection loop
     * ----------------------------------------------------------------*/
    const detectFaces = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        // Set canvas dimensions to match the video
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;

        const displaySize = {
            width: videoRef.current.videoWidth,
            height: videoRef.current.videoHeight
        };
        faceapi.matchDimensions(canvasRef.current, displaySize);

        const id = setInterval(async () => {
            if (!videoRef.current) {
                clearInterval(id);
                return;
            }
            const detections = await faceapi
                .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceExpressions();

            setFaceDetected(detections.length > 0);

            const resized = faceapi.resizeResults(detections, displaySize);
            const ctx = canvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            faceapi.draw.drawDetections(canvasRef.current, resized);
            faceapi.draw.drawFaceLandmarks(canvasRef.current, resized);
            faceapi.draw.drawFaceExpressions(canvasRef.current, resized);
        }, 100);
    };

    /* ------------------------------------------------------------------
     *  Photo upload handling
     * ----------------------------------------------------------------*/
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Vui lòng chọn file ảnh hợp lệ (JPG, PNG, etc.)');
                return;
            }

            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                alert('Kích thước file quá lớn. Vui lòng chọn ảnh dưới 10MB.');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                setUploadedImage(e.target.result);
                // Close camera if it's open
                if (isCameraOpen) {
                    stopCamera();
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileUpload = () => {
        if (!userInfoComplete) {
            alert('Vui lòng nhập Độ tuổi & Giới tính trước khi tải ảnh lên.');
            return;
        }
        fileInputRef.current?.click();
    };

    const removeUploadedImage = () => {
        setUploadedImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    /* ------------------------------------------------------------------
     *  Capture photo & upload
     * ----------------------------------------------------------------*/
    const takePhoto = async () => {
        if (!videoRef.current) return;

        // Capture frame to an off‑screen canvas
        const tmp = document.createElement('canvas');
        tmp.width = videoRef.current.videoWidth;
        tmp.height = videoRef.current.videoHeight;
        tmp.getContext('2d').drawImage(videoRef.current, 0, 0);
        const dataUrl = tmp.toDataURL('image/png');

        try {
            stopCamera();
            setIsUploading(true);
            const response = await fetch('https://pet-commonly-whippet.ngrok-free.app/api/detect/', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({image_base64: dataUrl, age: parseInt(age, 10), gender})
            });
            if (!response.ok) throw new Error('Không thể tải ảnh lên server');

            const result = await response.json();

            // Use React state instead of localStorage
            if (result.status === 200) {
                localStorage.removeItem('analysisResult');
                localStorage.setItem('analysisResult', JSON.stringify(result));
                setActiveSection('analysis');
            }
        } catch (error) {
            console.error('Lỗi khi tải ảnh lên:', error);
            alert('Có lỗi xảy ra khi phân tích ảnh. Vui lòng thử lại.');
        } finally {
            setIsUploading(false);
        }
    };

    const uploadPhoto = async () => {
        if (!uploadedImage) return;

        try {
            setIsUploading(true);
            const response = await fetch('https://pet-commonly-whippet.ngrok-free.app/api/detect/', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    image_base64: uploadedImage,
                    age: parseInt(age, 10),
                    gender
                })
            });

            if (!response.ok) throw new Error('Không thể tải ảnh lên server');

            const result = await response.json();

            if (result.status === 200) {
                localStorage.removeItem('analysisResult');
                localStorage.setItem('analysisResult', JSON.stringify(result));
                setActiveSection('analysis');
            }
        } catch (error) {
            console.error('Lỗi khi tải ảnh lên:', error);
            alert('Có lỗi xảy ra khi phân tích ảnh. Vui lòng thử lại.');
        } finally {
            setIsUploading(false);
        }
    };

    /* ------------------------------------------------------------------
     *  Render
     * ----------------------------------------------------------------*/
    return (
        <section
            id="home"
            className={`fade-in container mx-auto px-4 ${activeSection === 'home' ? 'block' : 'hidden'}`}
        >
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-blue-900">CHẨN ĐOÁN DA LÃO HÓA</h1>
                <p className="text-gray-600 mb-2">Ứng dụng công nghệ AI phân tích da hàng đầu</p>

                {/* ---------------- User info form ---------------- */}
                {(!isCameraOpen && !userInfoComplete && !uploadedImage) && (
                    <div className="mb-8 max-w-md mx-auto bg-white p-6 rounded-xl shadow-md">
                        <h2 className="text-xl font-semibold mb-4 text-left">Thông tin người dùng</h2>
                        <label className="block text-left mb-2 font-medium">Độ tuổi</label>
                        <input
                            type="number"
                            min="1"
                            max="120"
                            value={age}
                            onChange={e => setAge(e.target.value)}
                            className="w-full border rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                            placeholder="Nhập tuổi của bạn"
                        />
                        <label className="block text-left mb-2 font-medium">Giới tính</label>
                        <select
                            value={gender}
                            onChange={e => setGender(e.target.value)}
                            className="w-full border rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="" disabled>Chọn giới tính</option>
                            <option value="male">Nam</option>
                            <option value="female">Nữ</option>
                            <option value="other">Khác</option>
                        </select>
                        <p className="text-sm text-gray-500 text-left">Thông tin này sẽ được sử dụng để cá nhân hoá kết
                            quả phân tích.</p>
                    </div>
                )}

                {/* ---------------- Camera preview ---------------- */}
                <div
                    ref={videoContainerRef}
                    className="relative max-w-sm mx-auto"
                    style={{
                        display: userInfoComplete && !uploadedImage ? 'block' : 'none',
                        maxHeight: '80vh',
                        overflow: 'hidden',
                        backgroundImage: "url('https://pet-commonly-whippet.ngrok-free.app/media/gets/0a1e20ff-bdf0-417a-a91f-19d78c3293f9.png')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                    }}
                >
                    <Modal
                        title={<p><ExclamationCircleFilled/> LƯU Ý KHI SOI DA </p>}
                        closable={{'aria-label': 'Custom Close Button'}}
                        open={isModalOpen}
                        onOk={handleOk}
                        onCancel={handleCancel}
                        footer={[
                            <Button key="ok" onClick={handleCancel}>
                                OK
                            </Button>
                        ]}
                    >
                        <ul className="list-disc pl-5">
                            <li>Để có kết quả chính xác nhất, vui lòng giữ camera ở khoảng cách 30-50cm và nhìn
                                thẳng vào camera.
                            </li>
                            <li>Không gian xung quanh nên đủ sáng và không có ánh sáng chói.</li>
                            <li>Cởi bỏ kính mắt, mun, hoặc các vật cản khác trên mặt.</li>
                            <li>Giữ tóc gọn gàng, không che mặt.</li>
                            <li>Không nên có người khác trong khung hình.</li>
                            <li>Không nên có ánh sáng mạnh phía sau.</li>
                        </ul>
                    </Modal>
                    <div className="vertical-camera-container">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="rounded-xl shadow-lg border-4 border-white"
                            style={{
                                width: dimensions.width > 0 ? dimensions.width : '100%',
                                height: dimensions.height > 0 ? dimensions.height : 'auto',
                                objectFit: 'cover',
                                objectPosition: 'center'
                            }}
                        />
                        <canvas
                            ref={canvasRef}
                            className="absolute top-0 left-0 w-full h-full"
                            style={{display: 'none'}}
                        />
                    </div>

                    {/* Face detection guide overlay */}
                    <div
                        className="absolute inset-0 pointer-events-none flex items-center justify-center"
                        style={{display: isCameraOpen ? 'flex' : 'none'}}
                    >
                        <div
                            className={`opacity-50 border-8 ${
                                faceDetected ? 'border-green-500' : 'border-white border-dashed'
                            }`}
                            style={{
                                width: '60%',
                                height: '60%',
                                borderRadius: '50%',
                            }}
                        />
                    </div>
                </div>

                {/* ---------------- Uploaded image preview ---------------- */}
                {uploadedImage && (
                    <div className="relative max-w-sm mx-auto mb-4">
                        <img
                            src={uploadedImage}
                            alt="Uploaded preview"
                            className="w-full rounded-xl shadow-lg border-4 border-white"
                            style={{
                                maxHeight: '65vh',
                                objectFit: 'contain'
                            }}
                        />
                    </div>
                )}

                {/* ---------------- Hidden file input ---------------- */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                />

                {/* ---------------- Action buttons ---------------- */}
                <div className="mt-2 flex flex-wrap justify-center gap-4 action-buttons"
                     style={{display: userInfoComplete ? 'flex' : 'none'}}>

                    {/* Camera mode buttons */}
                    {!uploadedImage && (
                        <>
                            {isCameraOpen ? (
                                <>
                                    <button
                                        onClick={stopCamera}
                                        disabled={isUploading}
                                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full text-sm sm:text-lg font-bold transform transition-all hover:scale-105 active:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <i className="fas fa-times mr-2"/>HỦY BỎ
                                    </button>
                                    <button
                                        {...faceDetected ? {} : {disabled: true}}
                                        onClick={takePhoto}
                                        disabled={isUploading || !faceDetected}
                                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full text-sm sm:text-lg font-bold transform transition-all hover:scale-105 active:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <i className="fas fa-camera mr-2"/>
                                        {isUploading ? 'ĐANG XỬ LÝ...' : 'CHỤP ẢNH'}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={startCamera}
                                        disabled={!userInfoComplete || isUploading}
                                        className={`px-4 py-2 sm:px-6 sm:py-3 rounded-full text-sm sm:text-lg font-bold transform transition-all hover:scale-105 active:scale-105 text-white ${
                                            userInfoComplete && !isUploading
                                                ? 'bg-red-500 hover:bg-red-600'
                                                : 'bg-red-300 cursor-not-allowed'
                                        }`}
                                    >
                                        <i className="fas fa-camera mr-2"/>BẮT ĐẦU SOI DA
                                    </button>
                                    <button
                                        onClick={triggerFileUpload}
                                        disabled={!userInfoComplete || isUploading}
                                        className={`px-4 py-2 sm:px-6 sm:py-3 rounded-full text-sm sm:text-lg font-bold transform transition-all hover:scale-105 active:scale-105 text-white ${
                                            userInfoComplete && !isUploading
                                                ? 'bg-blue-500 hover:bg-blue-600'
                                                : 'bg-blue-300 cursor-not-allowed'
                                        }`}
                                    >
                                        <i className="fas fa-upload mr-2"/>TẢI ẢNH LÊN
                                    </button>
                                </>
                            )}
                        </>
                    )}

                    {/* Upload mode buttons */}
                    {uploadedImage && (
                        <>
                            <button
                                onClick={removeUploadedImage}
                                disabled={isUploading}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full text-sm sm:text-lg font-bold transform transition-all hover:scale-105 active:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <i className="fas fa-times mr-2"/>HỦY BỎ
                            </button>
                            <button
                                onClick={uploadPhoto}
                                disabled={isUploading}
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full text-sm sm:text-lg font-bold transform transition-all hover:scale-105 active:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <i className="fas fa-search mr-2"/>
                                {isUploading ? 'ĐANG PHÂN TÍCH...' : 'PHÂN TÍCH DA'}
                            </button>
                            <button
                                onClick={triggerFileUpload}
                                disabled={isUploading}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-full text-sm sm:text-lg font-bold transform transition-all hover:scale-105 active:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <i className="fas fa-exchange-alt mr-2"/>ĐỔI ẢNH KHÁC
                            </button>
                        </>
                    )}
                </div>

                {/* Loading indicator */}
                {isUploading && (
                    <div className="mt-4 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span className="ml-2 text-blue-600">Đang xử lý ảnh...</span>
                    </div>
                )}
            </div>

            {/* CSS for portrait mode */}
            <style jsx>{`
                .vertical-camera-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    overflow: hidden;
                }

                @media (max-width: 768px) {
                    .vertical-camera-container video {
                        max-height: 70vh;
                    }

                    .action-buttons {
                        flex-wrap: wrap;
                        gap: 8px;
                    }

                    .action-buttons button {
                        min-width: 120px;
                    }
                }
            `}</style>
        </section>
    );
}

export default Home;