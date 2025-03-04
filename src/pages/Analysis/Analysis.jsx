import React from 'react';

function Analysis({ activeSection }) {
    return (
        <section id="analysis" className={`fade-in container mx-auto px-4 ${activeSection === 'analysis' ? 'block' : 'hidden'}`}>
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                <h2 className="text-2xl font-bold text-blue-900 mb-6">
                    <i className="fas fa-chart-bar mr-3"></i>PHÂN TÍCH CHI TIẾT
                </h2>

                <div className="bg-blue-50 rounded-lg p-6 mb-8 text-center">
                    <p className="text-2xl font-bold">SỨC KHỎE LÀN DA:
                        <span className="text-red-600">6.2/10</span>
                        <span className="text-gray-600">(Bình thường)</span>
                    </p>
                    <div className="mt-4 flex justify-center space-x-4">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <div className="bg-white rounded-lg p-6 shadow-lg border-t-4 border-blue-500">
                        <h3 className="text-lg font-bold text-red-600 mb-4">LÃO HÓA DA (6/10)</h3>
                        <div className="relative h-2 bg-gray-200 rounded-full mb-4">
                            <div className="absolute h-2 bg-gradient-to-r from-green-500 to-red-500 w-3/5 rounded-full"></div>
                        </div>
                        <p className="text-sm">Da bắt đầu xuất hiện nếp nhăn nhẹ, độ đàn hồi giảm</p>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-lg border-t-4 border-yellow-500">
                        <h3 className="text-lg font-bold text-red-600 mb-4">MỤN (6/10)</h3>
                        <div className="relative h-2 bg-gray-200 rounded-full mb-4">
                            <div className="absolute h-2 bg-gradient-to-r from-green-500 to-red-500 w-3/5 rounded-full"></div>
                        </div>
                        <p className="text-sm">Da dầu, cần kiểm soát bã nhờn và ngăn ngừa viêm</p>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-lg border-t-4 border-purple-500">
                        <h3 className="text-lg font-bold text-red-600 mb-4">THÂM MẮT (5/10)</h3>
                        <div className="relative h-2 bg-gray-200 rounded-full mb-4">
                            <div className="absolute h-2 bg-gradient-to-r from-green-500 to-red-500 w-1/2 rounded-full"></div>
                        </div>
                        <p className="text-sm">Vùng mắt thiếu độ ẩm, cần chăm sóc đặc biệt</p>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Analysis;