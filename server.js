const express = require('express')
const { exec } = require('child_process');
const app = express()
const port = 3000

app.use(express.urlencoded({ extended: true }));


app.get('/setLayer', (req, res) => {
    let { clientId, fileName } = req.body;
    exec(`mkdir -p /usr/share/geoserver/data_dir/client_sources/${clientId}/ && gsutil cp gs://geoviz/clients/${clientId}/geojson/${fileName} /usr/share/geoserver/data_dir/client_sources/${clientId}/`, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            res.send('Error');
        }
        console.log(`exec stdout: ${stdout}`);
        res.send('Success');
    });
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
