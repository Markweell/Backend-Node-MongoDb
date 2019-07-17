var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hospital');

app.get('/', (req, res , next) => {
    Hospital.find({}, 'nombre img usuario').exec(
        (err, hospitales) => {
            if(err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando hospital',
                    error: err
                })
            }
            res.status(200).json({
                ok: true,
                hospitales
            })
        }
    )
});
app.put('/:id', mdAutenticacion.verificaToken, (req, res , next) => {
    let id = req.params.id;
    let body = req.body;

    Hospital.findById(id, (err , hospital ) => {

        if(err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                error: err
            });
        }
        
        if(!hospital){
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe. ',
                error: {message: 'No existe un hospital con ese ID'}
            })
        }
        
        hospital.nombre = body.nombre;
        hospital.img = body.img;
        hospital.usuario = req.usuario._id;

        hospital.save( ( err, hospitalGuardado ) => {
            if( err ){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    error: err
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });
    });
});
app.post('/', mdAutenticacion.verificaToken, (req, res , next) => {

    let body = req.body;
    
    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id
    });

    hospital.save( (err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crea el hospital',
                error: err
            })
        }
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
            usuarioToken: req.usuario
        })
    });
})
app.delete('/:id', mdAutenticacion.verificaToken, (req, res , next) => {
    var id = req.params.id;
    var body = req.body;
    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => { 
        if( err ){
            return res.status(400).json({
                ok:false,
                mensaje: 'Error al borrar el hospital',
                error: { message: 'Error al borra el hospital'}
            })
        }
        if(!hospitalBorrado){
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese id',
                error: err
            })
        }
        res.status(201).json({
            ok: true,
            hospital: hospitalBorrado
        });
    }); 
});

module.exports = app;