//
import { fileURLToPath, pathToFileURL } from 'node:url'

export function pathify(path: string): string {
  if (path.startsWith('file://')) {
    path = fileURLToPath(path)
  }
  return path
}

export function instantiateEmscriptenWasm<T extends EmscriptenWasm.Module>(
  factory: EmscriptenWasm.ModuleFactory<T>,
  path: string,
  workerJS = ''
): Promise<T> {
  return factory({
    locateFile(requestPath) {
      // The glue code generated by emscripten uses the original
      // file names of the worker file and the wasm binary.
      // These will have changed in the bundling process and
      // we need to inject them here.
      if (requestPath.endsWith('.wasm')) return pathify(path)
      if (requestPath.endsWith('.worker.js')) return pathify(workerJS)
      return requestPath
    },
  })
}

export function dirname(url: string) {
	return url.substring(0, url.lastIndexOf('/'))
}

/**
 * On certain serverless hosts, our ESM bundle is transpiled to CJS before being run, which means
 * import.meta.url is undefined, so we'll fall back to __dirname in those cases
 * We should be able to remove this once https://github.com/netlify/zip-it-and-ship-it/issues/750 is fixed
 */
export function getModuleURL(url: string | undefined): string {
	if (!url) {
		return pathToFileURL(__dirname).toString();
	}

	return url
}