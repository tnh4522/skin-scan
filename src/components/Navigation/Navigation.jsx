import React, { useState } from 'react';
import { BarChart3, MessageCircle, FlaskConical, TrendingUp, Menu, X, ScanFace} from 'lucide-react';

function Navigation({ activeSection, setActiveSection }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleSectionChange = (sectionId, event) => {
        event.preventDefault();
        setActiveSection(sectionId);
        setIsMobileMenuOpen(false); // Close mobile menu after selection
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const navigationItems = [
        {
            id: 'home',
            label: 'Phân Tích',
            icon: ScanFace,
            onClick: () => {
                window.location.reload();
                setIsMobileMenuOpen(false);
            }
        },
        {
            id: 'analysis',
            label: 'Kết Quả',
            icon: BarChart3,
            onClick: (e) => handleSectionChange('analysis', e)
        },
        {
            id: 'advice',
            label: 'Tư Vấn',
            icon: MessageCircle,
            onClick: (e) => handleSectionChange('advice', e)
        },
        {
            id: 'test',
            label: 'Test',
            icon: FlaskConical,
            onClick: (e) => handleSectionChange('test', e)
        }
    ];

    return (
        <div className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
                <div className="flex justify-between items-center">
                    {/* Logo/Brand */}
                    <div className="flex items-center space-x-8">
                        <div className="flex items-center space-x-2">
                            <div
                                className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                                {activeSection === 'home' ? (
                                    <ScanFace className="w-5 h-5 text-white"/>
                                ) : activeSection === 'analysis' ? (
                                    <BarChart3 className="w-5 h-5 text-white"/>
                                ) : activeSection === 'advice' ? (
                                    <MessageCircle className="w-5 h-5 text-white"/>
                                ) : (
                                    <FlaskConical className="w-5 h-5 text-white"/>
                                )}
                            </div>
                        </div>

                        <span className="text-l font-bold bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">
                            {activeSection == 'home' ? 'PHÂN TÍCH DA MẶT' : activeSection == 'analysis' ? 'KẾT QUẢ PHÂN TÍCH VÀ ĐÁNH GIÁ' : activeSection == 'advice' ? 'ĐỀ XUẤT SẢN PHẨM CHĂM SÓC DA' : 'Test'}
                        </span>

                        {/* Navigation Menu */}
                        <nav className="hidden md:flex items-center space-x-1">
                            {navigationItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeSection === item.id;

                                return (
                                    <a
                                        key={item.id}
                                        href={`#${item.id}`}
                                        onClick={item.onClick}
                                        className={`
                                            flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 group
                                            ${isActive
                                            ? 'bg-blue-50 text-blue-700 shadow-sm'
                                            : 'text-gray-600 hover:text-blue-700 hover:bg-gray-50'
                                        }
                                        `}
                                    >
                                        <Icon
                                            className={`w-4 h-4 transition-colors ${isActive ? 'text-blue-700' : 'text-gray-500 group-hover:text-blue-600'}`}/>
                                        <span className="font-medium">{item.label}</span>
                                        {isActive && (
                                            <div
                                                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
                                        )}
                                    </a>
                                );
                            })}
                        </nav>
                    </div>

                    {/* CTA Button & Mobile Menu */}
                    <div className="flex items-center space-x-4">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={toggleMobileMenu}
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-6 h-6 text-gray-700" />
                            ) : (
                                <Menu className="w-6 h-6 text-gray-700" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Overlay */}
                {isMobileMenuOpen && (
                    <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={toggleMobileMenu}>
                        <div className="bg-white w-64 h-full shadow-xl" onClick={(e) => e.stopPropagation()}>
                            <div className="p-4">
                                {/* Mobile Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-2">
                                        <div
                                            className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                                            {activeSection === 'home' ? (
                                                <ScanFace className="w-5 h-5 text-white"/>
                                            ) : activeSection === 'analysis' ? (
                                                <BarChart3 className="w-5 h-5 text-white"/>
                                            ) : activeSection === 'advice' ? (
                                                <MessageCircle className="w-5 h-5 text-white"/>
                                            ) : (
                                                <FlaskConical className="w-5 h-5 text-white"/>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent text-center">
                                            {activeSection == 'home' ? 'Phân Tích' : activeSection == 'analysis' ? 'Kết Quả' : activeSection == 'advice' ? 'Tư vấn' : 'Test'}
                                    </span>
                                    <button
                                        onClick={toggleMobileMenu}
                                        className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <X className="w-6 h-6 text-gray-700"/>
                                    </button>
                                </div>

                                {/* Mobile Navigation Items */}
                                <nav className="space-y-2">
                                    {navigationItems.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = activeSection === item.id;

                                        return (
                                            <a
                                                key={item.id}
                                                href={`#${item.id}`}
                                                onClick={item.onClick}
                                                className={`
                                                    flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 w-full
                                                    ${isActive
                                                    ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600'
                                                    : 'text-gray-700 hover:text-blue-700 hover:bg-gray-50'
                                                }
                                                `}
                                            >
                                                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
                                                <span className="font-medium">{item.label}</span>
                                            </a>
                                        );
                                    })}
                                </nav>

                                {/* Mobile CTA */}
                                <div className="mt-8 pt-6 border-t border-gray-200">
                                    <button
                                        onClick={(e) => handleSectionChange('analysis', e)}
                                        className="
                                            w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-lg
                                            font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                                            transition-all duration-200 flex items-center justify-center space-x-2
                                            hover:from-blue-700 hover:to-blue-800
                                        "
                                    >
                                        <BarChart3 className="w-5 h-5" />
                                        <span>Xem kết quả</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tablet Navigation */}
                <div className="hidden sm:flex md:hidden mt-4 pt-4 border-t border-gray-100">
                    <nav className="flex flex-wrap gap-2 w-full justify-center">
                        {navigationItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeSection === item.id;

                            return (
                                <a
                                    key={item.id}
                                    href={`#${item.id}`}
                                    onClick={item.onClick}
                                    className={`
                                        flex items-center space-x-2 px-4 py-2 rounded-lg text-sm transition-all duration-200
                                        ${isActive
                                        ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-200'
                                        : 'text-gray-600 hover:text-blue-700 hover:bg-gray-50 border border-transparent'
                                    }
                                    `}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="font-medium">{item.label}</span>
                                </a>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </div>
    );
}

export default Navigation;