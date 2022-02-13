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

import { AxiosRequestConfig, AxiosRequestHeaders, AxiosResponseHeaders } from 'axios';
import { Json22ParseOptions, Json22StringifyOptions } from 'json22';

export interface Json22AxiosOptions {
    json22ParseOptions?: Json22ParseOptions;
    json22StringifyOptions?: Json22StringifyOptions;
}

export function transformDataToJson22String(data: any, headers: AxiosRequestHeaders): any;

export function transformJson22StringToData(data: any, headers: AxiosResponseHeaders): any;

export function Json22RequestInterceptor(options?: Json22AxiosOptions): (config: AxiosRequestConfig) => AxiosRequestConfig;
