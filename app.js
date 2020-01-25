//.  app.js
var express = require( 'express' ),
    bodyParser = require( 'body-parser' ),
    fs = require( 'fs' ),
    ejs = require( 'ejs' ),
    request = require( 'request' ),
    settings = require( './settings' ),
    app = express();

app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( bodyParser.json() );
app.use( express.static( __dirname + '/public' ) );

app.set( 'views', __dirname + '/views' );
app.set( 'view engine', 'ejs' );

app.get( '/', function( req, res ){
  res.render( 'index', {} );
});

app.get( '/address/:lat/:lng', function( req, res ){
  res.contentType( 'application/json' );

  var _lat = req.params.lat;
  var _lng = req.params.lng;
  var lat = parseFloat( _lat );
  var lng = parseFloat( _lng );
  if( typeof lat == 'number' && typeof lng == 'number' ){
    position2address( lat, lng ).then( function( address ){
      res.write( JSON.stringify( { status: true, address: address }, 2, null ) );
      res.end();
    }).catch( function( err ){
      res.status( 400 );
      res.write( JSON.stringify( { status: false, error: err }, 2, null ) );
      res.end();
    });
  }
});


function position2address( lat, lng ){
  return new Promise( function( resolve, reject ){
    var address = '（住所不明）';
    if( !lat && !lng ){
      resolve( address );
    }else{
      //. Yahoo!リバースジオコーダ API を使う
  		//. http://developer.yahoo.co.jp/webapi/map/openlocalplatform/v1/reversegeocoder.html
      var option = {
        url: 'https://map.yahooapis.jp/geoapi/V1/reverseGeoCoder?lat=' + lat + '&lon=' + lng + '&output=json&appid=' + settings.yahoo_app_id,
        method: 'GET'
      };
      request( option, ( err0, res0, body0 ) => {
        body0 = JSON.parse( body0 );
        if( !err0 ){
          address = body0.Feature[0].Property.Address;
        }
        if( !address ){
          address = body0.Feature[0].Property.Country.Name;
        }
        resolve( address );
      });
    }
  });
}

var port = process.env.PORT || 8080;
app.listen( port );
console.log( "server starting on " + port + " ..." );
