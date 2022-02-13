import { JSON22 } from 'json22';
import utils from 'axios/lib/utils.js';

const PARSE_OPTIONS = Symbol('Json22ParseOptions');
const STRINGIFY_OPTIONS = Symbol('Json22StringifyOptions');

/**
 * @param {any} data
 * @param {AxiosRequestHeaders} headers
 * */
export function transformDataToJson22String(data, headers) {
    const unsupported = [
        utils.isFormData,
        utils.isArrayBuffer,
        utils.isBuffer,
        utils.isStream,
        utils.isFile,
        utils.isBlob,
        utils.isArrayBufferView,
        utils.isURLSearchParams,
    ];

    if (!unsupported.some(fn => fn(data))) {
        const contentType = headers['Content-Type'] ?? headers['content-type'];
        if (contentType !== 'multipart/form-data' && contentType !== 'application/json') {
            const isObjectPayload = utils.isObject(data);
            if (isObjectPayload) {
                /** @type {AxiosRequestConfig} */
                const config = this;
                headers['Content-Type'] = JSON22.mimeType;
                // TODO: combine both stringify options objects
                return JSON22.stringify(data, config[STRINGIFY_OPTIONS] ?? config.json22Options?.json22StringifyOptions);
            }
        }
    }
    return data;
}

/**
 * @param {any} data
 * @param {AxiosResponseHeaders} [headers]
 * */
export function transformJson22StringToData(data, headers) {
    /** @type {AxiosRequestConfig} */
    const config = this;

    if ((headers?.['content-type'] ?? headers?.['Content-Type']) === JSON22.mimeType) {
        // TODO: combine both parse options objects
        return JSON22.parse(data, config[PARSE_OPTIONS] ?? config.json22Options?.json22ParseOptions);
    }

    return data;
}

/**
 * @param {Json22AxiosOptions} [options={}]
 * */
export function Json22RequestInterceptor(options = {}) {
    /**
     * @param {AxiosRequestConfig} config
     * */
    function json22RqIntercept(config) {
        config[PARSE_OPTIONS] = options.json22ParseOptions;
        config[STRINGIFY_OPTIONS] = options.json22StringifyOptions;
        config.transformRequest.unshift(transformDataToJson22String);
        config.transformResponse.unshift(transformJson22StringToData);
        return config;
    }
    return json22RqIntercept;
}
