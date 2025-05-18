import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

function Analysis({ activeSection, setActiveSection }) {
    const [skinData, setSkinData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In a real application, you would import the data or fetch it
        // For this example, we'll use a dynamic import
        import('../../response/response-example.json')
            .then(data => {
                setSkinData(data.default);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error loading skin data:", error);
                setLoading(false);
            });
    }, []);

    // Calculate skin aging score based on various factors
    const calculateSkinAgingScore = (data) => {
        if (!data || !data.result) return { score: 0, status: "Unknown" };

        const factors = [
            data.result.forehead_wrinkle?.value || 0,
            data.result.crows_feet?.value || 0,
            data.result.eye_finelines?.value || 0,
            data.result.glabella_wrinkle?.value || 0,
            data.result.nasolabial_fold?.value || 0,
            data.result.nasolabial_fold_severity?.value || 0,
            data.result.dark_circle?.value || 0,
            data.result.eye_pouch?.value || 0
        ];

        // Calculate average and normalize to a 0-10 scale
        const sum = factors.reduce((a, b) => a + b, 0);
        const avg = sum / factors.length;
        const score = (avg * 5).toFixed(1); // Assuming max value is 2, normalize to 10

        // Determine status based on score
        let status = "Normal";
        if (score < 3) status = "Excellent";
        else if (score < 5) status = "Good";
        else if (score > 7) status = "Concerning";

        return { score, status };
    };

    // Calculate scores for specific areas
    const calculateAreaScores = (data) => {
        if (!data || !data.result) return {};

        // Wrinkles score
        const wrinklesFactors = [
            data.result.forehead_wrinkle?.value || 0,
            data.result.crows_feet?.value || 0,
            data.result.eye_finelines?.value || 0,
            data.result.glabella_wrinkle?.value || 0,
            data.result.nasolabial_fold?.value || 0
        ];
        const wrinklesScore = Math.round((wrinklesFactors.reduce((a, b) => a + b, 0) / wrinklesFactors.length) * 5);

        // Pigmentation score
        const pigmentationFactors = [
            (data.result.skin_spot?.rectangle?.length || 0) > 0 ? 2 : 0,
            data.result.blackhead?.value || 0
        ];
        const pigmentationScore = Math.round((pigmentationFactors.reduce((a, b) => a + b, 0) / pigmentationFactors.length) * 5);

        // Dryness/Oiliness score based on skin type
        const skinTypeValue = data.result.skin_type?.skin_type || 0;
        // Normalize to 0-10 scale where 5 is balanced
        const drynessScore = Math.min(10, Math.max(0, Math.abs(skinTypeValue - 2) * 3 + 4));

        return {
            wrinkles: wrinklesScore,
            pigmentation: pigmentationScore,
            dryness: drynessScore
        };
    };

    // Base skin image with face detection component
    const SkinBaseImage = ({ skinData }) => (
        <div className="relative w-full h-full">
            <img
                src="http://localhost:8000/media/uploads/1741780530.png"
                alt="Skin Analysis"
                className="w-full h-auto rounded-lg shadow-lg"
            />

            {/* Face rectangle indicator */}
            <div
                className="absolute border-2 border-blue-400 rounded-lg"
                style={{
                    width: `${skinData?.face_rectangle?.width || 230}px`,
                    height: `${skinData?.face_rectangle?.height || 240}px`,
                    left: `${skinData?.face_rectangle?.left || 100}px`,
                    top: `${skinData?.face_rectangle?.top || 120}px`,
                    pointerEvents: 'none'
                }}
            ></div>
        </div>
    );

    // Acne slide component
    const AcneSlide = ({ skinData }) => (
        <div className="relative w-full h-full">
            <SkinBaseImage skinData={skinData} />

            {/* Plot acne positions */}
            {skinData?.result?.acne?.rectangle?.map((rect, index) => (
                <div
                    key={`acne-${index}`}
                    className="absolute bg-red-500 opacity-70 rounded-full flex items-center justify-center border border-white"
                    style={{
                        width: `${rect.width + 4}px`,
                        height: `${rect.height + 4}px`,
                        left: `${rect.left}px`,
                        top: `${rect.top}px`,
                        pointerEvents: 'none',
                        zIndex: 20
                    }}
                    title={`Mụn (Độ tin cậy: ${(skinData.result.acne.confidence[index] * 100).toFixed(0)}%)`}
                >
                    <span className="text-xs text-white font-bold">A</span>
                </div>
            ))}

            <div className="absolute bottom-4 left-4 bg-white bg-opacity-80 p-2 rounded-lg">
                <h3 className="font-bold text-red-600">Mụn</h3>
                <p className="text-sm">Số lượng: {skinData?.result?.acne?.rectangle?.length || 0}</p>
            </div>
        </div>
    );

    // Mole slide component
    const MoleSlide = ({ skinData }) => (
        <div className="relative w-full h-full">
            <SkinBaseImage skinData={skinData} />

            {/* Plot moles */}
            {skinData?.result?.mole?.rectangle?.map((rect, index) => (
                <div
                    key={`mole-${index}`}
                    className="absolute bg-yellow-800 opacity-80 rounded-full flex items-center justify-center border border-white"
                    style={{
                        width: `${rect.width + 4}px`,
                        height: `${rect.height + 4}px`,
                        left: `${rect.left}px`,
                        top: `${rect.top}px`,
                        pointerEvents: 'none',
                        zIndex: 20
                    }}
                    title={`Nốt ruồi (Độ tin cậy: ${(skinData.result.mole.confidence[index] * 100).toFixed(0)}%)`}
                >
                    <span className="text-xs text-white font-bold">M</span>
                </div>
            ))}

            <div className="absolute bottom-4 left-4 bg-white bg-opacity-80 p-2 rounded-lg">
                <h3 className="font-bold text-yellow-800">Nốt ruồi</h3>
                <p className="text-sm">Số lượng: {skinData?.result?.mole?.rectangle?.length || 0}</p>
            </div>
        </div>
    );

    // Skin spot slide component
    const SpotSlide = ({ skinData }) => (
        <div className="relative w-full h-full">
            <SkinBaseImage skinData={skinData} />

            {/* Plot skin spots */}
            {skinData?.result?.skin_spot?.rectangle?.map((rect, index) => (
                <div
                    key={`spot-${index}`}
                    className="absolute bg-yellow-500 opacity-80 rounded-full flex items-center justify-center border border-white"
                    style={{
                        width: `${rect.width + 4}px`,
                        height: `${rect.height + 4}px`,
                        left: `${rect.left}px`,
                        top: `${rect.top}px`,
                        pointerEvents: 'none',
                        zIndex: 20
                    }}
                    title={`Đốm nâu (Độ tin cậy: ${(skinData.result.skin_spot.confidence[index] * 100).toFixed(0)}%)`}
                >
                    <span className="text-xs text-white font-bold">S</span>
                </div>
            ))}

            <div className="absolute bottom-4 left-4 bg-white bg-opacity-80 p-2 rounded-lg">
                <h3 className="font-bold text-yellow-500">Đốm nâu</h3>
                <p className="text-sm">Số lượng: {skinData?.result?.skin_spot?.rectangle?.length || 0}</p>
            </div>
        </div>
    );

    // Wrinkle slide component
    const WrinkleSlide = ({ skinData, areaScores }) => (
        <div className="relative w-full h-full">
            <SkinBaseImage skinData={skinData} />

            {/* Add wrinkle indicators */}
            {skinData?.result?.forehead_wrinkle?.value > 0 && (
                <div
                    className="absolute border-2 border-pink-400 rounded-full flex items-center justify-center bg-white bg-opacity-50 px-2"
                    style={{
                        left: `${(skinData.face_rectangle.left + skinData.face_rectangle.width/2) - 40}px`,
                        top: `${skinData.face_rectangle.top + 20}px`,
                        pointerEvents: 'none',
                        zIndex: 20
                    }}
                >
                    <span className="text-xs text-pink-700 font-bold">Nếp nhăn trán</span>
                </div>
            )}

            {skinData?.result?.nasolabial_fold?.value > 0 && (
                <div
                    className="absolute border-2 border-pink-400 rounded-full flex items-center justify-center bg-white bg-opacity-50 px-2"
                    style={{
                        left: `${(skinData.face_rectangle.left + skinData.face_rectangle.width) - 50}px`,
                        top: `${skinData.face_rectangle.top + skinData.face_rectangle.height/2}px`,
                        pointerEvents: 'none',
                        zIndex: 20
                    }}
                >
                    <span className="text-xs text-pink-700 font-bold">Nếp khóe mũi</span>
                </div>
            )}

            <div className="absolute bottom-4 left-4 bg-white bg-opacity-80 p-2 rounded-lg">
                <h3 className="font-bold text-pink-600">Nếp nhăn ({areaScores.wrinkles}/10)</h3>
                <div className="relative h-2 bg-gray-200 rounded-full my-2 w-32">
                    <div
                        className="absolute h-2 bg-gradient-to-r from-green-500 to-red-500 rounded-full"
                        style={{ width: `${areaScores.wrinkles * 10}%` }}
                    ></div>
                </div>
                <p className="text-xs">
                    {areaScores.wrinkles <= 3 && "Da còn rất tốt, ít dấu hiệu lão hóa"}
                    {areaScores.wrinkles > 3 && areaScores.wrinkles <= 6 && "Bắt đầu xuất hiện nếp nhăn nhẹ"}
                    {areaScores.wrinkles > 6 && "Cần chăm sóc chuyên sâu"}
                </p>
            </div>
        </div>
    );

    // Dark circles and eye pouches slide
    const EyeIssuesSlide = ({ skinData }) => (
        <div className="relative w-full h-full">
            <SkinBaseImage skinData={skinData} />

            {/* Eye area indicators */}
            {skinData?.result?.dark_circle?.value > 0 && (
                <div
                    className="absolute border-2 border-purple-400 rounded-full flex items-center justify-center bg-white bg-opacity-50 px-2"
                    style={{
                        left: `${skinData.face_rectangle.left + skinData.face_rectangle.width/4}px`,
                        top: `${skinData.face_rectangle.top + skinData.face_rectangle.height/3}px`,
                        pointerEvents: 'none',
                        zIndex: 20
                    }}
                >
                    <span className="text-xs text-purple-700 font-bold">Quầng thâm</span>
                </div>
            )}

            {skinData?.result?.eye_pouch?.value > 0 && (
                <div
                    className="absolute border-2 border-blue-400 rounded-full flex items-center justify-center bg-white bg-opacity-50 px-2"
                    style={{
                        left: `${skinData.face_rectangle.left + (skinData.face_rectangle.width * 3/4)}px`,
                        top: `${skinData.face_rectangle.top + skinData.face_rectangle.height/3}px`,
                        pointerEvents: 'none',
                        zIndex: 20
                    }}
                >
                    <span className="text-xs text-blue-700 font-bold">Túi mắt</span>
                </div>
            )}

            <div className="absolute bottom-4 left-4 bg-white bg-opacity-80 p-2 rounded-lg">
                <h3 className="font-bold text-purple-600">Vùng mắt</h3>
                {skinData?.result?.dark_circle?.value > 0 && (
                    <p className="text-xs">Quầng thâm: {skinData?.result?.dark_circle?.value}/2</p>
                )}
                {skinData?.result?.eye_pouch?.value > 0 && (
                    <p className="text-xs">Túi mắt: {skinData?.result?.eye_pouch?.value}/2</p>
                )}
            </div>
        </div>
    );

    if (loading) {
        return (
            <section id="analysis" className={`fade-in container mx-auto px-4 ${activeSection === 'analysis' ? 'block' : 'hidden'}`}>
                <div className="flex justify-center items-center h-64">
                    <p className="text-xl">Đang tải dữ liệu phân tích...</p>
                </div>
            </section>
        );
    }

    const agingResult = calculateSkinAgingScore(skinData);
    const areaScores = calculateAreaScores(skinData);

    // Slider settings
    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        pauseOnHover: true,
        adaptiveHeight: true,
        arrows: true
    };

    // Find skin concerns
    const hasAcne = skinData?.result?.acne?.rectangle?.length > 0;
    const hasMoles = skinData?.result?.mole?.rectangle?.length > 0;
    const hasSpots = skinData?.result?.skin_spot?.rectangle?.length > 0;
    const hasSensitivity = skinData?.result?.sensitivity?.sensitivity_area > 0.2;

    return (
        <section id="analysis" className={`fade-in container mx-auto px-4 py-8 ${activeSection === 'analysis' ? 'block' : 'hidden'}`}>
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">PHÂN TÍCH CHI TIẾT</h2>

            <div className="bg-blue-50 rounded-lg p-6 mb-8 text-center">
                <p className="text-2xl font-bold">Skin Aging:
                    <span className="text-red-600"> {agingResult.score}/10</span>
                    <span className="text-gray-600"> ({agingResult.status})</span>
                </p>

                {skinData?.warning && (
                    <div className="mt-2 text-amber-600 text-sm">
                        <p>Lưu ý: {skinData.warning.join(', ')}</p>
                    </div>
                )}

                <div className="mt-4 flex flex-col lg:flex-row justify-center gap-4">
                    <div className="relative w-full max-w-md rounded-lg overflow-hidden mx-auto lg:mx-0">
                        <Slider {...sliderSettings} className="skin-analysis-slider">
                            {hasAcne && <AcneSlide skinData={skinData} />}
                            {hasMoles && <MoleSlide skinData={skinData} />}
                            {hasSpots && <SpotSlide skinData={skinData} />}
                            <WrinkleSlide skinData={skinData} areaScores={areaScores} />
                            <EyeIssuesSlide skinData={skinData} />
                        </Slider>
                    </div>

                    {/* Legend */}
                    <div className="bg-white p-4 rounded-lg shadow-lg">
                        <h4 className="font-bold text-gray-700 mb-2">Chú thích</h4>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center">
                                <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
                                <span className="text-sm">Mụn (A)</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-4 h-4 rounded-full bg-yellow-800 mr-2"></div>
                                <span className="text-sm">Nốt ruồi (M)</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
                                <span className="text-sm">Đốm nâu (S)</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-4 h-4 border-2 border-pink-400 mr-2"></div>
                                <span className="text-sm">Nếp nhăn</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-4 h-4 border-2 border-purple-400 mr-2"></div>
                                <span className="text-sm">Quầng thâm</span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-4 h-4 border-2 border-blue-400 mr-2"></div>
                                <span className="text-sm">Túi mắt</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                <div className="bg-white rounded-lg p-6 shadow-lg border-t-4 border-blue-500">
                    <h3 className="text-lg font-bold text-red-600 mb-4">Wrinkles ({areaScores.wrinkles}/10)</h3>
                    <div className="relative h-2 bg-gray-200 rounded-full mb-4">
                        <div
                            className="absolute h-2 bg-gradient-to-r from-green-500 to-red-500 rounded-full"
                            style={{ width: `${areaScores.wrinkles * 10}%` }}
                        ></div>
                    </div>
                    <p className="text-sm">
                        {areaScores.wrinkles <= 3 && "Da còn rất tốt, ít dấu hiệu lão hóa"}
                        {areaScores.wrinkles > 3 && areaScores.wrinkles <= 6 && "Da bắt đầu xuất hiện nếp nhăn nhẹ, độ đàn hồi giảm"}
                        {areaScores.wrinkles > 6 && "Da có dấu hiệu lão hóa rõ rệt, cần chăm sóc chuyên sâu"}
                    </p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-lg border-t-4 border-yellow-500">
                    <h3 className="text-lg font-bold text-red-600 mb-4">Pigmentation ({areaScores.pigmentation}/10)</h3>
                    <div className="relative h-2 bg-gray-200 rounded-full mb-4">
                        <div
                            className="absolute h-2 bg-gradient-to-r from-green-500 to-red-500 rounded-full"
                            style={{ width: `${areaScores.pigmentation * 10}%` }}
                        ></div>
                    </div>
                    <p className="text-sm">
                        {skinData?.result?.skin_type?.skin_type === 3 && "Da dầu, cần kiểm soát bã nhờn và ngăn ngừa viêm"}
                        {skinData?.result?.skin_type?.skin_type === 2 && "Da hỗn hợp, cần cân bằng vùng da dầu và khô"}
                        {skinData?.result?.skin_type?.skin_type === 1 && "Da khô, cần bổ sung độ ẩm"}
                        {(skinData?.result?.skin_type?.skin_type === 0 || !skinData?.result?.skin_type?.skin_type) && "Chưa xác định loại da"}
                    </p>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-lg border-t-4 border-purple-500">
                    <h3 className="text-lg font-bold text-red-600 mb-4">Skin Dryness ({areaScores.dryness}/10)</h3>
                    <div className="relative h-2 bg-gray-200 rounded-full mb-4">
                        <div
                            className="absolute h-2 bg-gradient-to-r from-green-500 to-red-500 rounded-full"
                            style={{ width: `${areaScores.dryness * 10}%` }}
                        ></div>
                    </div>
                    <p className="text-sm">
                        {areaScores.dryness <= 3 && "Da bạn khá khô, cần bổ sung độ ẩm"}
                        {areaScores.dryness > 3 && areaScores.dryness < 7 && "Vùng mắt thiếu độ ẩm, cần chăm sóc đặc biệt"}
                        {areaScores.dryness >= 7 && "Da bạn có dấu hiệu tiết nhiều dầu, cần cân bằng"}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg mb-8">
                <h3 className="text-xl font-bold mb-4 text-gray-800">Chi tiết các vấn đề về da</h3>

                <div className="space-y-4">
                    {hasAcne && (
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                            <p>Mụn: {skinData?.result?.acne?.rectangle?.length} vị trí</p>
                        </div>
                    )}

                    {hasMoles && (
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-yellow-800 rounded-full mr-2"></div>
                            <p>Nốt ruồi: {skinData?.result?.mole?.rectangle?.length} vị trí</p>
                        </div>
                    )}

                    {hasSpots && (
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                            <p>Đốm nâu: {skinData?.result?.skin_spot?.rectangle?.length} vị trí</p>
                        </div>
                    )}

                    {hasSensitivity && (
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-pink-500 rounded-full mr-2"></div>
                            <p>Da nhạy cảm: Vùng nhạy cảm {(skinData?.result?.sensitivity?.sensitivity_area * 100).toFixed(0)}% với cường độ {skinData?.result?.sensitivity?.sensitivity_intensity?.toFixed(1)}</p>
                        </div>
                    )}

                    {skinData?.result?.dark_circle?.value > 0 && (
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
                            <p>Quầng thâm mắt: Mức độ {skinData?.result?.dark_circle?.value}/2 (Độ tin cậy: {(skinData?.result?.dark_circle?.confidence * 100).toFixed(0)}%)</p>
                        </div>
                    )}

                    {skinData?.result?.eye_pouch?.value > 0 && (
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                            <p>Túi mắt: Mức độ {skinData?.result?.eye_pouch?.value}/2 (Độ tin cậy: {(skinData?.result?.eye_pouch?.confidence * 100).toFixed(0)}%)</p>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .skin-analysis-slider .slick-slide {
                    height: 400px;
                }
                .skin-analysis-slider .slick-dots {
                    bottom: -30px;
                }
                .skin-analysis-slider .slick-prev,
                .skin-analysis-slider .slick-next {
                    z-index: 10;
                }
                .skin-analysis-slider .slick-prev {
                    left: 10px;
                }
                .skin-analysis-slider .slick-next {
                    right: 10px;
                }
            `}</style>

            <div className="text-center">
                <button
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-lg"
                    onClick={() => setActiveSection('advice')}
                >
                    Tư vấn chăm sóc da
                </button>
            </div>
        </section>
    );
}

export default Analysis;