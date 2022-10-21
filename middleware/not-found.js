const notFound = (req, res) => {
    console.log("I m asdfasdf ")
    return res.status(404).send('Route does not exist')
}

module.exports = notFound
