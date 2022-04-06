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
            exec(`ogr2ogr -f GPKG /usr/share/geoserver/data_dir/client_sources/${clientId}/${name}.gpkg /usr/share/geoserver/data_dir/client_sources/${clientId}/${fileName} -lco GEOMETRY_NAME=geom -lco OVERWRITE=YES -a_srs 'EPSG:4326'`, (error, stdout, stderr) => {
                if (!error) {
                    // Create datastore
                    axios.post('http://localhost:8080/geoserver/rest/workspaces/clients/datastores', {
                        "dataStore": {
                            "name": name,
                            "connectionParameters": {
                                "entry": [
                                    { "@key": "database", "$": `file:client_sources/2/${name}.gpkg` },
                                    { "@key": "dbtype", "$": "geopkg" }
                                ]
                            }
                        }
                    }).then(resp => {
                        console.log(`statusCode: ${resp.status}`)
                        if (resp.status == 201) {
                            // Create layer
                            axios.post(`http://localhost:8080/geoserver/rest/workspaces/clients/datastores/${name}/featuretypes?recalculate=nativebbox,latlonbbox`,
                                {
                                    "name": name,
                                    "nativeName": name,
                                    "namespace": {
                                        "name": "clients",
                                        "href": "http://localhost:8080/geoserver/rest/namespaces/clients.json"
                                    },
                                    "title": name,
                                    "abstract": "",
                                    "keywords": {
                                        "string": [
                                            name,
                                        ]
                                    },
                                    "metadataLinks": {
                                        "metadataLink": []
                                    },
                                    "dataLinks": {
                                        "org.geoserver.catalog.impl.DataLinkInfoImpl": []
                                    },
                                    "nativeCRS": "EPSG:4326",
                                    "srs": "EPSG:4326",
                                    "nativeBoundingBox": {
                                        "minx": 0,
                                        "maxx": 0,
                                        "miny": 0,
                                        "maxy": 0,
                                        "crs": "EPSG:4326"
                                    },
                                    "latLonBoundingBox": {
                                        "minx": 0,
                                        "maxx": 0,
                                        "miny": 0,
                                        "maxy": 0,
                                        "crs": "EPSG:4326"
                                    },
                                    "projectionPolicy": "REPROJECT_TO_DECLARED",
                                    "enabled": true,
                                    "metadata": {
                                        "entry": [
                                            
                                        ]
                                    },
                                    "store": {
                                        "@class": "dataStore",
                                        "name": "clients:" + name,
                                        "href": "http://localhost:8080/geoserver/rest/workspaces/clients/datastores/" + name + ".json"
                                    },
                                    "cqlFilter": "INCLUDE",
                                    "maxFeatures": 100,
                                    "numDecimals": 6,
                                    "responseSRS": {
                                        "string": [
                                            4326
                                        ]
                                    },
                                    "overridingServiceSRS": true,
                                    "skipNumberMatched": true,
                                    "circularArcPresent": true,
                                    "linearizationTolerance": 10,
                                    "attributes": {
                                        "attribute": [
                                            {
                                                "name": "the_geom",
                                                "minOccurs": 0,
                                                "maxOccurs": 1,
                                                "nillable": true,
                                                "binding": "org.locationtech.jts.geom.Point"
                                            },
                                            {},
                                            {},
                                            {}
                                        ]
                                    }
                                }).then((resp2)=>{
                                    console.log(resp2);
                                    res.sendStatus(resp2.status);

                                }).catch(error=>{
                                    console.error(error)
                                    res.send(error)
                                });

                        } else {
                            res.sendStatus(resp.status)
                        }
                    })
                        .catch(error => {
                            console.error(error)
                            res.send(error)
                        })
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

    // res.send('end');
})



app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
