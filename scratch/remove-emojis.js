const fs = require('fs');
const path = require('path');

const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E6}-\u{1F1FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{2B50}\u{2B55}]|[\u{231A}\u{231B}\u{2328}\u{23CF}\u{23E9}-\u{23F3}\u{23F8}-\u{23FA}]/gu;

function walkDir(dir) {
    fs.readdirSync(dir).forEach(f => {
        const dirPath = path.join(dir, f);
        if (fs.statSync(dirPath).isDirectory()) {
            walkDir(dirPath);
        } else if (f.endsWith('.tsx') || f.endsWith('.ts') || f.endsWith('.css') || f.endsWith('.js') || f.endsWith('.json')) {
            let content = fs.readFileSync(dirPath, 'utf8');
            if (emojiRegex.test(content)) {
                content = content.replace(emojiRegex, '');
                fs.writeFileSync(dirPath, content);
                console.log(`Cleaned: ${dirPath}`);
            }
        }
    });
}

walkDir('./src');
