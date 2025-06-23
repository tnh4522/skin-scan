import React, { useState, useEffect } from 'react';
import { Camera, Eye, Sun, Droplets, TrendingUp, RefreshCw, Heart, Sparkles } from 'lucide-react';

function Analysis({ activeSection = 'analysis', setActiveSection = () => {} }) {
    const [loadingRecommendation, setLoadingRecommendation] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    const mockAnalysis = {
        uid: 'mock-uid-12345',
        wsrs_level: 2,
        wrinkle_evaluate: `**Tình trạng nếp nhăn:**\n\n* Có một số nếp nhăn nông ở vùng mắt và trán\n* Chưa có dấu hiệu nếp nhăn sâu rõ rệt\n* Cần dưỡng ẩm và chống nắng đầy đủ để ngăn ngừa lão hóa`,
        pigmentation_level: 3,
        dryness_level: 2,
    };

    const [analysisResult, setAnalysisResult] = useState(mockAnalysis);
    const [slides, setSlides] = useState([]);

    useEffect(() => {
        // Load analysis result
        let analysisResult = localStorage.getItem('analysisResult');
        analysisResult = analysisResult ? JSON.parse(analysisResult) : null;

        // Load images
        const imageUrl = localStorage.getItem('originalImage');
        let age_spot_output = localStorage.getItem('extracted_file_skinanalysisResult_hd_age_spot_output.png');
        let task_id = analysisResult.skin_analysis.task_id;
        let uuid = analysisResult.wrinkle.id;
        let age_spot_output_url = 'https://pet-commonly-whippet.ngrok-free.app/media/skin_analysis_results/' + task_id + '/skinanalysisResult/hd_age_spot_output.png';
        age_spot_output = age_spot_output ? JSON.parse(age_spot_output) : null;
        let moisture_output = localStorage.getItem('extracted_file_skinanalysisResult_hd_moisture_output.png');
        let moisture_output_url = 'https://pet-commonly-whippet.ngrok-free.app/media/skin_analysis_results/' + task_id + '/skinanalysisResult/hd_moisture_output.png';
        moisture_output = moisture_output ? JSON.parse(moisture_output) : null;
        let wrinkle_output = localStorage.getItem('extracted_file_skinanalysisResult_hd_wrinkle_output_all.png');
        wrinkle_output = wrinkle_output ? JSON.parse(wrinkle_output) : null;
        // let wrinkle_output_url = 'https://pet-commonly-whippet.ngrok-free.app/media/overlays/' + uuid + '.png';
        let wrinkle_output_url = 'https://pet-commonly-whippet.ngrok-free.app/media/skin_analysis_results/' + task_id + '/skinanalysisResult/hd_wrinkle_output_all.png';

        // Set analysis result
        setAnalysisResult(analysisResult || mockAnalysis);

        // Create slides array
        const slidesArray = [
            {
                id: 'original',
                title: 'Hình ảnh gốc',
                description: 'Ảnh chụp ban đầu của làn da',
                image: imageUrl || 'https://images.unsplash.com/photo-1494790108755-2616c667c01f?w=400&h=300&fit=crop',
                color: 'from-red-500 to-pink-600',
                icon: Camera
            }
        ];

        if (wrinkle_output && wrinkle_output.contentBase64) {
            slidesArray.push({
                id: 'wrinkle',
                title: 'Phân tích nếp nhăn',
                description: 'Hiển thị các vùng có nếp nhăn và mức độ lão hóa',
                image: `data:image/png;base64,${wrinkle_output.contentBase64}`,
                imageUrl: wrinkle_output_url,
                color: 'from-green-500 to-teal-600',
                icon: Eye
            });
        }

        if (age_spot_output && age_spot_output.contentBase64) {
            slidesArray.push({
                id: 'age_spot',
                title: 'Phân tích đốm sắc tố',
                description: 'Hiển thị các đốm nâu và vùng có sắc tố bất thường',
                image: `data:image/png;base64,${age_spot_output.contentBase64}`,
                imageUrl: age_spot_output_url,
                color: 'from-blue-500 to-teal-600',
                icon: Sun
            });
        }

        if (moisture_output && moisture_output.contentBase64) {
            slidesArray.push({
                id: 'moisture',
                title: 'Phân tích độ ẩm',
                description: 'Hiển thị các vùng có độ ẩm khác nhau trên da',
                image: `data:image/png;base64,${moisture_output.contentBase64}`,
                imageUrl: moisture_output_url,
                color: 'from-yellow-500 to-orange-600',
                icon: Droplets
            });
        }

        setSlides(slidesArray);
    }, [activeSection]);

    const wsrs_level = analysisResult?.wrinkle?.wsrs_level || 0;
    const wrinkle_evaluate = analysisResult?.wrinkle?.wrinkle_evaluate || "";
    const pigmentation_level = analysisResult?.pigmentation_level || 0;
    const dryness_level = analysisResult?.moisture_level || 0;
    const pigment_evaluate = analysisResult.evaluate_text?.pigment_evaluate || "";
    const moisture_evaluate = analysisResult.evaluate_text?.moisture_evaluate || "";

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

    function renderCard() {
        if (currentSlide == 1) {
            const Wrinkle = CustomIcons.Wrinkles;
            return <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border-t-4 border-green-500 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center mb-3 sm:mb-4">
                    <div className="bg-green-100 p-2 sm:p-3 rounded-full mr-3">
                        <Wrinkle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600"/>
                    </div>
                    <div>
                        <h3 className="text-base sm:text-lg font-bold text-green-800">Nếp Nhăn</h3>
                        <p className={`text-sm font-semibold ${getScoreColorText(wsrs_level, 4)}`}>
                            {wsrs_level}/4 - {getScoreText(wsrs_level, 4)}
                        </p>
                    </div>
                </div>

                <div className="relative h-2 w-full bg-gray-200 rounded-full mb-3 sm:mb-4">
                    <div className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-1000 ${getScoreColor(wsrs_level, 4)}`}
                        style={{width: `${wsrs_level * 25}%`}}
                    ></div>
                </div>

                <div className="text-xs sm:text-sm leading-relaxed text-gray-700 formatted-content"
                    dangerouslySetInnerHTML={{
                        __html: wrinkle_evaluate
                            .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-green-600">$1</strong>')
                            .replace(/\* ([^*]+?)(?=\s*\*|$)/g, '<div class="flex items-start mb-2"><span class="text-green-500 mr-2 text-xs">•</span><span class="text-xs">$1</span></div>')
                    }}
                />
            </div>
        } else if (currentSlide == 2) {
            const Pigmentation = CustomIcons.AgeSpots;
            return <div
                className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border-t-4 border-blue-500 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center mb-3 sm:mb-4">
                    <div className="bg-blue-100 p-2 sm:p-3 rounded-full mr-3">
                        <Pigmentation className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600"/>
                    </div>
                    <div>
                        <h3 className="text-base sm:text-lg font-bold text-blue-800">Đốm Sắc Tố</h3>
                        <p className={`text-sm font-semibold ${getScoreColorText(pigmentation_level, 4)}`}>
                            {pigmentation_level}/4 - {getScoreText(pigmentation_level, 4)}
                        </p>
                    </div>
                </div>

                <div className="relative h-2 w-full bg-gray-200 rounded-full mb-3 sm:mb-4">
                    <div className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-1000 ${getScoreColor(pigmentation_level, 5)}`}
                        style={{width: `${pigmentation_level * 20}%`}}
                    ></div>
                </div>

                <p className="text-xs sm:text-sm text-gray-700 formatted-content"
                    dangerouslySetInnerHTML={{
                        __html: pigment_evaluate
                            .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-blue-600">$1</strong>')
                            .replace(/\* ([^*]+?)(?=\s*\*|$)/g, '<div class="flex items-start mb-2"><span class="text-blue-500 mr-2 text-xs">•</span><span class="text-xs">$1</span></div>')
                    }}
                />
            </div>
        } else if (currentSlide == 3) {
            const Moisture = CustomIcons.Moisture;
            return <div
                className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border-t-4 border-orange-500 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 md:col-span-2 lg:col-span-1">
                <div className="flex items-center mb-3 sm:mb-4">
                    <div className="bg-orange-100 p-2 sm:p-3 rounded-full mr-3">
                        <Moisture className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600"/>
                    </div>
                    <div>
                        <h3 className="text-base sm:text-lg font-bold text-orange-800">Độ Khô Da</h3>
                        <p className={`text-sm font-semibold ${getScoreColorText(dryness_level, 4)}`}>
                            {dryness_level}/4 - {getScoreText(dryness_level, 4)}
                        </p>
                    </div>
                </div>

                <div className="relative h-2 w-full bg-gray-200 rounded-full mb-3 sm:mb-4">
                    <div
                        className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-1000 ${getScoreColor(dryness_level, 5)}`}
                        style={{width: `${dryness_level * 20}%`}}
                    ></div>
                </div>

                <p className="text-xs sm:text-sm text-gray-700 formatted-content"
                   dangerouslySetInnerHTML={{
                       __html: moisture_evaluate
                           .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-orange-600">$1</strong>')
                           .replace(/\* ([^*]+?)(?=\s*\*|$)/g, '<div class="flex items-start mb-2"><span class="text-orange-500 mr-2 text-xs">•</span><span class="text-xs">$1</span></div>')
                   }}>
                </p>
            </div>
        } else {
            return <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border-t-4 border-red-500 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 md:col-span-2 lg:col-span-1">
                <div className="flex items-start">
                    <div className="bg-red-100 p-2 sm:p-3 rounded-full mr-3 sm:mr-4 flex-shrink-0">
                        <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-red-600"/>
                    </div>
                    <div>
                        <h3 className="text-base sm:text-lg font-bold text-red-800 mb-2">Đánh Giá Tổng Quan</h3>
                        <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                            Làn da của bạn đang trong tình trạng khá tốt với mức độ lão hóa thấp.
                            Tuy nhiên, cần chú ý chăm sóc đặc biệt cho vùng đốm sắc tố và bổ sung độ ẩm.
                            Với quy trình chăm sóc phù hợp, bạn có thể duy trì và cải thiện tình trạng da hiệu quả.
                        </p>
                    </div>
                </div>
            </div>
        }
    }

    const CustomIcons = {
        Wrinkles: ({className}) => (
            <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12c2-2 4 2 6 0s4 2 6 0 4 2 6 0"/>
                <path d="M3 8c2-2 4 2 6 0s4 2 6 0 4 2 6 0"/>
                <path d="M3 16c2-2 4 2 6 0s4 2 6 0 4 2 6 0"/>
            </svg>
        ),

        AgeSpots: ({className}) => (
            <svg className={className} viewBox="0 0 24 24" fill="currentColor">
                <circle cx="6" cy="6" r="2"/>
                <circle cx="18" cy="8" r="1.5"/>
                <circle cx="12" cy="12" r="2.5"/>
                <circle cx="8" cy="18" r="1"/>
                <circle cx="16" cy="16" r="1.5"/>
            </svg>
        ),

        Moisture: ({className}) => (
            <svg className={className} viewBox="0 0 24 24" fill="currentColor">
                <path
                    d="M12 2.5c-1.5 2-3.5 4-3.5 7.5 0 3.5 2.5 6 5.5 6s5.5-2.5 5.5-6c0-3.5-2-5.5-3.5-7.5l-2-2.5-2 2.5z"/>
                <ellipse cx="10" cy="12" rx="1" ry="2" fill="white" opacity="0.3"/>
            </svg>
        )
    };

    const getSlideIcon = (slideId) => {
        switch(slideId) {
            case 'wrinkle':
                return CustomIcons.Wrinkles;
            case 'age_spot':
                return CustomIcons.AgeSpots;
            case 'moisture':
                return CustomIcons.Moisture;
            default:
                return Camera;
        }
    };

    return (
        <section id="analysis" className={`fade-in container mx-auto px-3 sm:px-4 py-3 sm:py-8 max-w-6xl ${activeSection === 'analysis' ? 'block' : 'hidden'}`}>
            {/* Image Analysis Carousel */}
            <div className={`bg-white rounded-2xl shadow-xl overflow-hidden mb-6 sm:mb-8 ${
                currentSlide === 0 ? 'border-2 border-t-4 border-b-4 border-red-500' : currentSlide === 1 ? 'border-2 border-t-4 border-b-4 border-green-500' : currentSlide === 2 ? 'border-2 border-t-4 border-b-4 border-blue-500' : currentSlide === 3 ? 'border-2 border-t-4 border-b-4 border-orange-500' : 'border-2 border-gray-300'
            }`}>
                <div className="relative">
                    {/* Main Carousel Container */}
                    <div className="relative h-72 sm:h-80 md:h-96 lg:h-[28rem] xl:h-[32rem] overflow-hidden bg-gray-100">
                        {/* Image Display */}
                        <div className="relative w-full h-full flex items-center justify-center">
                            {/* Original Image (Always visible as base) */}
                            <img
                                src={slides[0]?.image}
                                alt="Original skin image"
                                className="max-w-full max-h-full object-contain z-10"
                                style={{display: 'block'}}
                            />

                            {/* Overlay Image (Only when not on original slide and overlay is on) */}
                            {(currentSlide > 0) && (
                                <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                                    <img
                                        src={slides[currentSlide]?.imageUrl}
                                        alt={slides[currentSlide]?.title}
                                        className="max-w-full max-h-full object-contain mix-blend-multiply opacity-90 z-20"
                                        style={{display: 'block'}}
                                    />
                                </div>
                            )}

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

                    {/* Thumbnails */}
                    <div
                        className="bg-gray-50 p-4 flex gap-2 justify-center items-center overflow-x-auto scrollbar-hide">
                        {slides.map((slide, index) => {
                            const IconComponent = getSlideIcon(slide.id);

                            const getMainColor = (colorClass) => {
                                if (colorClass.includes('blue')) return 'blue';
                                if (colorClass.includes('red')) return 'red';
                                if (colorClass.includes('yellow') || colorClass.includes('orange')) return 'orange';
                                if (colorClass.includes('green') || colorClass.includes('teal')) return 'green';
                                return 'blue';
                            };

                            const mainColor = getMainColor(slide.color);

                            return <button
                                key={slide.id}
                                onClick={() => setCurrentSlide(index)}
                                className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 transition-all duration-100 flex flex-col items-center justify-center gap-1 focus:outline-none ${
                                    currentSlide === index ?
                                        `border-${mainColor}-600 bg-${mainColor}-50` :
                                        `border-${mainColor}-300 bg-white hover:bg-${mainColor}-50`
                                }`}
                            >
                                {/* Icon của từng slide */}
                                <IconComponent
                                    className={`w-10 h-10 ${currentSlide === index ? `text-${mainColor}-600` : `text-${mainColor}-300`}`}/>

                                {/* Label ngắn gọn */}
                                <span className={`text-xs font-medium text-center leading-tight text-${mainColor}-600`}>
                                        {slide.id === 'original' ? 'Gốc' : slide.id === 'wrinkle' ? 'Nhăn' : slide.id === 'age_spot' ? 'Đốm' : slide.id === 'moisture' ? 'Ẩm' : slide.title.split(' ')[0]}
                                    </span>
                            </button>
                        })}
                    </div>
                </div>

                {/* Loading state */}
                {slides.length === 0 && (
                    <div className="h-72 sm:h-80 md:h-96 bg-gray-100 flex items-center justify-center">
                        <div className="text-center">
                            <div
                                className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Đang tải hình ảnh phân tích...</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Analysis Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {renderCard()}
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
                            <div
                                className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2"></div>
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
        </section>
    );
}

export default Analysis;