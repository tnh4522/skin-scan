import React from 'react';

function Advice({ activeSection }) {
    return (
        <section id="advice" className={`fade-in container mx-auto px-4 ${activeSection === 'advice' ? 'block' : 'hidden'}`}>
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                <h2 className="text-2xl font-bold text-blue-900 mb-6">
                    <i className="fas fa-heart mr-3"></i>TƯ VẤN CHĂM SÓC DA
                </h2>

                <div className="space-y-6">
                    <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-xl font-semibold mb-4"> CHỐNG LÃO HÓA</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Sử dụng serum Vitamin C buổi sáng</li>
                            <li>Dưỡng ẩm với Hyaluronic Acid</li>
                            <li>Retinol 2-3 lần/tuần vào buổi tối</li>
                            <li>Luôn dùng kem chống nắng SPF 50+</li>
                        </ul>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-xl font-semibold mb-4"> KIỂM SOÁT MỤN</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Rửa mặt 2 lần/ngày với sữa rửa mặt dịu nhẹ</li>
                            <li>Sử dụng toner cân bằng pH</li>
                            <li>Điều trị cục bộ với Benzoyl Peroxide</li>
                            <li>Dưỡng ẩm không chứa dầu</li>
                        </ul>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-xl font-semibold mb-4">✨ TRỊ THÂM NÁM</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Serum Vitamin C nồng độ cao</li>
                            <li>Sản phẩm chứa Niacinamide</li>
                            <li>Tẩy tế bào chết hóa học AHA/BHA</li>
                            <li>Liệu pháp laser (nếu cần)</li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <button className="bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition">
                        <i className="fas fa-comments mr-2"></i>NHẬN TƯ VẤN CHUYÊN SÂU
                    </button>
                </div>
            </div>
        </section>
    );
}

export default Advice;