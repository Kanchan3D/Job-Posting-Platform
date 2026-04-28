const fs = require('fs');
const path = require('path');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
const mammoth = require('mammoth');

const uploadsDir = path.join(__dirname, '../../uploads/resumes');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Extract text from PDF file
 * @param {string} filePath - Path to PDF file
 * @returns {Promise<string>} Extracted text content
 */
const extractTextFromPDF = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const pdf = await pdfjsLib.getDocument({ data: dataBuffer }).promise;
    
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      text += pageText + ' ';
    }
    
    return text.trim();
  } catch (error) {
    throw new Error(`Failed to extract PDF text: ${error.message}`);
  }
};

/**
 * Extract text from DOCX file
 * @param {string} filePath - Path to DOCX file
 * @returns {Promise<string>} Extracted text content
 */
const extractTextFromDOCX = async (filePath) => {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    throw new Error(`Failed to extract DOCX text: ${error.message}`);
  }
};

/**
 * Extract text from resume file based on file type
 * @param {string} filePath - Path to resume file
 * @param {string} mimeType - MIME type of file
 * @returns {Promise<string>} Extracted text content
 */
const extractResumeText = async (filePath, mimeType) => {
  if (mimeType === 'application/pdf') {
    return await extractTextFromPDF(filePath);
  } else if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword' ||
    mimeType === 'application/x-docx'
  ) {
    return await extractTextFromDOCX(filePath);
  } else {
    throw new Error(`Unsupported file type: ${mimeType}`);
  }
};

/**
 * Save uploaded resume file
 * @param {Object} file - Multer file object
 * @param {string} userId - User ID
 * @returns {Promise<Object>} File info with path and extracted text
 */
const saveResumeFile = async (file, userId) => {
  try {
    if (!file) {
      throw new Error('No file provided');
    }

    // Validate file type
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'application/x-docx'
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      // Clean up the uploaded file
      fs.unlinkSync(file.path);
      throw new Error(`Unsupported file type. Allowed types: PDF, DOCX`);
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      fs.unlinkSync(file.path);
      throw new Error('File size exceeds 5MB limit');
    }

    // Extract text from resume
    const resumeText = await extractResumeText(file.path, file.mimetype);

    if (!resumeText || resumeText.trim().length === 0) {
      fs.unlinkSync(file.path);
      throw new Error('Resume file is empty or could not be read');
    }

    // Rename file to include userId for organization
    const uniqueName = `${userId}_${Date.now()}_${file.originalname}`;
    const newPath = path.join(uploadsDir, uniqueName);
    fs.renameSync(file.path, newPath);

    return {
      fileName: uniqueName,
      filePath: newPath,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      resumeText: resumeText.substring(0, 50000), // Limit text to prevent token overflow
      uploadedAt: new Date()
    };
  } catch (error) {
    // Clean up file if it exists
    if (file && fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
      } catch (unlinkError) {
        console.error('Error deleting temporary file:', unlinkError);
      }
    }
    throw new Error(`Failed to save resume file: ${error.message}`);
  }
};

/**
 * Delete resume file
 * @param {string} filePath - Path to resume file
 */
const deleteResumeFile = async (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error deleting resume file:', error);
    // Don't throw error to allow cleanup to continue
  }
};

/**
 * Get resume file text
 * @param {string} filePath - Path to resume file
 * @returns {Promise<string>} Extracted text
 */
const getResumeText = async (filePath) => {
  try {
    if (!filePath || !fs.existsSync(filePath)) {
      throw new Error('Resume file not found');
    }

    const mimeType = filePath.endsWith('.pdf') 
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    return await extractResumeText(filePath, mimeType);
  } catch (error) {
    throw new Error(`Failed to get resume text: ${error.message}`);
  }
};

module.exports = {
  extractTextFromPDF,
  extractTextFromDOCX,
  extractResumeText,
  saveResumeFile,
  deleteResumeFile,
  getResumeText,
  uploadsDir
};
