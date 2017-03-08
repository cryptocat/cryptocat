![Cryptocat](https://raw.githubusercontent.com/cryptocat/cryptocat/master/src/img/logo/64x64.png)

[![Build Status](https://travis-ci.org/cryptocat/cryptocat.svg?branch=master)](https://travis-ci.org/cryptocat/cryptocat)

[Documentation](https://crypto.cat/help.html) | [Security](https://crypto.cat/security.html) | [License](http://www.gnu.org/licenses/gpl-3.0.en.html)

### Building
Install dependencies:
```
npm run setup
```

Run:
```
npm run dev
```

### Packaging
Install dependencies:
```
npm install -g electron-builder
```
#### Windows
```
build -w
```
#### Linux
````
build -l
````
#### Mac
````
build -m
```
