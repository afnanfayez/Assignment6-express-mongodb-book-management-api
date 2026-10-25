import { HttpError } from '../../common/index.js';

const titleValidator = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['title'],
    properties: { title: { bsonType: 'string', minLength: 1, pattern: '\\S' } },
  },
};

function existingCollection(db, name) {
  return db.listCollections({ name }, { nameOnly: true }).hasNext();
}

export async function createBooksCollection(db) {
  const alreadyExists = await existingCollection(db, 'books');
  const options = {
    validator: titleValidator,
    validationLevel: 'strict',
    validationAction: 'error',
  };
  if (alreadyExists) await db.command({ collMod: 'books', ...options });
  else await db.createCollection('books', options);
  return { acknowledged: true, collectionName: 'books', alreadyExists, validatorApplied: true };
}

export async function insertAuthor(db, author) {
  if (!author || typeof author !== 'object' || Array.isArray(author) || !Object.keys(author).length) {
    throw new HttpError(400, 'Provide a non-empty author document as a JSON object.');
  }
  return db.collection('authors').insertOne(author);
}

export async function createCappedLogsCollection(db) {
  if (await existingCollection(db, 'logs')) {
    const capped = await db.collection('logs').isCapped();
    const info = await db.listCollections({ name: 'logs' }).next();
    if (!capped || info.options?.size !== 1048576) {
      throw new HttpError(409, 'An existing logs collection is not capped at exactly 1048576 bytes; inspect it before changing data.');
    }
    return { acknowledged: true, collectionName: 'logs', capped, size: info.options.size, alreadyExists: true };
  }
  await db.createCollection('logs', { capped: true, size: 1024 * 1024 });
  const capped = await db.collection('logs').isCapped();
  return { acknowledged: true, collectionName: 'logs', capped, size: 1048576, alreadyExists: false };
}

export async function createBooksTitleIndex(db) {
  try {
    const name = await db.collection('books').createIndex({ title: 1 });
    return { acknowledged: true, collectionName: 'books', name };
  } catch (error) {
    if (error.code === 26) throw new HttpError(409, 'Create the books collection first (Q01).');
    throw error;
  }
}
