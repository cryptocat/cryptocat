![Cryptocat](https://raw.githubusercontent.com/cryptocat/cryptocat/master/src/img/logo/64x64.png)

[![Build Status](https://travis-ci.org/cryptocat/cryptocat.svg?branch=master)](https://travis-ci.org/cryptocat/cryptocat)

[Documentation](https://crypto.cat/help.html) | [Security](https://crypto.cat/security.html) | [License](http://www.gnu.org/licenses/gpl-3.0.en.html)

### Build Instructions
Install dependencies:
```
npm run setup
```

Run:
```
npm run dev
```

Build for your platform (builds are in `dist`):
```
npm install -g electron-builder
build -w
build -l
build -m
```
