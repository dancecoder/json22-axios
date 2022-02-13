import { after, before, suite, test } from 'mocha';
import { createServer } from 'http';
import { Writable } from 'stream';
import { Buffer } from 'buffer';
import { strict as assert } from 'assert';
import axios from 'axios';
import { JSON22 } from 'json22';
import { Json22RequestInterceptor, transformJson22StringToData } from '../index.js';

suite('Response interceptor tests', () => {

    class TypedModel {
        constructor(data) {
            this.a = data?.a;
            this.b = data?.b;
        }
        valueOf() {
            return { a: this.a, b: this.b };
        }
    }

    const context = { TypedModel };

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
                    res.writeHead(200, {'Content-Type': req.url === '/json' ? 'application/json' : JSON22.mimeType});
                    const data = { date: new Date(), typedModel: new TypedModel({ a: 42 }) };
                    res.end(req.url === '/json' ? JSON.stringify(data) : JSON22.stringify(data));
                    callback();
                }
            }));
        });
        server.listen(4445);
        server.on('listening', done);
    });

    after(done => {
        server.close(done);
    });

    test('no response interceptor', async () => {
        const resp = await axios.get('http://localhost:4445/');
        assert.equal(resp.status, 200);
    });

    test('global response interceptor', async () => {
        const data = { date: new Date() };
        const ic = axios.interceptors.request.use(Json22RequestInterceptor({ json22ParseOptions: { context } }));
        const resp = await axios.post('http://localhost:4445/', data);
        axios.interceptors.request.eject(ic);

        assert.equal(typeof resp.data, 'object');
        assert.deepEqual(resp.data.date.constructor.name, 'Date');
        assert.deepEqual(resp.data.typedModel.constructor.name, 'TypedModel');
    });

    test('unsupported content type', async () => {
        const data = { date: new Date() };
        const ic = axios.interceptors.request.use(Json22RequestInterceptor());
        const resp = await axios.post('http://localhost:4445/json', data);
        axios.interceptors.request.eject(ic);

        assert.equal(typeof resp.data, 'object');
        assert.deepEqual(resp.data.date.constructor.name, 'String');
    });

    test('direct transformer', async () => {
        const data = { date: new Date() };
        const resp = await axios.request({
            method: 'POST',
            baseURL: 'http://localhost:4445',
            url: '/',
            transformResponse: transformJson22StringToData,
            json22Options: { json22ParseOptions: { context } },
            data
        });
        assert.equal(typeof resp.data, 'object');
        assert.deepEqual(resp.data.date.constructor.name, 'Date');
        assert.deepEqual(resp.data.typedModel.constructor.name, 'TypedModel');
    });

    test('direct transformer unsupported content type', async () => {
        const data = { date: new Date() };
        const resp = await axios.request({
            method: 'POST',
            baseURL: 'http://localhost:4445',
            url: '/json',
            transformResponse: transformJson22StringToData,
            json22Options: { json22ParseOptions: { context } },
            data
        });
        assert.equal(typeof resp.data, 'string');
    });


});
