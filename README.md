# npm-custom-installer
--

npm-custom-installer is enable to use dependencies of user defined.  

## sample

__package.json__

```json
{
  "dependencies": {
    "mocha": "2.0.0"
  }
}
```

__config.js__

```js
{
  dependencies: {
    mocha: {
      version: '2.2.5',
      dependencies: {
        commander: '=2.8.1',
        'node-glob': '^5.0.0'
      }
    }
  }
}
```

```bash
./bin/installer -c config.js
```
