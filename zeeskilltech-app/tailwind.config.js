/** Brand colours come from CSS variables (set in app/layout.js from Admin > Website content > theme). */
const v=n=>`rgb(var(--${n}) / <alpha-value>)`;
module.exports={
 content:['./app/**/*.{js,jsx}','./components/**/*.{js,jsx}'],
 darkMode:['selector','[data-theme="dark"]'],
 theme:{extend:{colors:{pri:v('pri'),acc:v('acc')},fontFamily:{sans:['Inter','system-ui','sans-serif'],head:['Poppins','Inter','sans-serif']}}},
 plugins:[]};
