var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

var app = express();

var Medico = require('../models/medico');

app.get('/', (req, res , next) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);


    Medico
    .find({},)
    .populate('usuario', 'nombre email')
    .populate('hospital')
    .skip(desde)
    .limit(5)
    .exec(
        (err, medicos) => {
            if(err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando medicos',
                    error: err
                })
            }
           Medico.count({}, (err,conteo) => {
                res.status(200).json({
                    ok: true,
                    medicos,
                    conteo
                });
            })
        });
});
app.put('/:id', mdAutenticacion.verificaToken, (req, res , next) => {
    let id = req.params.id;
    let body = req.body;

    Medico.findById(id, (err , medico ) => {

        if(err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                error: err
            });
        }
        
        if(!medico){
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id ' + id + ' no existe. ',
                error: {message: 'No existe un medico con ese ID'}
            })
        }
        
        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital

        medico.save( ( err, medicoGuardado ) => {
            if( err ){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    error: err
                });
            }
            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });
    });
});
app.post('/', mdAutenticacion.verificaToken, (req, res , next) => {

    let body = req.body;
    
    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save( (err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crea el medico',
                error: err
            })
        }
        res.status(201).json({
            ok: true,
            medico: medicoGuardado,
            usuarioToken: req.usuario
        })
    });
})
app.delete('/:id', mdAutenticacion.verificaToken, (req, res , next) => {
    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => { 
        if( err ){
            return res.status(400).json({
                ok:false,
                mensaje: 'Error al borrar el medico',
                error: { message: 'Error al borra el medico'}
            })
        }
        if(!medicoBorrado){
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con ese id',
                error: err
            })
        }
        res.status(201).json({
            ok: true,
            medico: medicoBorrado
        });
    }); 
});

module.exports = app;