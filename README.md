# Webpack Http Module Loader
Allow use browser remote import es module in webpack eg: `import { xxx } from 'https://yourdomain.'` 

# How to use
- `npm install https://github.com/miterfrants/webpack-http-module-loader.git`
- edit webpack.config.js
```
module: {
    rules: [{
        test: /\.js$/i,
        use: ['http-module-loader']    
    }]
}
```

# How it work
- http module loader will change your source to dynamic import and skip webpack compiler
```
import { moduleName } from 'https://yourdomainname';
↓↓↓↓↓↓↓↓
import('https://yourdomainname').then((importedModule)=>{
  window[moduleName] = importedModule[moduleName];
});
```
