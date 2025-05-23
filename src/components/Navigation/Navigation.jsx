import React from 'react';

function Navigation({ activeSection, setActiveSection }) {
    const handleSectionChange = (sectionId) => {
        setActiveSection(sectionId);
    };

    return (
        <div className="container mx-auto px-4 py-2">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-4">
                    <nav className="flex space-x-6">
                        <a
                            href="#home"
                            className={`section-toggle ${activeSection === 'home' ? 'nav-active text-blue-900 font-medium' : 'text-gray-600 hover:text-blue-900'}`}
                            onClick={() => handleSectionChange('home')}
                        >
                            <i className="fas fa-home text-2xl text-blue-900"></i>
                        </a>
                        {/*<a*/}
                        {/*    href="#history"*/}
                        {/*    className={`section-toggle ${activeSection === 'history' ? 'nav-active text-blue-900 font-medium' : 'text-gray-600 hover:text-blue-900'}`}*/}
                        {/*    onClick={() => handleSectionChange('history')}*/}
                        {/*>*/}
                        {/*    Lịch sử*/}
                        {/*</a>*/}
                        <a
                            href="#analysis"
                            className={`section-toggle ${activeSection === 'analysis' ? 'nav-active text-blue-900 font-medium' : 'text-gray-600 hover:text-blue-900'}`}
                            onClick={() => handleSectionChange('analysis')}
                        >
                            Phân tích
                        </a>
                        <a
                            href="#advice"
                            className={`section-toggle ${activeSection === 'advice' ? 'nav-active text-blue-900 font-medium' : 'text-gray-600 hover:text-blue-900'}`}
                            onClick={() => handleSectionChange('advice')}
                        >
                            Tư vấn
                        </a>
                    </nav>
                </div>
                <a href="#analysis" className="bg-blue-100 px-4 py-2 rounded-full text-blue-900 hover:bg-blue-200" onClick={() => handleSectionChange('analysis')}>
                    <i className="fas fa-chart-line mr-2"></i>Kết quả
                </a>
            </div>
        </div>
    );
}

export default Navigation;