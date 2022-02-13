import { createServer } from 'http'
import { Buffer } from 'buffer';
import { strict as assert } from 'assert'
import { Writable } from 'stream';

import { suite, before, after, test } from 'mocha';
import { JSON22 } from 'json22';
import axios from 'axios';

import { Json22RequestInterceptor, transformDataToJson22String } from '../index.js';


suite('Request interceptor tests', () => {

    let server;

    before(done => {
        server = createServer(function (req, res) {
            const chunks = [];
            req.pipe(new Writable({
                write(chunk, encoding, callback) {
                    chunks.push(chunk);
                    callback();
                },
                final(callback) {
                    const buffer = Buffer.concat(chunks);
                    const contentText = buffer.toString();
                    const contentType = req.headers['content-type'];
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ contentType, contentText }));
                    callback();
                }
            }));
        });
        server.listen(4444);
        server.on('listening', done);
    });

    after(done => {
        server.close(done);
    });

    test('request with no parameters', async () => {
        const resp = await axios.get('http://localhost:4444/');
        assert.equal(resp.status, 200);
    });

    test('global request interceptor', async () => {
        const data = { date: new Date() };
        const ic = axios.interceptors.request.use(Json22RequestInterceptor());
        const resp = await axios.post('http://localhost:4444/', data);
        axios.interceptors.request.eject(ic);

        const contentType = JSON22.mimeType;
        const contentText = JSON22.stringify(data);
        assert.deepEqual(resp.data, { contentType, contentText });
    });

    test('unsupported payload type', async () => {
        const contentText = 'Buffer is not a type to stringify by axios';

        const ic = axios.interceptors.request.use(Json22RequestInterceptor());
        const resp = await axios.post('http://localhost:4444/', Buffer.from(contentText) );
        axios.interceptors.request.eject(ic);

        const contentType = 'application/x-www-form-urlencoded';
        assert.deepEqual(resp.data, { contentType, contentText });
    });

    test('specific content mime type', async () => {
        const contentType = 'application/json';
        const data = { date: new Date() };
        const ic = axios.interceptors.request.use(Json22RequestInterceptor());
        const resp = await axios.post('http://localhost:4444/', data, { headers: { 'content-type': contentType } });
        axios.interceptors.request.eject(ic);

        const contentText = JSON.stringify(data);
        assert.deepEqual(resp.data, { contentType, contentText });
    });

    test('http GET method', async () => {
        const ic = axios.interceptors.request.use(Json22RequestInterceptor());
        const resp = await axios.get('http://localhost:4444/');
        axios.interceptors.request.eject(ic);
        assert.equal(resp.status, 200);
        assert.deepEqual(resp.data, { contentText: '' });
    });

    test('direct transformer use', async () => {
        const data = { date: new Date() };
        const resp = await axios.request({
            method: 'POST',
            baseURL: 'http://localhost:4444',
            url: '/',
            transformRequest: [
                transformDataToJson22String
            ],
            data
        });
        const contentType = JSON22.mimeType;
        const contentText = JSON22.stringify(data);
        assert.deepEqual(resp.data, { contentType, contentText });
    });

    test('direct transformer use with unsupported payload type', async () => {
        const contentText = 'Buffer is not a type to stringify by axios';
        const resp = await axios.request({
            method: 'POST',
            baseURL: 'http://localhost:4444',
            url: '/',
            transformRequest: [
                transformDataToJson22String
            ],
            data: Buffer.from(contentText),
        });
        const contentType = 'application/x-www-form-urlencoded';
        assert.deepEqual(resp.data, { contentType, contentText });
    });

});

