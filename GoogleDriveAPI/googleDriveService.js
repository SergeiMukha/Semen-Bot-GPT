const axios = require("axios");
const stream = require('stream');

const { getDrive } = require("../GoogleAPIAuth/authorizeGoogleAPI");

class GoogleDriveService {
    // Resolving promise to automaticallu initialize drive API
    constructor() {
        return Promise.resolve()
        .then(async () => {
            this.drive = await getDrive();

            return this;
        });
    };

    // Get all Google Sheets files in certain folder
    async getFolderGoogleSheetsFiles(folderId) {
        const response = await this.drive.files.list({
            q: `'${folderId}' in parents and mimeType='application/vnd.google-apps.spreadsheet'`,
            fields: 'files(id, name)',
        });
        
        const files = response.data.files;
        
        return files;
    }

    // Get all folders in certain folder
    async getAllFoldersInFolder(folderId) {
        const response = await this.drive.files.list({
          q: `mimeType='application/vnd.google-apps.folder' and '${folderId}' in parents`,
          fields: 'files(id, name)',
        });
      
        const folders = response.data.files;

        return folders;      
    }

    async createFolder(folderName, parentFolderId) {
        const fileMetadata = {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentFolderId],
          };
        
          const response = await this.drive.files.create({
            resource: fileMetadata,
            fields: 'id',
          });
        
          const folderId = response.data.id;
          return folderId;
    }

    async getFolderParent(folderId) {
        const response = await this.drive.files.get({
            fileId: folderId,
            fields: 'parents',
          });
        
          const parentFolderId = response.data.parents[0];

          return parentFolderId;
    }

    async getItemsInFolder(folderId) {
        const response = await this.drive.files.list({
            q: `'${folderId}' in parents and (mimeType = 'application/vnd.google-apps.folder' or mimeType = 'application/vnd.google-apps.spreadsheet')`,
            fields: 'files(id, name, mimeType)',
        });
        
        const foldersAndFiles = response.data.files;

        return foldersAndFiles;
    }

    async getItemType(itemId) {
        const response = await this.drive.files.get({
            fileId: itemId,
            fields: 'mimeType',
          });
        
          const mimeType = response.data.mimeType;
          const itemType = mimeType === 'application/vnd.google-apps.folder' ? 'Folder' : 'Table';

          return itemType;        
    }

    async moveSpreadsheetToFolder(spreadsheetId, folderId) {
        await this.drive.files.update({
            fileId: spreadsheetId,
            addParents: folderId,
            removeParents: 'previousParentId',
            fields: 'id, parents',
        });      
    }

    async deleteItem(itemId) {
        await this.drive.files.delete({
            fileId: itemId,
        });
    }

    async getAllGoogleSheetsFilesOnDrive() {
        const response = await this.drive.files.list({
            q: "mimeType='application/vnd.google-apps.spreadsheet'",
            fields: 'files(id, name)',
        });
        
        const sheetsFiles = response.data.files;

        console.log(sheetsFiles);
        return sheetsFiles;    
    }

    async uploadPhotoOrVideoByUrl(url, folderId) {
        const fileName = url.split("/")[6].split(".")[0];

        // Download file from URL
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        
        const fileBuffer = Buffer.from(response.data)

        // Upload file to Google Drive
        const fileMetadata = {
            name: fileName,
            parents: [folderId]
        };

        const media = {
            mimeType: response.headers['content-type'],
            body: createStreamFromBuffer(fileBuffer),
        };

        const uploadedFile = await this.drive.files.create({
            requestBody: fileMetadata,
            media,
        });

        return uploadedFile.data.id;
    }

    async getFileMimeType(fileId) {
        const response = await this.drive.files.get({
            fileId,
            fields: 'mimeType',
        });
    
        const mimeType = response.data.mimeType;
        
        return mimeType;
    }

    async getFileBuffer(fileId) {
        const res = await this.drive.files.get({ fileId, alt: 'media' }, { responseType: 'arraybuffer' });

        const fileBuffer = Buffer.from(res.data);
        const mimeType = await this.getFileMimeType(fileId);

        return {
            fileBuffer: fileBuffer,
            mimeType: mimeType
        }
    }

    async getFileName(fileId) {
        const response = await this.drive.files.get({
            fileId,
            fields: 'name',
        });
        
        return response.data.name;
    }

    async changeFileName(fileId, newFileName) {
        const fileMetadata = {
            name: newFileName,
        };
      
        await this.drive.files.update({
            fileId,
            requestBody: fileMetadata,
        });
    }

    async moveFile(fileId, folderId) {
        await this.drive.files.update({
            fileId,
            addParents: folderId,
            fields: 'id, parents',
        });
    }

    async getFoldersInFolder(folderId) {
        const response = await this.drive.files.list({
            q: `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder'`,
            fields: 'files(id, name)',
        });
        
        const folders = response.data.files;

        return folders;
    }

    async isRootFolder(folderId) {
        const response = await this.drive.files.get({
            fileId: folderId,
            fields: 'id, parents',
        });
    
        const file = response.data;
        const isRoot = !file.parents;

        return isRoot;
    }

    async getFolderName(folderId) {
        const response = await this.drive.files.get({
            fileId: folderId,
            fields: "name"
        })

        return response.data.name;
    }

    async getFileIdByNameInFolder(fileName, folderId) {
        const response = await this.drive.files.list({
            q: `name = '${fileName}' and '${folderId}' in parents`,
            fields: 'files(id)',
          });
      
        const files = response.data.files;

        return files[0].id;
    }
}

function createStreamFromBuffer(buffer) {
    const readable = new stream.PassThrough();
    readable.end(buffer);
    return readable;
}

// const start = async () => {
//     const googleDriveService = await new GoogleDriveService();

//     await googleDriveService.getFileIdByNameInFolder("hello", "1-xF8eOeQtSgm9eGgIa2Y8cSlMLTqXztw");
// }

// start();

module.exports = GoogleDriveService;