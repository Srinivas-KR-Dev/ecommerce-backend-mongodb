import archiver from "archiver";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, "backups");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate timestamp for unique filename
const timestamp = new Date().toISOString().replace(/[:.]/g, "-").split("T")[0];
const zipFileName = `ecommerce-backend-${timestamp}.zip`;
const outputPath = path.join(outputDir, zipFileName);

// Create a file to stream archive data to
const output = fs.createWriteStream(outputPath);
const archive = archiver("zip", {
  zlib: { level: 9 }, // compression level
});

// Listen for all archive data to be written
output.on("close", () => {
  console.log(`✅ Backup created successfully!`);
  console.log(`📦 File: ${zipFileName}`);
  console.log(`📁 Location: ${outputDir}`);
  console.log(`📊 Size: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
});

// Catch errors
output.on("error", (err) => {
  console.error("❌ Error writing zip file:", err);
  process.exit(1);
});

archive.on("error", (err) => {
  console.error("❌ Error creating archive:", err);
  process.exit(1);
});

// Pipe archive data to the file
archive.pipe(output);

// Add files and directories to archive (excluding certain folders)
const filesToIgnore = ["node_modules", ".git", "logs", ".env", "backups"];

// Recursively add files
const addFilesToArchive = (dir, arcPath) => {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    const archivePath = path.join(arcPath, file);

    if (filesToIgnore.includes(file)) {
      return; // Skip ignored files/folders
    }

    if (stat.isDirectory()) {
      addFilesToArchive(filePath, archivePath);
    } else {
      archive.file(filePath, { name: archivePath });
    }
  });
};

console.log("📦 Creating backup...");
addFilesToArchive(__dirname, "");

// Finalize the archive
archive.finalize();
