const express = require('express');
const { main } = require('./index');
const cors = require('cors');
const app = express();

const PORT = 4000;

app.use(express.json())
app.use(cors())

console.log("hello")

app.get('/:domain', async(req, res) => {
    let result = []
    const url = req.url.split('?')
    console.log({ url })
    const domain = url[0].slice(1)
    const cores = url.length > 1 && url[1]
    const start = performance.now()
    console.log({ url, domain, cores })
    try {
        result = await main(domain);
        console.log(result)
        const end = performance.now()
        res.json({ result, time: end - start });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});




app.listen(PORT, () => console.log("Listening on port:" + PORT))