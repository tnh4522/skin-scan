import React, { useState, useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';

/**
 * Home component – allows the user to enter age & gender, then start an AI‑powered skin scan.
 * Modified version with vertical camera frame.
 */
function Home({ activeSection, setActiveSection }) {
    /* ------------------------------------------------------------------
     *  State & references
     * ----------------------------------------------------------------*/
    const [mediaStream, setMediaStream] = useState(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [faceDetected, setFaceDetected] = useState(false);

    const [age, setAge] = useState('');           // User‑supplied age
    const [gender, setGender] = useState('');     // "male" | "female" | "other"

    // Add state for camera dimensions
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const videoContainerRef = useRef(null);

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
                const targetHeight = containerWidth * (4/3);

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
                    aspectRatio: { ideal: 0.75 } // 3:4 aspect ratio (portrait)
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
        canvasRef.current.width  = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;

        const displaySize = {
            width:  videoRef.current.videoWidth,
            height: videoRef.current.videoHeight
        };
        faceapi.matchDimensions(canvasRef.current, displaySize);

        const id = setInterval(async () => {
            if (!videoRef.current) { clearInterval(id); return; }
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
     *  Capture photo & upload
     * ----------------------------------------------------------------*/
    const takePhoto = async () => {
        if (!videoRef.current) return;

        // Capture frame to an off‑screen canvas
        const tmp = document.createElement('canvas');
        tmp.width  = videoRef.current.videoWidth;
        tmp.height = videoRef.current.videoHeight;
        tmp.getContext('2d').drawImage(videoRef.current, 0, 0);
        const dataUrl = tmp.toDataURL('image/png');

        try {
            stopCamera();
            const response = await fetch('http://localhost:8000/api/detect/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image_base64: dataUrl, age: parseInt(age, 10), gender })
            });
            if (!response.ok) throw new Error('Không thể tải ảnh lên server');

            const result = await response.json();

            localStorage.setItem('upload', JSON.stringify(result));

            if(result.status === 200) {
                setActiveSection('analysis');
            }
        } catch (error) {
            console.error('Lỗi khi tải ảnh lên:', error);
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
                <h1 className="text-4xl font-bold text-blue-900">SOI DA ONLINE AI</h1>
                <p className="text-gray-600 mb-2">Ứng dụng công nghệ AI phân tích da hàng đầu</p>

                {/* ---------------- User info form ---------------- */}
                {(!isCameraOpen && !userInfoComplete) && (
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
                        <p className="text-sm text-gray-500 text-left">Thông tin này sẽ được sử dụng để cá nhân hoá kết quả phân tích.</p>
                    </div>
                )}

                {/* ---------------- Camera preview ---------------- */}
                <div
                    ref={videoContainerRef}
                    className="relative max-w-sm mx-auto"
                    style={{
                        display: userInfoComplete ? 'block' : 'none',
                        maxHeight: '80vh',
                        overflow: 'hidden',
                        backgroundImage: "url('http://localhost:8000/media/gets/0a1e20ff-bdf0-417a-a91f-19d78c3293f9.png')",
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                    }}
                >
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
                    </div>

                    {/* Face detection guide overlay */}
                    <div
                        className="absolute inset-0 pointer-events-none flex items-center justify-center"
                        style={{display: isCameraOpen ? 'flex' : 'none'}}
                    >
                        <div
                            className={`rounded-full w-3/4 h-3/5 opacity-50 border-8 ${
                                faceDetected ? 'border-green-500' : 'border-white border-dashed'
                            }`}
                            style={{
                                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.3)',
                                transition: 'border-color 0.3s ease-in-out',
                            }}
                        />
                    </div>
                </div>

                {/* ---------------- Action buttons ---------------- */}
                <div className="mt-2 flex flex-wrap justify-center gap-4"
                     style={{display: userInfoComplete ? 'flex' : 'none'}}>
                    {isCameraOpen ? (
                        <>
                            <button
                                onClick={stopCamera}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-4 rounded-full text-lg font-bold transform transition-all hover:scale-105"
                            >
                                <i className="fas fa-times mr-3" />HỦY BỎ
                            </button>
                            <button
                                onClick={takePhoto}
                                className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full text-lg font-bold transform transition-all hover:scale-105"
                            >
                                <i className="fas fa-camera mr-3" />CHỤP ẢNH
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={startCamera}
                            className={`px-8 py-4 rounded-full text-lg font-bold transform transition-all hover:scale-105 text-white ${userInfoComplete ? 'bg-red-500 hover:bg-red-600' : 'bg-red-300 cursor-not-allowed'}`}
                            disabled={!userInfoComplete}
                        >
                            <i className="fas fa-camera mr-3" />BẮT ĐẦU SOI DA
                        </button>
                    )}
                </div>
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
                }
            `}</style>
        </section>
    );
}

export default Home;