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
            removeParents: 'root',
            fields: 'id, parents',
        });      
    }

    async deleteItem(itemId) {
        await this.drive.files.delete({
            fileId: itemId,
        });
    }
}

// const start = async () => {
//     const googleDriveService = await new GoogleDriveService();

//     await googleDriveService.getFolderParent("root");
// }

// start();

module.exports = GoogleDriveService;