const mongoose = require('mongoose');
require('./index.js')

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect(`mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}/?retryWrites=true&w=majority`);
    console.log('Connected to MongoDB');    
}