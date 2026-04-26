const mongoose = require('mongoose');

const Item = require('../models/Item');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected successfully');

        // If an accidental unique index exists for firebaseUid from a prior migration, drop it.
        try {
            const indexes = await Item.collection.indexes();
            const firebaseUidIndex = indexes.find(index => index.name === 'firebaseUid_1');
            if (firebaseUidIndex && firebaseUidIndex.unique) {
                await Item.collection.dropIndex('firebaseUid_1');
                console.log('Dropped unique index firebaseUid_1 for Item collection (allows multiple items per user)');
            }
        } catch (indexErr) {
            if (indexErr.codeName === 'IndexNotFound' || indexErr.message.includes('not found')) {
                console.log('No firebaseUid unique index found, nothing to drop.');
            } else {
                console.warn('Could not inspect/drop firebaseUid index:', indexErr.message);
            }
        }

    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        // Log more details about the error for debugging
        if (error.code === 8000) {
            console.error('Wrong database credentials');
        } else if (error.code === 'ENOTFOUND') {
            console.error('Could not reach database server');
        }
        process.exit(1);
    }
};

module.exports = connectDB;