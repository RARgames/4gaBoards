const fs = require('fs');
const path = require('path');
const tar = require('tar');

const createLimitError = (code) => {
  const error = new Error(code);
  error.code = code;
  return error;
};

const ensureSafeArchiveEntry = (entry) => {
  const normalizedPath = path.posix.normalize(entry.path || '');
  const parts = normalizedPath.split('/').filter(Boolean);

  if (!normalizedPath || normalizedPath === '.' || path.posix.isAbsolute(normalizedPath) || parts.includes('..') || entry.type === 'SymbolicLink' || entry.type === 'Link') {
    throw 'invalidFile';
  }
};

const validateArchive = async (filePath, limits) => {
  let entriesCount = 0;
  let totalUncompressedBytes = 0;

  await tar.t({
    file: filePath,
    onentry: (entry) => {
      ensureSafeArchiveEntry(entry);

      entriesCount += 1;
      if (entriesCount > limits.maxEntries) {
        throw createLimitError('archiveTooManyEntries');
      }

      const entrySize = Number.isFinite(entry.size) ? entry.size : 0;
      totalUncompressedBytes += Math.max(entrySize, 0);
      if (totalUncompressedBytes > limits.maxUncompressedBytes) {
        throw createLimitError('archiveUncompressedTooLarge');
      }
    },
  });
};

const extractArchiveWithTimeout = async (filePath, destinationPath, maxExtractionMs) => {
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => {
    abortController.abort(createLimitError('archiveExtractionTimeout'));
  }, maxExtractionMs);

  try {
    await tar.extract({
      file: filePath,
      cwd: destinationPath,
      signal: abortController.signal,
    });
  } catch (error) {
    if (abortController.signal.aborted) {
      throw createLimitError('archiveExtractionTimeout');
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

module.exports = {
  inputs: {
    file: {
      type: 'json',
      required: true,
    },
  },

  exits: {
    invalidFile: {},
  },

  async fn(inputs) {
    const importfileDir = path.dirname(inputs.file.fd);
    const importFileName = path.basename(inputs.file.fd);
    const importTempDir = path.join(importfileDir, `temp-${importFileName}`);
    const { boardImportExtractionLimits } = sails.config.custom;

    try {
      const compressedSize = fs.statSync(inputs.file.fd).size;
      if (compressedSize > boardImportExtractionLimits.maxCompressedBytes) {
        throw createLimitError('archiveCompressedTooLarge');
      }

      fs.mkdirSync(importTempDir, { recursive: true });
      await validateArchive(inputs.file.fd, boardImportExtractionLimits);

      await extractArchiveWithTimeout(inputs.file.fd, importTempDir, boardImportExtractionLimits.maxExtractionMs);
    } catch (error) {
      sails.log.error(error);
      fs.rmSync(importTempDir, { recursive: true, force: true });
      fs.rmSync(inputs.file.fd, { force: true });
      throw 'invalidFile';
    }

    return { importTempDir };
  },
};
