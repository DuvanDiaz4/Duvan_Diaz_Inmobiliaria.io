
const admin = (req, res) => {
    res.render('propiedades/admin', {
        pagina: 'Administra tus propiedades',
        barra: true
    })
}

export {
    admin,
}