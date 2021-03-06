var express = require('express');

var app = express();

const path = require('path');
const fs = require('fs');

app.get('/:tipo/:imagen', (req, res, next )=>{ 
    let tipo = req.params.tipo;
    let img = req.params.imagen;

    let pathImagen = path.resolve( __dirname, `../uploads/${ tipo }/${ img }`);

    if( fs.existsSync(pathImagen) ){
        res.sendFile(pathImagen);
    } else {
        let pathNoImagen = path.resolve( __dirname, '../assets/no-img.jpg');
        res.sendFile(pathNoImagen);
    }

});

module.exports = app;