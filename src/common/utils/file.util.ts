import fs from 'fs';

export function deleteFile(filePath: string): void {
  fs.unlink(filePath, (error) => {
    if (error) console.log(error);
  });
}
