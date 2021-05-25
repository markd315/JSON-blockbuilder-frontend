Universal Drag-And-Drop Frontend
==============
Build complex REST json bodies easily utilizing Blockly, Menuly and [json-schema](https://json-schema.org/draft/2020-12/json-schema-core.html).

Pre-configure the data models that your API accepts, and the relationships between different classes.

Then, end-users can just drag and drop schema-defined blocks to wire together, validate, and send multiple API requests at once.

![Example](https://raw.githubusercontent.com/markd315/JSON-blockbuilder-frontend/master/example.png)

With Postman or other API requesting tools, you would have to configure these as three separate requests to three different endpoints! Jsonfrontend disambiguates and properly orders all of these requests for you, sending them with the click of a single button. It also ensures that your requests are entirely schema-compliant.

Universal Frontend makes it easy for your business analysts and any other low-tech users to use your API. All they need is the json-schema for the api, and their existing domain knowledge! No need to write new forms for every class!

### Usage Instructions

1. Configure server.json for wherever your rest API backend is, and supply any credentials. You can also play around in the browser without configuring a valid server. Remove `corsProxy` for any sort of production use.

2. Make any changes you want to the `schema`s in the folder. You will also have to list the new blocks under one of the menu categories at `index.html:72`. See the bullets below on the additional feature-driving fields this project adds to the `json-schema` standard.

3. Install dependencies `npm install`

3.5. (pending fix): change any occurrences of `grep -rnw . -e "zanzalaz.com"` to localhost or your own domain to use cusotm schema.

4. Rebuild any changes into the bundle with `browserify public/main.js -o public/bundle.js` 

5. Start the application with: `npm start`

6. Open `http://localhost:8080/` in the browser (tested with chrome)


### Schema Definitions

The basic structure necessary is defined by [json schema](https://json-schema.org/draft/2020-12/json-schema-core.html). 


Plenty of examples come prepackaged with this project, using all of the new fields below.

The following additional fields specific to this product are also supported:
- `endpoint`: The name of the file defines the default endpoint (baseUrl + "/" + fileName). This allows you to override it.
- `default`: When we create a primitive (boolean, string, number) field for a block, spawn it with this value.
- `color`: The [HSV color](https://developers.google.com/blockly/guides/create-custom-blocks/block-colour#:~:text=%20Block%20colour%20%201%20Defining%20the%20block,space%20is%20highly%20recommended%2C%20but%20Blockly...%20More%20) for the blockly blocks in the browser
- `properties[n].$ref`: Overridden. You can only provide another schema filename from the folder as a subschema. Don't try to do anything recursive would be my advice ;) `"$ref": "location.json"` 
- `properties[n].apiCreationStrategy`: Multiple backend methods are supported for creating objects with dependency relationships. See below for the three supported ones.

1. Providing everything in one big payload and trusting the server to properly handle the data in the child objects (The default way, don't have to specify).
2. Providing the `childFirstBodyId` apiCreationStrategy override: Creating the child first, then providing it to the parent as an id. The json response from the child POST ***must*** contain an id in the top-level.
3. Providing the `parentFirstRouteId` apiCreationStrategy override. Client creates the parent first, then creates the child using the id from the parent POST in a route for the child request.

Did I lose you there? See below for what's going on here and how this `apiCreationStrategy` really works and how powerful it is. It just allows the app to conform to the existing way your server handles composition relationships, I promise!

### Example schema with apiCreationStrategy overrides.

*Note that this example has no proper server, it is using a dummy api. Only the `employee` can ever return 200 because only the employee is supported by this dummy server. To see the example work by using mocked server responses, set `mockedResponses` to true in serverConfig.json*

In our example, you can build a tree like `product > location > employee` by using the optional fields in the dropdowns.

Simply drag and drop a product into the "Root" node. Then, add the optional "warehouseLocation" via the `product` dropdown. Finally, add the optional field "manager" via the `location` dropdown.

Change whichever primitive fields you like, and add any other additional fields.


1. Because `product.warehouseLocation` has `"apiCreationStrategy": "parentFirstRouteId"`, the product is created first with no warehouse at all. An id must returned by the server. It is stored.

```
curl 'http://dummy.restapiexample.com/api/v1/product' \
  -H 'Authorization: eyJ...' \
  -H 'Content-type: application/json' \
  --data-raw '{"productId":1,"productName":"Fanta","price":3.41}'
```
response:
```
{"id" : "3302372d-a590-4c4b-b3e2-c070025a3b8e"}
```

2. Location is not created next, because its `manager` field has `"apiCreationStrategy": "childFirstBodyId"`.
Instead, the employee must first created to be the manager of this warehouse. Once again, an id must be returned by the server, and is stored.
`endpoint` is also overridden, so the only unique thing to observe about this request is that the route changes, instead of `http://dummy.restapiexample.com/api/v1/employee` we use `http://dummy.restapiexample.com/api/v1/create`

```
curl 'http://dummy.restapiexample.com/api/v1/create' \
  -H 'Authorization: eyJ...' \
  -H 'Content-type: application/json' \
  --data-raw '{"name":"Bill","salary":"72000","age":"44"}'
```
response:
```
{"id" : "2f02372d-a590-4c4b-b3e2-c070025a3b8e"}
```

3. Finally, the location (warehouse location) must be created with references to both of the previously stored ids.
As specified, the product is provided in the route of the POST, and the id of the managing employee is provided in the body like so:
```
curl 'http://dummy.restapiexample.com/api/v1/product/3302372d-a590-4c4b-b3e2-c070025a3b8e/location' \
  -H 'Authorization: eyJ...' \
  -H 'Content-type: application/json' \
  --data-raw '{"latitude":30.09,"longitude":-81.62,"manager":"2f02372d-a590-4c4b-b3e2-c070025a3b8e"}'
```


### Feature ideas

- Serve schema from somewhere other than zanzalaz.com
- Add explicit schema inheritance via `"allOf": []`
- Add `default` values to the custom schema by overriding something in appendChild when we create the child blocks.
- Dark theme (pain because this involves updating my blockly version)


References:

1. https://developers.google.com/blockly/

2. https://github.com/ens-lg4/MenulyJSON

3. http://jsonlogic.com/

4. Direct forked from https://github.com/katirasole/JSONLogic-Editor

