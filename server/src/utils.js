export const supportedFiles = ["mp3", , "mp4", "ogg", "wav", "flac"];

export function isFileSupported(file) {
  return supportedFiles.some(supported => file.name.includes(supported));
}
