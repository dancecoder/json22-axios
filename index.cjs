/*
MIT License

Copyright (c) 2022 Dmitry Dutikov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

const { JSON22 } = require('json22');
const utils = require('axios/lib/utils');

const PARSE_OPTIONS = Symbol('Json22ParseOptions');
const STRINGIFY_OPTIONS = Symbol('Json22StringifyOptions');

/**
 * @param {any} data
 * @param {AxiosRequestHeaders} headers
 * */
function transformDataToJson22String(data, headers) {
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
function transformJson22StringToData(data, headers) {
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
function Json22RequestInterceptor(options = {}) {
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

module.exports = { transformDataToJson22String, transformJson22StringToData, Json22RequestInterceptor };
