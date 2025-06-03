import React, {useEffect, useState} from 'react';
import {
    ChevronDown, ChevronUp, Heart, MessageCircle, Sun, Moon, Droplets,
    Sparkles, Clock, Shield
} from 'lucide-react';

function Advice({activeSection = 'advice'}) {
    // Mock data since we can't use localStorage in artifacts
    const mockRecommendation = {
        header: {
            age: "25-30 tuổi",
            condition: "Da hỗn hợp, mụn nhẹ"
        },
        morningRoutine: [
            {
                step: "1",
                product: "Sữa rửa mặt CeraVe Foaming Cleanser",
                ingredient: "Ceramides, Niacinamide",
                purpose: "Làm sạch da, duy trì hàng rào bảo vệ da",
                real_link: "https://example.com",
                real_image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&h=200&fit=crop",
                icon: "Droplets"
            },
            {
                step: "2",
                product: "Serum Vitamin C The Ordinary",
                ingredient: "L-Ascorbic Acid 10%",
                purpose: "Chống oxy hóa, làm sáng da",
                real_link: "https://example.com",
                real_image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=200&h=200&fit=crop",
                icon: "Sparkles"
            },
            {
                step: "3",
                product: "Kem chống nắng La Roche-Posay SPF50",
                ingredient: "Zinc Oxide, Titanium Dioxide",
                purpose: "Bảo vệ da khỏi tia UV",
                real_link: "https://example.com",
                real_image: "https://images.unsplash.com/photo-1576426863848-c21f53c60b19?w=200&h=200&fit=crop",
                icon: "Sun"
            }
        ],
        eveningRoutine: [
            {
                step: "1",
                product: "Dầu tẩy trang Hada Labo",
                ingredient: "Hyaluronic Acid",
                purpose: "Tẩy trang nhẹ nhàng, giữ ẩm",
                real_link: "https://example.com",
                real_image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=200&h=200&fit=crop",
                icon: "Droplets"
            },
            {
                step: "2",
                product: "Retinol Serum Paula's Choice",
                ingredient: "Retinol 0.5%",
                purpose: "Chống lão hóa, giảm mụn",
                real_link: "https://example.com",
                real_image: "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=200&h=200&fit=crop",
                icon: "Moon"
            },
            {
                step: "3",
                product: "Kem dưỡng ẩm Neutrogena",
                ingredient: "Hyaluronic Acid, Ceramides",
                purpose: "Phục hồi và dưỡng ẩm ban đêm",
                real_link: "https://example.com",
                real_image: "https://images.unsplash.com/photo-1564420595781-d840c7b23b77?w=200&h=200&fit=crop",
                icon: "Shield"
            }
        ],
        lifestyleTips: [
            {
                tip: "Uống đủ nước",
                detail: "2-3 lít nước mỗi ngày để da luôn căng mướt",
                icon: "💧"
            },
            {
                tip: "Ngủ đủ giấc",
                detail: "7-8 tiếng mỗi ngày để da tự phục hồi",
                icon: "😴"
            },
            {
                tip: "Ăn nhiều rau xanh",
                detail: "Bổ sung vitamin và chất chống oxy hóa",
                icon: "🥬"
            },
            {
                tip: "Tránh stress",
                detail: "Thực hành yoga, thiền để giảm căng thẳng",
                icon: "🧘‍♀️"
            },
            {
                tip: "Vận động thường xuyên",
                detail: "30 phút mỗi ngày để lưu thông máu tốt",
                icon: "🏃‍♀️"
            },
            {
                tip: "Tránh đường và đồ chiên",
                detail: "Hạn chế thực phẩm gây viêm da",
                icon: "🚫"
            }
        ],
        expertAdvice: [
            "Thoa kem chống nắng hàng ngày, kể cả khi ở trong nhà",
            "Không nặn mụn bằng tay để tránh để lại scar",
            "Thay gối và khăn mặt thường xuyên",
            "Patch test sản phẩm mới trước khi sử dụng",
            "Kiên nhẫn với skincare routine, kết quả thấy sau 4-6 tuần"
        ]
    };

    const [recommendation, setRecommendation] = useState(mockRecommendation);

    useEffect(() => {
        try {
            const storedData = localStorage.getItem('recommendation');
            if (storedData) {
                let parsedData;

                if (typeof storedData === 'string' && storedData.includes('```json')) {
                    const jsonMatch = storedData.match(/```json\s*([\s\S]*?)\s*```/);
                    if (jsonMatch && jsonMatch[1]) {
                        parsedData = JSON.parse(jsonMatch[1].trim());
                    }
                } else {
                    parsedData = JSON.parse(storedData);
                }

                if (parsedData && parsedData.header && parsedData.morningRoutine && parsedData.eveningRoutine) {
                    setRecommendation(parsedData);
                }
            }
        } catch (error) {
            console.error("Error parsing recommendation data from localStorage:", error);
        }
    }, []);

    if (!recommendation) {
        return (
            <section id="advice"
                     className={`fade-in container mx-auto px-3 sm:px-4 py-6 sm:py-8 ${activeSection === 'advice' ? 'block' : 'hidden'}`}>
                <div className="text-center text-gray-500">
                    <Heart className="w-8 h-8 text-red-400 mx-auto mb-4" />
                    <p className="text-base sm:text-lg font-medium">Không có dữ liệu tư vấn để hiển thị.</p>
                </div>
            </section>
        );
    }

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

    const morningRoutine = (recommendation.morningRoutine).map((item) => ({
        step: parseInt(item.step),
        product: item.product,
        ingredient: item.ingredient,
        purpose: item.purpose,
        link: item.real_link,
        image: item.real_image,
        icon: item.icon == "Droplets" ? <Droplets className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500"/> : item.icon == "Sparkles" ?
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500"/> : item.icon == "Sun" ?
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500"/> : item.icon == "Moon" ?
                    <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500"/> : <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-400"/>,
    }))

    const eveningRoutine = (recommendation.eveningRoutine).map((item) => ({
        step: parseInt(item.step),
        product: item.product,
        ingredient: item.ingredient,
        purpose: item.purpose,
        link: item.real_link,
        image: item.real_image,
        icon: item.icon == "Droplets" ? <Droplets className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500"/> : item.icon == "Sparkles" ?
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500"/> : item.icon == "Moon" ?
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500"/> : item.icon == "Shield" ?
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-500"/> : <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-red-400"/>,
    }));

    const lifestyleTips = (recommendation.lifestyleTips).map((item) => ({
        tip: item.tip,
        detail: item.detail,
        icon: item.icon,
    }));

    const expertAdvice = recommendation.expertAdvice;

    const RoutineCard = ({title, routine, timeIcon, bgColor}) => (
        <div className={`${bgColor} rounded-xl p-4 sm:p-6 shadow-lg`}>
            <div className="flex items-center mb-3 sm:mb-4">
                {timeIcon}
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 ml-2 sm:ml-3">{title}</h3>
            </div>
            <div className="space-y-3 sm:space-y-4">
                {routine.map((item, index) => (
                    <div key={index} className="bg-white/80 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-white/20">
                        <div className="flex items-start space-x-2 sm:space-x-3">
                            <div className="flex-shrink-0 bg-white rounded-full p-1.5 sm:p-2 shadow-sm">
                                {item.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="mb-2">
                                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium mr-2 inline-block">
                                        Bước {item.step}
                                    </span>
                                    <a className="font-semibold text-gray-800 text-sm sm:text-base break-words"
                                       href={item.link} target="_blank" rel="noopener noreferrer">
                                        {item.product}
                                    </a>
                                </div>
                                <p className="text-xs sm:text-sm text-blue-600 font-medium mb-1">{item.ingredient}</p>
                                <p className="text-xs sm:text-sm text-gray-600">{item.purpose}</p>
                            </div>
                            <div className="flex-shrink-0">
                                <img src={item.image} alt={item.product}
                                     className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg shadow-sm object-cover"/>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <section id="advice"
                 className={`fade-in container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-6xl ${activeSection === 'advice' ? 'block' : 'hidden'}`}>
            <div className="mx-auto">
                <div className="text-center mb-6 sm:mb-8">
                    <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 mb-4 sm:mb-6">
                        <div className="flex items-center justify-center mb-3 sm:mb-4">
                            <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 mr-2 sm:mr-3"/>
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">TƯ VẤN CHĂM SÓC DA</h1>
                        </div>
                        <div className="bg-gradient-to-r from-red-100 to-pink-100 rounded-lg p-3 sm:p-4">
                            <p className="text-sm sm:text-base lg:text-lg text-gray-700">
                                <span className="font-semibold">Độ tuổi:</span> {recommendation.header.age}
                                <br className="sm:hidden" />
                                <span className="font-semibold sm:ml-2">| Tình trạng:</span> {recommendation.header.condition}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mb-6 sm:mb-8">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 sm:p-6 cursor-pointer flex items-center justify-between"
                            onClick={() => toggleSection('routine')}>
                            <div className="flex items-center">
                                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white mr-2 sm:mr-3"/>
                                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">QUY TRÌNH CHĂM SÓC DA</h2>
                            </div>
                            {expandedSections.routine ? <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 text-white"/> :
                                <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-white"/>}
                        </div>
                        {expandedSections.routine && (
                            <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
                                <RoutineCard
                                    title="BUỔI SÁNG"
                                    routine={morningRoutine}
                                    timeIcon={<Sun className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500"/>}
                                    bgColor="bg-gradient-to-br from-yellow-100 to-orange-100"
                                />
                                <RoutineCard
                                    title="BUỔI TỐI"
                                    routine={eveningRoutine}
                                    timeIcon={<Moon className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500"/>}
                                    bgColor="bg-gradient-to-br from-indigo-100 to-purple-100"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="mb-6 sm:mb-8">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-green-600 to-teal-600 p-4 sm:p-6 cursor-pointer flex items-center justify-between"
                            onClick={() => toggleSection('lifestyle')}>
                            <div className="flex items-center">
                                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white mr-2 sm:mr-3"/>
                                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">THÓI QUEN SINH HOẠT</h2>
                            </div>
                            {expandedSections.lifestyle ? <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 text-white"/> :
                                <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-white"/>}
                        </div>
                        {expandedSections.lifestyle && (
                            <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                {lifestyleTips.map((item, index) => (
                                    <div key={index}
                                         className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-3 sm:p-4 border hover:shadow-md transition-shadow">
                                        <div className="flex items-center mb-2">
                                            <span className="text-xl sm:text-2xl mr-2 sm:mr-3">{item.icon}</span>
                                            <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{item.tip}</h3>
                                        </div>
                                        <p className="text-xs sm:text-sm text-gray-600">{item.detail}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mb-6 sm:mb-8">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 sm:p-6 cursor-pointer flex items-center justify-between"
                            onClick={() => toggleSection('expert')}>
                            <div className="flex items-center">
                                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white mr-2 sm:mr-3"/>
                                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">LỜI KHUYÊN CHUYÊN GIA</h2>
                            </div>
                            {expandedSections.expert ? <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6 text-white"/> :
                                <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-white"/>}
                        </div>
                        {expandedSections.expert && (
                            <div className="p-4 sm:p-6 space-y-2 sm:space-y-3 text-gray-700">
                                {expertAdvice.map((advice, index) => (
                                    <div key={index} className="flex items-start">
                                        <span className="text-pink-500 font-bold mr-2 mt-1">•</span>
                                        <p className="text-sm sm:text-base">{advice}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Advice;