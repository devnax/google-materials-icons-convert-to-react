const app = require("express")()
const path = require('path');
const fs = require('fs');
const HTMLParser = require('node-html-parser')

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}



/**
 * 
 * https: //github.com/marella/material-design-icons
 * download this repo and copy the svg folder and past it in root dir
 */


const convert = async (dirname) => {
    const directory = path.join(__dirname, `svg/${dirname}`)
    const outputDirectory = path.join(__dirname, `icons/${dirname}`)
    fs.readdir(directory, function (err, files) {
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }
        files.forEach(function (file) {
            const compName = file.replace('.svg', '').split("_").map(f => capitalizeFirstLetter(f)).join("")
            let content = fs.readFileSync(directory + `/${file}`).toString()
            var parsed = HTMLParser.parse(content);
            const svg = parsed.querySelector("svg")
            const component = `import React from 'react'
import Icon, { IconProps } from '../'

const Icon${compName} = (props: Omit<IconProps, "path">) => {
    return <Icon 
    {...props} 
    >${svg.innerHTML}</Icon>
}

export default Icon${compName}
            `;

            !fs.existsSync(outputDirectory) && fs.mkdirSync(outputDirectory)
            fs.writeFileSync(outputDirectory + `/${compName}.tsx`, component)
        });
    });
}

app.get('/', async (_req, res) => {

    const component = `import React, { SVGProps } from 'react'
let baseProps = {};

export const setIconBaseProps = (props: SVGProps<SVGElement>) => {
    baseProps = props
}


export type IconProps = SVGProps<SVGElement> & {
    fontSize?: number;
    color?: string;
}

const Icon = (props: IconProps) => {
    let { fontSize, color, style, children, ...rest }: any = {...baseProps, ...props}
    fontSize = fontSize || 24
    return <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24"
    style={{
        fill: color, 
        fontSize: fontSize+"px", 
        userSelect: "none", 
        width: "1em", height: "1em", 
        display: "inline-block", 
        ...(style || {})}} 
        {...rest}
    >
    {children}
    </svg>
}

export default Icon
            `;
    const outputDirectory = path.join(__dirname, `icons/`);
    !fs.existsSync(outputDirectory) && fs.mkdirSync(outputDirectory);
    fs.writeFileSync(outputDirectory + `/index.tsx`, component)


    const dirs = ["filled", "outlined", "round", "sharp", "two-tone"]
    for (let dir of dirs) {
        await convert(dir)
    }

    res.send("wellcome")
})


app.listen(5000)