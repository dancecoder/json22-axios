# JSON22-Axios
Axios interceptor providing support to [JSON22](https://github.com/dancecoder/json22#readme) data format in your applications.

## Features
* Ready to use [Axios](https://axios-http.com/) interceptor
* Parse [JSON22](https://github.com/dancecoder/json22#readme) body content
* Serialize data to JSON22
* Support for global interceptor as well as request level transformation
* Both CJS/ESM modules support

## Installation
```shell
npm install json22-axios
```

Add interceptor at your client setup
```javascript
import axios from 'axios';
import { Json22RequestInterceptor } from 'json22-axios';

axios.interceptors.request.use(Json22RequestInterceptor());
```

For old-fashioned javascript

```javascript
const axios = require('axios');
const { Json22RequestInterceptor } = require('json22-axios');

axios.interceptors.request.use(Json22RequestInterceptor());
```

## Options

Both stringify and parse methods of JSON22 accepts options. You may be interested to define such options at global level as well as with isolated client instance.

`Json22RequestInterceptor` accepts the next options structure

```typescript
interface Json22AxiosOptions {
    json22ParseOptions?: Json22ParseOptions;
    json22StringifyOptions?: Json22StringifyOptions;
}
```
See also `Json22ParseOptions` and `Json22StringifyOptions` at [JSON22 API description](https://github.com/dancecoder/json22#api)

### Define global level options
```javascript
import axios from 'axios';
import { Json22RequestInterceptor } from 'json22-axios';
import { TypedModel } from './models/typed-model.js';

axios.interceptors.request.use(Json22RequestInterceptor({
    json22ParseOptions: { context: { TypedModel } },
}));
```

### Define isolated client options
```javascript
import axios from 'axios';
import { Json22RequestInterceptor } from 'json22-axios';
import { TypedModel } from './models/typed-model.js';

const client = axios.create();
client.interceptors.request.use(Json22RequestInterceptor({
    json22ParseOptions: { context: { TypedModel } },
}));
```

## Request level data transformation
In same rare cases you might be interested to set up data transformation for a specific query.
This case you shall not use the interceptor. Instead, you'll have to use data transformers functions. 
Data transformers do not accept options, so you'll need to define it on query configuration at `json22Options`.
```javascript
import axios from 'axios';
import { transformJson22StringToData, transformDataToJson22String } from 'json22-axios';
import { TypedModel } from './models/typed-model.js';

export async function postData(data) {
    const resp = await axios.request({
        method: 'POST',
        baseURL: 'https://example.com',
        url: '/api/data',
        transformResponse: transformJson22StringToData,
        transformRequest: transformDataToJson22String,
        json22Options: { json22ParseOptions: { context: { TypedModel } } },
        data
    });
    return resp.data;
}   
```
__Note: `json22Options` configuration field is not defined by axios.__ 
That is the reason we do not recommend to use json22 data transformers directly.
Please, use interceptor instead. 
