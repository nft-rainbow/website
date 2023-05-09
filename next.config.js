/** @type {import('next').NextConfig} */
const nextConfig = {
    i18n: {
        locales: ['en', 'zh-CN'],
        defaultLocale: 'en',
    },
    images: {
        unoptimized: true,
    },
};

module.exports = nextConfig;
