var express = require('express');
var bcrypt = require('bcryptjs');

var app = express();

var Usuario = require('../models/usuario');

// Obtener todos los usuarios.
app.get('/', (req, res, next )=>{ 
    Usuario.find({}, 'nombre email img role').exec(
        (err, usuarios)=>{
            if(err){
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargado usuario',
                    erros: err 
                })
            }
            res.status(200).json({
                ok: true,
                usuarios
            })
        })
});

// Actualizar un usuario.
app.put('/:id', (req,res)=>{
    var id = req.params.id;
    var body = req.body

    Usuario.findById( id , (err, usuario) => {
        if(err){
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                erros: err 
            })
        }
        if(!usuario){
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id '+id+ ' no existe. ',
                erros: {message: 'No existe usuario con ese ID'}
            })
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save( (err, usuarioGuardado) => {
            if(err){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    erros: err 
                })
            }
            usuarioGuardado.password = ':)';
            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            })    
        });
    });
    
})


// Crear un nuevo usuario.
app.post('/', (req, res)=>{
    var body = req.body;
    var usuario = new Usuario({
        nombre: body.nombre,
        email:  body.email,
        password:  bcrypt.hashSync(body.password, 10),
        img:  body.img,
        role: body.role
    });

    usuario.save( (err, usuarioGuardado) => {
        if(err){
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                erros: err 
            })
        }    
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado
        })
    });
})

module.exports = app;