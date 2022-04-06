const express = require('express')
const { exec } = require('child_process');
const request = require('request');
const app = express()
const port = 3000

app.use(express.urlencoded({ extended: true }));


app.get('/setLayer', (req, res) => {
    let { clientId, fileName } = req.query;
    const name = fileName.split('.').slice(0, -1).join('.')

    // Download GeoJSON
    exec(`mkdir -p /usr/share/geoserver/data_dir/client_sources/${clientId}/ && gsutil cp gs://geoviz/clients/${clientId}/geojson/${fileName} /usr/share/geoserver/data_dir/client_sources/${clientId}/`, execOutput);
    // Convert to GeoPackage
    exec(`ogr2ogr -f GPKG ${name}.gpkg /usr/share/geoserver/data_dir/client_sources/${clientId}/${fileName} -lco GEOMETRY_NAME=geom -lco OVERWRITE=YES -a_srs 'EPSG:4326'`, execOutput)
    // Create datastore
    var options = {
        headers: {
            'Content-Type': 'application/json; charset=utf8'
        },
        formData: {
            "dataStore": {
                "name": name,
                "connectionParameters": {
                    "entry": [
                        { "@key": "database", "$": `file:client_sources/2/${name}.gpkg` },
                        { "@key": "dbtype", "$": "geopkg" }
                    ]
                }
            }
        },
        json: true
    }

    var create = request.post('http://localhost:8080/geoserver/rest/workspaces/clients/datastores', options, function (error, response, body) {
        // console.log(error);
        console.log(response);
        // console.log(body);
        res.json('Se ha actualizado la configuración correctamente.');
    });

;


function execOutput(error, stdout, stderr) {
    if (error) {
        console.error(`exec error: ${error}`);
        res.send('Error');
    }
    // res.send('Success');
}
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
