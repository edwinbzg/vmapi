const express = require('express')
const { exec, execSync } = require('child_process');
const axios = require('axios')
const app = express()
const port = 3000

app.use(express.urlencoded({ extended: true }));


app.get('/setLayer', async (req, res) => {
    let { clientId, fileName } = req.query;
    const name = fileName.split('.').slice(0, -1).join('.')

    // Download GeoJSON
    exec(`mkdir -p /usr/share/geoserver/data_dir/client_sources/${clientId}/ && gsutil cp gs://geoviz/clients/${clientId}/geojson/${fileName} /usr/share/geoserver/data_dir/client_sources/${clientId}/`, (error, stdout, stderr) => {
        if (!error) {
            // Convert to GeoPackage
            exec(`ogr2ogr -f GPKG ${name}.gpkg /usr/share/geoserver/data_dir/client_sources/${clientId}/${fileName} -lco GEOMETRY_NAME=geom -lco OVERWRITE=YES -a_srs 'EPSG:4326'`, (error, stdout, stderr) => {
                if (!error) {
                    res.send('ok')
                } else {
                    console.log(stderr);
                    res.send(stderr)
                }
            });
        } else {
            console.log(stderr);
            res.send(stderr)
        }
    })



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
    // res.send('end');
})



app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
