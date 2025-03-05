import React, { useState, useRef, useEffect } from 'react';

function Home({ activeSection }) {
    const [mediaStream, setMediaStream] = useState(null);
    const [imageSrc, setImageSrc] = useState(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const videoRef = useRef(null);

    // Khởi tạo video stream khi mediaStream thay đổi
    useEffect(() => {
        if (videoRef.current && mediaStream) {
            videoRef.current.srcObject = mediaStream;
            videoRef.current.play();
        }
    }, [mediaStream]);

    // Dọn dẹp khi component unmount hoặc section thay đổi
    useEffect(() => {
        return () => {
            if (mediaStream) {
                mediaStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [mediaStream]);

    // Dừng camera khi chuyển section
    useEffect(() => {
        if (activeSection !== 'home' && mediaStream) {
            stopCamera();
        }
    }, [activeSection, mediaStream]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' }
            });
            setMediaStream(stream);
            setIsCameraOpen(true);
        } catch (error) {
            console.error('Lỗi truy cập camera:', error);
            alert('Vui lòng cho phép quyền truy cập camera để tiếp tục');
        }
    };

    const stopCamera = () => {
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            setMediaStream(null);
            setIsCameraOpen(false);
        }
    };

    const capturePhoto = () => {
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        const photoDataUrl = canvas.toDataURL('image/png');
        setImageSrc(photoDataUrl);
        stopCamera();
    };

    const retakePhoto = () => {
        setImageSrc(null);
        startCamera();
    };

    return (
        <section id="home" className={`fade-in container mx-auto px-4 ${activeSection === 'home' ? 'block' : 'hidden'}`}>
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-blue-900 mb-2">
                    SOI DA ONLINE AI
                </h1>
                <p className="text-gray-600 mb-8">Ứng dụng công nghệ AI phân tích da hàng đầu</p>

                <div className="max-w-2xl mx-auto">
                    {imageSrc ? (
                        <img
                            src={imageSrc}
                            alt="Kết quả chụp"
                            className="rounded-xl shadow-lg border-4 border-white"
                        />
                    ) : mediaStream ? (
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="rounded-xl shadow-lg border-4 border-white w-full h-auto"
                        />
                    ) : (
                        <img
                            src="https://storage.googleapis.com/a1aa/image/-3JQEEOZB1p0JxOU_cJmL7S-p5Iube5WVuO_OgescsA.jpg"
                            alt="Hướng dẫn soi da"
                            className="rounded-xl shadow-lg border-4 border-white"
                        />
                    )}
                </div>

                <div className="mt-8 flex justify-center gap-4">
                    {imageSrc ? (
                        <button
                            onClick={retakePhoto}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-bold transform transition-all hover:scale-105"
                        >
                            <i className="fas fa-sync-alt mr-3"></i>CHỤP LẠI
                        </button>
                    ) : isCameraOpen ? (
                        <>
                            <button
                                onClick={capturePhoto}
                                className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full text-lg font-bold transform transition-all hover:scale-105"
                            >
                                <i className="fas fa-camera mr-3"></i>CHỤP ẢNH
                            </button>
                            <button
                                onClick={stopCamera}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-4 rounded-full text-lg font-bold transform transition-all hover:scale-105"
                            >
                                <i className="fas fa-times mr-3"></i>HỦY BỎ
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