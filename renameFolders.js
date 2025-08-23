const fs = require('fs');
const path = require('path');
const { folderNameMapping } = require('./folderNameMapping');

const voicerecordsDir = path.join(__dirname, 'voicerecords');

// Function to rename folders
async function renameFolders() {
  try {
    // Check if voicerecords directory exists
    if (!fs.existsSync(voicerecordsDir)) {
      console.error('voicerecords directory not found!');
      return;
    }

    console.log('Starting folder renaming process...');
    
    // Get all directories in voicerecords
    const folders = fs.readdirSync(voicerecordsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    // Create a backup of the folder structure
    console.log('Creating backup of folder structure...');
    const backupFile = path.join(__dirname, 'voicerecords_folder_backup.json');
    fs.writeFileSync(backupFile, JSON.stringify(folders, null, 2));
    
    // Rename each folder
    for (const oldName of folders) {
      if (folderNameMapping[oldName]) {
        const newName = folderNameMapping[oldName];
        const oldPath = path.join(voicerecordsDir, oldName);
        const newPath = path.join(voicerecordsDir, newName);
        
        // Check if destination already exists
        if (fs.existsSync(newPath)) {
          console.log(`Skipping ${oldName} - destination ${newName} already exists`);
          continue;
        }
        
        // Rename folder
        fs.renameSync(oldPath, newPath);
        console.log(`Renamed: ${oldName} -> ${newName}`);
        
        // Update folder_info.txt with both old and new names
        const infoFilePath = path.join(newPath, 'folder_info.txt');
        if (fs.existsSync(infoFilePath)) {
          const content = `New folder name: ${newName}\nOriginal folder name: ${oldName}`;
          fs.writeFileSync(infoFilePath, content);
        }
      } else {
        console.log(`No mapping found for: ${oldName}`);
      }
    }
    
    console.log('Folder renaming completed successfully!');
    console.log(`Backup saved to: ${backupFile}`);
    console.log('You can use the folderNameMapping.js file for reference.');
  } catch (error) {
    console.error('Error renaming folders:', error);
  }
}

// Execute the function
renameFolders();