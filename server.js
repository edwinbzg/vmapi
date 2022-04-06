const express = require('express')
const { exec, execSync } = require('child_process');
const axios = require('axios')
const app = express()
const port = 3000

app.use(express.urlencoded({ extended: true }));


app.get('/setLayer', async (req, res) => {
    let { clientId, fileName } = req.query;
    const name = fileName.split('.').slice(0, -1).join('.')
    // columns = JSON.parse(columns);

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
                            // Get Geopackage info
                            // exec(`ogrinfo ${name}.gpkg -sql "SELECT json_group_array(json_object('cid', cid,'name', name,'type', type,'dflt_value', dflt_value,'pk', pk)) AS json_result FROM (SELECT * FROM pragma_table_info('${name}'))"`, (error, stdout, stderr) => {
                            //     if (!error) {
                            //         var attribute = [];
                            //         var columns = JSON.parse(stdout.split('json_result (String) = ')[1]);
                            //         columns.forEach(item => {
                            //             attribute.push({
                            //                 "name": item.name,
                            //                 "minOccurs": 0,
                            //                 "maxOccurs": 1,
                            //                 "nillable": true,
                            //                 "binding": "org.locationtech.jts.geom.Polygon"
                            //             })
                            //         });
                            //     } else {
                            //         // Error
                            //     }
                            // })
                            // Create layer
                            axios.post(`http://localhost:8080/geoserver/rest/workspaces/clients/datastores/${name}/featuretypes`,
                                {
                                    "featureType": {
                                        "name": name,
                                        "nativeName": name,
                                        "namespace": {
                                            "name": "clients",
                                            "href": "http://localhost:8080/geoserver/rest/namespaces/clients.json"
                                        },
                                        "title": name,
                                        "keywords": {
                                            "string": [
                                                "features",
                                                name
                                            ]
                                        },
                                        "nativeCRS": "GEOGCS[\"WGS 84\", \n  DATUM[\"World Geodetic System 1984\", \n    SPHEROID[\"WGS 84\", 6378137.0, 298.257223563, AUTHORITY[\"EPSG\",\"7030\"]], \n    AUTHORITY[\"EPSG\",\"6326\"]], \n  PRIMEM[\"Greenwich\", 0.0, AUTHORITY[\"EPSG\",\"8901\"]], \n  UNIT[\"degree\", 0.017453292519943295], \n  AXIS[\"Geodetic longitude\", EAST], \n  AXIS[\"Geodetic latitude\", NORTH], \n  AUTHORITY[\"EPSG\",\"4326\"]]",
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
                                        "projectionPolicy": "FORCE_DECLARED",
                                        "enabled": true,
                                        "store": {
                                            "@class": "dataStore",
                                            "name": `clients:${name}`,
                                            "href": `http://localhost:8080/geoserver/rest/workspaces/clients/datastores/${name}.json`
                                        },
                                        "serviceConfiguration": false,
                                        "simpleConversionEnabled": false,
                                        "internationalTitle": "",
                                        "internationalAbstract": "",
                                        "maxFeatures": 0,
                                        "numDecimals": 0,
                                        "padWithZeros": false,
                                        "forcedDecimal": false,
                                        "overridingServiceSRS": false,
                                        "skipNumberMatched": false,
                                        "circularArcPresent": false,
                                        "attributes": {
                                            "attribute": [
                                                {
                                                    "name": "geom",
                                                    "minOccurs": 0,
                                                    "maxOccurs": 1,
                                                    "nillable": true,

                                                },
                                                {
                                                    "name": "stroke",
                                                    "minOccurs": 0,
                                                    "maxOccurs": 1,
                                                    "nillable": true,
                                                    // "binding": "java.lang.String"
                                                },
                                                {
                                                    "name": "stroke-width",
                                                    "minOccurs": 0,
                                                    "maxOccurs": 1,
                                                    "nillable": true,
                                                    // "binding": "java.lang.Integer"
                                                },
                                                {
                                                    "name": "stroke-opacity",
                                                    "minOccurs": 0,
                                                    "maxOccurs": 1,
                                                    "nillable": true,
                                                    // "binding": "java.lang.Integer"
                                                },
                                                {
                                                    "name": "fill",
                                                    "minOccurs": 0,
                                                    "maxOccurs": 1,
                                                    "nillable": true,
                                                    // "binding": "java.lang.String"
                                                },
                                                {
                                                    "name": "fill-opacity",
                                                    "minOccurs": 0,
                                                    "maxOccurs": 1,
                                                    "nillable": true,
                                                    // "binding": "java.lang.Double"
                                                },
                                                {
                                                    "name": "Name",
                                                    "minOccurs": 0,
                                                    "maxOccurs": 1,
                                                    "nillable": true,
                                                    // "binding": "java.lang.String"
                                                },
                                                {
                                                    "name": "description",
                                                    "minOccurs": 0,
                                                    "maxOccurs": 1,
                                                    "nillable": true,
                                                    // "binding": "java.lang.String"
                                                }
                                            ]
                                        }
                                    }
                                }).then(async (resp2) => {
                                    // Calculate feature layers
                                    await axios({
                                            method: 'PUT',
                                            url: `http://localhost:8080/geoserver/rest/workspaces/clients/datastores/${name}/featuretypes/${name}?recalculate=nativebbox,latlonbbox`,
                                            headers: { 'Content-Type': 'application/json; charset=utf-8' }
                                        })
                                    console.log(resp2);
                                    res.sendStatus(resp2.status);

                                }).catch(error => {
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

function getDataType(type) {
    var resp = '';
    switch (key) {
        case 'INTEGER':
            resp = "java.lang.Integer";
            break;
        case 'REAL':
            resp = "java.lang.Double";
            break;
        case 'TEXT':
            resp = "java.lang.String";
            break;
        case 'POLYGON':
            resp = "org.locationtech.jts.geom.Polygon";
            break;

        default:
            break;
    }
}

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
