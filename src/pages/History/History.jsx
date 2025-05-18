import React from 'react';

function History({ activeSection }) {
    return (
        <section id="history" className={`fade-in container mx-auto px-4 ${activeSection === 'history' ? 'block' : 'hidden'}`}>
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                <h2 className="text-2xl font-bold text-blue-900 mb-6">
                    <i className="fas fa-history mr-3"></i>LỊCH SỬ SOI DA
                </h2>

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
                        <h3 className="text-lg font-bold mb-4">PHÂN TÍCH NẾP NHĂN</h3>
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