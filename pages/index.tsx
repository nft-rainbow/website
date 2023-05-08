import Image from 'next/image';
function Menu() {
    return (
        <div className="relative h-[74px] min-w-[1200px] px-[120px] flex flex-row justify-between text-base font-normal text-[#05001F]">
            <div className="flex flex-row items-center">
                <a href="/" className="flex flex-row items-center text-[#010101]">
                    <Image width={28} height={28} src="/images/logo.svg" alt="NFTRainbow" />
                    <div className="ml-1 font-semibold">NFTRainbow</div>
                </a>
                <a href="/" className="ml-[28px]">
                    Exploration activities
                </a>
                <a href="/" className="flex flex-row items-center ml-8">
                    Solution
                    <Image className="ml-2" width={16} height={16} src="/images/arrow.svg" alt="arrow" />
                </a>
                <a href="/" className="ml-8">
                    Development documentation
                </a>
            </div>
            <div className="flex flex-row items-center">
                <div className="flex flex-row items-center">
                    <Image width={16} height={16} src="/images/language.svg" alt="language" />
                    <div className="ml-1">EN</div>
                </div>
                <button className="ml-[18px] py-[10px] px-4 rounded-full text-sm leading-[18px] text-white font-normal bg-[#6953EF] border border-[#37334C]">
                    Connect Wallet
                </button>
            </div>
            <div
                style={{
                    background: 'linear-gradient(269.99deg, #6953EF 0%, #59E213 34.3%, #FEE64E 66.5%, #FF003C 99.99%)',
                }}
                className="w-60 h-0.5 absolute top-full left-0"></div>
        </div>
    );
}

function Footer() {
    return (
        <div className="h-[80px] min-w-[1200px] px-[120px] flex flex-row justify-between text-base font-normal text-[#473E6B]">
            <div className="flex flex-row items-center">
                <a href="/" className="flex flex-row items-center text-[#010101]">
                    <Image width={28} height={28} src="/images/logo.svg" alt="NFTRainbow" />
                    <div className="ml-1 font-semibold">NFTRainbow</div>
                </a>
                <a href="/" className="ml-12">
                    文档
                </a>
                <a href="/" className="flex flex-row items-center ml-8">
                    介绍
                </a>
                <a href="/" className="ml-8">
                    获取 API Key
                </a>
            </div>
            <div className="flex flex-row items-center text-xs">Copyright (c) 2022 NFTRainbow. All rights reserved.</div>
        </div>
    );
}

export default function Index() {
    return (
        <div className="flex flex-col">
            <Menu />
            <Footer />
        </div>
    );
}
