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
                        <h3 className="text-xl font-semibold mb-4">Nếp nhăn</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Sử dụng serum retinoid hoặc peptide vào ban đêm để kích thích sản sinh collagen và giảm nếp nhăn.</li>
                            <li>Thoa serum Vitamin C vào buổi sáng để bảo vệ da khỏi tác hại của gốc tự do và làm sáng da.</li>
                            <li>Xem xét các liệu pháp như microdermabrasion hoặc laser nếu muốn kết quả rõ rệt hơn (tham khảo ý kiến bác sĩ da liễu).</li>
                        </ul>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-xl font-semibold mb-4">Độ sắc tố</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Tiếp tục duy trì quy trình chăm sóc da hiện tại vì nó đang hoạt động hiệu quả.</li>
                            <li>Sử dụng kem chống nắng phổ rộng SPF 30+ hàng ngày để ngăn ngừa tổn thương do tia UV và duy trì độ đều màu của da.</li>
                            <li>Thoa lại kem chống nắng sau mỗi 2 giờ nếu tiếp xúc trực tiếp với ánh nắng mặt trời.</li>
                        </ul>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-xl font-semibold mb-4">Khô da</h3>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Sử dụng sữa rửa mặt dịu nhẹ, cấp ẩm (tránh xà phòng mạnh).</li>
                            <li>Thoa toner dưỡng ẩm để chuẩn bị da.</li>
                            <li>Sử dụng serum chứa hyaluronic acid để cấp ẩm sâu.</li>
                            <li>Khóa ẩm bằng kem dưỡng chứa ceramide.</li>
                            <li>Đắp mặt nạ dưỡng ẩm 1 lần/tuần để tăng cường độ ẩm.</li>
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