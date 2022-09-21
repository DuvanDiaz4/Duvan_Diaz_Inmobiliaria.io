
const inicio = (req, res) => {

    res.render('Inicio', {
        pagina: 'Inicio'
    });
}

const categoria = (req, res) => {

}

const noEncontrado = (req, res) => {

}

const buscador = (req, res) => {

}

export {
    inicio,
    categoria,
    noEncontrado,
    buscador
}