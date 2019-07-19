var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED

var app = express();
var Usuario = require('../models/usuario');

// Google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);


// ==============================================
//  Login Normal
// ==============================================
app.post('/', (req, res) => {

    var body = req.body;
    Usuario.findOne({email: body.email}, (err,usuarioBD) => {

        if (err) {
            return res.status(500).json({
                ok:false,
                mensaje: 'Error al buscar usuarios',
                errors: err
            })
        }

        if(!usuarioBD){
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                error: err
            })
        }

        if( !bcrypt.compareSync(body.password, usuarioBD.password)){
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                error: err
            })
        }

        // Crear token!!
        usuarioBD.password = ':)';
        var token = jwt.sign({ usuario: usuarioBD }, SEED,{ expiresIn: 14400});

        res.status(200).json({
            ok: true,
            usuario: usuarioBD,
            id: usuarioBD._id,
            token
        });
    });
});



// ======================================
//  Login con google
// ======================================

async function verify(token) {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
  // const userid = payload['sub'];
  // If request specified a G Suite domain:
  // const domain = payload['hd'];
  return {
      nombre: payload.name,
      img: payload.picture,
      email: payload.email,
      google: true,
      payload
  };
}


app.post('/google', async (req, res) => {
    let token = req.body.token;
    let googleUser = await verify( token )
    .catch(e => {
        res.status(403).json({
            ok: false,
            mensaje: 'Token no válido',
            error: e
        });
    });

    Usuario.findOne({email: googleUser.email}, (err, usuarioBD) => {

        if (err) {
            return res.status(500).json({
                ok:false,
                mensaje: 'Error al buscar usuarios',
                errors: err
            });
        }

        if(usuarioBD){
            if(!usuarioBD.google){
                return res.status(400).json({
                    ok:false,
                    mensaje: 'Debe de usar su autenticación normal'
                });
            } else {
                var token = jwt.sign({ usuario: usuarioBD }, SEED,{ expiresIn: 14400});
                res.status(200).json({
                    ok: true,
                    usuario: usuarioBD,
                    id: usuarioBD._id,
                    token
                });
            }
        } else {
            // El usuario no existe ... hay que crearlo
            let usuario =  new Usuario();
            
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save( (err, usuarioBD) => {
                var token = jwt.sign({ usuario: usuarioBD }, SEED,{ expiresIn: 14400});
                res.status(200).json({
                    ok: true,
                    usuarioBD,
                    token,
                    id: usuarioBD._id
                });
            });


        }
    });

    // res.status(200).json({
    //     ok: true,
    //     mensaje: 'todo ok',
    //     googleUser
    // });
});



module.exports = app;