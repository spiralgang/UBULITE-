/**
 * Puter.js File System Integration Template
 * Use this template to add file system functionality
 */

class PuterFileManager {
  constructor() {
    this.initialized = false;
  }

  async initialize() {
    if (typeof puter === 'undefined') {
      throw new Error('Puter.js not available');
    }
    
    if (!puter.fs) {
      throw new Error('Puter.js File System not available');
    }
    
    this.initialized = true;
    console.log('✅ Puter.js File Manager initialized');
  }

  async readFile(path) {
    if (!this.initialized) await this.initialize();

    try {
      const content = await puter.fs.read(path);
      return { success: true, content, path };
    } catch (error) {
      return { success: false, error: error.message, path };
    }
  }

  async writeFile(path, content) {
    if (!this.initialized) await this.initialize();

    try {
      const result = await puter.fs.write(path, content);
      return { success: true, result, path };
    } catch (error) {
      return { success: false, error: error.message, path };
    }
  }

  async fileExists(path) {
    if (!this.initialized) await this.initialize();

    try {
      const exists = await puter.fs.exists(path);
      return { success: true, exists, path };
    } catch (error) {
      return { success: false, error: error.message, path };
    }
  }

  async listFiles(directory = '/') {
    if (!this.initialized) await this.initialize();

    try {
      const files = await puter.fs.list(directory);
      return { success: true, files, directory };
    } catch (error) {
      return { success: false, error: error.message, directory };
    }
  }
}

// Usage Example:
/*
const fileManager = new PuterFileManager();

// Read a file
const fileContent = await fileManager.readFile('/path/to/file.txt');
if (fileContent.success) {
  console.log('File content:', fileContent.content);
}

// Write a file
const writeResult = await fileManager.writeFile('/path/to/newfile.txt', 'Hello World');
if (writeResult.success) {
  console.log('File written successfully');
}

// List files
const fileList = await fileManager.listFiles('/');
if (fileList.success) {
  console.log('Files:', fileList.files);
}
*/
