const fs = require('fs');
const path = require('path');

// Configuration
const sourceDir = __dirname;
const targetDir = path.join(__dirname, 'dist');
const ignoredPaths = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.DS_Store',
  '.env.local',
  '.env.development.local',
  '.env.test.local',
  '.env.production.local'
];

// Create dist directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log(`Created directory: ${targetDir}`);
}

// Function to copy file
function copyFile(source, target) {
  try {
    fs.copyFileSync(source, target);
    console.log(`Copied: ${path.relative(sourceDir, source)} → ${path.relative(sourceDir, target)}`);
  } catch (error) {
    console.error(`Error copying ${source}: ${error.message}`);
  }
}

// Function to create directory
function createDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${path.relative(sourceDir, dir)}`);
  }
}

// Function to copy directory recursively
function copyDir(source, target) {
  // Create target directory
  createDir(target);
  
  // Read source directory
  const entries = fs.readdirSync(source, { withFileTypes: true });
  
  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);
    
    // Skip ignored paths
    if (ignoredPaths.includes(entry.name)) {
      console.log(`Skipping: ${path.relative(sourceDir, sourcePath)}`);
      continue;
    }
    
    if (entry.isDirectory()) {
      copyDir(sourcePath, targetPath);
    } else {
      copyFile(sourcePath, targetPath);
    }
  }
}

// Copy package.json with modified scripts
const packageJson = require('./package.json');
packageJson.scripts.serve = 'node index.js';
fs.writeFileSync(
  path.join(targetDir, 'package.json'),
  JSON.stringify(packageJson, null, 2)
);
console.log('Created modified package.json in dist folder');

// Copy all files and directories
console.log('Starting build process...');
copyDir(sourceDir, targetDir);

console.log('\nBuild completed successfully!');
console.log(`Files are available in: ${targetDir}`);
console.log('Run "cd dist && npm ci --production && node index.js" to start the server');