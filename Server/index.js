import express, { json, urlencoded } from 'express';
import { search } from './search.js';

var app = express();
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));
app.use(json())
app.use(urlencoded({extended: true}))


app.get('/Search', async function (req, res) {

    //get the search query
    var searchQuery = req.query.query;

    const response = await search(searchQuery);

    res.send(response);

});

app.listen(3000);
