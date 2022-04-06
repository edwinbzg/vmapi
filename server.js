const express = require('express')
const { exec } = require('child_process');
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
    var create = request({
        url: 'http://localhost:8080/geoserver/rest/workspaces/clients/datastores',
        method: 'POST',
        form: {
            "dataStore": {
                "name": name,
                "connectionParameters": {
                    "entry": [
                        { "@key": "database", "$": `file:client_sources/2/${fileName}` },
                        { "@key": "dbtype", "$": "geopkg" }
                    ]
                }
            }
        }
    }, function (error, response, body) {
        res.json(global.response(true, 1, 'Se ha actualizado la configuración correctamente.'));
    });

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
