var express = require('express');
const fileUpload = require('express-fileupload');

let fs = require('fs');
var app = express();

let Usuario = require('../models/usuario');
let Hospital = require('../models/hospital');
let Medico = require('../models/medico');


app.use(fileUpload());

//Rutas
app.put('/:tipo/:id', (req, res, next )=>{ 

    let tipo = req.params.tipo;
    let id = req.params.id;

    // tipos de coleccion
    let tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if( tiposValidos.indexOf( tipo ) < 0){
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no es válida',
            error: { message: 'Los tipos de colecciones válidas son ' + tiposValidos.join(', ')
            }
        });
    }

    if (!req.files){
        return res.status(400).json({
            ok: false,
            mensaje: 'No se puede cargar una imagen vacía',
            error: { message: 'No se seleccionó imagen' }
        })
    }
    
    // Obtener el nombre del archivo.
    let archivo = req.files.imagen;
    let nombreCortado = archivo.name.split('.');
    let extensionArchivo = nombreCortado [nombreCortado.length - 1];


    // Solo estas extensiones aceptamos
    let extensionesValidas = [ 'png','jpeg','gif','jpg'];

    if ( extensionesValidas.indexOf(extensionArchivo) < 0 ){
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no válida',
            error: {
                menssage: 'Las extensiones válidas son ' + extensionesValidas.join(', ')
            }
        });
    }

    // Nombre de archivo personalizado
    let nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${extensionArchivo}`;


    subirPorTipo(tipo, id, nombreArchivo, res);

    // Mover el archivo.
    let path = `./uploads/${ tipo }/${ nombreArchivo  }`;
    archivo.mv( path , err => {
        if(err){
            return res.status(500).json({
                ok: false, mensaje: 'Error al mover archivo',
                error: err
            })
        }
    });
});

function subirPorTipo(tipo, id, nombreArchivo, res){
    switch(tipo){
        case 'usuarios':
            Usuario.findById(id, (err, usuario) => {

                if(!usuario){
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Usuario no encontrado',
                        error: err
                    }); 
                }

                let pathViejo = './uploads/usuarios/'+ usuario.img;
                
                // Si existe, elimina la imagen interior
                if( fs.existsSync(pathViejo) ){
                    fs.unlink(pathViejo, (error) => {
                        if (error) {
                            return res.status(500).json({
                                ok: false,
                                mensaje: 'No se pudo eliminar la imagen del usuario',
                                error: error
                            });
                        }
                    });
                }

                usuario.img = nombreArchivo;
                usuario.save( (err, usuarioActualizado) => {

                    usuario.password = ':(';
                    
                    if(err){
                        res.status(500).json({
                            ok: false,
                            mensaje: 'Error al actualizar la foto del usuario',
                            error: err
                        });
                    }

                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de usuario actualizada',
                        usuarioActualizado
                    });
                });
                usuario
            });
            break;
        case 'medicos':
            Medico.findById(id, (err, medico) => {
                if (!medico){
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Medico no encontrado.',
                        error: {message: 'No existe un médico con ese id'}
                    })
                }

                let pathViejo = './uploads/medicos/' + medico.img;

                if( fs.existsSync(pathViejo) ){
                    fs.unlink(pathViejo, (err) => {
                        if(err){
                            return res.status(500).json({
                                ok: false,
                                mensaje: 'No se pudo eliminar la imagen del médico',
                                error: err
                            });
                        }
                    });
                }
                medico.img = nombreArchivo;
                medico.save( (err, medicoActualizado) => {
                    if(err){
                        res.status(500).json({
                            ok: false,
                            mensaje: 'Error al actualizar la foto del medico',
                            error: err
                        });
                    }

                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de medico actualizada',
                        medicoActualizado
                    });
                });
            });
            break; 
        case 'hospitales':
            Hospital.findById(id, (err, hospital) => {
                if (!hospital){
                    return res.status(400).json({
                        ok: false,
                        mensaje: 'Hospital no encontrado.',
                        error: {message: 'No existe un hospital con ese id'}
                    })
                }

                let pathViejo = './uploads/hospitales/' + hospital.img;

                if( fs.existsSync(pathViejo) ){
                    fs.unlink(pathViejo, (err) => {
                        if(err){
                            return res.status(500).json({
                                ok: false,
                                mensaje: 'No se pudo eliminar la imagen del hospital',
                                error: err
                            });
                        }
                    });
                }
                hospital.img = nombreArchivo;
                hospital.save( (err, hospitalActualizado) => {
                    if(err){
                        res.status(500).json({
                            ok: false,
                            mensaje: 'Error al actualizar la foto del hospital',
                            error: err
                        });
                    }

                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de hospital actualizada',
                        hospitalActualizado
                    });
                });
            });
            break;
    }
}

module.exports = app;