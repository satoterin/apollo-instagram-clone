import crypto from 'crypto';
import { ImageTransformationOptions, v2 as cloudinary } from 'cloudinary';
import { FileUpload } from 'graphql-upload';
import { CLOUDINARY_ROOT_PATH, __prod__ } from '../constants';

type PathSuffix = 'profiles' | 'posts';

function generateFileName() {
  return crypto.randomBytes(15).toString('hex');
}

function getTransformationOptions(
  pathSuffix: PathSuffix
): ImageTransformationOptions {
  return pathSuffix === 'posts'
    ? {
        width: 600,
      }
    : {
        width: 180,
        height: 180,
      };
}

export function generateUrl(selector: string, pathSuffix: PathSuffix) {
  const options = getTransformationOptions(pathSuffix);

  return cloudinary.url(selector, {
    ...options,
    quality: 'auto',
    format: 'webp',
  });
}

export async function uploadToCloudinary(
  file: FileUpload,
  pathSuffix: 'profiles' | 'posts'
) {
  const { createReadStream } = await file;

  return new Promise<{ url: string }>((resolve, reject) => {
    const fileName = generateFileName();
    const filePath = `${CLOUDINARY_ROOT_PATH}/${pathSuffix}`;

    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: fileName,
        folder: filePath,
      },
      (err, res) => {
        if (res) {
          resolve({
            url: `${filePath}/${fileName}`,
          });
        } else {
          reject(err);
        }
      }
    );
    createReadStream()
      .pipe(stream)
      .on('error', (err) => reject(err));
  });
}

export async function deleteCloudinaryFile(public_id: string) {
  if (public_id.startsWith(CLOUDINARY_ROOT_PATH)) {
    await cloudinary.uploader.destroy(public_id);
    return true;
  }
  return false;
}

// async function createBuffer(file: FileUpload) {
//   const { createReadStream } = await file;
//   const buffers: Uint8Array[] = [];
//   return await new Promise<Buffer | null>(async (res) =>
//     createReadStream()
//       .on('data', (chunk) => {
//         buffers.push(chunk as Buffer);
//       })
//       .on('end', () => {
//         res(Buffer.concat(buffers));
//       })
//       .on('error', (err) => {
//         console.log(err);
//         res(null);
//       })
//   );
// }

// async function uploadFile(
//   file: FileUpload,
//   pathPrefix?: string
// ): Promise<{ isUploaded: boolean; imgURL: string }> {
//   // Create buffer for minimising
//   const buffer = await createBuffer(file);
//   if (!buffer) return { isUploaded: false, imgURL: '' };

//   // constructing file name to be saved
//   const pathName = `public/images/${pathPrefix}/${generateFileName()}`;
//   const dirname = path.dirname(pathName);
//   if (!existsSync(dirname)) {
//     await fs.promises.mkdir(dirname, { recursive: true });
//   }
//   const imgURL = pathName.replace('public/', '');

//   // converting to jpg and minimising file
//   try {
//     await sharp(buffer)
//       .resize(pathPrefix === 'profile' ? 50 : 600)
//       .jpeg()
//       .toFile(pathName);

//     return { isUploaded: true, imgURL };
//   } catch (err) {
//     console.log(err);
//     return { isUploaded: false, imgURL };
//   }
// }

// export default uploadFile;
