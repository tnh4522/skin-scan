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
                    detectFaces(); // Start detection after metadata is loaded
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

        // Set canvas dimensions
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

            canvasRef.current.getContext('2d').clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
            faceapi.draw.drawFaceLandmarks(canvasRef.current, resizedDetections);
            faceapi.draw.drawFaceExpressions(canvasRef.current, resizedDetections);
        }, 100);
    };

    return (
        <section id="home" className={`fade-in container mx-auto px-4 ${activeSection === 'home' ? 'block' : 'hidden'}`}>
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
                        <button onClick={stopCamera} className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-4 rounded-full text-lg font-bold transform transition-all hover:scale-105">
                            <i className="fas fa-times mr-3"></i>HỦY BỎ
                        </button>
                    ) : (
                        <button onClick={startCamera} className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-full text-lg font-bold transform transition-all hover:scale-105">
                            <i className="fas fa-camera mr-3"></i>BẮT ĐẦU SOI DA
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
}

export default Home;
