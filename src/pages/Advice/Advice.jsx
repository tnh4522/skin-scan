import React, {useState} from 'react';
import {
    ChevronDown, ChevronUp, Heart, MessageCircle, Sun, Moon, Droplets,
    Sparkles, Clock, Shield
} from 'lucide-react';

function Advice({activeSection}) {
    const rawRecommendation = localStorage.getItem('recommendation');
    let recommendation = null;

    try {
        recommendation = JSON.parse(rawRecommendation);
    } catch (error) {
        console.error("Lỗi khi parse recommendation từ localStorage:", error);
    }

    if (!recommendation) {
        return (
            <section id="advice"
                     className={`fade-in container mx-auto px-4 py-8 ${activeSection === 'advice' ? 'block' : 'hidden'}`}>
                <div className="text-center text-gray-500">
                    <Heart className="w-8 h-8 text-red-400 mx-auto mb-4" />
                    <p className="text-lg font-medium">Không có dữ liệu tư vấn để hiển thị.</p>
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
        icon: item.icon == "Droplets" ? <Droplets className="w-5 h-5 text-blue-500"/> : item.icon == "Sparkles" ?
            <Sparkles className="w-5 h-5 text-purple-500"/> : item.icon == "Sun" ?
                <Sun className="w-5 h-5 text-yellow-500"/> : item.icon == "Moon" ?
                    <Moon className="w-5 h-5 text-indigo-500"/> : <Heart className="w-5 h-5 text-red-400"/>,
    }))

    const eveningRoutine = (recommendation.eveningRoutine).map((item) => ({
        step: parseInt(item.step),
        product: item.product,
        ingredient: item.ingredient,
        purpose: item.purpose,
        link: item.real_link,
        image: item.real_image,
        icon: item.icon == "Droplets" ? <Droplets className="w-5 h-5 text-blue-500"/> : item.icon == "Sparkles" ?
            <Sparkles className="w-5 h-5 text-purple-500"/> : item.icon == "Moon" ?
                <Moon className="w-5 h-5 text-indigo-500"/> : item.icon == "Shield" ?
                    <Shield className="w-5 h-5 text-green-500"/> : <Heart className="w-5 h-5 text-red-400"/>,
    }));

    const lifestyleTips = (recommendation.lifestyleTips).map((item) => ({
        tip: item.tip,
        detail: item.detail,
        icon: item.icon,
    }));

    const expertAdvice = recommendation.expertAdvice;

    const RoutineCard = ({title, routine, timeIcon, bgColor}) => (
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
                                <div className="mb-2">
                                    <span
                                        className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium mr-2 inline-block">
                                        Bước {item.step}
                                    </span>
                                    <a className="font-semibold text-gray-800 inline" href={item.link} target="_blank" rel="noopener noreferrer">
                                        {item.product}
                                    </a>
                                </div>
                                <p className="text-sm text-blue-600 font-medium mb-1">{item.ingredient}</p>
                                <p className="text-sm text-gray-600">{item.purpose}</p>
                            </div>
                            <div className="flex-shrink-0">
                                <img src={item.image} alt={item.product} className="w-16 h-16 rounded-lg shadow-sm"/>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <section id="advice"
                 className={`fade-in container mx-auto px-4 py-8 ${activeSection === 'advice' ? 'block' : 'hidden'}`}>
            <div className="mx-auto">
                <div className="text-center mb-8">
                    <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
                        <div className="flex items-center justify-center mb-4">
                            <Heart className="w-8 h-8 text-red-500 mr-3"/>
                            <h1 className="text-3xl font-bold text-gray-800">TƯ VẤN CHĂM SÓC DA</h1>
                        </div>
                        <div className="bg-gradient-to-r from-red-100 to-pink-100 rounded-lg p-4">
                            <p className="text-lg text-gray-700">
                                <span className="font-semibold">Độ tuổi:</span> {recommendation.header.age} |
                                <span className="font-semibold ml-2">Tình trạng:</span> {recommendation.header.condition}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mb-8">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 cursor-pointer flex items-center justify-between"
                            onClick={() => toggleSection('routine')}>
                            <div className="flex items-center">
                                <Clock className="w-6 h-6 text-white mr-3"/>
                                <h2 className="text-2xl font-bold text-white">QUY TRÌNH CHĂM SÓC DA</h2>
                            </div>
                            {expandedSections.routine ? <ChevronUp className="w-6 h-6 text-white"/> :
                                <ChevronDown className="w-6 h-6 text-white"/>}
                        </div>
                        {expandedSections.routine && (
                            <div className="p-6 grid lg:grid-cols-2 gap-8">
                                <RoutineCard
                                    title="BUỔI SÁNG"
                                    routine={morningRoutine}
                                    timeIcon={<Sun className="w-6 h-6 text-yellow-500"/>}
                                    bgColor="bg-gradient-to-br from-yellow-100 to-orange-100"
                                />
                                <RoutineCard
                                    title="BUỔI TỐI"
                                    routine={eveningRoutine}
                                    timeIcon={<Moon className="w-6 h-6 text-indigo-500"/>}
                                    bgColor="bg-gradient-to-br from-indigo-100 to-purple-100"
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="mb-8">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-green-600 to-teal-600 p-6 cursor-pointer flex items-center justify-between"
                            onClick={() => toggleSection('lifestyle')}>
                            <div className="flex items-center">
                                <Heart className="w-6 h-6 text-white mr-3"/>
                                <h2 className="text-2xl font-bold text-white">THÓI QUEN SINH HOẠT</h2>
                            </div>
                            {expandedSections.lifestyle ? <ChevronUp className="w-6 h-6 text-white"/> :
                                <ChevronDown className="w-6 h-6 text-white"/>}
                        </div>
                        {expandedSections.lifestyle && (
                            <div className="p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {lifestyleTips.map((item, index) => (
                                    <div key={index}
                                         className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-4 border hover:shadow-md transition-shadow">
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
                        <div
                            className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 cursor-pointer flex items-center justify-between"
                            onClick={() => toggleSection('expert')}>
                            <div className="flex items-center">
                                <MessageCircle className="w-6 h-6 text-white mr-3"/>
                                <h2 className="text-2xl font-bold text-white">LỜI KHUYÊN CHUYÊN GIA</h2>
                            </div>
                            {expandedSections.expert ? <ChevronUp className="w-6 h-6 text-white"/> :
                                <ChevronDown className="w-6 h-6 text-white"/>}
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
        </section>
    );
}

export default Advice;
