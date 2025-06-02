import React, { useState } from 'react';
import {
    ChevronDown, ChevronUp, Heart, MessageCircle, Sun, Moon, Droplets,
    Sparkles, Clock, Shield
} from 'lucide-react';

function Advice() {
    const [expandedSections, setExpandedSections] = useState({
        routine: true,
        lifestyle: false,
        expert: false
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const morningRoutine = [
        { step: 1, product: "Sữa rửa mặt dịu nhẹ", ingredient: "CeraVe Hydrating Cleanser", purpose: "Loại bỏ bụi bẩn, dầu thừa, không làm khô da", icon: <Droplets className="w-5 h-5 text-blue-500" /> },
        { step: 2, product: "Toner cân bằng", ingredient: "Paula's Choice Enriched Calming Toner", purpose: "Cân bằng độ pH, làm dịu và tăng cường hàng rào bảo vệ da", icon: <Sparkles className="w-5 h-5 text-purple-500" /> },
        { step: 3, product: "Serum Vitamin C", ingredient: "Skinceuticals C E Ferulic", purpose: "Chống oxy hóa mạnh, làm sáng da, kích thích sản sinh collagen", icon: <Sun className="w-5 h-5 text-yellow-500" /> },
        { step: 4, product: "Kem dưỡng ẩm", ingredient: "CeraVe Facial Moisturizing Lotion AM", purpose: "Dưỡng ẩm sâu, củng cố hàng rào bảo vệ da", icon: <Droplets className="w-5 h-5 text-blue-400" /> },
        { step: 5, product: "Kem chống nắng SPF 50+", ingredient: "Anessa Perfect UV Sunscreen", purpose: "Ngăn chặn tia UV – nguyên nhân chính làm nếp nhăn sâu thêm", icon: <Shield className="w-5 h-5 text-orange-500" /> }
    ];

    const eveningRoutine = [
        { step: 1, product: "Tẩy trang & rửa mặt", ingredient: "Bioderma Sensibio H2O + CeraVe Cleanser", purpose: "Làm sạch lớp trang điểm, dầu nhờn, bụi bẩn suốt ngày", icon: <Droplets className="w-5 h-5 text-blue-500" /> },
        { step: 2, product: "Tẩy tế bào chết (1-2 lần/tuần)", ingredient: "Paula's Choice 8% AHA Gel", purpose: "Lột bỏ tế bào chết, giúp da sáng, hỗ trợ tái tạo", icon: <Sparkles className="w-5 h-5 text-pink-500" /> },
        { step: 3, product: "Serum Retinol 0.5-1%", ingredient: "La Roche-Posay Retinol B3 Serum", purpose: "Kích thích tái tạo tế bào, tăng sinh collagen, làm đầy nếp nhăn", icon: <Moon className="w-5 h-5 text-indigo-500" /> },
        { step: 4, product: "Kem dưỡng ẩm phục hồi", ingredient: "CeraVe PM Facial Moisturizing Lotion", purpose: "Giúp da phục hồi, hạn chế kích ứng khi dùng retinol", icon: <Heart className="w-5 h-5 text-red-400" /> }
    ];

    const lifestyleTips = [
        { tip: "Uống đủ nước", detail: "2-3 lít/ngày giúp duy trì độ ẩm cho da từ bên trong", icon: "💧" },
        { tip: "Ngủ đủ giấc", detail: "7-9 tiếng mỗi đêm thúc đẩy quá trình tái tạo da", icon: "😴" },
        { tip: "Ăn uống lành mạnh", detail: "Rau xanh, trái cây, omega-3 từ cá béo, hạt chia", icon: "🥗" },
        { tip: "Hạn chế căng thẳng", detail: "Thư giãn, thiền, tập yoga làm chậm quá trình lão hóa", icon: "🧘‍♀️" },
        { tip: "Tập luyện đều đặn", detail: "Cải thiện lưu thông máu, giúp da sáng khỏe", icon: "🏃‍♀️" },
        { tip: "Tránh tác hại", detail: "Hạn chế thuốc lá và đồ uống có cồn", icon: "🚫" }
    ];

    const expertAdvice = [
        "Đưa retinol vào chế độ chăm sóc từ từ: Bắt đầu 1-2 lượt/tuần",
        "Luôn giữ da ẩm và làm dịu khi dùng retinol",
        "Tham vấn bác sĩ da liễu nếu da nhạy cảm",
        "Tái khám định kỳ để điều chỉnh liệu trình",
        "Cân nhắc điều trị chuyên sâu như laser, filler nếu cần"
    ];

    const RoutineCard = ({ title, routine, timeIcon, bgColor }) => (
        <div className={`${bgColor} rounded-xl p-6 shadow-lg`}>
            <div className="flex items-center mb-4">
                {timeIcon}
                <h3 className="text-xl font-bold text-gray-800 ml-3">{title}</h3>
            </div>
            <div className="space-y-4">
                {routine.map((item, index) => (
                    <div key={index} className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 bg-white rounded-full p-2 shadow-sm">
                                {item.icon}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center mb-2">
                                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium mr-3">
                                        Bước {item.step}
                                    </span>
                                    <h4 className="font-semibold text-gray-800">{item.product}</h4>
                                </div>
                                <p className="text-sm text-blue-600 font-medium mb-1">{item.ingredient}</p>
                                <p className="text-sm text-gray-600">{item.purpose}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            <div className="container mx-auto px-4 py-8">
                <div className="text-center mb-8">
                    <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
                        <div className="flex items-center justify-center mb-4">
                            <Heart className="w-8 h-8 text-red-500 mr-3" />
                            <h1 className="text-3xl font-bold text-gray-800">TƯ VẤN CHĂM SÓC DA</h1>
                        </div>
                        <div className="bg-gradient-to-r from-red-100 to-pink-100 rounded-lg p-4 mb-4">
                            <p className="text-lg text-gray-700">
                                <span className="font-semibold">Độ tuổi:</span> 35 tuổi |
                                <span className="font-semibold ml-2">Tình trạng:</span> Nếp nhăn Grade 3 (WSRS)
                            </p>
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                            Với mức độ nếp nhăn đã rõ rệt, da cần liệu trình chuyên sâu tập trung vào
                            <span className="font-semibold text-blue-600"> phục hồi cấu trúc da, tăng sinh collagen</span> và
                            <span className="font-semibold text-purple-600"> làm mờ nếp nhăn sâu</span>.
                        </p>
                    </div>
                </div>

                <div className="mb-8">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 cursor-pointer flex items-center justify-between"
                             onClick={() => toggleSection('routine')}>
                            <div className="flex items-center">
                                <Clock className="w-6 h-6 text-white mr-3" />
                                <h2 className="text-2xl font-bold text-white">QUY TRÌNH CHĂM SÓC DA</h2>
                            </div>
                            {expandedSections.routine ? <ChevronUp className="w-6 h-6 text-white" /> : <ChevronDown className="w-6 h-6 text-white" />}
                        </div>
                        {expandedSections.routine && (
                            <div className="p-6 grid lg:grid-cols-2 gap-8">
                                <RoutineCard
                                    title="BUỔI SÁNG"
                                    routine={morningRoutine}
                                    timeIcon={<Sun className="w-6 h-6 text-yellow-500" />}
                                    bgColor="bg-gradient-to-br from-yellow-100 to-orange-100"
                                />
                                <RoutineCard
                                    title="BUỔI TỐI"
                                    routine={eveningRoutine}
                                    timeIcon={<Moon className="w-6 h-6 text-indigo-500" />}
                                    bgColor="bg-gradient-to-br from-indigo-100 to-purple-100"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="mb-8">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6 cursor-pointer flex items-center justify-between"
                             onClick={() => toggleSection('lifestyle')}>
                            <div className="flex items-center">
                                <Heart className="w-6 h-6 text-white mr-3" />
                                <h2 className="text-2xl font-bold text-white">THÓI QUEN SINH HOẠT</h2>
                            </div>
                            {expandedSections.lifestyle ? <ChevronUp className="w-6 h-6 text-white" /> : <ChevronDown className="w-6 h-6 text-white" />}
                        </div>
                        {expandedSections.lifestyle && (
                            <div className="p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {lifestyleTips.map((item, index) => (
                                    <div key={index} className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-4 border hover:shadow-md transition-shadow">
                                        <div className="flex items-center mb-2">
                                            <span className="text-2xl mr-3">{item.icon}</span>
                                            <h3 className="font-semibold text-gray-800">{item.tip}</h3>
                                        </div>
                                        <p className="text-sm text-gray-600">{item.detail}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mb-8">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 cursor-pointer flex items-center justify-between"
                             onClick={() => toggleSection('expert')}>
                            <div className="flex items-center">
                                <MessageCircle className="w-6 h-6 text-white mr-3" />
                                <h2 className="text-2xl font-bold text-white">LỜI KHUYÊN CHUYÊN GIA</h2>
                            </div>
                            {expandedSections.expert ? <ChevronUp className="w-6 h-6 text-white" /> : <ChevronDown className="w-6 h-6 text-white" />}
                        </div>
                        {expandedSections.expert && (
                            <div className="p-6 space-y-3 text-gray-700">
                                {expertAdvice.map((advice, index) => (
                                    <div key={index} className="flex items-start">
                                        <span className="text-pink-500 font-bold mr-2">•</span>
                                        <p>{advice}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Advice;
