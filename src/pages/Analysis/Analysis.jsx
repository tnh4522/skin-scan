import React, {useState, useEffect} from 'react';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function Analysis({activeSection, setActiveSection}) {
    const [loading, setLoading] = useState(true);
    const [loadingRecommendation, setLoadingRecommendation] = useState(false);

    let analysisResult = localStorage.getItem('analysisResult');
    analysisResult = analysisResult ? JSON.parse(analysisResult) : null;

    const imageUrl = analysisResult
        ? 'https://pet-commonly-whippet.ngrok-free.app/media/overlays/' + analysisResult.uid
        : 'https://pet-commonly-whippet.ngrok-free.app/media/gets/0a1e20ff-bdf0-417a-a91f-19d78c3293f9.png';

    const wsrs_level = analysisResult?.wsrs_level || 0;
    const wrinkle_evaluate = analysisResult?.wrinkle_evaluate || "";

    useEffect(() => {
        if (!analysisResult) {
            alert("Không có dữ liệu phân tích. Vui lòng thử lại.");
            setActiveSection('home');
            return;
        }

        setLoading(false);
    }, []);

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
                setActiveSection('advice');
            } else {
                alert("Không thể lấy tư vấn chăm sóc da.");
            }
        } catch (error) {
            console.error("Fetch recommendation error:", error);
            alert("Lỗi khi kết nối tới máy chủ tư vấn.");
        }

        setLoadingRecommendation(false);
    };

    if (loading) {
        return (
            <section id="analysis" className={`fade-in container mx-auto px-4 ${activeSection === 'analysis' ? 'block' : 'hidden'}`}>
                <div className="flex justify-center items-center h-64">
                    <p className="text-xl">Đang tải dữ liệu phân tích...</p>
                </div>
            </section>
        );
    }


    if (loading) {
        return (
            <section id="analysis"
                     className={`fade-in container mx-auto px-4 ${activeSection === 'analysis' ? 'block' : 'hidden'}`}>
                <div className="flex justify-center items-center h-64">
                    <p className="text-xl">Đang tải dữ liệu phân tích...</p>
                </div>
            </section>
        );
    }

    return (
        <section id="analysis"
                 className={`fade-in container mx-auto px-4 py-8 ${activeSection === 'analysis' ? 'block' : 'hidden'}`}>
            <div className="bg-blue-50 rounded-lg p-2 mb-2 text-center">
                <img src={imageUrl} alt="Skin Analysis" className="w-full h-auto rounded-lg shadow-lg mb-4"/>
                <p className="text-2xl font-bold">Mức độ lão hóa da :
                    <span className="text-red-600"> 1/5</span>
                </p>

                <div className="mt-4 flex flex-col lg:flex-row justify-center gap-4">
                    <div className="relative w-full max-w-md rounded-lg overflow-hidden mx-auto lg:mx-0">
                        {/*<Slider {...sliderSettings} className="skin-analysis-slider">*/}
                        {/*</Slider>*/}
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                <div className="bg-white rounded-lg p-6 shadow-lg border-t-4 border-blue-500">
                    <h3 className="text-lg font-bold text-red-600 mb-4">Nếp Nhăn ({wsrs_level}/4)</h3>
                    <div className="relative h-2 w-full bg-gray-200 rounded-full mb-4">
                        <div
                            className="absolute top-0 left-0 h-2 bg-blue-500 rounded-full"
                            style={{width: `${wsrs_level * 25}%`}}
                        ></div>
                    </div>
                    <div
                        className="text-sm leading-relaxed formatted-content"
                        dangerouslySetInnerHTML={{
                            __html: wrinkle_evaluate
                                .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-red-600">$1</strong>')
                                .replace(/\* ([^*]+?)(?=\s*\*|$)/g, '<div class="flex items-start mb-2"><span class="text-purple-500 mr-2">•</span><span>$1</span></div>')
                        }}
                    />
                </div>

                <div className="bg-white rounded-lg p-6 shadow-lg border-t-4 border-yellow-500">
                    <h3 className="text-lg font-bold text-red-600 mb-4">Đốm Sắc Tố (3/5)</h3>
                    <div className="relative h-2 w-full bg-gray-200 rounded-full mb-4">
                        <div
                            className="absolute top-0 left-0 h-2 bg-yellow-500 rounded-full"
                            style={{width: `${3 * 20}%`}}
                        ></div>
                    </div>
                    <p className="text-sm">
                        Da có dấu hiệu đốm nâu, cần chăm sóc đặc biệt
                    </p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-lg border-t-4 border-purple-500">
                    <h3 className="text-lg font-bold text-red-600 mb-4">Khô Da (2/5)</h3>
                    <div className="relative h-2 w-full bg-gray-200 rounded-full mb-4">
                        <div
                            className="absolute top-0 left-0 h-2 bg-purple-500 rounded-full"
                            style={{width: `${2 * 20}%`}}
                        ></div>
                    </div>
                    <p className="text-sm">
                        Da bạn khá khô, cần bổ sung độ ẩm
                    </p>
                </div>
            </div>

            <div className="text-center">
                <button
                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition shadow-lg mr-4"
                    onClick={() => window.location.reload()}>
                    Phân tích lại
                </button>
                <button
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-lg"
                    onClick={fetchRecommendation}
                    disabled={loadingRecommendation}
                >
                    {loadingRecommendation ? 'Đang tư vấn...' : 'Tư vấn chăm sóc da'}
                </button>
            </div>
        </section>
    );
}

export default Analysis;