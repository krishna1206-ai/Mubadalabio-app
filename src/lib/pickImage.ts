import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

export type PickedImage = { mime: string; base64: string; preview: string };

/**
 * Lets the admin choose a photo and shrinks it to at most `maxWidth` px (JPEG) so uploads stay
 * small. Returns null if they cancel; throws if the file can't be read.
 */
export async function pickAndShrinkImage(maxWidth = 1600): Promise<PickedImage | null> {
  const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
  const asset = res.canceled ? null : res.assets[0];
  if (!asset) return null;
  const ctx = ImageManipulator.manipulate(asset.uri);
  if (asset.width > maxWidth) ctx.resize({ width: maxWidth });
  const image = await (await ctx.renderAsync()).saveAsync({ format: SaveFormat.JPEG, compress: 0.82, base64: true });
  if (!image.base64) throw new Error('Could not read the image');
  return { mime: 'image/jpeg', base64: image.base64, preview: image.uri };
}

/** Which script the text is mostly written in, or null if it has no letters yet. */
export function detectLang(text: string): 'en' | 'ar' | null {
  const arabic = (text.match(/[؀-ۿ]/g) ?? []).length;
  const latin = (text.match(/[A-Za-z]/g) ?? []).length;
  if (!arabic && !latin) return null;
  return arabic >= latin ? 'ar' : 'en';
}
