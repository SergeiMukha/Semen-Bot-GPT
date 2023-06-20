require("dotenv").config();
const getSheets = require("./authorizeGoogleSheets");

class GoogleSheets {
    // Resolving promise to automaticallu initialize sheet
    constructor() {
        return Promise.resolve()
        .then(async () => {
            this.sheets = await getSheets();

            return this;
        });

    }

    // Read data from Google Sheets table
    async readData(spreadsheetId) {
        // Get all data from the sheet
        const response = await this.sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: "Sheet"
        })

        return response.data.values;
    }

    // Get one certain row
    async getRow(spreadsheetId, rowId) {
        const response = await this.sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: "Sheet"
        })

        return response.data.values[rowId];
    }

    // Write data into Google Sheets table
    async writeData(spreadsheetId, data) {
        const resource = {
            values: data
        }

        await this.sheets.spreadsheets.values.append(
            {
                spreadsheetId: spreadsheetId,
                range: "Sheet",
                valueInputOption: 'RAW',
                resource: resource
            },
            (err) => {
                if (err) {
                    console.log(err);
                }
            }
        )
    }

    // Update one certain row
    async updateRow(spreadsheetId, rowId, rowData) {
        const resource = {
            values: [rowData]
        }

        await this.sheets.spreadsheets.values.update(
            {
                spreadsheetId: spreadsheetId,
                range: `Sheet!A${parseInt(rowId)+1}:F${parseInt(rowId)+1}`,
                valueInputOption: 'RAW',
                resource: resource
            },
            (err) => {
                if (err) {
                    console.log(err);
                }
            }
        )
    }

    // Create Google Sheets table
    async createDatabase(name) {
        // Create table
        const spreadsheet = await this.sheets.spreadsheets.create({
            requestBody: {
                properties: {
                    title: name,
                },
            },
        });

        const spreadsheetId = spreadsheet.data.spreadsheetId;
        
        // Create sheet
        await this.sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
                requests: [
                    {
                    addSheet: {
                        properties: {
                            title: "Sheet",
                        },
                    },
                    },
                ],
            },
        });

        return spreadsheetId;
    }
    
    async deleteRow(rowId) {
        await this.sheets.spreadsheets.values.clear({
            spreadsheetId: process.env.DATABASES_TABLE_ID,
            range: `Sheet!A${parseInt(rowId)+1}:ZZ${parseInt(rowId)+1}`
        })
    }

    async deleteFirstSheet(spreadsheetId) {
        const response = await this.sheets.spreadsheets.get({
            spreadsheetId: spreadsheetId,
            fields: 'sheets(properties(sheetId,title))',
        });

        const sheetId = response.data.sheets[0].properties.sheetId;

        await this.sheets.spreadsheets.batchUpdate({
            spreadsheetId: spreadsheetId,
            resource: {
                requests: [
                    {
                        deleteSheet: {
                            sheetId: sheetId,
                        },
                    },
                ],
            },
        });
    }
}

// const start = async () => {
//     const googleSheetsParser = await new GoogleSheets();
// }

// start()

module.exports = GoogleSheets
