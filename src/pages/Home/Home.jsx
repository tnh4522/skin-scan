import React, {useState, useRef, useEffect} from 'react';
import * as faceapi from 'face-api.js';
import {Button, Modal} from "antd";
import { ExclamationCircleFilled } from '@ant-design/icons';
import analyzeSkinHelper from "./Helper.js";
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
        localStorage.setItem('originalImage', dataUrl);
        try {
            stopCamera();
            setIsUploading(true);
            const wrinkle = await fetch('https://pet-commonly-whippet.ngrok-free.app/api/detect/', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({image_base64: dataUrl, age: parseInt(age, 10), gender})
            });

            // analyzeSkinHelper(dataUrl).then((result) => {
            //
            // });

            if (!wrinkle.ok) throw new Error('Không thể tải ảnh lên server');

            const wrinkle_result = await wrinkle.json();

            // Use React state instead of localStorage
            if (wrinkle_result.status === 200) {
                localStorage.removeItem('analysisResult');
                localStorage.setItem('analysisResult', JSON.stringify(wrinkle_result));
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
        localStorage.setItem('originalImage', uploadedImage);
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
                {/* Enhanced header with gradient and animation */}
                <div className="mb-8 animate-fade-in">
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                        CHẨN ĐOÁN DA LÃO HÓA
                    </h1>
                    <p className="text-gray-600 text-lg flex items-center justify-center gap-2">
                        <span className="inline-block w-8 h-[2px] bg-gradient-to-r from-blue-400 to-purple-400"></span>
                        Ứng dụng công nghệ AI phân tích da hàng đầu
                        <span className="inline-block w-8 h-[2px] bg-gradient-to-r from-purple-400 to-blue-400"></span>
                    </p>
                </div>

                {/* ---------------- User info form with enhanced styling ---------------- */}
                {(!isCameraOpen && !userInfoComplete && !uploadedImage) && (
                    <div className="mb-8 max-w-md mx-auto bg-white p-8 rounded-2xl shadow-xl border border-gray-100 transform transition-all hover:shadow-2xl">
                        <div className="flex items-center justify-center mb-6">
                            <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full">
                                <i className="fas fa-user-circle text-4xl text-blue-600"></i>
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Thông tin người dùng</h2>

                        <div className="space-y-5">
                            <div className="text-left">
                                <label className="block mb-2 font-semibold text-gray-700 flex items-center gap-2">
                                    <i className="fas fa-calendar-alt text-blue-500"></i>
                                    Độ tuổi
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="120"
                                    value={age}
                                    onChange={e => setAge(e.target.value)}
                                    className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all"
                                    placeholder="Nhập tuổi của bạn"
                                />
                            </div>

                            <div className="text-left">
                                <label className="block mb-2 font-semibold text-gray-700 flex items-center gap-2">
                                    <i className="fas fa-venus-mars text-purple-500"></i>
                                    Giới tính
                                </label>
                                <select
                                    value={gender}
                                    onChange={e => setGender(e.target.value)}
                                    className="w-full border-2 border-gray-200 rounded-xl p-3 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 transition-all cursor-pointer"
                                >
                                    <option value="" disabled>Chọn giới tính</option>
                                    <option value="male">Nam</option>
                                    <option value="female">Nữ</option>
                                    <option value="other">Khác</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                            <p className="text-sm text-gray-600 flex items-start gap-2">
                                <i className="fas fa-info-circle text-blue-500 mt-0.5"></i>
                                <span>Thông tin này sẽ được sử dụng để cá nhân hoá kết quả phân tích của bạn.</span>
                            </p>
                        </div>
                    </div>
                )}

                {/* ---------------- Camera preview with enhanced styling ---------------- */}
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
                    {/* Enhanced Modal */}
                    <Modal
                        title={
                            <div className="flex items-center gap-2 text-lg font-bold text-orange-600">
                                <ExclamationCircleFilled className="text-2xl"/>
                                LƯU Ý KHI SOI DA
                            </div>
                        }
                        closable={{'aria-label': 'Custom Close Button'}}
                        open={isModalOpen}
                        onOk={handleOk}
                        onCancel={handleCancel}
                        footer={[
                            <Button
                                key="ok"
                                onClick={handleCancel}
                                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 hover:from-blue-600 hover:to-purple-600 px-6"
                            >
                                Xác Nhận
                            </Button>
                        ]}
                        className="custom-modal"
                    >
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2">
                                <i className="fas fa-check-circle text-green-500 mt-1"></i>
                                <span>Để có kết quả chính xác nhất, vui lòng giữ camera ở khoảng cách 30-50cm và nhìn thẳng vào camera.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <i className="fas fa-check-circle text-green-500 mt-1"></i>
                                <span>Không gian xung quanh nên đủ sáng và không có ánh sáng chói.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <i className="fas fa-check-circle text-green-500 mt-1"></i>
                                <span>Cởi bỏ kính mắt, mun, hoặc các vật cản khác trên mặt.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <i className="fas fa-check-circle text-green-500 mt-1"></i>
                                <span>Giữ tóc gọn gàng, không che mặt.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <i className="fas fa-check-circle text-green-500 mt-1"></i>
                                <span>Không nên có người khác trong khung hình.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <i className="fas fa-check-circle text-green-500 mt-1"></i>
                                <span>Không nên có ánh sáng mạnh phía sau.</span>
                            </li>
                        </ul>
                    </Modal>

                    <div className="vertical-camera-container">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="rounded-2xl shadow-2xl border-4 border-white"
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

                    {/* Enhanced face detection guide overlay */}
                    <div
                        className="absolute inset-0 pointer-events-none flex items-center justify-center"
                        style={{display: isCameraOpen ? 'flex' : 'none'}}
                    >
                        <div
                            className={`transition-all duration-300 border-4 ${
                                faceDetected
                                    ? 'border-green-400 shadow-lg shadow-green-400/50 animate-pulse'
                                    : 'border-white border-dashed opacity-70'
                            }`}
                            style={{
                                width: '60%',
                                height: '60%',
                                borderRadius: '50%',
                            }}
                        />
                        {/* Face detection status indicator */}
                        <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full text-white text-sm font-semibold ${
                            faceDetected ? 'bg-green-500' : 'bg-gray-500'
                        }`}>
                            {faceDetected ? 'Đã phát hiện khuôn mặt' : 'Đang tìm khuôn mặt...'}
                        </div>
                    </div>
                </div>

                {/* ---------------- Enhanced uploaded image preview ---------------- */}
                {uploadedImage && (
                    <div className="relative max-w-sm mx-auto mb-6 animate-fade-in">
                        <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl">
                            <img
                                src={uploadedImage}
                                alt="Uploaded preview"
                                className="w-full rounded-xl shadow-xl"
                                style={{
                                    maxHeight: '65vh',
                                    objectFit: 'contain'
                                }}
                            />
                        </div>
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow-lg">
                            <span className="text-sm font-semibold text-gray-700">
                                <i className="fas fa-image text-blue-500 mr-1"></i> Ảnh đã tải lên
                            </span>
                        </div>
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

                {/* ---------------- Enhanced action buttons ---------------- */}
                <div className="mt-6 flex flex-wrap justify-center gap-4 action-buttons"
                     style={{display: userInfoComplete ? 'flex' : 'none'}}>

                    {/* Camera mode buttons */}
                    {!uploadedImage && (
                        <>
                            {isCameraOpen ? (
                                <>
                                    <button
                                        onClick={stopCamera}
                                        disabled={isUploading}
                                        className="group relative bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full text-sm sm:text-lg font-bold transform transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                                    >
                                        <span className="flex items-center gap-2">
                                            <i className="fas fa-times"/>
                                            HỦY BỎ
                                        </span>
                                    </button>
                                    <button
                                        {...faceDetected ? {} : {disabled: true}}
                                        onClick={takePhoto}
                                        disabled={isUploading || !faceDetected}
                                        className="group relative bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full text-sm sm:text-lg font-bold transform transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:from-gray-400 disabled:to-gray-500"
                                    >
                                        <span className="flex items-center gap-2">
                                            <i className={`fas ${isUploading ? 'fa-spinner fa-spin' : 'fa-camera'}`}/>
                                            {isUploading ? 'ĐANG XỬ LÝ...' : 'CHỤP ẢNH'}
                                        </span>
                                        {faceDetected && !isUploading && (
                                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                                            </span>
                                        )}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={startCamera}
                                        disabled={!userInfoComplete || isUploading}
                                        className={`group relative px-6 py-3 sm:px-8 sm:py-4 rounded-full text-sm sm:text-lg font-bold transform transition-all hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl ${
                                            userInfoComplete && !isUploading
                                                ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <i className="fas fa-camera"/>
                                            BẮT ĐẦU SOI DA
                                        </span>
                                    </button>
                                    <button
                                        onClick={triggerFileUpload}
                                        disabled={!userInfoComplete || isUploading}
                                        className={`group relative px-6 py-3 sm:px-8 sm:py-4 rounded-full text-sm sm:text-lg font-bold transform transition-all hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl ${
                                            userInfoComplete && !isUploading
                                                ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <i className="fas fa-upload"/>
                                            TẢI ẢNH LÊN
                                        </span>
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
                                className="group relative bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full text-sm sm:text-lg font-bold transform transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                            >
                                <span className="flex items-center gap-2">
                                    <i className="fas fa-times"/>
                                    HỦY BỎ
                                </span>
                            </button>
                            <button
                                onClick={uploadPhoto}
                                disabled={isUploading}
                                className="group relative bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full text-sm sm:text-lg font-bold transform transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                            >
                                <span className="flex items-center gap-2">
                                    <i className={`fas ${isUploading ? 'fa-spinner fa-spin' : 'fa-search'}`}/>
                                    {isUploading ? 'ĐANG PHÂN TÍCH...' : 'PHÂN TÍCH DA'}
                                </span>
                            </button>
                            <button
                                onClick={triggerFileUpload}
                                disabled={isUploading}
                                className="group relative bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-full text-sm sm:text-lg font-bold transform transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                            >
                                <span className="flex items-center gap-2">
                                    <i className="fas fa-exchange-alt"/>
                                    ĐỔI ẢNH KHÁC
                                </span>
                            </button>
                        </>
                    )}
                </div>

                {/* Enhanced loading indicator */}
                {isUploading && (
                    <div className="mt-8 flex flex-col items-center justify-center animate-fade-in">
                        <div className="relative">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent absolute top-0 left-0"></div>
                        </div>
                        <div className="mt-4 text-center">
                            <p className="text-lg font-semibold text-gray-700">Đang xử lý ảnh...</p>
                            <p className="text-sm text-gray-500 mt-1">Vui lòng đợi trong giây lát</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Enhanced CSS for portrait mode and animations */}
            <style jsx="true">{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fade-in {
                    animation: fade-in 0.5s ease-out;
                }

                @media (max-width: 768px) {
                    .vertical-camera-container video {
                        max-height: 70vh;
                    }

                    .action-buttons button {
                        min-width: 120px;
                    }
                }

                /* Custom modal styling */
                .custom-modal .ant-modal-content {
                    border-radius: 16px;
                    overflow: hidden;
                }

                .custom-modal .ant-modal-header {
                    background: linear-gradient(to right, #FEF3C7, #FDE68A);
                    border-bottom: 2px solid #F59E0B;
                    padding: 20px 24px;
                }

                .custom-modal .ant-modal-body {
                    padding: 24px;
                }

                /* Button hover effects */
                button {
                    position: relative;
                    overflow: hidden;
                }

                button::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 0;
                    height: 0;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.2);
                    transform: translate(-50%, -50%);
                    transition: width 0.6s, height 0.6s;
                }

                button:hover::before {
                    width: 300px;
                    height: 300px;
                }

                /* Gradient text animation */
                @keyframes gradient-shift {
                    0% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                    100% {
                        background-position: 0% 50%;
                    }
                }

                .bg-gradient-to-r {
                    background-size: 200% 200%;
                    animation: gradient-shift 3s ease infinite;
                }

                /* Pulse animation for face detection */
                @keyframes pulse-border {
                    0% {
                        box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
                    }
                    70% {
                        box-shadow: 0 0 0 10px rgba(34, 197, 94, 0);
                    }
                    100% {
                        box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
                    }
                }

                .animate-pulse {
                    animation: pulse-border 2s infinite;
                }

                /* Input focus effects */
                input:focus, select:focus {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 20px rgba(59, 130, 246, 0.15);
                }

                /* Card hover effect */
                .transform:hover {
                    transform: translateY(-4px);
                }

                /* Smooth transitions */
                * {
                    transition-property: all;
                    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                    transition-duration: 150ms;
                }
            `}</style>
        </section>
    );
}

export default Home;