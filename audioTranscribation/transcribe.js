require("dotenv").config();
const Replicate = require("replicate");

const replicate = new Replicate({
  	auth: process.env.REPLICATE_TOKEN,
});

async function transcribeAudio(url) {
    const output = await replicate.run(
        "openai/whisper:91ee9c0c3df30478510ff8c8a3a545add1ad0259ad3a9f78fba57fbc05ee64f7",
        {
			input: {
				audio: url,
				language: "uk"
			}
        }
    );

    console.log(output);
}


transcribeAudio("https://api.telegram.org/file/bot6229481281:AAGCYXowVbuCJo9kKM-ZaZan4dUL1bsBhtA/music/file_5.m4a")