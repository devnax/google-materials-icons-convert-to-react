const app = require("express")()
const path = require('path');
const fs = require('fs');

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
            content = content.replace('width="24"', ``)
            content = content.replace('height="24"', `style={{fontSize: fontSize+"px", userSelect: "none", width: "1em", height: "1em", display: "inline-block", ...(style || {})}} {...rest}`)

            const component = `import React, { HTMLAttributes } from 'react'
import {theme} from '../IconBaseTheme'

export type Icon${compName}Props = HTMLAttributes<HTMLOrSVGElement> & {
    fontSize?: number;
    color?: string;
}

const Icon${compName} = (props: Icon${compName}Props) => {
    let { fontSize, color, style, ...rest }: any = {...(theme.current || {}), ...props}
    fontSize = fontSize || 24
    return ${content}
}

export default Icon${compName}
            `;

            !fs.existsSync(outputDirectory) && fs.mkdirSync(outputDirectory);
            fs.writeFileSync(outputDirectory + `/${compName}.tsx`, component)
        });
    });
}



app.get('/', async (req, res) => {
    const dirs = ["filled", "outlined", "round", "sharp", "two-tone"]
    for (let dir of dirs) {
        await convert(dir)
    }

    res.send("wellcome")
})


app.listen(5000)