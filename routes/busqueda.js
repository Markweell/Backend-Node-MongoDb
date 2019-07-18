var express = require('express');

var app = express();

let Hospital = require('../models/hospital');
let Medico = require('../models/medico');
let Usuario = require('../models/usuario');


// Busqueda por colección
app.get('/coleccion/:tabla/:busqueda', (req, res) =>{
    let tabla = req.params.tabla;
    let busqueda = req.params.busqueda;
    let regex = new RegExp(busqueda,'i');

    let promesa;

    switch(tabla){
        case 'medico':
            promesa = buscar(regex, Medico, 'medicos');
        break;
        case 'hospital':
            promesa = buscar(regex, Hospital, 'hospitales');
        break;
        case 'usuario':
            promesa = buscarUsuario(regex);
        break;
        default: 
            res.status(400).json({ ok: true, mensaje: 'No existe colección con ese nombre. Los nombres válidos son medicos, hospitales y usuario.', error: 'tipo de coleccion/tabla no válido' });
    }

    promesa.then(data => {
        res.status(200).json({ 
            ok: true, 
            [tabla]: data
        });
    });


});

// Busqueda general
app.get('/todo/:busqueda', (req, res, next )=>{ 
    
    let busqueda = req.params.busqueda;
    let regex = new RegExp(busqueda,'i');
    Promise.all([
        buscar(regex, Hospital, 'hospitales'),
        buscar(regex, Medico, 'medicos'),
        buscarUsuario(regex)]).
            then(respuestas => {
                res.status(200).json({
                    ok:true,
                    hospitales: respuestas[0],
                    medicos: respuestas[1],
                    usuarios: respuestas[2]
            });
    });
});

function buscar(regex, Modelo, nombreCampo = 'resultadoBusqueda'){
    return new Promise ((resolve, reject) => {
        Modelo.find({nombre: regex})
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec( (err, resultadoBusqueda) => {
            if(err){
                reject('Error al cargar ' + nombreCampo, err);
            }else{
                resolve(resultadoBusqueda);
            }
        });
    });
}

function buscarUsuario(regex){
    return new Promise ((resolve,reject) => {
        Usuario.find({}, 'nombre email role')
        .or([{ 'nombre': regex}, { 'email': regex}])
        .exec((err, usuarios) =>{
            if(err){
                reject('Error al cargar usuario', err);
            }else{
                resolve(usuarios);
            }
        })
    })
}

// app.get('/todo/:busqueda', async (req, res) => {
//     let busqueda = req.params.busqueda;
//     let regexp = new RegExp(  busqueda, 'i' );
//     try {
//         let usuarios = await Usuario.find({nombre:regexp})
//         let hospitales = await Hospital.find({nombre:regexp})
//         let medicos = await Medico.find({nombre:regexp})
//         res.json({
//             ok: true,
//             usuarios,
//             hospitales,
//             medicos
//         })
//     } catch (error) {
//         res.status(500).json({
//             ok: false,
//             error
//         })
//     }
 
// })

module.exports = app;