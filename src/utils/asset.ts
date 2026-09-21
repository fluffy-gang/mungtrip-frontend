import { Asset } from 'expo-asset';

/**
 * Resolves a `require()`'d local image module to a displayable URI, synchronously.
 * `Image.resolveAssetSource` (used in older code) only exists on native React Native --
 * react-native-web ships no such static and throws "is not a function" when called on web.
 * `expo-asset` resolves the same module on every platform without an async download step.
 */
export function resolveAssetUri(module: number): string {
  return Asset.fromModule(module).uri;
}
