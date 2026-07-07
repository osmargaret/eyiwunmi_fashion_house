const fs = require('fs');
const path = require('path');

const repoDir = 'C:\\Users\\cleme\\Desktop\\eyiwunmifashionproject.html';
const indexPath = path.join(repoDir, 'eyiwunmi_user', 'index.html');
const wardrobePath = path.join(repoDir, 'eyiwunmi_user', 'wardrobe.html');

try {
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    const wardrobeContent = fs.readFileSync(wardrobePath, 'utf8');

    // Extract defaultOutfits definition from index.html
    const startTag = 'const defaultOutfits = [';
    const endTag = '];';
    
    const startIndex = indexContent.indexOf(startTag);
    if (startIndex === -1) {
        throw new Error('Could not find defaultOutfits in index.html');
    }
    
    // Find the matching closing bracket for defaultOutfits array
    let bracketCount = 1;
    let endIndex = startIndex + startTag.length;
    while (bracketCount > 0 && endIndex < indexContent.length) {
        if (indexContent[endIndex] === '[') bracketCount++;
        else if (indexContent[endIndex] === ']') bracketCount--;
        endIndex++;
    }
    
    const defaultOutfitsBlock = indexContent.substring(startIndex, endIndex);

    // Insert into wardrobe.html right before the localStorage check
    const targetString = "// Clear old database keys if old filenames exist";
    const insertion = defaultOutfitsBlock + '\n\n        // Load outfits from localStorage or initialize with defaults\n        if (!localStorage.getItem(\'eyiwunmi_outfits\')) {\n            localStorage.setItem(\'eyiwunmi_outfits\', JSON.stringify(defaultOutfits));\n        }\n\n        ';
    
    let updatedWardrobe = wardrobeContent.replace(targetString, insertion + targetString);
    
    fs.writeFileSync(wardrobePath, updatedWardrobe, 'utf8');
    console.log('Successfully injected defaultOutfits fallback into wardrobe.html');
} catch (err) {
    console.error('Error:', err);
}
