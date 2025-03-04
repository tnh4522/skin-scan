import React from 'react';

function Home({ activeSection }) {
    return (
        <section id="home" className={`fade-in container mx-auto px-4 ${activeSection === 'home' ? 'block' : 'hidden'}`}>
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-blue-900 mb-2">
                    SOI DA <span className="text-gray-600">ONLINE</span>
                    <span className="text-blue-900">AI</span>
                </h1>
                <p className="text-gray-600 mb-8">Ứng dụng công nghệ AI phân tích da hàng đầu</p>

                <div className="max-w-2xl mx-auto">
                    <img
                        src="https://storage.googleapis.com/a1aa/image/-3JQEEOZB1p0JxOU_cJmL7S-p5Iube5WVuO_OgescsA.jpg"
                        alt="Hướng dẫn soi da"
                        className="rounded-xl shadow-lg border-4 border-white"
                    />
                </div>

                <div className="mt-8">
                    <button className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-full text-lg font-bold transform transition-all hover:scale-105">
                        <i className="fas fa-camera mr-3"></i>BẮT ĐẦU SOI DA
                    </button>
                </div>
            </div>
        </section>
    );
}

export default Home;