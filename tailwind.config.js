const colors = require('tailwindcss/colors');

const spacing = Array(100)
    .fill('$')
    .map((_, index) => index + 1)
    .reduce((spacing, index) => {
        spacing[index] = `${index / 4}rem`;
        return spacing;
    }, {});

/** @type {import('tailwindcss').Config} */
module.exports = {
    purge: ['./pages/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}', './app/**/*.{js,ts,jsx,tsx,mdx}'],
    darkMode: 'class',
    theme: {
        extend: {
            colors,
            spacing,
        },
    },
    variants: {},
    plugins: [],
    // xwind options
    xwind: {
        mode: 'objectstyles',
    },
};
