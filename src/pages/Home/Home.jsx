import React, { useState, useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';

function Home({ activeSection }) {
    const [mediaStream, setMediaStream] = useState(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && mediaStream) {
            videoRef.current.srcObject = mediaStream;
            videoRef.current.play();
        }
    }, [mediaStream]);

    useEffect(() => {
        return () => {
            if (mediaStream) {
                mediaStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [mediaStream]);

    useEffect(() => {
        if (activeSection !== 'home' && mediaStream) {
            stopCamera();
        }
    }, [activeSection, mediaStream]);

    useEffect(() => {
        const loadModels = async () => {
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
                faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
                faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
                faceapi.nets.faceExpressionNet.loadFromUri('/models'),
            ]);
            console.log('Models loaded');
        };
        loadModels();
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' }
            });
            setMediaStream(stream);
            setIsCameraOpen(true);

            if (videoRef.current) {
                videoRef.current.onloadedmetadata = () => {
                    detectFaces(); // Bắt đầu dò khuôn mặt sau khi video load xong
                };
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
        }
    };

    const detectFaces = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        // Cài đặt kích thước canvas
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;

        const displaySize = {
            width: videoRef.current.videoWidth,
            height: videoRef.current.videoHeight
        };

        if (displaySize.width === 0 || displaySize.height === 0) {
            console.error('Invalid video dimensions:', displaySize);
            return;
        }

        faceapi.matchDimensions(canvasRef.current, displaySize);

        setInterval(async () => {
            const detections = await faceapi.detectAllFaces(
                videoRef.current,
                new faceapi.TinyFaceDetectorOptions()
            ).withFaceLandmarks().withFaceExpressions();

            const resizedDetections = faceapi.resizeResults(detections, displaySize);

            const context = canvasRef.current.getContext('2d');
            context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

            faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
            faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
            faceapi.draw.drawFaceExpressions(canvasRef.current, resizedDetections);
        }, 100);
    };

    // Tạo hàm chụp ảnh
    const takePhoto = async () => {
        if (!videoRef.current) return;

        // Tạo một canvas tạm
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');

        // Vẽ hình ảnh từ video
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        // Chuyển sang dạng base64
        const dataUrl = canvas.toDataURL('image/png'); // "image/jpeg" cũng được

        try {
            // Gửi dữ liệu ảnh lên server
            const response = await fetch('http://127.0.0.1:8000/api/upload/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ dataUrl })
            });

            if (!response.ok) {
                throw new Error('Không thể tải ảnh lên server');
            }

            const result = await response.json();
            console.log(result.message); // "image saved!" (nếu server trả về)
        } catch (error) {
            console.error('Lỗi khi tải ảnh lên:', error);
        }
    };

    return (
        <section
            id="home"
            className={`fade-in container mx-auto px-4 ${activeSection === 'home' ? 'block' : 'hidden'}`}
        >
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-blue-900 mb-2">
                    SOI DA ONLINE AI
                </h1>
                <p className="text-gray-600 mb-8">Ứng dụng công nghệ AI phân tích da hàng đầu</p>

                <div className="relative max-w-2xl mx-auto">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="rounded-xl shadow-lg border-4 border-white w-full h-auto"
                    />
                    <canvas ref={canvasRef} className="absolute top-0 left-0" />
                </div>

                <div className="mt-8 flex justify-center gap-4">
                    {isCameraOpen ? (
                        <>
                            <button
                                onClick={stopCamera}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-4 rounded-full text-lg font-bold transform transition-all hover:scale-105"
                            >
                                <i className="fas fa-times mr-3"></i>HỦY BỎ
                            </button>
                            <button
                                onClick={takePhoto}
                                className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full text-lg font-bold transform transition-all hover:scale-105"
                            >
                                <i className="fas fa-camera mr-3"></i>CHỤP ẢNH
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={startCamera}
                            className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-full text-lg font-bold transform transition-all hover:scale-105"
                        >
                            <i className="fas fa-camera mr-3"></i>BẮT ĐẦU SOI DA
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
}

export default Home;
