import Image from 'next/image';
import { useState } from 'react';
function Menu() {
    return (
        <div className="relative z-[11] h-[74px] min-w-[1200px] px-[120px] flex flex-row justify-between text-base font-normal text-[#05001F]">
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
interface RadiuProps extends Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, 'className'> {
    active?: boolean;
}
function Radiu({ active, ...rest }: RadiuProps) {
    return (
        <div
            className={`${!active ? 'w-2 h-2' : 'w-4 h-4 bg-[#6953EF]'} transition-all rounded-full border border-[#37334C]`}
            {...rest}></div>
    );
}

const bannerData = [
    {
        title: '降低项目与开发者进入 Web3 的技术门槛与成本',
        content:
            '无需花费更多时间与成本掌握区块链技术、Solidity、GraphQL、web3.js、ethers.js、hardhat 等等，可以更专注于项目的发展与策划，降低项目的维护成本',
        imageSrc: '/images/banner1.png',
        backgroundColor: '#fafaff',
    },
    {
        title: '打造共享的数字身份网络生态系统',
        content:
            '以 NFT 为载体，打造链上地址的数字身份网络，开放的、Web3 的数字身份网络提供品牌项目方、开发者更轻易构建有吸引力的 Web3 社区或应用',
        imageSrc: '/images/banner2.png',
        backgroundColor: '#eef9fe',
    },
    {
        title: '减少用户进入 Web3 的路径',
        content:
            '通过 NFT Rainbow 的能力整合，用户只需要通过手机号，快速领取NFT。品牌项目方还可以定制自己的链上足迹、链下贡献数据，捕获更多具有忠诚度价值的 WEB3 用户',
        imageSrc: '/images/banner3.png',
        backgroundColor: '#FFFDF9',
    },
];

function Banner() {
    const [bannerIndex, setIndex] = useState(0);
    return (
        <div className="relative w-full min-w-[1440px] h-[900px] flex flex-row overflow-hidden">
            {bannerData.map(({ title, content, imageSrc, backgroundColor }, index) => {
                return (
                    <div
                        key={index}
                        style={{
                            transform: `translate(-${bannerIndex * 100}%,0)`,
                            backgroundColor,
                            backgroundImage: `url(${imageSrc})`,
                            backgroundSize: 'auto 100%',
                            backgroundPosition: 'top center',
                            backgroundRepeat: 'no-repeat',
                        }}
                        className={`transition-all duration-300 relative flex-shrink-0 z-10 w-full h-full flex flex-col items-center bg-[#FFFDF9]`}>
                        <div className="relative z-1 w-[1440px] pt-[210px]">
                            <div className="w-[600px] text-5xl font-semibold text-[#473E6B]">{title}</div>
                            <div className="mt-8 w-[600px] font-normal text-[#696679]">{content}</div>
                            <button className="mt-[100px] px-8 py-4 text-xl flex flex-row rounded-full text-white bg-[#6953EF]">
                                <span>创建项目</span>
                                <Image className="ml-2.5" src="/images/goto.svg" width={32} height={32} alt="create" />
                            </button>
                        </div>
                    </div>
                );
            })}
            <div className=" absolute z-10 left-[120px] bottom-[108px] flex flex-row items-center gap-[10px]">
                {bannerData.map((_, index) => {
                    return (
                        <Radiu
                            key={index}
                            active={index === bannerIndex}
                            onClick={() => {
                                setIndex(index);
                            }}
                        />
                    );
                })}
            </div>
        </div>
    );
}

export default function Index() {
    return (
        <div className="flex flex-col">
            <Menu />
            <Banner />
            <Footer />
        </div>
    );
}
