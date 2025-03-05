import React from 'react';

function Footer() {
    return (
        <footer className="bg-white mt-12">
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row items-center justify-between">
                    {/*<div className="flex items-center mb-4 md:mb-0">*/}
                    {/*    <img*/}
                    {/*        src="https://storage.googleapis.com/a1aa/image/XKjVPnENTwK1L1v3zjl3qWvK3mDsPmGQCW8we_crL6s.jpg"*/}
                    {/*        className="w-16 h-16 mr-4"*/}
                    {/*        alt="Footer Logo"*/}
                    {/*    />*/}
                    {/*    <div>*/}
                    {/*        <p className="font-bold">TIKITECH</p>*/}
                    {/*        <p className="text-sm">Số 91 Đường N1, Quận 12, TP.HCM</p>*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                    <div className="text-center md:text-right">
                        <p className="font-semibold">Hỗ trợ 24/7</p>
                        <p className="text-blue-600 text-xl">0917 891 007</p>
                        <p className="text-sm">hi@tikitech.vn</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;