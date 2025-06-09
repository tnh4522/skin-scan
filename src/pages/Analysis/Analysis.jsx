import React, { useState, useEffect } from 'react';
import { Camera, Star, Eye, Sun, Droplets, TrendingUp, RefreshCw, Heart, Sparkles, ChevronLeft, ChevronRight, Layers } from 'lucide-react';

function Analysis({ activeSection = 'analysis', setActiveSection = () => {} }) {
    const [loadingRecommendation, setLoadingRecommendation] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [showOverlay, setShowOverlay] = useState(true);

    const mockAnalysis = {
        uid: 'mock-uid-12345',
        wsrs_level: 2,
        wrinkle_evaluate: `**Tình trạng nếp nhăn:**\n\n* Có một số nếp nhăn nông ở vùng mắt và trán\n* Chưa có dấu hiệu nếp nhăn sâu rõ rệt\n* Cần dưỡng ẩm và chống nắng đầy đủ để ngăn ngừa lão hóa`,
        pigmentation_level: 3,
        dryness_level: 2,
    };

    const [analysisResult, setAnalysisResult] = useState(mockAnalysis);
    const [imageUrl, setImageUrl] = useState('');
    const [slides, setSlides] = useState([]);

    useEffect(() => {
        // Load analysis result
        let analysisResult = localStorage.getItem('analysisResult');
        analysisResult = analysisResult ? JSON.parse(analysisResult) : null;

        // Load images
        const imageUrl = localStorage.getItem('originalImage');
        let age_spot_output = localStorage.getItem('extracted_file_skinanalysisResult_hd_age_spot_output.png');
        age_spot_output = age_spot_output ? JSON.parse(age_spot_output) : null;
        let oiliness_output = localStorage.getItem('extracted_file_skinanalysisResult_hd_oiliness_output.png');
        oiliness_output = oiliness_output ? JSON.parse(oiliness_output) : null;
        let wrinkle_output = localStorage.getItem('extracted_file_skinanalysisResult_hd_wrinkle_output_all.png');
        wrinkle_output = wrinkle_output ? JSON.parse(wrinkle_output) : null;

        // Set analysis result
        setAnalysisResult(analysisResult || mockAnalysis);
        setImageUrl(imageUrl || 'https://images.unsplash.com/photo-1494790108755-2616c667c01f?w=400&h=300&fit=crop');

        // Create slides array
        const slidesArray = [
            {
                id: 'original',
                title: 'Hình ảnh gốc',
                description: 'Ảnh chụp ban đầu của làn da',
                image: imageUrl || 'https://images.unsplash.com/photo-1494790108755-2616c667c01f?w=400&h=300&fit=crop',
                color: 'from-blue-500 to-purple-600',
                icon: Camera
            }
        ];

        if (wrinkle_output && wrinkle_output.contentBase64) {
            slidesArray.push({
                id: 'wrinkle',
                title: 'Phân tích nếp nhăn',
                description: 'Hiển thị các vùng có nếp nhăn và mức độ lão hóa',
                image: `data:image/png;base64,${wrinkle_output.contentBase64}`,
                color: 'from-red-500 to-pink-600',
                icon: Eye
            });
        }

        if (age_spot_output && age_spot_output.contentBase64) {
            slidesArray.push({
                id: 'age_spot',
                title: 'Phân tích đốm sắc tố',
                description: 'Hiển thị các đốm nâu và vùng có sắc tố bất thường',
                image: `data:image/png;base64,${age_spot_output.contentBase64}`,
                color: 'from-yellow-500 to-orange-600',
                icon: Sun
            });
        }

        if (oiliness_output && oiliness_output.contentBase64) {
            slidesArray.push({
                id: 'oiliness',
                title: 'Phân tích độ nhờn',
                description: 'Hiển thị các vùng da nhờn và khô',
                image: `data:image/png;base64,${oiliness_output.contentBase64}`,
                color: 'from-green-500 to-teal-600',
                icon: Droplets
            });
        }

        setSlides(slidesArray);
    }, [activeSection]);

    const wsrs_level = analysisResult?.wsrs_level || 0;
    const wrinkle_evaluate = analysisResult?.wrinkle_evaluate || "";
    const pigmentation_level = analysisResult?.pigmentation_level || 3;
    const dryness_level = analysisResult?.dryness_level || 2;

    const fetchRecommendation = async () => {
        if (!analysisResult) return;
        setLoadingRecommendation(true);

        try {
            const response = await fetch('https://pet-commonly-whippet.ngrok-free.app/api/recommendation/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(analysisResult),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('recommendation', JSON.stringify(data.recommendation));
                setLoadingRecommendation(false);
                setActiveSection('advice');
            } else {
                alert("Không thể lấy tư vấn chăm sóc da.");
                setLoadingRecommendation(false);
            }
        } catch (error) {
            console.error("Fetch recommendation error:", error);
            alert("Lỗi khi kết nối tới máy chủ tư vấn.");
            setLoadingRecommendation(false);
        }
    };

    const getScoreColor = (score, maxScore) => {
        const percentage = (score / maxScore) * 100;
        if (percentage <= 25) return 'bg-green-500';
        if (percentage <= 50) return 'bg-yellow-500';
        if (percentage <= 75) return 'bg-orange-500';
        return 'bg-red-500';
    };

    const getScoreColorText = (score, maxScore) => {
        const percentage = (score / maxScore) * 100;
        if (percentage <= 25) return 'text-green-600';
        if (percentage <= 50) return 'text-yellow-600';
        if (percentage <= 75) return 'text-orange-600';
        return 'text-red-600';
    };

    const getScoreText = (score, maxScore) => {
        const percentage = (score / maxScore) * 100;
        if (percentage <= 25) return 'Tốt';
        if (percentage <= 50) return 'Trung bình';
        if (percentage <= 75) return 'Cần chú ý';
        return 'Cần cải thiện';
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    function renderCard() {
        if (currentSlide == 1) {
            return <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border-t-4 border-blue-500 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center mb-3 sm:mb-4">
                    <div className="bg-blue-100 p-2 sm:p-3 rounded-full mr-3">
                        <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600"/>
                    </div>
                    <div>
                        <h3 className="text-base sm:text-lg font-bold text-gray-800">Nếp Nhăn</h3>
                        <p className={`text-sm font-semibold ${getScoreColorText(wsrs_level, 4)}`}>
                            {wsrs_level}/4 - {getScoreText(wsrs_level, 4)}
                        </p>
                    </div>
                </div>

                <div className="relative h-2 w-full bg-gray-200 rounded-full mb-3 sm:mb-4">
                    <div
                        className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-1000 ${getScoreColor(wsrs_level, 4)}`}
                        style={{width: `${wsrs_level * 25}%`}}
                    ></div>
                </div>

                <div
                    className="text-xs sm:text-sm leading-relaxed text-gray-700 formatted-content"
                    dangerouslySetInnerHTML={{
                        __html: wrinkle_evaluate
                            .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-blue-600">$1</strong>')
                            .replace(/\* ([^*]+?)(?=\s*\*|$)/g, '<div class="flex items-start mb-2"><span class="text-blue-500 mr-2 text-xs">•</span><span class="text-xs">$1</span></div>')
                    }}
                />
            </div>
        } else if (currentSlide == 2) {
            return <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border-t-4 border-yellow-500 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center mb-3 sm:mb-4">
                    <div className="bg-yellow-100 p-2 sm:p-3 rounded-full mr-3">
                        <Sun className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600"/>
                    </div>
                    <div>
                        <h3 className="text-base sm:text-lg font-bold text-gray-800">Đốm Sắc Tố</h3>
                        <p className={`text-sm font-semibold ${getScoreColorText(pigmentation_level, 5)}`}>
                            {pigmentation_level}/5 - {getScoreText(pigmentation_level, 5)}
                        </p>
                    </div>
                </div>

                <div className="relative h-2 w-full bg-gray-200 rounded-full mb-3 sm:mb-4">
                    <div
                        className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-1000 ${getScoreColor(pigmentation_level, 5)}`}
                        style={{width: `${pigmentation_level * 20}%`}}
                    ></div>
                </div>

                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                    Da có dấu hiệu đốm nâu nhẹ, chủ yếu do tác động của tia UV. Cần sử dụng kem chống nắng và sản phẩm
                    làm sáng da.
                </p>
            </div>
        } else if (currentSlide == 3) {
            return <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border-t-4 border-purple-500 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 md:col-span-2 lg:col-span-1">
                <div className="flex items-center mb-3 sm:mb-4">
                    <div className="bg-purple-100 p-2 sm:p-3 rounded-full mr-3">
                        <Droplets className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600"/>
                    </div>
                    <div>
                        <h3 className="text-base sm:text-lg font-bold text-gray-800">Độ Khô Da</h3>
                        <p className={`text-sm font-semibold ${getScoreColorText(dryness_level, 5)}`}>
                            {dryness_level}/5 - {getScoreText(dryness_level, 5)}
                        </p>
                    </div>
                </div>

                <div className="relative h-2 w-full bg-gray-200 rounded-full mb-3 sm:mb-4">
                    <div
                        className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-1000 ${getScoreColor(dryness_level, 5)}`}
                        style={{width: `${dryness_level * 20}%`}}
                    ></div>
                </div>

                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                    Da có dấu hiệu khô nhẹ, cần bổ sung độ ẩm thường xuyên. Sử dụng serum hyaluronic acid và kem dưỡng
                    ẩm.
                </p>
            </div>
        }
    }

    return (
        <section id="analysis" className={`fade-in container mx-auto px-3 sm:px-4 py-3 sm:py-8 max-w-6xl ${activeSection === 'analysis' ? 'block' : 'hidden'}`}>

            {/* Header Section */}
            <div className="text-center mb-4 sm:mb-8">
                <div
                    className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-4 sm:p-6 text-white shadow-xl">
                    <div className="flex items-center justify-center mb-3 sm:mb-4">
                        <Camera className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3"/>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">KẾT QUẢ PHÂN TÍCH DA</h1>
                    </div>
                    <p className="text-sm sm:text-base opacity-90">Phân tích chi tiết tình trạng làn da của bạn</p>
                </div>
            </div>

            {/* Image Analysis Carousel */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6 sm:mb-8">
                {slides.length > 0 && (
                    <div className="relative">
                        {/* Main Carousel Container */}
                        <div className="relative h-64 sm:h-80 md:h-96 lg:h-[32rem] overflow-hidden bg-gray-100">
                            {/* Image Display */}
                            <div className="relative w-full h-full">
                                {/* Original Image (Always visible as base) */}
                                <img
                                    src={slides[0]?.image}
                                    alt="Original skin image"
                                    className="absolute inset-0 w-full h-full object-contain"
                                />

                                {/* Overlay Image (Only when not on original slide and overlay is on) */}
                                {currentSlide > 0 && showOverlay && (
                                    <div className="absolute inset-0 w-full h-full">
                                        <img
                                            src={slides[currentSlide]?.image}
                                            alt={slides[currentSlide]?.title}
                                            className="w-full h-full object-contain mix-blend-multiply opacity-90"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Navigation Controls */}
                            <div className="absolute inset-0 flex items-center justify-between p-4 pointer-events-none">
                                <button
                                    onClick={prevSlide}
                                    className="pointer-events-auto bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 backdrop-blur-sm shadow-lg"
                                    disabled={slides.length <= 1}
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={nextSlide}
                                    className="pointer-events-auto bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 backdrop-blur-sm shadow-lg"
                                    disabled={slides.length <= 1}
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Overlay Toggle (Only show when not on original) */}
                            {currentSlide > 0 && (
                                <button
                                    onClick={() => setShowOverlay(!showOverlay)}
                                    className="absolute top-4 left-4 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm shadow-lg flex items-center gap-2"
                                >
                                    <Layers className="w-4 h-4" />
                                    <span className="text-sm font-medium">
                                        {showOverlay ? 'Ẩn lớp phủ' : 'Hiện lớp phủ'}
                                    </span>
                                </button>
                            )}

                            {/* Slide Indicator Dots */}
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                                {slides.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentSlide(index)}
                                        className={`h-2 rounded-full transition-all duration-300 ${
                                            currentSlide === index
                                                ? 'w-8 bg-white'
                                                : 'w-2 bg-white/50 hover:bg-white/70'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Slide Info Bar */}
                        <div className={`bg-gradient-to-r ${slides[currentSlide]?.color} p-4 sm:p-6`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {slides[currentSlide]?.icon && (
                                        <div className="bg-white/20 p-2 rounded-lg">
                                            {React.createElement(slides[currentSlide].icon, {
                                                className: "w-5 h-5 sm:w-6 sm:h-6 text-white"
                                            })}
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="text-white font-bold text-base sm:text-lg">
                                            {slides[currentSlide]?.title}
                                        </h3>
                                        <p className="text-white/80 text-xs sm:text-sm">
                                            {slides[currentSlide]?.description}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-white text-sm font-medium">
                                    {currentSlide + 1} / {slides.length}
                                </div>
                            </div>
                        </div>

                        {/*/!* Thumbnails *!/*/}
                        {/*<div className="bg-gray-50 p-4 flex gap-2 overflow-x-auto">*/}
                        {/*    {slides.map((slide, index) => (*/}
                        {/*        <button*/}
                        {/*            key={slide.id}*/}
                        {/*            onClick={() => setCurrentSlide(index)}*/}
                        {/*            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${*/}
                        {/*                currentSlide === index*/}
                        {/*                    ? 'border-blue-500 shadow-lg scale-105'*/}
                        {/*                    : 'border-gray-300 hover:border-gray-400'*/}
                        {/*            }`}*/}
                        {/*        >*/}
                        {/*            <img*/}
                        {/*                src={slide.image}*/}
                        {/*                alt={slide.title}*/}
                        {/*                className="w-full h-full object-cover"*/}
                        {/*            />*/}
                        {/*        </button>*/}
                        {/*    ))}*/}
                        {/*</div>*/}
                    </div>
                )}

                {/* Loading state */}
                {slides.length === 0 && (
                    <div className="h-64 sm:h-80 md:h-96 bg-gray-100 flex items-center justify-center">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Đang tải hình ảnh phân tích...</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Analysis Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {renderCard()}
            </div>

            {/* Overall Assessment */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-green-200">
                <div className="flex items-start">
                    <div className="bg-green-100 p-2 sm:p-3 rounded-full mr-3 sm:mr-4 flex-shrink-0">
                        <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600"/>
                    </div>
                    <div>
                        <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2">Đánh Giá Tổng Quan</h3>
                        <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                            Làn da của bạn đang trong tình trạng khá tốt với mức độ lão hóa thấp.
                            Tuy nhiên, cần chú ý chăm sóc đặc biệt cho vùng đốm sắc tố và bổ sung độ ẩm.
                            Với quy trình chăm sóc phù hợp, bạn có thể duy trì và cải thiện tình trạng da hiệu quả.
                        </p>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                <button
                    className="w-full sm:w-auto bg-gradient-to-r from-red-500 to-red-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center font-semibold"
                    onClick={() => window.location.reload()}>
                    <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 mr-2"/>
                    Phân tích lại
                </button>

                <button
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center font-semibold disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                    onClick={fetchRecommendation}
                    disabled={loadingRecommendation}
                >
                    {loadingRecommendation ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
                            Đang tư vấn...
                        </>
                    ) : (
                        <>
                            <Heart className="w-4 h-4 sm:w-5 sm:h-5 mr-2"/>
                            Tư vấn chăm sóc da
                        </>
                    )}
                </button>
            </div>

            {/* Tips Section */}
            <div className="mt-6 sm:mt-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 sm:p-6 border border-purple-200">
                <div className="flex items-start">
                    <div className="bg-purple-100 p-2 sm:p-3 rounded-full mr-3 sm:mr-4 flex-shrink-0">
                        <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600"/>
                    </div>
                    <div>
                        <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2">Lời Khuyên Nhanh</h3>
                        <ul className="text-sm sm:text-base text-gray-700 space-y-1 sm:space-y-2">
                            <li className="flex items-start">
                                <span className="text-purple-500 mr-2">•</span>
                                <span>Sử dụng kem chống nắng hàng ngày để ngăn ngừa lão hóa da</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-purple-500 mr-2">•</span>
                                <span>Uống đủ nước và ngủ đủ giấc để da khỏe mạnh từ bên trong</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-purple-500 mr-2">•</span>
                                <span>Thực hiện routine chăm sóc da đều đặn 2 lần/ngày</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Analysis;