import Image from 'next/image';
import { useState } from 'react';
function Menu() {
    return (
        <div className="mx-auto w-[1200px] h-[74px] flex flex-row justify-between text-base font-normal text-[#05001F]">
            <div className="flex flex-row items-center">
                <a href="/" className="flex flex-row items-center text-[#010101]">
                    <Image width={28} height={28} src="/images/logo.svg" alt="NFTRainbow" />
                    <div className="ml-1 font-semibold">NFTRainbow</div>
                </a>
                <a href="/" className="ml-[28px]">
                    探索活动
                </a>
                <a href="/" className="flex flex-row items-center ml-8">
                    解决方案
                    <Image className="ml-2" width={16} height={16} src="/images/arrow.svg" alt="arrow" />
                </a>
                <a href="/" className="ml-8">
                    开发文档
                </a>
            </div>
            <div className="flex flex-row items-center">
                <div className="flex flex-row items-center">
                    <Image width={16} height={16} src="/images/language.svg" alt="language" />
                    <div className="ml-1">中</div>
                </div>
                {/* <button className="ml-[18px] py-[10px] px-4 rounded-full text-sm leading-[18px] text-white font-normal bg-[#6953EF] border border-[#37334C]">
                    Connect Wallet
                </button> */}
            </div>
            <div
                style={{
                    backgroundImage: 'linear-gradient(269.99deg, #6953EF 0%, #59E213 34.3%, #FEE64E 66.5%, #FF003C 99.99%)',
                    backgroundClip: 'border-box',
                }}
                className="absolute left-0 top-[74px] z-[11] w-60 h-0.5"></div>
        </div>
    );
}

function Footer() {
    return (
        <div className="mx-auto h-[80px] w-[1200px] flex flex-row justify-between text-base font-normal text-[#473E6B]">
            <div className=" flex flex-row items-center">
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
                        <div className="relative z-1 w-[1200px] pt-[210px]">
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
            <div className=" absolute z-10 left-1/2 bottom-[108px] -translate-x-1/2 w-[1200px] flex flex-row items-center gap-[10px]">
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

const AppModuleData = [
    {
        title: 'POAP',
        content:
            'Rainbow POAP 基于 Conflux 区块链与 NFT Rainbow 数字身份网络，组织和分发轻量级的 NFT 徽章活动，提供快速、便捷、轻量的链上凭证解决方案。基于 Rainbow POAP，开发者或品牌项目方可以个性化定制社区活动，并奖励社区成员 NFT 徽章，目的是社区数量的增长和社区粘性的增强',
        imageSrc: 'POAP.svg',
    },
    {
        title: 'SBT',
        content:
            '基于 Conflux 树图链发行的链上成就 NFT，提供品牌项目发布快速、便捷、轻量的NFT徽章活动。成就 NFT 可以作为品牌项目社区参与的链上记录，为品牌、社区成员轻松、规模化上链的解决方案。',
        imageSrc: 'SBT.svg',
    },
    {
        title: 'NFT',
        content: '使社区能够利用数字身份凭证和游戏化的 NFT 活动来更好地奖励和吸引用户。',
        imageSrc: 'NFT.svg',
    },
    {
        title: '盲盒',
        content: '使社区能够利用数字身份凭证和游戏化的 NFT 活动来更好地奖励和吸引用户。',
        imageSrc: 'blindbox.svg',
    },
    {
        title: '白名单\r\n空投',
        subTitle: '白名单 ｜ 空投',
        content: '使社区能够利用数字身份凭证和游戏化的 NFT 活动来更好地奖励和吸引用户。',
        imageSrc: 'whitelist.svg',
    },
    {
        title: '忠诚度策划',
        content: '使社区能够利用数字身份凭证和游戏化的 NFT 活动来更好地奖励和吸引用户。',
        imageSrc: 'loyalty.svg',
    },
];

function AppModule() {
    const [moduleIndex, setIndex] = useState(0);
    const { title, imageSrc, subTitle, content } = AppModuleData[moduleIndex];
    return (
        <div className="mx-auto w-[1200px] h-[900px] overflow-visible pt-18 flex flex-row justify-between">
            <div className="flex flex-col justify-between overflow-visible text-[28px] font-semibold text-[#473E6B]">
                <span>应用模块</span>
                <Image className=" -translate-x-14" src="/images/AppModule.svg" alt="AppModuleBg" width={464} height={464} />
            </div>
            <div className="flex flex-row">
                <div
                    style={{
                        boxShadow: '8px 12px 0px 0px rgba(235, 234, 255, 1)',
                    }}
                    className="flex flex-col mr-6 p-11 w-[550px] h-[540px] rounded-[32px] border border-[#6B6395]">
                    <Image src={'/images/' + imageSrc} alt={title} width={130} height={130} />
                    <div className="flex-1 flex flex-col mt-[42px] text-[#473E6B]">
                        <div className="flex flex-row items-center">
                            <div className="text-[30px] leading-[38px] font-semibold ">{subTitle || title}</div>
                            <Image className="ml-2.5" src={'/images/star.svg'} alt={title} width={28} height={28} />
                        </div>
                        <div className="flex-1 mt-[42px] text-base leading-[26px] font-normal">{content}</div>
                        <Image src="/images/roadmap.svg" alt={title} width={248} height={32} />
                    </div>
                </div>
                <div className="hidden-scroll pb-4 pr-4 -mr-4 flex flex-col overflow-y-scroll">
                    {AppModuleData.map(({ title }, index) => {
                        const isFocus = moduleIndex === index;
                        return (
                            <div
                                key={index}
                                onClick={() => setIndex(index)}
                                style={{
                                    boxShadow: '6px 8px 0px 0px rgba(235, 234, 255, 1)',
                                }}
                                className={`${
                                    isFocus ? 'bg-[#6953EF] text-[#FAFAFF]' : 'text-[#473E6B]'
                                } first:mt-0 mt-6 flex-shrink-0 w-[168px] h-[148px] flex items-center justify-center text-xl text-center whitespace-pre-line font-semibold rounded-3xl border border-[#483E6B]`}>
                                {title}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function DigitalIdentityNetwork() {
    return (
        <div className="h-[900px] pt-35">
            <div className="text-[38px] leading-[46px] text-center text-[#37334C]">数字身份网络</div>
            <div className="mt-12 flex flex-row justify-center">
                <div
                    style={{ boxShadow: '8px 12px 0px 0px rgba(235, 234, 255, 1)' }}
                    className="last:ml-25 pt-12 px-15 flex flex-col items-center w-[550px] h-[382px] rounded-[32px] border border-[#6B6395]">
                    <Image src="/images/on-chain.svg" width={430} height={130} alt="" />
                    <div className="mt-9 text-[#473E6B] ">
                        <div className="text-2xl font-semibold text-center">链上数字身份</div>
                        <div className="mt-2 text-base font-normal text-center">
                            通过子图查询或地址快照来查找数据，或从智能合约中查询凭证数据，以定制链上用例
                        </div>
                    </div>
                </div>
                <div
                    style={{ boxShadow: '8px 12px 0px 0px rgba(235, 234, 255, 1)' }}
                    className="last:ml-25 pt-12 px-15 flex flex-col items-center w-[550px] h-[382px] rounded-[32px] border border-[#6B6395]">
                    <Image src="/images/off-chain.svg" width={430} height={130} alt="" />
                    <div className="mt-9 text-[#473E6B] ">
                        <div className="text-2xl font-semibold text-center">链下数字身份</div>
                        <div className="mt-2 text-base font-normal text-center">
                            通过集成数据源（例如 Discord、DODO、微信公众号...）贡献数据 通过指定的条件（例如手机号）贡献数据
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Partner() {
    return (
        <div className="flex flex-col items-center pt-18 pb-23 bg-[#EEE3FD]">
            <div className="text-[38px] leading-[48px] text-[#473E6B]">合作伙伴</div>
            <div className="mt-12 flex flex-row">
                <div className="first:ml-0 ml-12 w-60 h-20 flex items-center justify-center rounded-xl border border-[#483E6B]">
                    <Image className="select-none pointer-events-none" src="/images/conflux.svg" alt="conflux" width={148} height={36} />
                </div>
                <div className="first:ml-0 ml-12 w-60 h-20 flex items-center justify-center rounded-xl border border-[#483E6B]">
                    <Image className="select-none pointer-events-none" src="/images/anyweb.svg" alt="anyweb" width={144} height={36} />
                </div>
                <div className="first:ml-0 ml-12 w-60 h-20 flex items-center justify-center rounded-xl border border-[#483E6B]">
                    <Image className="select-none pointer-events-none" src="/images/cellar.svg" alt="cellar" width={111} height={36} />
                </div>
            </div>
        </div>
    );
}

export default function Index() {
    return (
        <div className="flex flex-col">
            <Menu />
            <Banner />
            <AppModule />
            <DigitalIdentityNetwork />
            <Partner />
            <Footer />
        </div>
    );
}
