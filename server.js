const express = require('express')
const { exec } = require('child_process');
const axios = require('axios')
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
    // console.log(`ogr2ogr -f GPKG ${name}.gpkg /usr/share/geoserver/data_dir/client_sources/${clientId}/${fileName} -lco GEOMETRY_NAME=geom -lco OVERWRITE=YES -a_srs 'EPSG:4326'`)
    // Create datastore
    // axios.post('http://localhost:8080/geoserver/rest/workspaces/clients/datastores', {
    //     "dataStore": {
    //         "name": name,
    //         "connectionParameters": {
    //             "entry": [
    //                 { "@key": "database", "$": `file:client_sources/2/${name}.gpkg` },
    //                 { "@key": "dbtype", "$": "geopkg" }
    //             ]
    //         }
    //     }
    // }).then(resp => {
    //         console.log(`statusCode: ${resp.status}`)
    //         console.log(resp)
    //         res.send(resp)
    //     })
    //     .catch(error => {
    //         console.error(error)
    //         res.send(error)
    //     })


    function execOutput(error, stdout, stderr) {
        if (error) {
            console.error(`exec error: ${error}`);
            res.send('Error');
        }
    }
})



app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
