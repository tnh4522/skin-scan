import React from 'react';

function History({ activeSection }) {
    return (
        <section id="history" className={`fade-in container mx-auto px-4 ${activeSection === 'history' ? 'block' : 'hidden'}`}>
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                <h2 className="text-2xl font-bold text-blue-900 mb-6">
                    <i className="fas fa-history mr-3"></i>LỊCH SỬ SOI DA
                </h2>

                <div className="bg-pink-50 rounded-lg p-6 mb-6">
                    <div className="flex items-center mb-4">
                        <img
                            src="https://storage.googleapis.com/a1aa/image/4sP2ufm-qXVwihPlq19BfbdPK3owQI4FQSYOkutJXnA.jpg"
                            className="w-24 h-24 rounded-full border-4 border-white shadow"
                            alt="Skin Tone"
                        />
                        <div className="ml-6">
                            <h3 className="text-xl font-semibold">TONE MÀU DA CỦA BẠN</h3>
                            <p className="text-red-600">Ứng Đỏ • Nhiều Màu • Màu quốc tế 109</p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <p className="font-semibold mb-3">MÀU PHÙ HỢP:</p>
                        <div className="flex space-x-4">
                            <div className="w-12 h-12 bg-pink-400 rounded-full shadow"></div>
                            <div className="w-12 h-12 bg-pink-300 rounded-full shadow"></div>
                            <div className="w-12 h-12 bg-pink-200 rounded-full shadow"></div>
                            <div className="w-12 h-12 bg-red-800 rounded-full shadow"></div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="bg-white rounded-lg p-6 shadow-inner">
                        <h3 className="text-lg font-bold mb-4">DẤU HIỆU LÃO HÓA</h3>
                        <div className="space-y-2">
                            <p>Nhăn cánh mũi: <span className="text-red-600">Cả hai bên</span></p>
                            <p>Nếp nhăn môi: <span className="text-red-600">0.17%</span></p>
                            <p>Nhăn trán: <span className="text-red-600">Không</span></p>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-inner">
                        <h3 className="text-lg font-bold mb-4">PHÂN TÍCH MỤN</h3>
                        <div className="space-y-2">
                            <p>Mụn viêm quanh môi: <span className="text-red-600">Có</span></p>
                            <p>Mụn đầu đen: <span className="text-red-600">0</span></p>
                            <p>Sẹo mụn: <span className="text-red-600">5</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default History;