import Iota from '../iota/Iota';
import addMetaData from './addMetaData';
import prepMetaData from './prepMetaData';
import Signature from '../crypto/Signature';

/**
 * Prepares and sends metadata to the tangle for public files
 * @param {string} fileId
 * @param {string} filename
 * @param {string} gateway
 * @param {string} description
 */
export default async function createMetadata(fileId, filename, gateway, description) {
  const iota = new Iota();
  const time = new Date().toUTCString();

  const sig = new Signature();
  const keys = await sig.getKeys();
  const publicHexKey = await sig.exportPublicKey(keys.publicKey);
  const publicTryteKey = iota.publicKeyPrep(publicHexKey);

  const [, fileNamePart, fileTypePart] = filename.match(/(.*)\.(.*)/);
  let metadata = {
    fileId,
    fileName: fileNamePart,
    fileType: fileTypePart,
    description,
    time,
    gateway,
    publicTryteKey,
  };
  metadata = prepMetaData(metadata);
  const signature = await sig.sign(keys.privateKey, JSON.stringify(metadata));
  // https://stackoverflow.com/questions/9267899/arraybuffer-to-base64-encoded-string/38858127
  metadata.signature = btoa(String.fromCharCode.apply(null, new Uint8Array(signature)));
  iota.sendMetadata(metadata);
  // store direct in database!
  addMetaData(metadata);
}