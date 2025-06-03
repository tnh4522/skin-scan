import React, {useState} from 'react';
import {Camera, Droplets, Eye, Heart, RefreshCw, Sparkles, Star, Sun, TrendingUp} from 'lucide-react';

function Analysis({activeSection = 'analysis', setActiveSection = () => {}}) {
    const [loadingRecommendation, setLoadingRecommendation] = useState(false);
    let analysisResult = localStorage.getItem('analysisResult');
    analysisResult = analysisResult ? JSON.parse(analysisResult) : null;

    const imageUrl = analysisResult
        ? 'https://pet-commonly-whippet.ngrok-free.app/media/overlays/' + analysisResult.uid
        : 'https://pet-commonly-whippet.ngrok-free.app/media/gets/0a1e20ff-bdf0-417a-a91f-19d78c3293f9.png';
    // Mock data since we can't use localStorage in artifacts

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
                localStorage.setItem('recommendation', data.recommendation);
                setLoadingRecommendation(false);
                setActiveSection('advice');
            } else {
                alert("Không thể lấy tư vấn chăm sóc da.");
            }
        } catch (error) {
            console.error("Fetch recommendation error:", error);
            alert("Lỗi khi kết nối tới máy chủ tư vấn.");
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

    return (
        <section id="analysis"
                 className={`fade-in container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-6xl ${activeSection === 'analysis' ? 'block' : 'hidden'}`}>

            {/* Header Section */}
            <div className="text-center mb-6 sm:mb-8">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-4 sm:p-6 text-white shadow-xl">
                    <div className="flex items-center justify-center mb-3 sm:mb-4">
                        <Camera className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3"/>
                        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">KẾT QUẢ PHÂN TÍCH DA</h1>
                    </div>
                    <p className="text-sm sm:text-base opacity-90">Phân tích chi tiết tình trạng làn da của bạn</p>
                </div>
            </div>

            {/* Image Analysis Result */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6 sm:mb-8">
                <div className="relative">
                    <img
                        src={imageUrl}
                        alt="Skin Analysis"
                        className="w-full h-78 sm:h-64 md:h-80 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                        <div className="flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-xl p-3 sm:p-4">
                            <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 mr-2"/>
                            <span className="text-lg sm:text-xl lg:text-2xl font-bold">
                                Mức độ lão hóa da:
                                <span className="text-yellow-400 ml-2">1/5</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Analysis Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">

                {/* Wrinkles Card */}
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border-t-4 border-blue-500 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
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

                {/* Pigmentation Card */}
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border-t-4 border-yellow-500 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
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
                        Da có dấu hiệu đốm nâu nhẹ, chủ yếu do tác động của tia UV. Cần sử dụng kem chống nắng và sản phẩm làm sáng da.
                    </p>
                </div>

                {/* Dryness Card */}
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border-t-4 border-purple-500 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 md:col-span-2 lg:col-span-1">
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
                        Da có dấu hiệu khô nhẹ, cần bổ sung độ ẩm thường xuyên. Sử dụng serum hyaluronic acid và kem dưỡng ẩm.
                    </p>
                </div>
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